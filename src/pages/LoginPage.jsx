import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import Divider from "../components/Divider";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState({ email: "", password: "" });

	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const navigate = useNavigate();

	const { loginAdmin } = useAuth();

	const validateForm = () => {
		let valid = true;
		let newErrors = { email: "", password: "" };

		if (!email.trim()) {
			newErrors.email = "Email is required";
			valid = false;
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			newErrors.email = "Enter a valid email address";
			valid = false;
		}

		if (!password.trim()) {
			newErrors.password = "Password is required";
			valid = false;
		} else if (password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
			valid = false;
		}

		setErrors(newErrors);
		return valid;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;

		setIsLoading(true);

		try {
			const { isAuthorizedBySuperAdmin } = await loginAdmin(email, password);
         
			navigate("/", { replace: true });
		} catch (error) {
			console.error("Error during login:", error);

			if (error.code === "auth/too-many-requests") {
				toast.error(
					"Too many attempts. Please reset your password or try again later."
				);
			} else if (error.code === "auth/invalid-credential") {
				toast.error("Invalid credentials. Please try again.");
			} else {
				toast.error(error.message || "Error logging in. Please try again.");
			}
		} finally {
			setIsLoading(false);
			setPassword("");
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 sm:p-8 lg:p-10">
			<motion.div
				className="bg-dark max-xs:max-w-xs w-full max-w-sm overflow-hidden rounded-2xl border border-neutral-700 shadow-md shadow-neutral-900 sm:max-w-md md:max-w-lg"
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
			>
				{/* Header */}
				<div className="space-y-2 p-6 text-center sm:p-8">
					<h1 className="text-light max-xs:text-xl text-2xl font-bold sm:text-3xl">
						Welcome to Vesta
					</h1>
					<p className="text-light/60 max-xs:text-xs text-sm sm:text-base">
						Sign in to your account to continue
					</p>
				</div>

				<Divider className={"mb-6 sm:mb-8"} />

				<div className="max-xs:gap-3 flex flex-col gap-4 px-6 sm:gap-5 sm:px-8">
					{/* Form */}
					<motion.form
						onSubmit={handleSubmit}
						className="max-xs:gap-3 flex flex-col gap-4 sm:gap-5"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						{/* Email */}
						<div>
							<label
								htmlFor="email"
								className="text-light mb-1 block text-sm font-medium"
							>
								Email
							</label>

							<div className="relative">
								<Mail className="text-light/40 absolute top-3.5 left-3 h-4 w-4" />
								<input
									id="email"
									type="text"
									placeholder="Enter your email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className={`text-light max-xs:text-sm placeholder-light/35 h-11 w-full rounded-lg border bg-neutral-800 pr-3 pl-10 focus:ring focus:ring-yellow-300 focus:outline-none ${
										errors.email
											? "border-red-500 focus:ring-red-400"
											: "border-neutral-700"
									}`}
								/>
							</div>

							<AnimatePresence>
								{errors.email && (
									<motion.p
										key="emailError"
										initial={{ opacity: 0, y: -5 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -5 }}
										transition={{ duration: 0.25 }}
										className="mt-1 text-xs text-red-400"
									>
										{errors.email}
									</motion.p>
								)}
							</AnimatePresence>
						</div>

						{/* Password */}
						<div>
							<label
								htmlFor="password"
								className="text-light mb-1 block text-sm font-medium"
							>
								Password
							</label>
							<div className="relative">
								<Lock className="text-light/40 absolute top-3.5 left-3 h-4 w-4" />
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter your password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className={`text-light max-xs:text-sm placeholder-light/35 h-11 w-full rounded-lg border bg-neutral-800 pr-10 pl-10 focus:ring focus:ring-yellow-300 focus:outline-none ${
										errors.password
											? "border-red-500 focus:ring-red-400"
											: "border-neutral-700"
									}`}
								/>
								<button
									type="button"
									className="text-light/40 hover:text-light/60 absolute top-0 right-0 h-full px-3"
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>

							<AnimatePresence>
								{errors.password && (
									<motion.p
										key="passwordError"
										initial={{ opacity: 0, y: -5 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -5 }}
										transition={{ duration: 0.25 }}
										className="mt-1 text-xs text-red-400"
									>
										{errors.password}
									</motion.p>
								)}
							</AnimatePresence>
						</div>

						{/* Forgot Password */}
						<div className="flex justify-end">
							<Link
								to="/reset-password"
								className="max-xs:text-xs text-sm text-yellow-400 hover:text-yellow-300"
							>
								Forgot password?
							</Link>
						</div>

						{/* Submit */}
						<button
							type="submit"
							className="text-light max-xs:text-sm h-11 w-full rounded-lg bg-yellow-600 text-base font-medium shadow-md transition hover:bg-yellow-500 disabled:opacity-50"
							disabled={isLoading}
						>
							{isLoading ? "Signing in..." : "Sign in"}
						</button>
					</motion.form>
				</div>

				{/* Footer */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="max-xs:text-xs p-6 text-center text-sm text-neutral-400 sm:p-8"
				>
					Don't have an account?{" "}
					<Link
						to="/register"
						className="font-medium text-yellow-400 hover:text-yellow-300"
					>
						Sign up
					</Link>
				</motion.div>

				{/* terms and privacy links */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className="flex flex-col items-center gap-1 justify-center border-t border-neutral-700 bg-dark/50 px-6 py-3"
				>
					<div className="flex items-center gap-2">
						<Link
							to="/terms"
							className="text-light/50 hover:text-accent text-xs"
						>
							Terms of Service
						</Link>{" "}
						<span className="text-light/50 text-xs">|</span>{" "}
						<Link
							to="/privacy"
							className="text-light/50 hover:text-accent text-xs"
						>
							Privacy Policy
						</Link>
					</div>
					<motion.div className="text-center text-xs text-neutral-500">
						&copy; {new Date().getFullYear()} Vesta. All rights reserved.
					</motion.div>
				</motion.div>
			</motion.div>
		</div>
	);
};

export default LoginPage;
