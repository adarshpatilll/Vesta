import { ensureSocietyId } from "../../utils/ensureSocietyId";
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
	monthKey?: string,
	isUndo: boolean = false // 👈 new param
) {
	!societyId && (societyId = await ensureSocietyId(societyId));

	try {
		const numAmount = Number(amount);
		if (isNaN(numAmount)) throw new Error("Invalid amount");

		const totalRef = doc(db, "societies", societyId, "settings", "balance");
		const totalSnap = await getDoc(totalRef);

		// delta calculation
		let delta = 0;
		if (type !== "initial") {
			if (type === "credit") delta = isUndo ? -numAmount : numAmount;
			if (type === "debit") delta = isUndo ? numAmount : -numAmount;
		}

		// ---- Update Global Total ----
		if (totalSnap.exists()) {
			// Update existing total
			const current = Number(totalSnap.data().total) || 0;
			await updateDoc(totalRef, { total: current + delta });
		} else {
			// First time create
			await setDoc(totalRef, { total: delta });
		}

		// ---- Update Monthly Balance ----
		const mk = monthKey || dayjs().format("YYYY-MM");
		const monthRef = doc(db, "societies", societyId, "balances", mk);
		const monthSnap = await getDoc(monthRef);

		if (monthSnap.exists()) {
			const data = monthSnap.data();
			await updateDoc(monthRef, {
				credit:
					Number(data.credit || 0) +
					(type === "credit" ? (isUndo ? -numAmount : numAmount) : 0),
				debit:
					Number(data.debit || 0) +
					(type === "debit" ? (isUndo ? -numAmount : numAmount) : 0),
				balance: Number(data.balance || 0) + delta,
			});
		} else {
			// First time create
			const prevMonthKey = dayjs(mk, "YYYY-MM")
				.subtract(1, "month")
				.format("YYYY-MM");

			const prevMonthData = await getMonthlyBalance(societyId, prevMonthKey);
			const carryForward = Number(prevMonthData?.balance || 0);

			const newBalance = carryForward + delta;

			await setDoc(monthRef, {
				credit: type === "credit" ? (isUndo ? 0 : numAmount) : 0,
				debit: type === "debit" ? (isUndo ? 0 : numAmount) : 0,
				balance: newBalance,
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
	!societyId && (societyId = await ensureSocietyId(societyId));

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
	!societyId && (societyId = await ensureSocietyId(societyId));

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
	!societyId && (societyId = await ensureSocietyId(societyId));

	try {
		const ref = doc(db, "societies", societyId, "settings", "balance");
		const snap = await getDoc(ref);
		return snap.exists() ? snap.data().total : 0;
	} catch (error: any) {
		throw error;
	}
}
