import dayjs from "dayjs";

const DayGrid = ({ onSelect, selectedStart, selectedEnd }) => {
	const daysInMonth = dayjs().daysInMonth(); // current month total days
	const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

	const isSelected = (day) => {
		// Case 1: Only start selected
		if (selectedStart && !selectedEnd) {
			return day === selectedStart;
		}
		// Case 2: Start + End range selected
		if (selectedStart && selectedEnd) {
			return day >= selectedStart && day <= selectedEnd;
		}
		return false;
	};

	return (
		<div className="grid grid-cols-7 gap-2">
			{days.map((day) => (
				<button
					key={day}
					onClick={() => onSelect(day)}
					className={`max-xs:h-8 max-xs:w-8 h-10 w-10 rounded-lg max-xs:text-xs text-sm font-medium transition
            ${
					isSelected(day)
						? "bg-yellow-500 text-dark hover:bg-yellow-600"
						: "bg-neutral-800 text-light hover:bg-neutral-700"
				}`}
				>
					{day}
				</button>
			))}
		</div>
	);
};

export default DayGrid;
