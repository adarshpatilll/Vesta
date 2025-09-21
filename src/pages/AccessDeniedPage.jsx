import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import errorAnimation from "@/assets/access-denied";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const AccessDeniedPage = () => {
	const navigate = useNavigate();
	const [counting, setCounting] = useState(5);
	const { logoutAdmin } = useAuth();

	useEffect(() => {
		// This effect is for countdown only
		if (counting === 0) {
			logoutAdmin(); // Call it once when the countdown finishes
			navigate("/login");
			return;
		}

		const interval = setInterval(() => {
			setCounting((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(interval);
	}, [counting, navigate, logoutAdmin]);

	return (
		<motion.div
			className="bg-dark text-light flex min-h-screen flex-col items-center justify-center px-4"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
		>
			<motion.h1
				className="mb-4 text-6xl font-bold text-yellow-400"
				initial={{ scale: 0.8 }}
				animate={{ scale: 1 }}
				transition={{ duration: 0.4 }}
			>
				<Lottie
					animationData={errorAnimation}
					loop={true}
					className="w-52 md:w-64 h-5w-52 md:h-64"
				/>
			</motion.h1>

			<motion.p
				className="mb-2 max-w-md text-center text-xl text-accent font-semibold md:text-2xl"
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.4, delay: 0.2 }}
			>
				Access Denied!
			</motion.p>

			<motion.p
				className="mb-6 max-w-lg text-center text-base text-neutral-400 md:text-lg"
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.4, delay: 0.2 }}
			>
				Waiting for Super Admin approval before you can log in.
			</motion.p>

			<motion.button className="text-dark flex items-center gap-2 rounded-lg bg-yellow-400 px-6 py-3 font-medium">
				Redirecting to Login in {counting}...
			</motion.button>
		</motion.div>
	);
};

export default AccessDeniedPage;
