import dayjs from "dayjs";
import { getTransactions } from "../firebase/firestore/transactions";
import { getMonthlyBalance } from "../firebase/firestore/balance";
import { getAllResidents } from "../firebase/firestore/residents";

export async function syncToGoogleSheetsReact(
	societyId,
	fromMonth,
	toMonth,
	token
) {
	// Validate inputs for safety
	const start = dayjs(fromMonth, "YYYY-MM").format("MMM YYYY");
	const end = dayjs(toMonth, "YYYY-MM").format("MMM YYYY");

	// 🔹 Helper to call Google APIs
	async function gFetch(url, options = {}) {
		const res = await fetch(url, {
			...options,
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
				...options.headers,
			},
		});
		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			throw new Error(err.error?.message || `Request failed: ${res.status}`);
		}
		return res.json();
	}

	// 🔹 Normalize societyId for folder name from "shyam-kunj" to "Shyam Kunj"
	const folderName = `Society Data (${societyId
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ")})`;

	// 🔹 Find or create folder in Drive
	async function getOrCreateFolder() {
		const searchRes = await gFetch(
			`https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`
		);

		if (searchRes.files && searchRes.files.length > 0) {
			return searchRes.files[0].id; // Folder exists
		}

		// Create folder if not exists
		const createRes = await gFetch(
			"https://www.googleapis.com/drive/v3/files",
			{
				method: "POST",
				body: JSON.stringify({
					name: folderName,
					mimeType: "application/vnd.google-apps.folder",
				}),
			}
		);

		return createRes.id;
	}

	// 🔹 Step 2: Create new Spreadsheet inside folder
	async function createSpreadsheet(folderId) {
		const spreadsheet = await gFetch(
			"https://sheets.googleapis.com/v4/spreadsheets",
			{
				method: "POST",
				body: JSON.stringify({
					properties: {
						title: `Society Data (${start} - ${end})`,
					},
					sheets: [
						{
							properties: {
								title: "Residents",
							},
						},
						{
							properties: {
								title: "Transactions",
							},
						},
						{
							properties: {
								title: "Balances",
							},
						},
					],
				}),
			}
		);

		// Move spreadsheet into folder
		await gFetch(
			`https://www.googleapis.com/drive/v3/files/${spreadsheet.spreadsheetId}?addParents=${folderId}&removeParents=root`,
			{ method: "PATCH" }
		);

		return spreadsheet;
	}

	// 🔹 Step 3: Write data to the spreadsheet
	async function writeData(spreadsheetId) {
		// Generate list of months between fromMonth and toMonth
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
		const residents = await getAllResidents(societyId);
		residents.sort((a, b) =>
			(a.flatNo || "").localeCompare(b.flatNo || "", undefined, {
				numeric: true,
			})
		);

		const resValues = [
			[
				"Flat No",
				"Owner Name",
				"Owner Contact",
				"Tenant Name",
				"Tenant Contact",
				"Type",
				...months,
			],
			...residents.map((r) => {
				const row = [
					r.flatNo || "",
					r.ownerName || "",
					r.ownerContact || "",
					r.tenantName || "N/A",
					r.tenantContact || "N/A",
					r.type || "",
				];
				months.forEach((mk) => row.push(r.maintenance?.[mk] || "unpaid"));
				return row;
			}),
		];

		await gFetch(
			`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Residents!A1:Z1000?valueInputOption=RAW`,
			{
				method: "PUT",
				body: JSON.stringify({ values: resValues }),
			}
		);

		// ---------------- Transactions Sheet ----------------
		let txValues = [
			[
				"Month",
				"Type",
				"Amount",
				"Description",
				"Date",
				"Expense For (Residents)",
			],
		];

		cur = dayjs(fromMonth, "YYYY-MM");

		while (cur.isBefore(end) || cur.isSame(end, "month")) {
			const monthKey = cur.format("YYYY-MM");
			const txList = await getTransactions(societyId, monthKey);

			txValues.push(
				...txList.map((tx) => [
					tx.monthKey,
					tx.type,
					tx.amount,
					tx.description,
					dayjs(tx.date?.toDate?.() || tx.date).format("DD MMM YYYY"),
					tx.isMultipleResidents ? "All" : "Single",
				])
			);
			cur = cur.add(1, "month");
		}

		await gFetch(
			`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Transactions!A1:Z1000?valueInputOption=RAW`,
			{
				method: "PUT",
				body: JSON.stringify({ values: txValues }),
			}
		);

		// ---------------- Balances Sheet ----------------
		let balValues = [
			["Month", "Credits", "Debits", "Carry Forward", "Balance"],
		];
		cur = dayjs(fromMonth, "YYYY-MM");
		while (cur.isBefore(end) || cur.isSame(end, "month")) {
			const monthKey = cur.format("YYYY-MM");
			const bal = await getMonthlyBalance(societyId, monthKey);
			balValues.push([
				monthKey,
				bal.credit,
				bal.debit,
				bal.carryForward,
				bal.balance,
			]);
			cur = cur.add(1, "month");
		}

		await gFetch(
			`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Balances!A1:Z1000?valueInputOption=RAW`,
			{
				method: "PUT",
				body: JSON.stringify({ values: balValues }),
			}
		);

		// ---------------- Formatting (Batch Update) ----------------
		// ✅ Bold headers, background color, freeze first row, auto resize
		const formattingResult = await fetch(
			`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					requests: ["Residents", "Transactions", "Balances"]
						.map((sheetName, idx) => ({
							updateSheetProperties: {
								properties: {
									sheetId: idx,
									gridProperties: { frozenRowCount: 1 },
								},
								fields: "gridProperties.frozenRowCount",
							},
						}))
						.concat(
							["Residents", "Transactions", "Balances"].map(
								(_, idx) => ({
									autoResizeDimensions: {
										dimensions: {
											sheetId: idx,
											dimension: "COLUMNS",
											startIndex: 0,
										},
									},
								})
							),
							["Residents", "Transactions", "Balances"].map(
								(_, idx) => ({
									repeatCell: {
										range: {
											sheetId: idx,
											startRowIndex: 0,
											endRowIndex: 1,
										},
										cell: {
											userEnteredFormat: {
												textFormat: {
													bold: true,
													foregroundColor: { red: 1 },
												},
												backgroundColor: {
													red: 0.9,
													green: 0.9,
													blue: 0.9,
												},
											},
										},
										fields:
											"userEnteredFormat(textFormat,backgroundColor)",
									},
								})
							)
						),
				}),
			}
		);
	}

	// 🔹 Main Execution Flow
	const folderId = await getOrCreateFolder();
	const sheet = await createSpreadsheet(folderId);
	await writeData(sheet.spreadsheetId);

	return `https://docs.google.com/spreadsheets/d/${sheet.spreadsheetId}/edit`; // Return the URL of the created spreadsheet
}
