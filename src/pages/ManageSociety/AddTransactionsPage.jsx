import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { addTransaction } from "@/firebase/firestore/transactions";
import { useAuth } from "@/context/AuthContext";
import { useSociety } from "@/context/SocietyContext";
import { RadioButtonGroup } from "@/components/RadioButtonGroup";
import { InputField } from "@/components/InputField";
import ResidentSelectModal from "@/components/ResidentSelectModal.jsx";
import dayjs from "dayjs";
import MonthSelector from "@/components/MonthSelector"; // 👈 for future use

const AddTransactionsPage = () => {
	const { societyId } = useAuth();
	const { residents } = useSociety();

	const [form, setForm] = useState({
		amount: "",
		type: "",
		monthKey: dayjs().format("YYYY-MM"),
		description: "",
		residentMode: "", // "all" | "selected"
		residentId: [], // array of selected resident IDs
	});

	const [loading, setLoading] = useState(false);
	const [showResidentModal, setShowResidentModal] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleResidentModeChange = (value) => {
		setForm((prev) => ({ ...prev, residentMode: value }));

		if (value === "selected") {
			setForm((prev) => ({ ...prev, residentId: [] }));
			setShowResidentModal(true);
		} else {
			setForm((prev) => ({
				...prev,
				residentId: residents.map((r) => r.id),
			}));
		}
	};

	const validateForm = () => {
		if (!form.amount) {
			toast.error("Amount is required");
			return false;
		}
		if (form.amount) {
			if (isNaN(form.amount) || Number(form.amount) <= 0) {
				toast.error("Amount must be a positive number");
				return false;
			}
		}
		if (!form.type) {
			toast.error("Transaction type is required");
			return false;
		}
		if (!form.monthKey) {
			toast.error("Month is required");
			return false;
		}
		if (!form.description.trim()) {
			toast.error("Description is required");
			return false;
		}
		if (!form.residentMode) {
			toast.error("Select resident mode");
			return false;
		}
		if (
			form.residentMode === "selected" &&
			(!form.residentId || form.residentId.length === 0)
		) {
			toast.error("Select at least one resident");
			return false;
		}
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;

		setLoading(true);
		try {
			toast.promise(
				addTransaction(societyId, {
					amount: Number(form.amount),
					monthKey: form.monthKey,
					type: form.type,
					description: form.description,
					residentId:
						form.residentMode === "all"
							? residents.map((r) => r.id)
							: form.residentId,
				}),
				{
					loading: "Adding transaction...",
					success: "Transaction added successfully 🎉",
					error: "Failed to add transaction",
				},
				{ duration: 3000 }
			);

			// Reset form
			setForm({
				...form,
				amount: "",
				type: "",
				description: "",
				residentMode: "",
				residentId: [],
			});
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const InputObjectArray = [
		{
			label: "Amount",
			type: "number",
			name: "amount",
			value: form.amount,
			onChange: handleChange,
			placeholder: "Enter Amount",
		},
		{
			label: "Month",
			type: "monthSelector",
			name: "monthKey",
			value: form.monthKey || dayjs().format("YYYY-MM"),
			onChange: (val) => setForm((prev) => ({ ...prev, monthKey: val })),
		},
		{
			label: "Transaction Type",
			type: "radio",
			name: "type",
			value: form.type,
			onChange: (val) => setForm((prev) => ({ ...prev, type: val })),
			options: [
				{ label: "Credit", value: "credit" },
				{ label: "Debit", value: "debit" },
			],
		},
		{
			label: "Description",
			type: "text",
			name: "description",
			value: form.description,
			onChange: handleChange,
			placeholder: "Enter Description",
		},
		{
			label: "Resident Selection",
			type: "radio",
			name: "residentMode",
			value: form.residentMode,
			onChange: handleResidentModeChange,
			className: "",
			options: [
				{ label: "All Residents", value: "all" },
				{ label: "Selected Resident(s)", value: "selected" },
			],
		},
	];

	return (
		<section className="mx-auto max-w-5xl p-4">
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="bg-dark rounded-2xl border border-neutral-700 p-6 shadow-lg flex flex-col gap-6"
			>
				<motion.form
					initial="hidden"
					animate="visible"
					variants={{
						hidden: { opacity: 0 },
						visible: {
							opacity: 1,
							transition: { staggerChildren: 0.2 },
						},
					}}
					className="grid gap-4 md:grid-cols-2"
				>
					{InputObjectArray.map((input, index) =>
						input.type === "radio" ? (
							<RadioButtonGroup
								key={index}
								label={input.label}
								name={input.name}
								value={input.value}
								onChange={input.onChange}
								options={input.options}
								className={input?.className}
							/>
						) : input.type === "monthSelector" ? (
							<div
								key={index}
								className="flex flex-col justify-between gap-1"
							>
								<h1 className="text-sm">{input.label}</h1>
								<div className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-3 text-light focus:outline-none focus:ring-0 focus:border-yellow-500">
									<MonthSelector
                              navigation={false}
										value={input.value}
										onChange={input.onChange}
									/>
								</div>
							</div>
						) : (
							<InputField
								key={index}
								label={input.label}
								type={input.type}
								name={input.name}
								value={input.value}
								onChange={input.onChange}
								placeholder={input.placeholder}
								className={input?.className}
							/>
						)
					)}
				</motion.form>

				{/* Submit */}
				<button
					onClick={handleSubmit}
					disabled={loading}
					className="md:mr-auto rounded-lg bg-yellow-600 sm:px-16 px-4 py-3 font-semibold text-dark transition duration-200 hover:bg-yellow-500"
				>
					{loading ? "Adding..." : "Add Transaction"}
				</button>
			</motion.div>

			{/* Resident Select Modal */}
			{showResidentModal && (
				<ResidentSelectModal
					residents={residents}
					selectedIds={form.residentId}
					onClose={() => {
						setShowResidentModal(false);
						if (form.residentId.length === 0) {
							setForm((prev) => ({ ...prev, residentMode: "" }));
						}
					}}
					onSave={(ids) => {
						if (ids.length === 0) {
							setForm((prev) => ({
								...prev,
								residentId: [],
							}));
							toast.error("Select at least one resident");
							return;
						} else {
							setForm((prev) => ({
								...prev,
								residentId: ids,
							}));
						}
						setShowResidentModal(false);
					}}
				/>
			)}
		</section>
	);
};

export default AddTransactionsPage;
