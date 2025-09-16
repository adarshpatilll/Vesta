// components/SkeletonTransaction.jsx
import { motion } from "framer-motion";

const SkeletonTransaction = () => {
	return (
		<motion.li
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
			className="flex items-center justify-between rounded-lg bg-neutral-800 border border-neutral-700 p-3 animate-pulse"
		>
			<div className="space-y-2">
				<div className="h-4 w-32 rounded bg-neutral-700"></div>
				<div className="h-3 w-20 rounded bg-neutral-700"></div>
			</div>
			<div className="h-4 w-12 rounded bg-neutral-700"></div>
		</motion.li>
	);
};

export default SkeletonTransaction;
