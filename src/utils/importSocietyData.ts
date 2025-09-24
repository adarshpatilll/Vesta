import ExcelJS from "exceljs";
import {
	Timestamp,
	collection,
	doc,
	db,
	addDoc,
	setDoc,
	getDoc,
} from "@/firebase/firebaseServices";

/***************************
 * Header mapping (aliases -> canonical camelCase)
 ***************************/
const HEADER_MAP: Record<string, string> = {
	// residents
	flatno: "flatNo",
	"flat no": "flatNo",
	"flat number": "flatNo",
	flat: "flatNo",

	ownername: "ownerName",
	"owner name": "ownerName",

	ownercontact: "ownerContact",
	"owner contact": "ownerContact",
	ownerphone: "ownerContact",
	"owner phone": "ownerContact",

	tenantname: "tenantName",
	"tenant name": "tenantName",

	tenantcontact: "tenantContact",
	"tenant contact": "tenantContact",
	tenantphone: "tenantContact",
	"tenant phone": "tenantContact",

	type: "type",

	createdat: "createdAt",
	"created at": "createdAt",

	updatedat: "updatedAt",
	"updated at": "updatedAt",

	// balances
	balance: "balance",
	balanceamount: "balance",

	carryforward: "carryForward",
	"carry forward": "carryForward",

	credit: "credit",

	debit: "debit",

	monthkey: "monthKey",
	"month key": "monthKey",
	month: "monthKey",

	// transactions
	amount: "amount",

	description: "description",
	note: "description",
	details: "description",
	desc: "description",

	date: "date",

	ismonthlymaintenance: "isMonthlyMaintenance",
	"is monthly maintenance": "isMonthlyMaintenance",

	ismultipleresidents: "isMultipleResidents",
	"is multiple residents": "isMultipleResidents",

	residentid: "residentId",
	"resident id": "residentId",
	payerid: "residentId",
	"payer id": "residentId",
};

/***************************
 * Helpers
 ***************************/
function normalizeRawHeader(raw: any): string {
	if (raw === null || raw === undefined) throw new Error("Empty header found");
	const key = String(raw).trim();
	const lower = key.toLowerCase();

	// If it's a maintenance month like 2025-09 -> keep as-is (YYYY-MM)
	if (/^\d{4}-(0[1-9]|1[0-2])$/.test(lower)) return lower;

	if (HEADER_MAP[lower]) return HEADER_MAP[lower];

	// try removing punctuation/extra spaces and mapping again
	const simplified = lower.replace(/[^a-z0-9]/g, "");
	if (HEADER_MAP[simplified]) return HEADER_MAP[simplified];

	throw new Error(
		`Invalid/unrecognized header: "${key}". Use the sample template.`
	);
}

function toTimestampFromCell(val: any): Timestamp {
	if (val instanceof Date) return Timestamp.fromDate(val);

	// Handle ExcelJS formula result object
	if (
		val &&
		typeof val === "object" &&
		"result" in val &&
		val.result instanceof Date
	) {
		// ExcelJS sometimes has object for formula results
		return Timestamp.fromDate(val.result as Date);
	}

	// Handle ExcelJS formula result object with number
	if (typeof val === "number") {
		// Try Excel serial to JS date (Excel epoch -> 1899-12-31)
		// Excel serial -> JS date: (excel - 25569) * 86400 * 1000
		try {
			const jsMs = Math.round((val - 25569) * 86400 * 1000);
			const d = new Date(jsMs);
			if (!isNaN(d.getTime())) return Timestamp.fromDate(d);
		} catch (e) {
			console.log(e);
		}
	}

	// Handle string date (e.g. "2023-09-15" or "09/15/2023")
	if (typeof val === "string") {
		const d = new Date(val);
		if (!isNaN(d.getTime())) return Timestamp.fromDate(d);
	}

	// default to server-ish timestamp
	return Timestamp.now();
}

/***************************
 * Interfaces
 ***************************/
export interface NormalizedResident {
	flatNo: string;
	ownerName: string;
	ownerContact: string;
	tenantName?: string;
	tenantContact?: string;
	type: string;
	maintenance: Record<string, "paid" | "unpaid">;
	createdAt: Timestamp;
	updatedAt: Timestamp | null;
}

export interface NormalizedBalance {
	monthKey: string; // e.g. "2023-09"
	balance: number;
	carryForward: number;
	credit: number;
	debit: number;
}

export interface NormalizedTransaction {
	monthKey: string;
	amount: number;
	createdAt: Timestamp;
	date: Timestamp;
	description: string;
	isMonthlyMaintenance: boolean;
	isMultipleResidents: boolean;
	residentId: string[];
	type: string;
	updatedAt: Timestamp | null;
}

/***************************
 * Normalizers (row array + normalized headers)
 * headers param must already be canonical (camelCase or YYYY-MM month strings)
 * e.g. ["flatNo", "ownerName", "2023-09", "2023-10", ...]
 * @param row Row data as array aligned to headers
 * @param headers Normalized headers array
 * @returns Normalized object
 ***************************/
export const normalizeResidentRow = (
	row: any[],
	headers: string[]
): NormalizedResident => {
	const maintenance: Record<string, "paid" | "unpaid"> = {};
	const out: Record<string, any> = {};

	for (let i = 0; i < headers.length; i++) {
		const h = headers[i];
		const val = row[i] ?? "";

		// month maintenance header (YYYY-MM)
		if (/^\d{4}-(0[1-9]|1[0-2])$/.test(h)) {
			const paid =
				String(val ?? "")
					.trim()
					.toLowerCase() === "paid"
					? "paid"
					: "unpaid";
			maintenance[h] = paid;
			continue;
		}

		// other known headers (see HEADER_MAP)
		switch (h) {
			case "flatNo":
				out.flatNo = String(val ?? "").trim();
				break;
			case "ownerName":
				out.ownerName = String(val ?? "").trim();
				break;
			case "ownerContact":
				out.ownerContact = String(val ?? "").trim();
				break;
			case "tenantName":
				out.tenantName =
					String(val).trim().toLowerCase() === "n/a" ||
					String(val).trim().toLowerCase() === "na"
						? ""
						: String(val ?? "").trim(); // if "N/A" or "NA", set to empty string else trim
				break;
			case "tenantContact":
				out.tenantContact =
					String(val).trim().toLowerCase() === "n/a" ||
					String(val).trim().toLowerCase() === "na"
						? ""
						: String(val ?? "").trim();
				break;
			case "type":
				out.type = String(val ?? "")
					.trim()
					.toLowerCase();
				break;
			case "createdAt":
				out.createdAt = toTimestampFromCell(val) || Timestamp.now();
				break;
			case "updatedAt":
				out.updatedAt = val ? toTimestampFromCell(val) : null;
				break;
			default:
				// ignore unknown (shouldn't happen if headers validated)
				break;
		}
	}

	return {
		flatNo: out.flatNo,
		ownerName: out.ownerName,
		ownerContact: out.ownerContact,
		tenantName: out.tenantName,
		tenantContact: out.tenantContact,
		type: out.type,
		maintenance,
		createdAt: out.createdAt ?? Timestamp.now(),
		updatedAt: out.updatedAt ?? null,
	} as NormalizedResident;
};

export const normalizeBalanceRow = (
	row: any[],
	headers: string[]
): NormalizedBalance => {
	const out: any = {};

	// gather known fields only (see HEADER_MAP)
	for (let i = 0; i < headers.length; i++) {
		const h = headers[i];
		const val = row[i] ?? "";

		// known headers only (see HEADER_MAP)
		switch (h) {
			case "monthKey":
				out.monthKey = String(val ?? "").trim();
				break;
			case "balance":
				out.balance = Number(val) || 0;
				break;
			case "carryForward":
				out.carryForward = Number(val) || 0;
				break;
			case "credit":
				out.credit = Number(val) || 0;
				break;
			case "debit":
				out.debit = Number(val) || 0;
				break;
			default:
				break;
		}
	}

	// monthKey is required for top-level month doc. If missing, throw at call site.
	return {
		monthKey: out.monthKey,
		balance: out.balance ?? 0,
		carryForward: out.carryForward ?? 0,
		credit: out.credit ?? 0,
		debit: out.debit ?? 0,
	} as NormalizedBalance;
};

export const normalizeTransactionRow = (
	row: any[],
	headers: string[]
): NormalizedTransaction | null => {
	const out: any = { residentId: [] as string[] };

	// gather known fields only (see HEADER_MAP)
	for (let i = 0; i < headers.length; i++) {
		const h = headers[i];
		const val = row[i] ?? "";

		// known headers only (see HEADER_MAP)
		switch (h) {
			case "monthKey":
				out.monthKey = String(val ?? "").trim();
				break;
			case "amount":
				out.amount = Number(val) || 0;
				break;
			case "createdAt":
				out.createdAt = val ? toTimestampFromCell(val) : Timestamp.now();
				break;
			case "date":
				out.date = val ? toTimestampFromCell(val) : Timestamp.now();
				break;
			case "description":
				out.description = String(val ?? "").trim();
				break;
			case "isMonthlyMaintenance":
				out.isMonthlyMaintenance =
					String(val ?? "")
						.trim()
						.toLowerCase() === "true" ||
					String(val ?? "")
						.trim()
						.toLowerCase() === "yes" ||
					val === true
						? true
						: false;
				break;
			case "isMultipleResidents":
				out.isMultipleResidents =
					String(val ?? "")
						.trim()
						.toLowerCase() === "true" ||
					String(val ?? "")
						.trim()
						.toLowerCase() === "yes" ||
					val === true
						? true
						: false;
				break;
			case "residentId":
				out.residentId =
					String(val ?? "")
						.trim()
						.toLowerCase() === "n/a"
						? []
						: [
								String(val ?? "")
									.trim()
									.toLowerCase(),
						  ];
				break;
			case "type":
				out.type = String(val ?? "").trim();
				break;
			case "updatedAt":
				out.updatedAt = val ? toTimestampFromCell(val) : null;
				break;
			default:
				break;
		}
	}

	if (!out.monthKey) return null; // cannot import without monthKey

	// Ensure required fields
	return {
		monthKey: out.monthKey,
		amount: out.amount ?? 0,
		createdAt: out.createdAt ?? Timestamp.now(),
		date: out.date ?? Timestamp.now(),
		description: out.description,
		isMonthlyMaintenance: out.isMonthlyMaintenance ?? false,
		isMultipleResidents: out.isMultipleResidents ?? false,
		residentId: out.residentId || "all",
		type: out.type,
		updatedAt: out.updatedAt ?? null,
	} as NormalizedTransaction;
};

/***************************
 * Firestore import functions
 ***************************/
async function importResidentsRows(
	normalizedRows: NormalizedResident[],
	societyId: string
) {
	const colRef = collection(db, "societies", societyId, "residents");

	for (const r of normalizedRows) {
		// create new resident doc and get generated ID
		const docRef = await addDoc(colRef, r);
		// optional: if you want to store the ID inside doc
		await setDoc(docRef, { id: docRef.id }, { merge: true });
	}
}

async function importBalancesRows(
	normalizedRows: NormalizedBalance[],
	societyId: string
) {
	const colRef = collection(db, "societies", societyId, "balances");

	for (const b of normalizedRows) {
		if (!b.monthKey) throw new Error("monthKey missing for balance row");
		// save as monthKey doc (merge so existing fields not lost)
		const ref = doc(colRef, b.monthKey);

		await setDoc(
			ref,
			{
				balance: b.balance,
				carryForward: b.carryForward,
				credit: b.credit,
				debit: b.debit,
			},
			{ merge: true }
		);
	}
}

async function importTransactionsRows(
	normalizedRows: NormalizedTransaction[],
	societyId: string
) {
	for (const t of normalizedRows) {
		if (!t.monthKey) continue;

		const monthDocRef = doc(
			db,
			"societies",
			societyId,
			"transactions",
			t.monthKey
		);

		// create monthKey doc as parent if not exists
		const monthDocSnap = await getDoc(monthDocRef);
		if (!monthDocSnap.exists()) {
			await setDoc(monthDocRef, { createdAt: Timestamp.now() });
		}

		const itemsCollectionRef = collection(monthDocRef, "items");
		await addDoc(itemsCollectionRef, t);
	}
}

/***************************
 * Dispatcher: read file, detect sheet type, normalize rows, import
 ***************************/
export async function importExcelData(file: File, societyId: string) {
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.load(await file.arrayBuffer());

	const results: { sheet: string; type: string; imported: number }[] = [];

	for (const worksheet of workbook.worksheets) {
		if (!worksheet || worksheet.rowCount < 2) continue; // nothing to do

		// read raw headers (row 1)
		const rawHeaders: any[] = [];
		worksheet.getRow(1).eachCell((cell, colNumber) => {
			rawHeaders.push(cell.value);
		});

		// normalize headers strictly
		const headers: string[] = rawHeaders.map((h) => normalizeRawHeader(h));

		// gather rows as arrays aligned to headers length
		const rowsData: any[][] = [];
		worksheet.eachRow((row, rowNumber) => {
			if (rowNumber === 1) return;
			const rowArr: any[] = [];
			for (let c = 1; c <= headers.length; c++) {
				const cell = row.getCell(c);
				// ExcelJS Date cells may be Date object; formula cell may be object etc.
				rowArr.push(cell.value);
			}
			rowsData.push(rowArr);
		});

		// detect type
		const hset = new Set(headers);
		let type: "residents" | "balances" | "transactions" | null = null;

		if (hset.has("flatNo") || hset.has("ownerName")) type = "residents";
		else if (
			hset.has("monthKey") &&
			(hset.has("balance") || hset.has("credit") || hset.has("debit"))
		)
			type = "balances";
		else if (hset.has("monthKey") && hset.has("amount"))
			type = "transactions";
		else {
			throw new Error(
				`Unrecognized sheet "${
					worksheet.name
				}" — headers: ${rawHeaders.join(", ")}`
			);
		}

		// normalize per row
		if (type === "residents") {
			const normalizedRows: NormalizedResident[] = rowsData.map((row) =>
				normalizeResidentRow(row, headers)
			);
			await importResidentsRows(normalizedRows, societyId);
			results.push({
				sheet: worksheet.name,
				type,
				imported: normalizedRows.length,
			});
		} else if (type === "balances") {
			const normalizedRows: NormalizedBalance[] = rowsData.map((row) =>
				normalizeBalanceRow(row, headers)
			);
			await importBalancesRows(normalizedRows, societyId);
			results.push({
				sheet: worksheet.name,
				type,
				imported: normalizedRows.length,
			});
		} else if (type === "transactions") {
			const normalizedRows: NormalizedTransaction[] = rowsData
				.map((row) => normalizeTransactionRow(row, headers))
				.filter(Boolean) as NormalizedTransaction[];
			await importTransactionsRows(
				normalizedRows as NormalizedTransaction[],
				societyId
			);
			results.push({
				sheet: worksheet.name,
				type,
				imported: normalizedRows.length,
			});
		}
	}

	return results;
}
