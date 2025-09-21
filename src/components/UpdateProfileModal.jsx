import React from "react";
import { InputField } from "./InputField";
import { toast } from "sonner";
import { updateAdminDetails } from "@/firebase/firestore/admin";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { X } from "lucide-react";

const UpdateProfileModal = ({ onClose, profileData }) => {
	const [name, setName] = React.useState(profileData.name || "");
	const [email, setEmail] = React.useState(profileData.email || "");
	const [phone, setPhone] = React.useState(profileData.phone || "");
	const [flatNo, setFlatNo] = React.useState(profileData.flatNo || "");

	const [loading, setLoading] = React.useState(false);

	const { setUser } = useAuth();

	const validateData = () => {
		if (!name.trim()) {
			toast.error("Name is required.");
			return false;
		}
		if (!email.trim()) {
			toast.error("Email is required.");
			return false;
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			toast.error("Email address is invalid.");
			return false;
		}
		if (!phone.trim()) {
			toast.error("Phone number is required.");
			return false;
		} else if (!/^\d{10}$/.test(phone)) {
			toast.error("Phone number is invalid. It should be 10 digits.");
			return false;
		}
		if (!flatNo.trim()) {
			toast.error("Flat number is required.");
			return false;
		}
		return true;
	};

	const handleProfileUpdate = async (e) => {
		e.preventDefault();

		if (!validateData()) return;

		// Donot update if no changes
		if (
			name === profileData.name &&
			email === profileData.email &&
			phone === profileData.phone &&
			flatNo === profileData.flatNo
		) {
			toast.warning("No changes detected.");
			return;
		}

		setLoading(true);

		try {
			await updateAdminDetails({
				name,
				email,
				phone,
				flatNo,
			});
			setUser((prev) => ({
				...prev,
				adminDetails: { ...prev.adminDetails, name, email, phone, flatNo },
			}));

			toast.success("Profile updated successfully!");
		} catch (error) {
			console.log("Error updating profile:", error);
			toast.error("Failed to update profile. Please try again.");
		} finally {
			setLoading(false);
		}

		onClose();
	};

	return (
		<div
			role="dialog"
			aria-modal="true"
			className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
		>
			<motion.div
				initial={{ opacity: 0, y: -30 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -30 }}
				className="bg-dark text-light hide-scrollbar flex max-h-[80vh] w-[90%] flex-col gap-7 overflow-y-auto rounded-xl p-4 sm:w-[90%] sm:max-w-xl sm:rounded-2xl sm:p-6"
			>
				<div className="flex w-full items-center justify-between">
					<h2 className="text-lg font-semibold sm:text-xl">
						Update Profile
					</h2>
					<button
						onClick={onClose}
						className="text-neutral-400 hover:text-light"
					>
						<X size={22} />
					</button>
				</div>

				<motion.form
					initial="hidden"
					animate="visible"
					variants={{
						hidden: { opacity: 0 },
						visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
					}}
					className="flex flex-col gap-4"
				>
					<InputField
						label="Full Name"
						type={"text"}
						name={"name"}
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>
					<InputField
						label="Email"
						type={"email"}
						name={"email"}
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<InputField
						label="Phone"
						type={"number"}
						name={"phone"}
						maxLength={10}
						value={phone}
						onChange={(e) => {
							const val = e.target.value.replace(/\D/g, "").slice(0, 10); // only digits, max 10
							setPhone(val);
						}}
					/>
					<InputField
						label="Flat No"
						type={"text"}
						name={"flatNo"}
						value={flatNo}
						onChange={(e) => setFlatNo(e.target.value)}
					/>
				</motion.form>

				<div className="flex justify-end gap-3">
					<button
						className="rounded-md bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-600 transition-colors"
						onClick={onClose}
					>
						Cancel
					</button>
					<button
						disabled={loading}
						onClick={handleProfileUpdate}
						type="submit"
						className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:cursor-not-allowed transition-colors"
					>
						{loading ? "Updating..." : "Update"}
					</button>
				</div>
			</motion.div>
		</div>
	);
};

export default UpdateProfileModal;
