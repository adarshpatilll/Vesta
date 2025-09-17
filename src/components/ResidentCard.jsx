import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSociety } from "../context/SocietyContext";
import { markMaintenancePaid } from "../firebase/firestore/paymentCycle";
import { WalletMinimal, Pencil, Undo2 } from "lucide-react";
import { RiDeleteBin6Line } from "react-icons/ri";
import MaintenanceHistoryModal from "./MaintenanceHistoryModal";
import { useState } from "react";
import getMonthKey from "../utils/getMonthKey";

const ResidentCard = ({
	filteredResidents,
	showMarkMaintenance = false,
	monthKey,
	onEdit,
	onDelete,
}) => {
	const { societyId, setResidents } = useSociety();
	const currentMonthKey = getMonthKey();

	const handleMarkPaid = async (resident) => {
		try {
			toast.promise(
				markMaintenancePaid(societyId, resident.id, "paid", monthKey),
				{
					loading: `Marking maintenance as paid for Flat ${resident.flatNo}...`,
					success: () => {
						setResidents((prev) =>
							prev.map((r) =>
								r.id === resident.id
									? {
											...r,
											maintenance: {
												...r.maintenance,
												[monthKey]: "paid",
											},
									  }
									: r
							)
						);
						return `Maintenance marked as paid for Flat ${resident.flatNo}`;
					},
					error: `Failed to mark maintenance as paid for Flat ${resident.flatNo}`,
				}
			);
		} catch (err) {
			console.error(err);
			toast.error("Failed to mark maintenance as paid");
		}
	};

	const handleUndoMarkPaid = async (resident) => {
		// only allow undo if it's the current month
		if (monthKey !== currentMonthKey) {
			toast.error("Undo Payment is only allowed for the current month");
			return;
		}

		try {
			toast.promise(
				markMaintenancePaid(societyId, resident.id, "undo", monthKey),
				{
					loading: `Undoing payment for Flat ${resident.flatNo}...`,
					success: () => {
						setResidents((prev) =>
							prev.map((r) =>
								r.id === resident.id
									? {
											...r,
											maintenance: {
												...r.maintenance,
												[monthKey]: "unpaid",
											},
									  }
									: r
							)
						);
						return `Payment undone for Flat ${resident.flatNo}`;
					},
					error: `Failed to undo payment for Flat ${resident.flatNo}`,
				}
			);
		} catch (err) {
			console.error(err);
			toast.error("Failed to undo payment");
		}
	};

	const [showHistoryModal, setShowHistoryModal] = useState(false);
	const [selectedResident, setSelectedResident] = useState(null);

	return (
		<>
			<motion.div
				className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
				initial="hidden"
				animate="visible"
				variants={{
					hidden: {},
					visible: { transition: { staggerChildren: 0.1 } },
				}}
			>
				<AnimatePresence>
					{filteredResidents
						.sort((a, b) => a.flatNo - b.flatNo)
						.map((res) => {
							const isPaid = res.maintenance?.[monthKey] === "paid"; // paid or unpaid

							return (
								<motion.div
									key={res.id}
									className={`relative rounded-2xl border bg-neutral-900/80 p-5 shadow-lg backdrop-blur-xl transition-all duration-300 ${
										showMarkMaintenance
											? isPaid
												? "border-green-500/60"
												: "border-red-500/60"
											: "border-yellow-500/60"
									}`}
									variants={{
										hidden: { opacity: 0 },
										visible: { opacity: 1 },
									}}
									transition={{ duration: 0.3 }}
								>
									{/* Header */}
									<h3 className="mb-3 flex items-center gap-2 justify-between">
										<span className="text-lg font-semibold text-yellow-500">
											Flat &gt; {res.flatNo}
										</span>
										<span
											hidden={!showMarkMaintenance}
											onClick={() => {
												setSelectedResident(res);
												setShowHistoryModal(true);
											}}
											className="text-light/85 cursor-pointer text-xs bg-accent/10 border border-accent/30 px-2 py-0.5 rounded-md"
										>
											Check History
										</span>
									</h3>

									{/* Resident Details */}
									<div className="grid grid-cols-2 gap-2 text-sm">
										<span className="text-gray-400">Owner:</span>
										<span>{res.ownerName}</span>

										<span className="text-gray-400">Contact:</span>
										<span>{res.ownerContact}</span>

										{res.type === "tenant" && (
											<>
												<span className="text-gray-400">
													Tenant:
												</span>
												{res.tenantName}
												<span className="text-gray-400">
													Contact:
												</span>
												{res.tenantContact}
											</>
										)}
									</div>

									{/* Mark Maintenance Button */}
									{showMarkMaintenance && (
										<>
											<button
												hidden={isPaid}
												onClick={() => handleMarkPaid(res)}
												className={`absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-md px-3 backdrop-blur-sm font-medium py-1 text-xs shadow-md transition bg-red-700/80 text-light hover:bg-red-700`}
											>
												<span className="flex items-center gap-1 truncate">
													<WalletMinimal size={14} />
													Mark Maintenance
												</span>
											</button>

											<button
												hidden={
													!isPaid || monthKey !== currentMonthKey
												}
												onClick={() => handleUndoMarkPaid(res)}
												className={`absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-md px-3 backdrop-blur-sm font-medium py-1 text-xs shadow-md transition bg-green-700/80 text-light hover:bg-green-700`}
											>
												<span className="flex items-center gap-1 truncate">
													<Undo2 size={14} />
													Undo Payment
												</span>
											</button>
										</>
									)}

									{/* Edit/Delete Buttons */}
									{(onEdit || onDelete) && (
										<div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
											{onEdit && (
												<button
													onClick={() => onEdit(res)}
													className="flex items-center gap-1 rounded-md bg-blue-600/80 px-3 py-1 text-xs font-medium text-white shadow-md backdrop-blur-sm transition hover:bg-blue-500"
												>
													<Pencil size={14} />
													Edit
												</button>
											)}
											{onDelete && (
												<button
													onClick={() => onDelete(res)}
													className="flex items-center gap-1 rounded-md bg-red-600/80 px-3 py-1 text-xs font-medium text-white shadow-md backdrop-blur-sm transition hover:bg-red-500"
												>
													<RiDeleteBin6Line size={14} />
													Delete
												</button>
											)}
										</div>
									)}
								</motion.div>
							);
						})}
				</AnimatePresence>
			</motion.div>

			{/* Maintenance History Modal */}
			{showHistoryModal && selectedResident && (
				<MaintenanceHistoryModal
					resident={selectedResident}
					onCancel={() => {
						setShowHistoryModal(false);
						setSelectedResident(null);
					}}
				/>
			)}
		</>
	);
};

export default ResidentCard;
