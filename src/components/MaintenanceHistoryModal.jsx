import { motion } from "framer-motion";
import { X } from "lucide-react";

const MaintenanceHistoryModal = ({ resident, onCancel }) => {
	// Convert object to array and sort by date (assuming date is in YYYY-MM format)
	const maintenanceHistory = Object.entries(resident?.maintenance || {})
		.map(([date, status]) => ({ date, status }))
		.sort((a, b) => new Date(b.date) - new Date(a.date));

	return (
		<div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.9 }}
				className="bg-dark text-light hide-scrollbar flex max-h-[80vh] w-[80%] flex-col gap-5 rounded-xl p-4 sm:w-[90%] sm:max-w-sm sm:rounded-2xl sm:p-6"
			>
				<div className="flex w-full items-center justify-between">
					<h2 className="text-base font-semibold sm:text-base">
						Maintenance History - Flat {resident?.flatNo}
					</h2>
					<button
						onClick={onCancel}
						className="text-neutral-400 hover:text-light"
					>
						<X size={22} />
					</button>
				</div>

				<motion.div
					initial="hidden"
					animate="visible"
					exit="hidden"
					variants={{
						hidden: { opacity: 0 },
						visible: {
							opacity: 1,
							transition: {
								staggerChildren: 0.03,
							},
						},
					}}
					className="overflow-y-auto px-2 py-1 hide-scrollbar"
				>
					{maintenanceHistory.length > 0 ? (
						<ul className="flex flex-col gap-4">
							{maintenanceHistory.map((entry, index) => (
								<motion.li
									key={index}
									variants={{
										hidden: { opacity: 0, y: 20 },
										visible: { opacity: 1, y: 0 },
									}}
								>
									<div className="flex justify-between">
										<span className="text-sm text-light/90">
											{entry.date}
										</span>
										<span className="text-sm font-medium">
											{entry.status === "paid" ? (
												<span className="text-green-400">Paid</span>
											) : (
												<span className="text-red-400">Unpaid</span>
											)}
										</span>
									</div>
								</motion.li>
							))}
						</ul>
					) : (
						<p className="text-sm text-gray-400">
							No maintenance history available.
						</p>
					)}
				</motion.div>
			</motion.div>
		</div>
	);
};

export default MaintenanceHistoryModal;
