import { X } from "lucide-react";
import { motion } from "framer-motion";
import AdminAuthStatusBundle from "./AdminAuthStatusBundle";

const ManageAdminAccessModal = ({
	allAdmins,
	loadingAdmins,
	setUser,
	setIsSuperAdmin,
	onClose,
	setAllAdmins,
}) => {
	return (
		<div
			role="dialog"
			aria-modal="true"
			className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
		>
			<motion.div
				initial={{ opacity: 0, y: -30 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -30 }}
				className="bg-dark text-light max-h-[80vh] w-[90%] max-w-lg rounded-xl p-6"
			>
				{/* Header */}
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-lg font-semibold">Select Residents</h2>
					<button
						onClick={onClose}
						className="text-neutral-400 hover:text-light"
					>
						<X size={20} />
					</button>
				</div>

				<AdminAuthStatusBundle
					allAdmins={allAdmins}
					loadingAdmins={loadingAdmins}
					setUser={setUser}
					setIsSuperAdmin={setIsSuperAdmin}
					onClose={onClose}
					setAllAdmins={setAllAdmins}
				/>
			</motion.div>
		</div>
	);
};

export default ManageAdminAccessModal;
