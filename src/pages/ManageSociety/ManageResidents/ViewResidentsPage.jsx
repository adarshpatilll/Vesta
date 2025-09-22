import { useEffect, useState } from "react";
import ResidentCard from "../../../components/ResidentCard";
import BackButton from "../../../components/BackButtonOrLink";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useSociety } from "../../../context/SocietyContext";
import CircularLoader from "./../../../components/CircularLoader";
import { searchFilter } from "../../../utils/searchFilters";
import getMonthKey from "../../../utils/getMonthKey";
import MonthSelector from "../../../components/MonthSelector";
import SearchBox from "../../../components/SearchBox";
import GradientHeading from "@/components/GradientHeading";

const ViewResidentsPage = () => {
	const [query, setQuery] = useState("");
	const [showSearch, setShowSearch] = useState(false);
	const [totalPaid, setTotalPaid] = useState(0);
	const [totalUnpaid, setTotalUnpaid] = useState(0);
	const [selectedCategory, setSelectedCategory] = useState("all");

	const [monthKey, setMonthKey] = useState(getMonthKey());

	const { residents, loading } = useSociety();

	// Update totals when residents or monthKey changes
	useEffect(() => {
		if (residents.length > 0) {
			const paid = residents.filter(
				(resident) => resident.maintenance?.[monthKey] === "paid"
			).length;
			const unpaid = residents.filter(
				(resident) =>
					resident.maintenance?.[monthKey] === "unpaid" ||
					resident.maintenance?.[monthKey] === undefined
			).length;
			setTotalPaid(paid);
			setTotalUnpaid(unpaid);
		}
	}, [residents, monthKey]);

	// Filter by search query and selected category
	let filteredResidents = query
		? searchFilter(residents, query, ["flatNo", "ownerName", "tenantName"])
		: residents;

	if (selectedCategory === "paid") {
		filteredResidents = filteredResidents.filter(
			(resident) => resident.maintenance?.[monthKey] === "paid"
		);
	} else if (selectedCategory === "unpaid") {
		filteredResidents = filteredResidents.filter(
			(resident) =>
				resident.maintenance?.[monthKey] === "unpaid" ||
				resident.maintenance?.[monthKey] === undefined
		);
	}

	return (
		<div className="w-full pt-32 px-2">
			{/* fixed Header + Search */}
			<div className="bg-dark fixed top-14 right-0 left-0 z-30 flex flex-col gap-3 px-6 py-2">
				{/* Header */}
				<motion.div
					className="flex items-center justify-between"
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<GradientHeading content="View Residents" />
					<BackButton isLink />
				</motion.div>

				{/* Search Toggle */}
				<div className="flex flex-col justify-between gap-3">
					<AnimatePresence mode="wait" initial={false}>
						{!showSearch ? (
							<motion.div
								key="default"
								initial={{ opacity: 0, y: -6 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -6 }}
								transition={{ duration: 0.2 }}
								className="flex w-full items-center justify-between"
							>
								<div className="w-full flex items-center gap-2 overflow-x-auto hide-scrollbar">
									<p
										onClick={() => setSelectedCategory("all")}
										className={`text-sm text-light/90 px-2 rounded py-0.5 cursor-pointer ${
											selectedCategory === "all"
												? "bg-neutral-700"
												: "bg-neutral-800"
										}`}
									>
										All: {residents.length}
									</p>
									<p
										onClick={() => setSelectedCategory("paid")}
										className={`text-sm text-green-400 px-2 rounded py-0.5 cursor-pointer ${
											selectedCategory === "paid"
												? "bg-neutral-700"
												: "bg-neutral-800"
										}`}
									>
										Paid: {totalPaid}
									</p>
									<p
										onClick={() => setSelectedCategory("unpaid")}
										className={`text-sm text-red-400 px-2 rounded py-0.5 cursor-pointer ${
											selectedCategory === "unpaid"
												? "bg-neutral-700"
												: "bg-neutral-800"
										}`}
									>
										Unpaid: {totalUnpaid}
									</p>
								</div>

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
							<SearchBox
								setShowSearch={setShowSearch}
								query={query}
								setQuery={setQuery}
								placeholderArray={[
									"flat number",
									"owner name",
									"tenant name",
								]}
							/>
						)}
					</AnimatePresence>

					{/* Month Navigation */}
					<MonthSelector value={monthKey} onChange={setMonthKey} />
				</div>
			</div>

			{/* Resident Cards */}
			<ResidentCard
				filteredResidents={filteredResidents}
				monthKey={monthKey}
				showMarkMaintenance
			/>

			{/* Loading Spinner */}
			{loading && <CircularLoader label="Loading Residents..." />}

			{/* No Residents Message */}
			{!loading && filteredResidents.length === 0 && (
				<p className="mt-4 text-center text-sm text-neutral-400">
					{query
						? `No residents found for "${query}".`
						: "No residents available."}
				</p>
			)}
		</div>
	);
};

export default ViewResidentsPage;
