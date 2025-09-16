import ExcelJS from "exceljs";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import { getTransactions } from "../firebase/firestore/transactions";
import { getMonthlyBalance } from "../firebase/firestore/balance";
import { getAllResidents } from "../firebase/firestore/residents";

export async function exportSocietyData(societyId, fromMonth, toMonth) {
	const workbook = new ExcelJS.Workbook();
	workbook.creator = "Society App";
	workbook.created = new Date();

	// 🔹 Month range prepare if fromMonth is less than 2025-07 then set 2025-07 as fromMonth
	const boundaryMonth = import.meta.env.VITE_MIN_MONTH_KEY || "2025-07";

	if (dayjs(fromMonth, "YYYY-MM").isBefore(boundaryMonth)) {
		fromMonth = boundaryMonth;
	}

	const months = [];
	let cur = dayjs(fromMonth, "YYYY-MM");
	const end = dayjs(toMonth, "YYYY-MM");

	while (cur.isBefore(end) || cur.isSame(end, "month")) {
		months.push(cur.format("YYYY-MM"));
		cur = cur.add(1, "month");
	}

	// ---------------- Residents Sheet ----------------
	const resSheet = workbook.addWorksheet("Residents");
	resSheet.addRow([
		"Flat No",
		"Owner Name",
		"Owner Contact",
		"Tenant Name",
		"Tenant Contact",
		"Type",
		...months, // 👈 month columns
	]);

	const residents = await getAllResidents(societyId);

	// Sort residents by flatNo (assuming flatNo is a string like "102", "105", "201A", etc.)
	residents.sort((a, b) => {
		const flatA = a.flatNo || "";
		const flatB = b.flatNo || "";
		return flatA.localeCompare(flatB, undefined, {
			numeric: true,
			sensitivity: "base",
		});
	});

	residents.forEach((r) => {
		const row = [
			r.flatNo || "",
			r.ownerName || "",
			r.ownerContact || "",
			r.tenantName || "N/A",
			r.tenantContact || "N/A",
			r.type || "",
		];

		months.forEach((mk) => {
			row.push(r.maintenance?.[mk] || "unpaid"); // 👈 fill maintenance status
		});

		resSheet.addRow(row);
	});

	// -------------------- Transactions Sheet --------------------
	const txSheet = workbook.addWorksheet("Transactions");
	txSheet.addRow([
		"Month",
		"Type",
		"Amount",
		"Description",
		"Date",
		"Expense For (Residents)",
	]);

	cur = dayjs(fromMonth, "YYYY-MM");

	while (cur.isBefore(end) || cur.isSame(end, "month")) {
		const monthKey = cur.format("YYYY-MM");

		const txList = await getTransactions(societyId, monthKey);
		txList.forEach((tx) => {
			txSheet.addRow([
				tx.monthKey,
				tx.type,
				tx.amount,
				tx.description,
				dayjs(tx.date?.toDate?.() || tx.date).format("DD MMM YYYY"),
				tx.isMultipleResidents ? "All" : "Single",
			]);
		});

		cur = cur.add(1, "month");
	}

	// -------------------- Balances Sheet --------------------
	const balSheet = workbook.addWorksheet("Balances");
	balSheet.addRow(["Month", "Credits", "Debits", "Carry Forward", "Balance"]);

	cur = dayjs(fromMonth, "YYYY-MM");
	while (cur.isBefore(end) || cur.isSame(end, "month")) {
		const monthKey = cur.format("YYYY-MM");
		const bal = await getMonthlyBalance(societyId, monthKey);

		balSheet.addRow([
			monthKey,
			bal.credit,
			bal.debit,
			bal.carryForward,
			bal.balance,
		]);

		cur = cur.add(1, "month");
	}

	// -------------------- Save File via file-saver --------------------
	const buf = await workbook.xlsx.writeBuffer();
	const blob = new Blob([buf], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});

	saveAs(blob, `Society_Data_Export_${fromMonth}_to_${toMonth}.xlsx`);
}
