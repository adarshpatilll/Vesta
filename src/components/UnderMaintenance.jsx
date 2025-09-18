import { motion } from "framer-motion";
import Lottie from "lottie-react";
import maintenanceAnimation from "../assets/under-maint.json";

const UnderMaintenance = () => {
	return (
		<div className="flex h-screen w-full flex-col items-center justify-center bg-dark p-4">
			<Lottie
				animationData={maintenanceAnimation}
				loop={true}
				className="h-48 w-48 sm:h-64 sm:w-64 mb-6"
			/>
			<motion.h1
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				className="mb-4 text-3xl font-bold text-accent"
			>
				Maintenance Mode
			</motion.h1>

			<motion.p
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
				className="text-center text-lg text-light"
			>
				The application is currently undergoing maintenance. Please check
				back later.
			</motion.p>
		</div>
	);
};

export default UnderMaintenance;
