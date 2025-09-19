import { motion } from "framer-motion";
import DayGrid from "./DayGrid";

const UpdatePaymentCycleModal = ({
	setIsModalOpen,
	handleSaveCycle,
	selectedDates,
	setSelectedDates,
}) => {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.9 }}
				className="bg-dark text-light hide-scrollbar flex flex-col gap-4 relative rounded-xl p-6 shadow-xl sm:rounded-2xl max-w-md min-w-[290px]"
			>
				<h2 className="text-light text-lg font-semibold">
					Update Payment Cycle
				</h2>

				<p className="text-light/70 text-sm">
					Select <b>start</b> and <b>end</b> day of the month:
				</p>

				<div className="flex flex-col gap-2 items-center">
					<DayGrid
						selectedStart={selectedDates.start}
						selectedEnd={selectedDates.end}
						onSelect={(day) => {
							if (
								!selectedDates.start ||
								(selectedDates.start && selectedDates.end)
							) {
								// First click OR reset case
								setSelectedDates({ start: day, end: null });
							} else {
								// Second click → normalize start and end
								const start = Math.min(selectedDates.start, day);
								const end = Math.max(selectedDates.start, day);
								setSelectedDates({ start, end });
							}
						}}
					/>

					{selectedDates.start && selectedDates.end && (
						<p className="text-sm text-center text-light">
							Selected: Day {selectedDates.start} → Day{" "}
							{selectedDates.end}
						</p>
					)}
				</div>

				<div className="flex justify-end gap-3">
					<button
						onClick={() => setIsModalOpen(false)}
						className="rounded-md bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-600"
					>
						Cancel
					</button>
					<button
						onClick={handleSaveCycle}
						className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
					>
						Confirm
					</button>
				</div>
			</motion.div>
		</div>
	);
};

export default UpdatePaymentCycleModal;
