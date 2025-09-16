import dayjs from "dayjs";
import { IoIosArrowBack } from "react-icons/io";

const MonthSelector = ({ value, onChange, label }) => {
	const currentMonthKey = dayjs().format("YYYY-MM"); // e.g., "2024-06"
	const minMonthKey = import.meta.env.VITE_MIN_MONTH_KEY || "2025-07"; // default min month if not set in .env

	// handlers for prev/next buttons
	const handlePrev = () => {
		if (value === minMonthKey) return; // stop if min reached
		const prevMonth = dayjs(value, "YYYY-MM")
			.subtract(1, "month")
			.format("YYYY-MM");
		onChange(prevMonth);
	};

	const handleNext = () => {
		if (value === currentMonthKey) return; // stop if current reached
		const nextMonth = dayjs(value, "YYYY-MM")
			.add(1, "month")
			.format("YYYY-MM");
		onChange(nextMonth);
	};

	// check disable conditions
	const disablePrev = value === minMonthKey;
	const disableNext = value === currentMonthKey;

	return (
		<div className="flex items-center justify-between gap-4 text-sm">
			<button
				type="button"
				onClick={handlePrev}
				disabled={disablePrev}
				className={
					"text-light rounded-md bg-neutral-700 px-1.5 py-1 hover:bg-neutral-600 disabled:opacity-50"
				}
			>
				<IoIosArrowBack size={18} />
			</button>

			<span
				className={`font-medium ${
					value === currentMonthKey ? "text-orange-300" : "text-light"
				}`}
			>
				{dayjs(value, "YYYY-MM").format("MMMM YYYY")}
			</span>

			<button
				type="button"
				onClick={handleNext}
				disabled={disableNext}
				className={
					"text-light rounded-md bg-neutral-700 px-1.5 py-1 hover:bg-neutral-600 disabled:opacity-50"
				}
			>
				<IoIosArrowBack size={18} className="rotate-180" />
			</button>
		</div>
	);
};

export default MonthSelector;
