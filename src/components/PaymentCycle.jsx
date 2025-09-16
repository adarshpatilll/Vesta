import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
	getPaymentCycle,
	setPaymentCycle,
} from "../firebase/firestore/paymentCycle";
import UpdatePaymentCycleModal from "./UpdatePaymentCycleModal";

const PaymentCycle = ({ societyId }) => {
	const [cycle, setCycle] = useState(null);
	const [loading, setLoading] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedDates, setSelectedDates] = useState({
		start: null,
		end: null,
	});

	// Fetch current cycle
	useEffect(() => {
		const fetchCycle = async () => {
			try {
				const data = await getPaymentCycle(societyId);
				if (data) {
					setCycle({
						startDay: data.startDay,
						endDay: data.endDay,
					});
				}
			} catch (err) {
				console.error(err);
				toast.error("Failed to fetch payment cycle");
			}
		};
		fetchCycle();
	}, [societyId]);

	const handleSaveCycle = async () => {
		if (!selectedDates.start || !selectedDates.end) {
			toast.error("Please select both start and end day");
			return;
		}
		setLoading(true);
		try {
			const startDay = selectedDates.start;
			const endDay = selectedDates.end;

			await setPaymentCycle(societyId, startDay, endDay);
			setCycle({ startDay, endDay });
			setPaymentCycle({ startDay, endDay });
			toast.success("Payment cycle updated 🎉");
			setIsModalOpen(false);
		} catch (err) {
			console.error(err);
			toast.error("Failed to update payment cycle");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-3">
			{/* Title */}
			<h3 className="text-light text-base font-semibold md:text-lg">
				Maintenance Cycle
			</h3>

			{/* Current Cycle */}
			<div className="flex flex-col items-center justify-between gap-2 rounded-lg border border-neutral-700 px-3 py-2 sm:flex-row">
				{loading ? (
					<p className="text-light/70 text-sm">Updating...</p>
				) : cycle ? (
					<p className="text-light text-sm sm:text-base">
						<span className="font-medium text-yellow-400">
							Day {cycle.startDay} → Day {cycle.endDay}
						</span>{" "}
						(of every month)
					</p>
				) : (
					<p className="text-light/60 text-center text-sm md:text-left">
						No cycle set yet
					</p>
				)}

				{/* Update Button */}
				{!loading && (
					<motion.button
						whileTap={{ scale: 0.95 }}
						transition={{ type: "spring", stiffness: 400, damping: 17 }}
						onClick={() => {
							setSelectedDates({ start: null, end: null });
							setIsModalOpen(true);
						}}
						className="text-light rounded-lg border border-blue-800 bg-blue-500/10 px-2 py-1 text-xs transition-colors hover:bg-blue-600/80 sm:text-sm"
					>
						Update Cycle
					</motion.button>
				)}
			</div>

			{/* Modal */}
			{isModalOpen && (
				<UpdatePaymentCycleModal
					setIsModalOpen={setIsModalOpen}
					handleSaveCycle={handleSaveCycle}
					selectedDates={selectedDates}
					setSelectedDates={setSelectedDates}
				/>
			)}
		</div>
	);
};

export default PaymentCycle;
