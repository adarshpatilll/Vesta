import {
	collection,
	db,
	doc,
	getDoc,
	getDocs,
	setDoc,
	updateDoc,
} from "../firebaseServices";
import dayjs from "dayjs";

export async function updateBalance(
	societyId: string,
	amount: number | string,
	type: "credit" | "debit" | "initial",
	monthKey?: string // 👈 monthly balance bhi
) {
	try {
		const numAmount = Number(amount); // 👈 force number
		if (isNaN(numAmount)) throw new Error("Invalid amount");

		// total balance ref
		const totalRef = doc(db, "societies", societyId, "settings", "balance");
		const totalSnap = await getDoc(totalRef);

		// calculate delta
		const delta =
			type !== "initial" ? (type === "credit" ? numAmount : -numAmount) : 0;

		// ---- Update Global Total ----
		if (totalSnap.exists()) {
			const current = Number(totalSnap.data().total) || 0;
			await updateDoc(totalRef, { total: current + delta });
		} else {
			await setDoc(totalRef, { total: delta });
		}

		// ---- Update Monthly Balance ----
		const mk = monthKey || dayjs().format("YYYY-MM");
		const monthRef = doc(db, "societies", societyId, "balances", mk);
		const monthSnap = await getDoc(monthRef);

		// if monthSnap exists, update credit/debit/balance
		if (monthSnap.exists()) {
			const data = monthSnap.data();
			await updateDoc(monthRef, {
				credit:
					Number(data.credit || 0) + (type === "credit" ? numAmount : 0),
				debit: Number(data.debit || 0) + (type === "debit" ? numAmount : 0),
				balance: Number(data.balance || 0) + delta,
			});
		} else {
			// first time create
			const prevMonthKey = dayjs(mk, "YYYY-MM")
				.subtract(1, "month")
				.format("YYYY-MM");

			// get prev month balance to set carryForward
			const prevMonthData = await getMonthlyBalance(societyId, prevMonthKey);
			const carryForward = Number(prevMonthData?.balance || 0);

			// calculate new balance
			const delta =
				type === "credit"
					? carryForward + numAmount
					: type === "debit"
					? carryForward - numAmount
					: carryForward;

			// create new month record
			await setDoc(monthRef, {
				credit: type === "credit" ? numAmount : 0,
				debit: type === "debit" ? numAmount : 0,
				balance: delta,
				carryForward: carryForward,
			});
		}
	} catch (error) {
		console.error("updateBalance error:", error);
		throw error;
	}
}

// Get all monthly balances
export async function getAllMonthlyBalances(societyId: string) {
	try {
		const ref = collection(db, "societies", societyId, "balances");
		const snap = await getDocs(ref);

		let balances: any[] = [];

		snap.forEach((docSnap) => {
			balances.push({
				monthKey: docSnap.id, // e.g. "2025-09"
				...docSnap.data(),
				balance: Number(docSnap.data()?.balance || 0),
				credit: Number(docSnap.data()?.credit || 0),
				debit: Number(docSnap.data()?.debit || 0),
				carryForward: Number(docSnap.data()?.carryForward || 0),
			});
		});

		// ✅ sort by monthKey desc
		balances.sort((a, b) => (a.monthKey < b.monthKey ? 1 : -1));

		return balances;
	} catch (error) {
		console.error("getAllMonthlyBalances error:", error);
		throw error;
	}
}

// Get monthly balance by monthKey
export async function getMonthlyBalance(societyId: string, monthKey: string) {
	try {
		const ref = doc(db, "societies", societyId, "balances", monthKey);
		const snap = await getDoc(ref);
		if (snap.exists()) {
			const d = snap.data();
			return {
				balance: Number(d.balance || 0),
				credit: Number(d.credit || 0),
				debit: Number(d.debit || 0),
				carryForward: Number(d.carryForward || 0),
			};
		}
		return { balance: 0, credit: 0, debit: 0, carryForward: 0 };
	} catch (error) {
		console.error(error);
		throw error;
	}
}

// Get balance
export async function getBalance(societyId: string) {
	try {
		const ref = doc(db, "societies", societyId, "settings", "balance");
		const snap = await getDoc(ref);
		return snap.exists() ? snap.data().total : 0;
	} catch (error: any) {
		throw error;
	}
}
