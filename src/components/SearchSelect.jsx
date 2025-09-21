import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { searchFilter } from "@/utils/searchFilters";
import { motion } from "framer-motion";
import Divider from "./Divider";
import { BadgeCheck, BadgeX, PenIcon, PenOffIcon } from "lucide-react";

export default function SearchSelect({
	label,
	options,
	value,
	defaultValue,
	onChange,
	autoFocus = true,
	forOnChangeReturnsObject = false,
	forAuthorization = false,
	forEditAccess = false,
}) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const ref = useRef(null);

	// Close on outside click
	useEffect(() => {
		function handleClickOutside(e) {
			if (ref.current && !ref.current.contains(e.target)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Filter options based on query
	const filtered = searchFilter(options, query.trim(), ["label"]);

	return (
		<div ref={ref} className="relative flex w-full flex-col select-none">
			{label && <label className="text-light text-sm">{label}</label>}

			{/* Input Box */}
			<div
				className={`mt-1 flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors ${
					open
						? "border-light border bg-neutral-800" // active state
						: "border border-neutral-700 bg-neutral-800"
				}`}
				onClick={() => {
					setOpen((prev) => !prev);
					setQuery("");
				}}
			>
				<span
					className={`flex-1 truncate ${
						value ? "text-light" : "text-light/50"
					}`}
				>
					{value
						? typeof value === "object"
							? value.value
							: value
						: defaultValue
						? defaultValue
						: "Select an option"}
				</span>
				<IoIosArrowDown
					className={`ml-2 shrink-0 transition-transform ${
						open ? "rotate-180" : ""
					}`}
				/>
			</div>

			{/* Dropdown */}
			{open && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="absolute top-full left-0 z-10 mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-900 shadow-lg"
				>
					{/* Search */}
					<input
						type="text"
						placeholder={"Search or select an option..."}
						value={query}
						autoFocus={autoFocus}
						onChange={(e) => setQuery(e.target.value)}
						className="w-full rounded-t-lg border-b border-neutral-700 bg-neutral-800 px-3 py-2 text-gray-200 focus:outline-none"
					/>

					{/* Options */}
					<motion.ul
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						className="hide-scrollbar max-h-52 overflow-y-auto"
					>
						{filtered.map((opt, idx) => (
							<React.Fragment key={opt.value + idx}>
								<li
									className={`cursor-pointer px-3 py-2 text-light transition-colors hover:bg-neutral-800 `}
									onClick={() => {
										onChange(
											forOnChangeReturnsObject ? opt : opt.value
										);
										setOpen(false);
										setQuery("");
									}}
								>
									<div className="flex flex-col w-full">
										{/* Name + Badge */}
										<div className="flex items-center gap-2">
											<span>{opt.label.split("-")[0]}</span>

											{forAuthorization && (
												<span>
													{opt.isAuthorizedBySuperAdmin ? (
														<BadgeCheck
															className="text-green-500 shrink-0"
															size={16}
														/>
													) : (
														<BadgeX
															className="text-red-500 shrink-0"
															size={16}
														/>
													)}
												</span>
											)}
											{forEditAccess && (
												<span>
													{opt.isEditAccess ? (
														<PenIcon
															className="text-green-500 shrink-0"
															size={16}
														/>
													) : (
														<PenOffIcon
															className="text-red-500 shrink-0"
															size={16}
														/>
													)}
												</span>
											)}
										</div>

										{/* Email / Secondary text */}
										<span className="text-light/60 text-sm truncate">
											({opt.label.split("-")[1]}){" "}
										</span>
									</div>
								</li>

								{
									// Divider is not added after the last item
									idx !== filtered.length - 1 && <Divider />
								}
							</React.Fragment>
						))}

						{filtered.length === 0 && query === "" && (
							<li className="text-light/50 px-3 py-2">
								No results found
							</li>
						)}
					</motion.ul>
				</motion.div>
			)}
		</div>
	);
}
