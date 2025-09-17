// components/NotificationButton.tsx
import { Bell } from "lucide-react";
import { motion } from "framer-motion";

export default function NotificationButton({
	count = 0,
	onClick,
}: {
	count?: number;
	onClick?: () => void;
}) {
	return (
		<motion.button
			whileTap={{ scale: 0.9 }}
			whileHover={{ scale: 1.06 }}
			transition={{ type: "spring", stiffness: 300 }}
			onClick={onClick}
			className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg"
			aria-label="Notifications"
		>
			<Bell size={20} />
			{count > 0 && (
				<span className="absolute -top-1 -right-1 bg-red-600 text-light text-[10px] font-semibold rounded-full h-[1.18rem] w-[1.18rem] shadow-md animate-pulse flex items-center justify-center">
					{count > 9 ? "9+" : count}
				</span>
			)}
		</motion.button>
	);
}
