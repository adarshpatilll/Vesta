import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { importExcelData } from "@/utils/importSocietyData";
import { motion } from "framer-motion";

export default function ExcelImporter({
	onImport,
	acceptSheets = true,
	societyId,
	onClose,
}) {
	const [fileName, setFileName] = useState(null);
	const [loading, setLoading] = useState(false);

	const onDrop = useCallback(
		async (acceptedFiles) => {
			if (!acceptedFiles.length) return;
			const file = acceptedFiles[0];
			setFileName(file.name);

			try {
				setLoading(true);
				const parsedData = await importExcelData(file, societyId); // returns { residents, balances, transactions }
				onImport(parsedData);
				toast.success("File imported successfully!");
			} catch (err) {
				console.error(err);
				toast.error(err.message || "Failed to import Excel file");
			} finally {
				setLoading(false);
			}
		},
		[onImport, societyId]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: acceptSheets
			? {
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
						[".xlsx", ".xls"],
			  }
			: undefined,
		multiple: false,
	});

	return (
		<motion.div
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex flex-col relative"
		>
			<div
				{...getRootProps()}
				className={`border-2 border-dashed border-primary rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-primary/10 ${
					isDragActive ? "bg-primary/5" : "bg-dark"
				}`}
			>
				<input {...getInputProps()} />

				<UploadCloud className="w-12 h-12 text-accent mb-4" />

				<p className="text-center text-light mb-2 text-sm sm:text-base">
					{isDragActive
						? "Drop the file here..."
						: "Drag & drop an Excel file here, or click to select"}
				</p>

				{fileName && (
					<p className="text-accent text-sm mt-2">
						Selected file: {fileName}
					</p>
				)}

				{loading && (
					<p className="text-light mt-2 animate-pulse">Processing...</p>
				)}

				<button
					type="button"
					className="mt-4 bg-primary hover:bg-primary-dark text-sm sm:text-base text-accent font-semibold px-6 py-2 rounded-lg"
				>
					Choose File
				</button>
			</div>

			<button
				className="bg-red-600 rounded-full text-light hover:bg-red-700 absolute -top-14 left-1/2 transform -translate-x-1/2"
				onClick={onClose}
			>
				<X className="w-6 h-6 m-1.5" />
			</button>
		</motion.div>
	);
}
