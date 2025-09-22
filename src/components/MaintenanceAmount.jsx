import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
	getMaintenanceAmount,
	setMaintenanceAmount,
} from "../firebase/firestore/maintenanceAmount";
import UpdateMaintenanceAmountModal from "./UpdateMaintenanceAmountModal";

const MaintenanceAmount = ({ societyId, isSuperAdmin }) => {
	const [amount, setAmount] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Fetch current amount
	useEffect(() => {
		const fetchAmount = async () => {
			try {
				const data = await getMaintenanceAmount(societyId);
				if (data) {
					setAmount(data);
					setMaintenanceAmount(societyId, data); // Update context
				}
			} catch (err) {
				console.error(err);
				toast.error("Failed to fetch maintenance amount");
			}
		};
		fetchAmount();
	}, [societyId]);

	const handleSave = async (newAmount) => {
		if (!newAmount || newAmount <= 0) {
			toast.error("Please enter a valid amount");
			return;
		}

		toast.promise(setMaintenanceAmount(societyId, newAmount), {
			loading: "Updating amount...",
			success: () => {
				setIsModalOpen(false);
				setAmount(newAmount);
				return "Maintenance amount updated 🎉";
			},
			error: "Failed to update maintenance amount",
		});
	};

	return (
		<motion.div className="flex flex-col gap-3">
			{/* Header */}
			<h2 className="text-light text-base font-semibold md:text-lg">
				Maintenance Amount
			</h2>

			<div className="flex flex-col items-center justify-between gap-2 rounded-lg border border-neutral-700 px-3 py-2 sm:flex-row sm:items-center">
				{amount !== null ? (
					<div className="flex items-center justify-evenly max-sm:w-full sm:flex-row sm:gap-3">
						<p className="text-light/70 text-sm">Current Amount</p>
						<p className="text-light text-base">₹ {amount}</p>
					</div>
				) : (
					<p className="text-light/60 text-center mb-6">
						No amount set yet
					</p>
				)}

				{/* Update Button only for admins who have edit access */}
				{isSuperAdmin && (
					<motion.button
						whileTap={{ scale: 0.95 }}
						transition={{ type: "spring", stiffness: 400, damping: 17 }}
						onClick={() => {
							setIsModalOpen(true);
						}}
						className="text-light rounded-lg border border-blue-800 bg-blue-500/10 px-2 py-1 text-xs transition-colors hover:bg-blue-600/80 sm:text-sm"
					>
						<span>Update Amount</span>
					</motion.button>
				)}
			</div>

			{isModalOpen && (
				<UpdateMaintenanceAmountModal
					setIsModalOpen={setIsModalOpen}
					handleSave={handleSave}
					currentAmount={amount}
				/>
			)}
		</motion.div>
	);
};

export default MaintenanceAmount;
