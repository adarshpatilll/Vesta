import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { updateResident } from "../firebase/firestore/residents";
import { useAuth } from "../context/AuthContext";
import { useSociety } from "../context/SocietyContext";
import { X } from "lucide-react";

const EditResidentModal = ({ resident, onClose }) => {
	const { societyId } = useAuth();
	const { setResidents } = useSociety();

	const [form, setForm] = useState({
		flatNo: resident.flatNo || "",
		ownerName: resident.ownerName || "",
		ownerContact: resident.ownerContact || "",
		type: resident.type || "",
		tenantName: resident.tenantName || "",
		tenantContact: resident.tenantContact || "",
	});

	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;

		// For contact fields, allow only digits and limit to 10 characters
		if (name === "ownerContact" || name === "tenantContact") {
			const val = value.replace(/\D/g, "").slice(0, 10);
			setForm((prev) => ({ ...prev, [name]: val }));
		} else {
			// For other fields, update normally
			setForm((prev) => ({ ...prev, [name]: value }));
		}
	};

	// Handle resident type change
	const handleTypeChange = (value) => {
		setForm((prev) => ({ ...prev, type: value }));
	};

	const validateForm = () => {
		if (!form.flatNo.trim()) {
			toast.error("Flat No. is required");
			return false;
		}
		if (!form.ownerName.trim()) {
			toast.error("Owner Name is required");
			return false;
		}
		if (!form.ownerContact.trim() || form.ownerContact.length !== 10) {
			toast.error("Owner Contact must be 10 digits");
			return false;
		}
		if (form.type === "tenant") {
			if (!form.tenantName.trim()) {
				toast.error("Tenant Name is required");
				return false;
			}
			if (!form.tenantContact.trim() || form.tenantContact.length !== 10) {
				toast.error("Tenant Contact must be 10 digits");
				return false;
			}
		}
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;

		setLoading(true);

		const isDataChanged = Object.keys(form).some(
			(key) => form[key] !== resident[key]
		);

		if (!isDataChanged) {
			toast.warning("No changes detected!");
			setLoading(false);
			return;
		}

		console.log("societyId:", societyId);
		console.log("resident.id:", resident?.id);
		console.log("form:", form);

		toast.promise(
			updateResident(
				societyId,
				resident.id,
				form.type === "owner"
					? { ...form, tenantContact: "", tenantName: "" }
					: { ...form } // if tenant, keep all fields as it is else clear tenant fields
			),
			{
				loading: "Updating resident...",
				success: () => {
					setResidents((prev) =>
						// if tenant, keep all fields as it is else clear tenant fields
						prev.map((r) =>
							r.id === resident.id
								? {
										...form,
										id: resident.id,
										...(form.type === "owner"
											? { tenantContact: "", tenantName: "" }
											: {}),
								  }
								: r
						)
					);

					onClose();

					return "Resident updated successfully 🎉";
				},
				error: (err) => {
					console.error(err);
					return "Failed to update resident";
				},
				finally: () => {
					setLoading(false);
				},
			},
			{ duration: 3000 }
		);
	};

	return (
		<div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<motion.div
				initial={{ opacity: 0, y: -30 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -30 }}
				className="bg-dark text-light hide-scrollbar flex max-h-[80vh] w-[90%] flex-col gap-7 overflow-y-auto rounded-xl p-4 sm:w-[90%] sm:max-w-3xl sm:rounded-2xl sm:p-6"
			>
				<div className="flex w-full items-center justify-between">
					<h2 className="text-lg font-semibold sm:text-xl">
						Edit Resident
					</h2>
					<button
						onClick={onClose}
						className="text-neutral-400 hover:text-light"
					>
						<X size={22} />
					</button>
				</div>

				<motion.form
					onSubmit={handleSubmit}
					initial="hidden"
					animate="visible"
					variants={{
						hidden: { opacity: 0 },
						visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
					}}
					className="grid gap-4 md:grid-cols-2"
				>
					{/* Flat No */}
					<motion.div
						variants={{
							hidden: { opacity: 0, y: 20 },
							visible: { opacity: 1, y: 0 },
						}}
						className="flex flex-col gap-1"
					>
						<label className="text-sm">Flat No.</label>
						<input
							type="text"
							name="flatNo"
							value={form.flatNo}
							onChange={handleChange}
							placeholder="Flat No."
							className="w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-light focus:outline-none focus:ring-0 focus:border-yellow-500"
						/>
					</motion.div>

					{/* Owner Name */}
					<motion.div
						variants={{
							hidden: { opacity: 0, y: 20 },
							visible: { opacity: 1, y: 0 },
						}}
						className="flex flex-col gap-1"
					>
						<label className="text-sm">Owner Name</label>
						<input
							type="text"
							name="ownerName"
							value={form.ownerName}
							onChange={handleChange}
							placeholder="Owner Name"
							className="w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-light focus:outline-none focus:ring-0 focus:border-yellow-500"
						/>
					</motion.div>

					{/* Owner Contact */}
					<motion.div
						variants={{
							hidden: { opacity: 0, y: 20 },
							visible: { opacity: 1, y: 0 },
						}}
						className="flex flex-col gap-1"
					>
						<label className="text-sm">Owner Contact</label>
						<input
							type="tel"
							name="ownerContact"
							value={form.ownerContact}
							onChange={handleChange}
							maxLength={10}
							placeholder="Owner Contact"
							className="w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-light focus:outline-none focus:ring-0 focus:border-yellow-500"
						/>
					</motion.div>

					{/* Resident Type */}
					<motion.div
						variants={{
							hidden: { opacity: 0, y: 20 },
							visible: { opacity: 1, y: 0 },
						}}
						className="flex flex-col gap-1 justify-between"
					>
						<label className="text-sm">Resident Type</label>
						<div className="flex gap-4">
							<label
								className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition ${
									form.type === "owner"
										? "border-yellow-500 bg-yellow-600/20 text-yellow-400"
										: "border-neutral-700 bg-neutral-800 text-light/70"
								}`}
								onClick={() => handleTypeChange("owner")}
							>
								<input
									type="radio"
									name="type"
									checked={form.type === "owner"}
									readOnly
									className="hidden"
								/>
								<span>Owner</span>
							</label>

							<label
								className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition ${
									form.type === "tenant"
										? "border-yellow-500 bg-yellow-600/20 text-yellow-400"
										: "border-neutral-700 bg-neutral-800 text-light/70"
								}`}
								onClick={() => handleTypeChange("tenant")}
							>
								<input
									type="radio"
									name="type"
									checked={form.type === "tenant"}
									readOnly
									className="hidden"
								/>
								<span>Tenant</span>
							</label>
						</div>
					</motion.div>

					{/* Tenant Fields */}
					{form.type === "tenant" && (
						<>
							<motion.div
								variants={{
									hidden: { opacity: 0, y: 20 },
									visible: { opacity: 1, y: 0 },
								}}
								className="flex flex-col gap-1"
							>
								<label className="text-sm">Tenant Name</label>
								<input
									type="text"
									name="tenantName"
									value={form.tenantName}
									onChange={handleChange}
									placeholder="Tenant Name"
									className="w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-light focus:outline-none focus:ring-0 focus:border-yellow-500"
								/>
							</motion.div>

							<motion.div
								variants={{
									hidden: { opacity: 0, y: 20 },
									visible: { opacity: 1, y: 0 },
								}}
								className="flex flex-col gap-1"
							>
								<label className="text-sm">Tenant Contact</label>
								<input
									type="tel"
									name="tenantContact"
									value={form.tenantContact}
									onChange={handleChange}
									maxLength={10}
									placeholder="Tenant Contact"
									className="w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-light focus:outline-none focus:ring-0 focus:border-yellow-500"
								/>
							</motion.div>
						</>
					)}
				</motion.form>

				{/* Submit */}
				<button
					onClick={handleSubmit}
					disabled={loading}
					className="md:mr-auto rounded-lg bg-yellow-600 sm:px-16 px-4 py-3 font-semibold text-dark transition duration-200 hover:bg-yellow-500"
				>
					{loading ? "Updating..." : "Update Resident"}
				</button>
			</motion.div>
		</div>
	);
};

export default EditResidentModal;
