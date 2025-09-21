import { motion } from "framer-motion";
import { X } from "lucide-react";

const DeleteModal = ({ resident, onCancel, onConfirm }) => {
	return (
		<div
			role="dialog"
			aria-modal="true"
			className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
		>
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.9 }}
				className="bg-dark text-light hide-scrollbar flex max-h-[80vh] w-[90%] flex-col gap-7 overflow-y-auto rounded-xl p-4 sm:w-[90%] sm:max-w-lg sm:rounded-2xl sm:p-6"
			>
				<div className="flex w-full items-center justify-between">
					<h2 className="text-lg font-semibold sm:text-xl">
						Delete Resident
					</h2>
					<button
						onClick={onCancel}
						className="text-neutral-400 hover:text-light"
					>
						<X size={22} />
					</button>
				</div>

				<p className="mb-6 text-sm text-neutral-300">
					Are you sure you want to delete resident of{" "}
					<b className="text-accent">Flat {resident?.flatNo}</b>?
					<span className="text-red-400">
						{" "}
						This action cannot be undone.
					</span>
				</p>

				<div className="flex justify-end gap-3">
					<button
						onClick={onCancel}
						className="rounded-md bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-600"
					>
						Cancel
					</button>
					<button
						onClick={() => onConfirm(resident)}
						className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
					>
						Delete
					</button>
				</div>
			</motion.div>
		</div>
	);
};

export default DeleteModal;
