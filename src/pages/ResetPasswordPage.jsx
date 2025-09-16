import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ResetPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleReset = async (e) => {
		e.preventDefault();
		setLoading(true);

		const actionCodeSettings = {
			url: `${import.meta.env.VITE_DOMAIN}/new-password`,
			handleCodeInApp: true,
		};

		toast.promise(sendPasswordResetEmail(auth, email, actionCodeSettings), {
			loading: "Sending...",
			success: () => {
				navigate("/login", { replace: true });
				return "Password reset email sent! Check your inbox or Junk folder.";
			},
			error: (err) => {
				console.error(err);
				return err.message;
			},
			finally: () => {
				setLoading(false);
				setEmail("");
			},
		});
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-neutral-950 p-4">
			<motion.div
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				className="bg-dark max-xs:p-4 max-xs:max-w-xs w-full max-w-sm rounded-2xl border border-neutral-700 p-6 shadow-xl sm:max-w-md"
			>
				<motion.h2
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="text-light max-xs:text-lg mb-4 text-xl font-bold"
				>
					{"Reset Password".split("").map((letter, index) => (
						<motion.span
							key={index}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.03, ease: "easeOut" }}
						>
							{letter}
						</motion.span>
					))}
				</motion.h2>

				<motion.form
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
					onSubmit={handleReset}
					className="space-y-4"
				>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Enter your email"
						required
						className="text-light max-xs:p-2 w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3"
					/>
					<button
						type="submit"
						disabled={loading}
						className="text-light max-xs:p-2 w-full rounded-lg bg-yellow-600 p-3 transition hover:bg-yellow-500"
					>
						{loading ? "Sending..." : "Send Reset Link"}
					</button>
				</motion.form>

				<div className="max-xs:text-xs mt-6 text-center text-sm text-neutral-400">
					Back to{" "}
					<Link
						to="/login"
						className="font-medium text-yellow-400 hover:text-yellow-300"
					>
						Login
					</Link>
				</div>
			</motion.div>
		</div>
	);
};

export default ResetPasswordPage;
