const GradientHeading = ({ content, children }) => {
	return (
		<p className="text-lg font-semibold bg-gradient-to-r from-yellow-500 to-light bg-clip-text text-transparent">
			{content || children}
		</p>
	);
};

export default GradientHeading;
