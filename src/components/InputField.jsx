import { motion } from "framer-motion";

export const InputField = ({
	label,
	type,
	name,
	value,
	onChange,
	placeholder,
	maxLength,
}) => (
	<motion.div
		variants={{
			hidden: { opacity: 0, y: 20 },
			visible: { opacity: 1, y: 0 },
		}}
		transition={{ duration: 0.2 }}
		className={`flex flex-col gap-1`}
	>
		<label className="text-sm">{label}</label>
		<input
			type={type}
			name={name}
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			className="w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-light 
	           focus:outline-none focus:ring-0 focus:border-yellow-500"
			maxLength={maxLength ? maxLength : 250}
		/>
	</motion.div>
);
