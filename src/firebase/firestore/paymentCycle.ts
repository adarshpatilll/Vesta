import {
	collection,
	db,
	doc,
	getDoc,
	getDocs,
	setDoc,
	Timestamp,
	updateDoc,
} from "../firebaseServices";
import getMonthKey from "./../../utils/getMonthKey";
import { addUnpaidNotification, deleteNotification } from "./notifications";
import { ensureSocietyId } from "../../utils/ensureSocietyId";
import {
	addTransaction,
	getTransactions,
	removeTransaction,
} from "./transactions";
import { getMaintenanceAmount } from "./maintenanceAmount";
import { getResidentById } from "./residents";
import { deleteField } from "firebase/firestore";

// Set payment cycle, e.g., 1-10
export async function setPaymentCycle(
	societyId: string,
	startDay: number,
	endDay: number
) {
	!societyId && (societyId = await ensureSocietyId(societyId));
	try {
		const ref = doc(db, "societies", societyId, "settings", "paymentCycle");
		await setDoc(ref, { startDay, endDay });
	} catch (error: any) {
		throw error;
	}

	return true;
}

// Get payment cycle, default to 1-10 if not set
export async function getPaymentCycle(societyId: string): Promise<any> {
	!societyId && (societyId = await ensureSocietyId(societyId));
	try {
		const ref = doc(db, "societies", societyId, "settings", "paymentCycle");
		const snap = await getDoc(ref);
		return snap.exists() ? snap.data() : { startDay: 1, endDay: 10 };
	} catch (error: any) {
		throw error;
	}
}

// Mark maintenance as paid for current month
export async function markMaintenancePaid(
	societyId: string,
	residentId: string,
	action: "paid" | "undo",
	monthKey?: string
) {
	!societyId && (societyId = await ensureSocietyId(societyId));

	try {
		if (!monthKey) {
			monthKey = getMonthKey();
		}

		const residentRef = doc(
			db,
			"societies",
			societyId,
			"residents",
			residentId
		);

		await updateDoc(residentRef, {
			[`maintenance.${monthKey}`]:
				action === "paid" ? "paid" : deleteField(),
			updatedAt: new Date(),
		});

		if (action === "paid") {
			// ✅ Add maintenance transaction
			const amount = await getMaintenanceAmount(societyId);
			if (!amount) throw new Error("Maintenance amount not set");

			const flatNumber = await getResidentById(societyId, residentId).then(
				(resident) => resident?.flatNo || "Unknown"
			);

			await addTransaction(societyId, {
				residentId,
				type: "credit",
				amount,
				monthKey,
				isMonthlyMaintenance: true,
				description: `Flat No. ${flatNumber} paid maintenance for ${monthKey}`,
			});

			// ✅ Remove any unpaid notification for this resident for this month
			await deleteNotification(societyId, `${residentId}-${monthKey}`);

			return true;
		} else if (action === "undo") {
			// ✅ Find transaction to undo
			const txns = await getTransactions(societyId, monthKey);

			const txnToDelete = txns.find(
				(txn) =>
					txn.isMonthlyMaintenance &&
					txn.type === "credit" &&
					txn.residentId.includes(residentId)
			);

			if (txnToDelete) {
				// ✅ Reverse balance change of the original credit
				await removeTransaction(societyId, monthKey, txnToDelete.id, {
					amount: txnToDelete.amount,
					type: "credit", // 👈 same as original to reverse correctly
				});
			}

			// Recreate unpaid notification
			await addUnpaidNotification(societyId, residentId, monthKey);
		}
	} catch (error) {
		console.error("Error marking maintenance paid:", error);
		throw error;
	}
}

// Auto mark unpaid residents after payment cycle ends
export async function autoMarkUnpaidResidents(societyId: string) {
	!societyId && (societyId = await ensureSocietyId(societyId));

	const today = new Date();
	const cycle = await getPaymentCycle(societyId);

	if (!cycle) return;

	// Agar cycle khatam nahi hua hai → kuch mat karo
	if (today.getDate() <= cycle.endDay) return;

	const monthKey = getMonthKey();

	const residentsRef = collection(db, "societies", societyId, "residents");
	const residentsSnap = await getDocs(residentsRef);

	for (const docSnap of residentsSnap.docs) {
		const resident = docSnap.data();
		const currentStatus = resident.maintenance?.[monthKey];

		// Agar already paid hai → skip
		if (currentStatus === "paid") continue;

		// Agar status missing ya unpaid hai → ab unpaid mark karo
		await updateDoc(docSnap.ref, {
			[`maintenance.${monthKey}`]: "unpaid",
			updatedAt: Timestamp.now(),
		});

		// Notification bhi banao
		await addUnpaidNotification(societyId, docSnap.id, monthKey);
	}
}
