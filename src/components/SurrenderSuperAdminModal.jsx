import React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { surrenderSuperAdminRole } from "@/firebase/firestore/admin";

const SurrenderSuperAdminModal = ({
	selectedAdmin,
	onClose,
	setAllAdmins,
	setUser,
	setIsSuperAdmin,
	setSelectedAdmin,
}) => {
	const handleConfirm = async () => {
		const adminId = selectedAdmin?.id;
		const isReadyForGetAccess =
			selectedAdmin?.isAuthorizedBySuperAdmin &&
			selectedAdmin?.isEditAccess &&
			!selectedAdmin?.isSuperAdmin;

		if (!adminId) {
			toast.error("Invalid admin selected.");
			return;
		}

		if (!isReadyForGetAccess) {
			toast.error(
				"Admin must have Edit Access and be Authorized by Super Admin to receive Super Admin role."
			);
			return;
		}

		toast.promise(surrenderSuperAdminRole(adminId), {
			loading: "Transferring Super Admin role...",
			success: () => {
				// Update local state: promote selected admin
				setUser((prevUser) => ({
					...prevUser,
					adminDetails: {
						...prevUser.adminDetails,
						isSuperAdmin: true,
					},
				}));
				// Update local state: demote current user
				setIsSuperAdmin(false);
            // Update all admins list
				setAllAdmins((prevAdmins) =>
					prevAdmins.map((admin) =>
						admin.id === adminId
							? { ...admin, isSuperAdmin: true }
							: admin
					)
				);
				return `Super Admin role granted to ${selectedAdmin?.name}.`;
			},
			error: (err) => {
				console.error("❌ Error surrendering Super Admin role:", err);
				return "Failed to surrender Super Admin role.";
			},
			finally: () => {
				onClose();
				setSelectedAdmin(null);
			},
		});
	};

	return (
		<div
			role="dialog"
			aria-modal="true"
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
		>
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.9 }}
				className="bg-dark text-light hide-scrollbar relative w-[90%] rounded-xl p-4 shadow-xl sm:w-[90%] sm:rounded-2xl sm:p-6 md:w-full md:max-w-md"
			>
				<h2 className="mb-4 text-lg font-semibold text-light">
					Super Admin Access
				</h2>
				<p className="mb-4 text-sm text-neutral-300">
					Are you sure you want to transfer Super Admin role to{" "}
					<span className="font-medium text-yellow-400">
						{selectedAdmin?.name}
					</span>
					?
				</p>

				<div className="flex justify-end gap-3">
					<button
						onClick={onClose}
						className="rounded-md bg-neutral-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-600"
					>
						Cancel
					</button>

					<button
						onClick={handleConfirm}
						className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
					>
						Surrender Access
					</button>
				</div>
			</motion.div>
		</div>
	);
};

export default SurrenderSuperAdminModal;
