import { motion } from "framer-motion";
import { useState } from "react";

const UpdateMaintenanceAmountModal = ({
	setIsModalOpen,
	handleSave,
	currentAmount,
}) => {
	const [amount, setAmount] = useState(currentAmount || "");

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.9 }}
				className="bg-dark text-light flex flex-col gap-4 relative rounded-xl p-4 shadow-xl sm:rounded-2xl sm:p-6 w-full max-w-md max-xs:w-[90%]"
			>
				<h2 className="text-light text-lg font-semibold">
					Update Maintenance Amount
				</h2>

				<p className="text-light/70 text-sm">
					Enter the <b>monthly maintenance</b> amount:
				</p>

				{/* Input */}
				<input
					type="number"
					value={amount}
					autoFocus
					onChange={(e) => setAmount(e.target.value)}
					className="w-full rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-light placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
					placeholder="Enter amount (₹)"
				/>

				{/* Buttons */}
				<div className="flex justify-end gap-3 pt-2">
					<button
						onClick={() => setIsModalOpen(false)}
						className="rounded-md bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-600"
					>
						Cancel
					</button>
					<button
						onClick={() => handleSave(amount)}
						className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
					>
						Confirm
					</button>
				</div>
			</motion.div>
		</div>
	);
};

export default UpdateMaintenanceAmountModal;
