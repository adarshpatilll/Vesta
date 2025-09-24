import { useEffect, useState } from "react";
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
import {
	getAllPublicSocieties,
	registerAdmin,
} from "@/firebase/firestore/admin";
import Particles from "@/blocks/Particles/Particles";

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

	const [publicSocieties, setPublicSocieties] = useState([]);

	const { setIsRegistration, setUser, setIsAuthenticated } = useAuth();

	const navigate = useNavigate();

	// Fetch all All Public Societies on component mount
	useEffect(() => {
		const fetchPublicSocieties = async () => {
			try {
				const societies = await getAllPublicSocieties();
				setPublicSocieties(societies);
			} catch (error) {
				console.error("Error fetching public societies:", error);
			}
		};

		fetchPublicSocieties();
	}, []);

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
			newErrors.password = "Min 6 characters required";
		}

		if (password !== confirmPassword) {
			newErrors.confirmPassword = "Passwords mismatch";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validate form inputs
		if (!validateForm()) return;

		setIsLoading(true);

		try {
			// Indicate that registration is in process
			setIsRegistration(true);

			// convert societyId (Shayam Kunj) to camelCase (shayam-kunj)
			const convertedSocietyId = societyId
				.trim()
				.replace(/\s+/g, " ")
				.split(" ")
				.map((word) => word.toLowerCase())
				.join("-");

			const {
				user: newUser,
				isFirstAdmin,
				adminDetails,
			} = await registerAdmin(
				{ name, phone, flatNo, societyId: convertedSocietyId },
				email,
				password
			);

			// Show success toast message based on whether it's the first admin
			if (isFirstAdmin) {
				// First admin of the society
				// Set user in context
				setUser({ ...newUser, adminDetails });
				setIsAuthenticated(true);

				toast.success("Account created successfully 🎉", {
					description:
						"Payment cycle is set to 1st - 10th and maintenance amount is set to ₹500 by default. You can change these settings later.",
					duration: 8000,
				});
				navigate("/", { replace: true });
			} else {
				// Society already exists
				// User is added as an admin but not authorized yet
				// So, do not set user in context
				setIsAuthenticated(false);

				toast.warning("Account created successfully 🎉", {
					duration: 8000,
					description:
						"Society already exists. You have been added as an admin to the existing society. Please wait for the super admin to authorize your account before you can log in.",
				});

				navigate("/login", { replace: true });
			}
		} catch (error) {
			console.log("Error registering admin:", error);
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
			// Indicate that registration is complete
			setIsRegistration(false);
		}
	};

	return (
		<div className="relative h-screen w-full bg-neutral-950 overflow-hidden">
			<Particles
				particleColors={["#ffffff", "#fbbf24", "#f59e0b"]} // white and yellow shades
				particleCount={300}
				particleSpread={10}
				speed={0.1}
				particleBaseSize={100}
				moveParticlesOnHover={true}
				alphaParticles={false}
				disableRotation={false}
			/>

			<motion.div
				className="bg-dark/80 max-xs:max-w-xs w-full max-w-sm overflow-hidden rounded-2xl border border-neutral-700 shadow-md shadow-neutral-900 sm:max-w-xl md:max-w-2xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
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
				<div className="max-xs:gap-3 flex flex-col gap-4 px-4 sm:gap-5 sm:px-8">
					<motion.form
						className="max-xs:gap-3 grid sm:grid-cols-2 gap-4 sm:gap-5 overflow-y-auto max-h-[66vh] hide-scrollbar p-1"
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
							publicSocieties={publicSocieties}
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
						className="text-light max-xs:text-sm h-11 w-[calc(100%-10px)] sm:w-fit mx-auto rounded-lg bg-yellow-600 text-base font-medium shadow-md transition hover:bg-yellow-500 disabled:opacity-50 sm:px-24 mt-2"
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
	publicSocieties = [],
}) => {
	const [isDuplicateSociety, setIsDuplicateSociety] = useState(false);

	const handleOnChange = (e) => {
		if (id === "societyId") {
			const inputSocietyId = e.target.value;

			if (inputSocietyId.length > 0) {
				const isDuplicate = publicSocieties.some(
					(society) =>
						society.name.toLowerCase() ===
						inputSocietyId.trim().replace(/\s+/g, "-").toLowerCase()
				);
				setIsDuplicateSociety(isDuplicate);

				if (isDuplicate) {
					toast.warning("Society already exists!", {
						description:
							"Since a society with this name already exists, you will be added as an admin to the existing society.",
					});
				}
			}

			onChange(inputSocietyId);
		} else {
			onChange(e.target.value);
		}
	};

	return (
		<div className={` ${wrapperClassName}`}>
			<label
				htmlFor={id}
				className="text-light mb-1 text-sm font-medium flex items-center justify-between gap-2"
			>
				{label}
				<AnimatePresence>
					{error && (
						<motion.p
							initial={{ opacity: 0, y: -5 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -5 }}
							transition={{ duration: 0.25 }}
							className="text-xs font-normal text-red-400"
						>
							{error}
						</motion.p>
					)}
				</AnimatePresence>
			</label>
			<div className="relative">
				<span className="absolute top-3.5 left-3">{icon}</span>
				<input
					id={id}
					type="text"
					placeholder={`${example
							? `Eg: ${example}`
							: `Enter your ${label.toLowerCase()}`
						}`}
					value={value}
					onChange={handleOnChange}
					maxLength={maxLength}
					className={`text-light max-xs:text-sm placeholder-light/35 h-11 w-full rounded-lg border bg-neutral-800/70 pr-3 pl-10 focus:border focus:border-yellow-300 focus:outline-none ${error ? "border-red-500" : "border-neutral-700"
						}`}
				/>
			</div>
		</div>
	);
};

// 🔹 Password Input Field
const PasswordField = ({ id, label, value, onChange, error, show, toggle }) => (
	<div>
		<label
			htmlFor={id}
			className="text-light mb-1 text-sm font-medium flex items-center justify-between gap-2"
		>
			{label}
			<AnimatePresence>
				{error && (
					<motion.p
						initial={{ opacity: 0, y: -5 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -5 }}
						transition={{ duration: 0.25 }}
						className="text-xs text-red-400 font-normal"
					>
						{error}
					</motion.p>
				)}
			</AnimatePresence>
		</label>
		<div className="relative">
			<Lock className="absolute left-3 top-3.5 h-4 w-4 text-light/40" />
			<input
				id={id}
				type={show ? "text" : "password"}
				placeholder={`Eg: hello@world`}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className={`text-light max-xs:text-sm placeholder-light/35 h-11 w-full rounded-lg border bg-neutral-800/70 pr-3 pl-10 focus:border focus:border-yellow-300 focus:outline-none ${error ? "border-red-500" : "border-neutral-700"
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
	</div>
);

export default RegisterPage;
