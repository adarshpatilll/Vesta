import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { useState } from "react";

const ResidentSelectModal = ({ residents, selectedIds, onClose, onSave }) => {
	const [selected, setSelected] = useState(new Set(selectedIds || []));

	const toggleSelect = (id) => {
		setSelected((prev) => {
			const copy = new Set(prev); // create a copy to avoid mutating state directly
			if (copy.has(id)) copy.delete(id); // deselect if already selected
			else copy.add(id); // select if not selected
			return copy;
		});
	};

	return (
		<div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
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

				{/* List */}
				<div className="overflow-y-auto hide-scrollbar max-h-[60vh] relative">
					<div className="space-y-3">
						{residents.map((res) => {
							const isSelected = selected.has(res.id);
							return (
								<div
									key={res.id}
									onClick={() => toggleSelect(res.id)}
									className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition ${
										isSelected
											? "border-yellow-500 bg-yellow-600/20 text-yellow-400"
											: "border-neutral-700 bg-neutral-800 text-light/70"
									}`}
								>
									{/* Custom Checkbox */}
									<div
										className={`flex h-5 w-5 items-center justify-center rounded border ${
											isSelected
												? "border-yellow-500 bg-yellow-500 text-dark"
												: "border-neutral-500"
										}`}
									>
										{isSelected && <Check size={14} />}
									</div>
									<span>
										Flat {res.flatNo} - {res.ownerName}
									</span>
								</div>
							);
						})}
					</div>
				</div>

				{/* Actions */}
				<div className="mt-6 flex justify-end gap-3">
					<button
						onClick={onClose}
						className="rounded-lg bg-neutral-700 px-4 py-2 text-sm"
					>
						Cancel
					</button>
					<button
						onClick={() => onSave(Array.from(selected))}
						className="rounded-lg bg-yellow-600 px-6 py-2 text-sm text-dark font-semibold hover:bg-yellow-500"
					>
						Save
					</button>
				</div>
			</motion.div>
		</div>
	);
};

export default ResidentSelectModal;
