import React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { authorizeOrUnauthorizeAdmin } from "@/firebase/firestore/admin";

const AuthorizeOrUnauthorizeAdminModal = ({
	selectedAdmin,
	onClose,
	setAllAdmins,
	setSelectedAdmin,
}) => {
	const handleConfirm = async () => {
		const adminId = selectedAdmin?.id;
		const isCurrentlyAuthorized = selectedAdmin?.isAuthorizedBySuperAdmin;

		toast.promise(
			authorizeOrUnauthorizeAdmin(adminId, !isCurrentlyAuthorized),
			{
				loading: isCurrentlyAuthorized
					? "Unauthorizing admin..."
					: "Authorizing admin...",
				success: () => {
					// Update local state with the *new* values
					setAllAdmins((prevAdmins) =>
						prevAdmins.map((admin) =>
							admin.id === adminId
								? {
										...admin,
										isAuthorizedBySuperAdmin: !isCurrentlyAuthorized,
										// If unauthorized, force edit access to false
										isEditAccess: !isCurrentlyAuthorized
											? admin.isEditAccess
											: false,
								  }
								: admin
						)
					);
					return isCurrentlyAuthorized
						? "Admin unauthorized successfully!"
						: "Admin authorized successfully!";
				},
				error: (err) => {
					console.error("❌ Error authorizing/unauthorizing admin:", err);
					return "Failed to update admin authorization status.";
				},
				finally: () => {
					// ✅ cleanup happens here
					onClose();
					setSelectedAdmin(null);
				},
			}
		);
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
				<h2 className="text-light mb-4 text-lg font-semibold">
					Admin Authorization
				</h2>
				<p className="mb-4 text-sm text-neutral-300">
					Are you sure you want to{" "}
					{selectedAdmin?.isAuthorizedBySuperAdmin
						? "unauthorize"
						: "authorize"}{" "}
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
						className={`rounded-md px-4 py-2 text-sm font-medium text-white transition-colors  ${
							!selectedAdmin?.isAuthorizedBySuperAdmin
								? "bg-green-600 hover:bg-green-500"
								: "bg-red-600 hover:bg-red-500"
						}`}
					>
						{selectedAdmin?.isAuthorizedBySuperAdmin
							? "Unauthorize Admin"
							: "Authorize Admin"}
					</button>
				</div>
			</motion.div>
		</div>
	);
};

export default AuthorizeOrUnauthorizeAdminModal;
