import { ensureSocietyId } from "../../utils/ensureSocietyId";
import {
	addDoc,
	collection,
	db,
	doc,
	getDoc,
	getDocs,
	setDoc,
	Timestamp,
} from "../firebaseServices";
import { updateBalance } from "./balance";

// Add transaction (credit or debit)
export const addTransaction = async (
	societyId: string,
	data: {
		residentId: Array<string> | string;
		type: "credit" | "debit";
		amount: number;
		description: string;
		monthKey: string; // YYYY-MM
	}
) => {
	societyId = await ensureSocietyId(societyId);

	try {
		// Normalize residentId to always be an array
		if (!Array.isArray(data.residentId)) {
			data.residentId = [data.residentId];
		}

		// ✅ Parent month doc ref
		const monthDocRef = doc(
			db,
			"societies",
			societyId,
			"transactions",
			data.monthKey
		);

		// ✅ Ensure parent doc exists
		const monthDocSnap = await getDoc(monthDocRef);
		if (!monthDocSnap.exists()) {
			await setDoc(monthDocRef, {
				createdAt: Timestamp.now(),
			});
		}

		// ✅ Add transaction under items subcollection
		const ref = collection(monthDocRef, "items");
		const docRef = await addDoc(ref, {
			...data,
			amount: Number(data.amount), // 👈 force number here
			isMultipleResidents: data.residentId.length > 1,
			createdAt: Timestamp.now(),
			updatedAt: null,
			date: Timestamp.now(),
		});

		// ✅ Update balance
		await updateBalance(societyId, data.amount, data.type, data.monthKey);

		return docRef.id;
	} catch (error: any) {
		throw error;
	}
};

// Get All transactions across all months {societyId}
export async function getAllTransactions(societyId: string): Promise<any[]> {
	!societyId && (societyId = await ensureSocietyId());

	try {
		// ✅ Parent transactions collection
		const txColRef = collection(db, "societies", societyId, "transactions");

		// ✅ Get all monthKey docs
		const monthDocsSnap = await getDocs(txColRef);

		let allTx: any[] = [];

		// ✅ For each monthKey doc, get its "items"
		for (const monthDoc of monthDocsSnap.docs) {
			const monthKey = monthDoc.id; // e.g. "2025-09"
			const itemsRef = collection(txColRef, monthKey, "items");
			const itemsSnap = await getDocs(itemsRef);

			const monthTx = itemsSnap.docs.map((doc) => ({
				id: doc.id,
				monthKey, // add monthKey so you know which month it belongs to
				...doc.data(),
			}));

			allTx = [...allTx, ...monthTx];
		}

		// ✅ Sort by date desc (optional) based on monthKey
		allTx.sort((a, b) => (a.monthKey < b.monthKey ? 1 : -1));

		return allTx; // return all transactions across all months ex: [{id, monthKey, ...data}, ...]
	} catch (error: any) {
		throw error;
	}
}

// Get all transactions by month
export async function getTransactions(
	societyId: string,
	monthKey: string
): Promise<any> {
	try {
		const ref = collection(
			db,
			"societies",
			societyId,
			"transactions",
			monthKey,
			"items"
		);
		const snap = await getDocs(ref);
		return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	} catch (error: any) {
		throw error;
	}
}
