import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import BackButton from "../../../components/BackButtonOrLink";
import ResidentCard from "../../../components/ResidentCard";
import EditResidentModal from "../../../components/EditResidentModal.jsx";
import DeleteModal from "../../../components/DeleteModal.jsx";
import { searchFilter } from "../../../utils/searchFilters";
import { useSociety } from "../../../context/SocietyContext";
import CircularLoader from "../../../components/CircularLoader";
import { deleteResident } from "../../../firebase/firestore/residents.js";
import { toast } from "sonner";

const UpdateResidentsPage = () => {
	const [query, setQuery] = useState("");
	const [showSearch, setShowSearch] = useState(false);

	const [selectedResident, setSelectedResident] = useState(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const { residents, loading, setResidents, societyId } = useSociety();

	// Apply search filter
	let filteredResidents = query
		? searchFilter(residents, query, ["flatNo", "ownerName", "tenantName"])
		: residents;

	// Handle delete
	const handleDelete = async (resident) => {
		try {
			toast.promise(deleteResident(societyId, resident.id), {
				loading: `Deleting resident of Flat ${resident.flatNo}...`,
				success: "Resident deleted successfully.",
				error: (err) => `Failed to delete resident: ${err.message}`,
			});
			setResidents((prev) => prev.filter((r) => r.id !== resident.id));
		} catch (error) {
			console.error("Failed to delete resident", error);
		} finally {
			setSelectedResident(null);
			setShowDeleteModal(false);
		}
	};

	return (
		<motion.div
			className="bg-dark text-light min-h-full px-2 py-2"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.4 }}
		>
			<div className="mx-auto max-w-5xl">
				<div className="pt-18">
					{/* Header + Search */}
					<div className="bg-dark fixed top-14 right-0 left-0 z-30 flex flex-col gap-3 px-6 py-2">
						{/* Header */}
						<motion.div
							className="flex items-center justify-between"
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
						>
							<h2 className="text-lg font-semibold">Update Residents</h2>
							<BackButton isLink />
						</motion.div>

						{/* Search */}
						<div className="flex items-center justify-between gap-3">
							<AnimatePresence mode="wait" initial={false}>
								{!showSearch ? (
									<motion.div
										key="search-closed"
										initial={{ opacity: 0, y: -6 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -6 }}
										className="flex w-full items-center justify-between"
									>
										<p className="text-sm text-light/90 px-2 rounded py-0.5 bg-neutral-800">
											{residents.length} residents
										</p>
										<motion.button
											onClick={() => setShowSearch(true)}
											className="text-light ml-3 rounded-md bg-neutral-800 p-2 hover:bg-neutral-700"
											whileHover={{ scale: 1.08 }}
											whileTap={{ scale: 0.95 }}
										>
											<Search size={18} />
										</motion.button>
									</motion.div>
								) : (
									<motion.div
										key="search-open"
										initial={{ opacity: 0, y: 6 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 6 }}
										className="flex w-full items-center gap-2"
									>
										<motion.input
											type="text"
											value={query}
											onChange={(e) => setQuery(e.target.value)}
											placeholder="Search resident..."
											className="text-light h-8 flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 text-sm placeholder-neutral-400 outline-none"
											autoFocus
										/>
										<motion.button
											onClick={() => {
												setShowSearch(false);
												setQuery("");
											}}
											className="text-light rounded-md bg-neutral-800 p-2 hover:bg-neutral-700"
											whileHover={{ scale: 1.08 }}
											whileTap={{ scale: 0.95 }}
										>
											<X size={18} />
										</motion.button>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>

					{/* Resident Cards */}
					<ResidentCard
						filteredResidents={filteredResidents}
						onEdit={(res) => {
							setSelectedResident(res);
							setShowEditModal(true);
						}}
						onDelete={(res) => {
							setSelectedResident(res);
							setShowDeleteModal(true);
						}}
					/>

					{/* Edit Modal */}
					{showEditModal && selectedResident && (
						<EditResidentModal
							resident={selectedResident}
							onClose={() => {
								setSelectedResident(null);
								setShowEditModal(false);
							}}
						/>
					)}

					{/* Delete Modal */}
					{showDeleteModal && selectedResident && (
						<DeleteModal
							resident={selectedResident}
							onCancel={() => {
								setSelectedResident(null);
								setShowDeleteModal(false);
							}}
							onConfirm={() => {
								handleDelete(selectedResident);
							}}
						/>
					)}

					{/* Loader */}
					{loading && <CircularLoader label="Loading Residents..." />}

					{/* Empty state */}
					{!loading && filteredResidents.length === 0 && (
						<p className="mt-4 text-center text-sm text-neutral-400">
							{query
								? `No residents found for "${query}".`
								: "No residents available."}
						</p>
					)}
				</div>
			</div>
		</motion.div>
	);
};

export default UpdateResidentsPage;
