import ExcelJS from "exceljs";

/**
 * Download a sample Excel template for Residents, Balances, and Transactions
 */
export async function downloadSampleExcel() {
	const workbook = new ExcelJS.Workbook();

	/***************
	 * RESIDENTS
	 ***************/
	const resSheet = workbook.addWorksheet("Residents");
	const residentHeaders = [
		"Flat No",
		"Owner Name",
		"Owner Contact",
		"Tenant Name",
		"Tenant Contact",
		"Type",
		"2025-08", // sample maintenance month
		"2025-09",
	];
	resSheet.addRow(residentHeaders);

	// Add sample row
	resSheet.addRow([
		"101",
		"Adarsh Patil",
		"9876543210",
		"n/a",
		"n/a",
		"owner",
		"paid",
		"unpaid",
	]);

	/***************
	 * BALANCES
	 ***************/
	const balSheet = workbook.addWorksheet("Balances");
	const balanceHeaders = [
		"Month Key",
		"Balance",
		"Carry Forward",
		"Credit",
		"Debit",
	];
	balSheet.addRow(balanceHeaders);
	balSheet.addRow(["2025-08", 500, 500, 500, 0]);
	balSheet.addRow(["2025-09", 200, 0, 0, 300]);

	/***************
	 * TRANSACTIONS
	 ***************/
	const transSheet = workbook.addWorksheet("Transactions");
	const transactionHeaders = [
		"Month Key",
		"Amount",
		"Date",
		"Description",
		"Is Monthly Maintenance",
		"Is Multiple Residents",
		"Resident ID",
		"Type",
	];
	transSheet.addRow(transactionHeaders);
	transSheet.addRow([
		"2025-08",
		500,
		new Date(),
		"Flat No. 101 paid maintenance for 2025-08",
		true,
		false,
		"n/a",
		"credit",
	]);

	transSheet.addRow([
		"2025-09",
		300,
		new Date(),
		"Motor Repairing",
		false,
		true,
		"n/a",
		"debit",
	]);

	/***************
	 * Download
	 ***************/
	const buf = await workbook.xlsx.writeBuffer();
	const blob = new Blob([buf], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});
	const url = URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.href = url;
	link.download = "vesta_sample_template.xlsx";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
