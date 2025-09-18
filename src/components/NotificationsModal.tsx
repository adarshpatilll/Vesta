// components/NotificationsModal.tsx
import { motion, AnimatePresence } from "framer-motion";
import { useSociety } from "../context/SocietyContext";
import { deleteNotification } from "../firebase/firestore/notifications";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useEffect } from "react";

export default function NotificationsModal({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const { notifications, societyId, setNotifications } = useSociety();

	if (!open) return null;

	const handleDelete = async (id: string) => {
		try {
			await deleteNotification(societyId, id);
			setNotifications((prev: any[]) => prev.filter((n) => n.id !== id));
		} catch (err) {
			console.error(err);
			toast.error("Failed to delete notification");
		}
	};

	// Close on ESC key
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};
		window.addEventListener("keydown", handleEsc);
		return () => window.removeEventListener("keydown", handleEsc);
	}, [onClose]);

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					initial={{ opacity: 0, y: -40 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -40 }}
					transition={{ duration: 0.2, ease: "easeOut" }}
					onClick={onClose}
					className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-6"
				>
					<div
						className="w-full max-w-lg rounded-2xl bg-neutral-900/95 p-5 shadow-2xl border border-neutral-700/50"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Header */}
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-light">
								Notifications
							</h3>
							<button
								onClick={onClose}
								className="text-sm text-neutral-400 hover:text-neutral-200 transition"
							>
								<X size={22} />
							</button>
						</div>

						{/* Notification List */}
						<div className="space-y-3 max-h-[60vh] overflow-auto hide-scrollbar">
							{notifications.length === 0 && (
								<div className="text-sm text-center text-neutral-400">
									No notifications 🎉
								</div>
							)}

							{notifications.map((n: any) => (
								<motion.div
									key={n.id}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 10 }}
									transition={{ duration: 0.2 }}
									className="flex items-center justify-between gap-3 p-3 rounded-lg border border-neutral-700 bg-neutral-800/70 backdrop-blur-sm shadow"
								>
									<div>
										<div className="text-sm font-medium text-light">
											Flat {n.flatNo}
										</div>
										<div className="text-xs text-neutral-300">
											{n.message}
										</div>
										<div className="text-[11px] text-neutral-500 mt-1">
											{new Date(
												n.createdAt?.toDate?.() || n.createdAt
											).toLocaleString()}
										</div>
									</div>

									<div className="flex flex-col gap-2">
										<button
											onClick={() => handleDelete(n.id)}
											className="text-xs bg-red-600/80 hover:bg-red-600 px-2 py-1 rounded-md text-light shadow-sm transition"
										>
											Dismiss
										</button>
									</div>
								</motion.div>
							))}
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
