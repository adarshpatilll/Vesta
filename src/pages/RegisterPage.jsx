import { useState } from "react";
import {
	Eye,
	EyeOff,
	Mail,
	Lock,
	User,
	Phone,
	Home,
	Building2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Divider from "../components/Divider";

const RegisterPage = () => {
	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [flatNo, setFlatNo] = useState("");
	const [societyId, setSocietyId] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState({});

	const navigate = useNavigate();
	const { registerAdmin } = useAuth();

	const validateForm = () => {
		const newErrors = {};
		if (!name.trim()) newErrors.name = "Name is required";
		if (!flatNo.trim()) newErrors.flatNo = "Flat number is required";
		if (!societyId.trim()) newErrors.societyId = "Society ID is required";

		if (!email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			newErrors.email = "Enter a valid email";
		}

		if (!phone.trim()) {
			newErrors.phone = "Phone number is required";
		} else if (!/^\d{10}$/.test(phone)) {
			newErrors.phone = "Enter a valid 10-digit phone number";
		}

		if (!password) {
			newErrors.password = "Password is required";
		} else if (password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}

		if (password !== confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;

		setIsLoading(true);
		try {
			// convert societyId (Shayam Kunj) to camelCase (shyamKunj)
			const convertedSocietyId = societyId
				.trim()
				.replace(/\s+/g, " ")
				.split(" ")
				.map((word) => word.toLowerCase())
				.join("-");

			// Call registerAdmin from AuthContext to create account and add admin to Firestore
			const { isFirstAdmin } = await registerAdmin(
				{ name, phone, flatNo, societyId: convertedSocietyId },
				email,
				password
			);

			// Show success toast message based on whether it's the first admin
			if (!isFirstAdmin) {
				// Society already exists
				toast.warning("Account created successfully 🎉", {
					duration: 8000,
					description:
						"Society already exists. You have been added as an admin to the existing society.",
				});
			} else {
				// First admin of the society
				toast.success("Account created successfully 🎉", {
					description:
						"Payment cycle is set to 1st - 10th and maintenance amount is set to ₹500 by default. You can change these settings later.",
					duration: 8000,
				});
			}

			// Redirect to home page
			navigate("/", { replace: true });
		} catch (error) {
			// Handle Firebase errors
			if (error.code === "auth/email-already-in-use") {
				toast.error("Email already in use");
			} else if (error.code === "auth/weak-password") {
				toast.error("Weak password. At least 6 characters required.");
			} else {
				toast.error(error.message || "Error registering admin");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 sm:p-8 lg:p-10">
			<motion.div
				className="bg-dark max-xs:max-w-xs w-full max-w-sm overflow-hidden rounded-2xl border border-neutral-700 shadow-md shadow-neutral-900 sm:max-w-xl md:max-w-2xl"
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
			>
				{/* Header */}
				<div className="space-y-2 p-6 text-center sm:p-8">
					<h1 className="text-light max-xs:text-xl text-2xl font-bold sm:text-3xl">
						Create Account
					</h1>
					<p className="text-light/60 max-xs:text-xs text-sm sm:text-base">
						Sign up vesta to manage your society
					</p>
				</div>

				<Divider className={"mb-6 sm:mb-8"} />

				{/* Form */}
				<div className="max-xs:gap-3 flex flex-col gap-4 px-6 sm:gap-5 sm:px-8">
					<motion.form
						className="max-xs:gap-3 grid sm:grid-cols-2 gap-4 sm:gap-5"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						{/* Name */}
						<Field
							id="name"
							label="Full Name"
							wrapperClassName="sm:col-span-2"
							example={"Adarsh Patil"}
							icon={<User className="h-4 w-4 text-light/40" />}
							value={name}
							onChange={setName}
							error={errors.name}
						/>

						{/* Phone */}
						<Field
							id="phone"
							label="Phone"
							maxLength={10}
							example={"1234512345"}
							icon={<Phone className="h-4 w-4 text-light/40" />}
							value={phone}
							onChange={setPhone}
							error={errors.phone}
						/>

						{/* Flat No */}
						<Field
							id="flatNo"
							label="Flat No"
							example={"204"}
							icon={<Home className="h-4 w-4 text-light/40" />}
							value={flatNo}
							onChange={setFlatNo}
							error={errors.flatNo}
						/>

						{/* Society ID */}
						<Field
							id="societyId"
							label="Society Name"
							example="Shyam Kunj"
							icon={<Building2 className="h-4 w-4 text-light/40" />}
							value={societyId}
							onChange={setSocietyId}
							error={errors.societyId}
						/>

						{/* Email */}
						<Field
							id="email"
							label="Email"
							example="help@adarsh.com"
							icon={<Mail className="h-4 w-4 text-light/40" />}
							value={email}
							onChange={setEmail}
							error={errors.email}
						/>

						{/* Password */}
						<PasswordField
							id="password"
							label="Password"
							value={password}
							onChange={setPassword}
							error={errors.password}
							show={showPassword}
							toggle={() => setShowPassword(!showPassword)}
						/>

						{/* Confirm Password */}
						<PasswordField
							id="confirmPassword"
							label="Confirm Password"
							value={confirmPassword}
							onChange={setConfirmPassword}
							error={errors.confirmPassword}
							show={showConfirmPassword}
							toggle={() => setShowConfirmPassword(!showConfirmPassword)}
						/>
					</motion.form>

					{/* Submit */}
					<button
						onClick={handleSubmit}
						className="text-light max-xs:text-sm h-11 w-full sm:w-fit mx-auto rounded-lg bg-yellow-600 text-base font-medium shadow-md transition hover:bg-yellow-500 disabled:opacity-50 sm:px-24 mt-2"
						disabled={isLoading}
					>
						{isLoading ? "Creating account..." : "Sign up"}
					</button>
				</div>

				{/* Footer */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="max-xs:text-xs p-6 text-center text-sm text-neutral-400 sm:p-8"
				>
					Already have an account?{" "}
					<Link
						to="/login"
						className="font-medium text-yellow-400 hover:text-yellow-300"
					>
						Sign in
					</Link>
				</motion.div>
			</motion.div>
		</div>
	);
};

// 🔹 Reusable Input Field
const Field = ({
	id,
	label,
	icon,
	value,
	onChange,
	error,
	example,
	maxLength,
	wrapperClassName,
}) => (
	<div className={` ${wrapperClassName}`}>
		<label htmlFor={id} className="text-light mb-1 block text-sm font-medium">
			{label}
		</label>
		<div className="relative">
			<span className="absolute top-3.5 left-3">{icon}</span>
			<input
				id={id}
				type="text"
				placeholder={`${
					example ? `Eg: ${example}` : `Enter your ${label.toLowerCase()}`
				}`}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				maxLength={maxLength}
				className={`text-light max-xs:text-sm placeholder-light/35 h-11 w-full rounded-lg border bg-neutral-800 pr-3 pl-10 focus:ring focus:ring-yellow-300 focus:outline-none ${
					error
						? "border-red-500 focus:ring-red-400"
						: "border-neutral-700"
				}`}
			/>
		</div>
		<AnimatePresence>
			{error && (
				<motion.p
					initial={{ opacity: 0, y: -5 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -5 }}
					transition={{ duration: 0.25 }}
					className="mt-1 text-xs text-red-400"
				>
					{error}
				</motion.p>
			)}
		</AnimatePresence>
	</div>
);

// 🔹 Password Input Field
const PasswordField = ({ id, label, value, onChange, error, show, toggle }) => (
	<div>
		<label htmlFor={id} className="text-light mb-1 block text-sm font-medium">
			{label}
		</label>
		<div className="relative">
			<Lock className="absolute left-3 top-3.5 h-4 w-4 text-light/40" />
			<input
				id={id}
				type={show ? "text" : "password"}
				placeholder={`Eg: hello@world`}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className={`text-light max-xs:text-sm placeholder-light/35 h-11 w-full rounded-lg border bg-neutral-800 pr-10 pl-10 focus:ring focus:ring-yellow-300 focus:outline-none ${
					error
						? "border-red-500 focus:ring-red-400"
						: "border-neutral-700"
				}`}
			/>
			<button
				type="button"
				className="text-light/40 hover:text-light/60 absolute top-0 right-0 h-full px-3"
				onClick={toggle}
			>
				{show ? (
					<EyeOff className="h-4 w-4" />
				) : (
					<Eye className="h-4 w-4" />
				)}
			</button>
		</div>
		<AnimatePresence>
			{error && (
				<motion.p
					initial={{ opacity: 0, y: -5 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -5 }}
					transition={{ duration: 0.25 }}
					className="mt-1 text-xs text-red-400"
				>
					{error}
				</motion.p>
			)}
		</AnimatePresence>
	</div>
);

export default RegisterPage;
