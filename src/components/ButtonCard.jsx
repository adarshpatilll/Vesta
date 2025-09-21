import { Link } from "react-router-dom";

const ButtonCard = ({ icon: Icon, label, onClick, to, isDisabled }) => {
	const baseClasses =
		"flex flex-col items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 p-6 transition-colors";
	const disabledClasses = "opacity-50 cursor-not-allowed";
	const enabledClasses = "hover:bg-neutral-800 cursor-pointer";

	if (to) {
		return isDisabled ? (
			<div className={`${baseClasses} ${disabledClasses}`}>
				<Icon size={28} />
				<span className="font-medium">{label}</span>
			</div>
		) : (
			<Link to={to} className={`${baseClasses} ${enabledClasses}`}>
				<Icon size={28} />
				<span className="font-medium">{label}</span>
			</Link>
		);
	}

	return (
		<button
			onClick={onClick}
			className={`${baseClasses} ${
				isDisabled ? disabledClasses : enabledClasses
			}`}
			disabled={isDisabled}
		>
			<Icon size={28} />
			<span className="font-medium">{label}</span>
		</button>
	);
};

export default ButtonCard;
