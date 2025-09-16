import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { addResident } from "../../../firebase/firestore/residents";
import { useAuth } from "../../../context/AuthContext";
import { useSociety } from "../../../context/SocietyContext";
import { RadioButtonGroup } from "./../../../components/RadioButtonGroup";
import { InputField } from "./../../../components/InputField";

const AddResidentPage = () => {
	const { societyId } = useAuth();
	const { setResidents } = useSociety();

	const [form, setForm] = useState({
		flatNo: "",
		ownerName: "",
		ownerContact: "",
		type: "owner", // default owner
		tenantName: "",
		tenantContact: "",
	});
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;

		if (name === "ownerContact" || name === "tenantContact") {
			const val = e.target.value.replace(/\D/g, "").slice(0, 10);
			setForm((prev) => ({ ...prev, [name]: val }));
		} else {
			setForm((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleTypeChange = (value) => {
		setForm((prev) => ({ ...prev, type: value }));
	};

	// ✅ custom validation
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
		try {
			toast.promise(
				addResident(societyId, form),
				{
					loading: "Adding resident...",
					success: "Resident added successfully 🎉",
					error: "Failed to add resident",
				},
				{ duration: 3000 }
			);

			// Reset form
			setForm({
				flatNo: "",
				ownerName: "",
				ownerContact: "",
				type: "owner",
				tenantName: "",
				tenantContact: "",
			});

			// Update context immediately
			setResidents((prev) => [
				...prev,
				{
					...form,
				},
			]);
		} catch (error) {
			console.error("Error adding resident:", error);
		} finally {
			setLoading(false);
		}
	};

	const InputObjectArray = [
		{
			label: "Flat No.",
			type: "text",
			name: "flatNo",
			value: form.flatNo,
			onChange: handleChange,
			placeholder: "Flat No.",
			maxLength: 50,
		},
		{
			label: "Owner Name",
			type: "text",
			name: "ownerName",
			value: form.ownerName,
			onChange: handleChange,
			placeholder: "Owner Name",
			maxLength: 100,
		},
		{
			label: "Owner Contact",
			type: "tel",
			name: "ownerContact",
			value: form.ownerContact,
			onChange: handleChange,
			placeholder: "Owner Contact",
			maxLength: 10,
		},
		{
			label: "Resident Type",
			type: "radio",
			name: "type",
			value: form.type,
			onChange: handleTypeChange,
			options: [
				{ label: "Owner", value: "owner" },
				{ label: "Tenant", value: "tenant" },
			],
		},
		...(form.type === "tenant"
			? [
					{
						label: "Tenant Name",
						type: "text",
						name: "tenantName",
						value: form.tenantName,
						onChange: handleChange,
						placeholder: "Tenant Name",
						maxLength: 100,
					},
					{
						label: "Tenant Contact",
						type: "tel",
						name: "tenantContact",
						value: form.tenantContact,
						onChange: handleChange,
						placeholder: "Tenant Contact",
						maxLength: 10,
					},
			  ]
			: []),
	];

	return (
		<section className="mx-auto max-w-5xl p-4 ">
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
							/>
						) : (
							<InputField
								key={index}
								label={input.label}
								type={input.type}
								name={input.name}
								value={input.value}
								onChange={input.onChange}
								placeholder={input.placeholder}
								maxLength={input.maxLength}
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
					{loading ? "Adding..." : "Add Resident"}
				</button>
			</motion.div>
		</section>
	);
};

export default AddResidentPage;
