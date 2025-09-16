import { motion } from "framer-motion";

export const RadioButtonGroup = ({ label, name, value, onChange, options }) => (
	<motion.div
		variants={{
			hidden: { opacity: 0, y: 20 },
			visible: { opacity: 1, y: 0 },
		}}
		transition={{ duration: 0.2 }}
		className={`flex flex-col gap-1`}
	>
		<label className={`text-sm`}>{label}</label>

		<div className={`flex gap-4 flex-wrap`}>
			{options.map((option) => (
				<label
					key={option.value}
					className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition ${
						value === option.value
							? "border-yellow-500 bg-yellow-600/20 text-yellow-400"
							: "border-neutral-700 bg-neutral-800 text-light/70"
					}`}
					onClick={() => onChange(option.value)}
				>
					<input
						type="radio"
						name={name}
						checked={value === option.value}
						readOnly
						className="hidden"
					/>
					<span>{option.label}</span>
				</label>
			))}
		</div>
	</motion.div>
);
