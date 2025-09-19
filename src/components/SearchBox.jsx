import { motion } from "framer-motion";
import { X } from "lucide-react";
import { TypeAnimation } from "react-type-animation";

export default function SearchBox({
	setShowSearch,
	query,
	setQuery,
	placeholderArray = ["name"],
}) {
	return (
		<motion.div
			key="search"
			initial={{ opacity: 0, y: 6 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 6 }}
			transition={{ duration: 0.2 }}
			className="flex w-full items-center gap-2"
		>
			<div className="relative flex-1">
				{/* Input field */}
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="text-light h-8 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 text-sm placeholder-transparent outline-none"
					autoFocus
				/>
				{/* Typing placeholder */}
				{!query && (
					<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
						<TypeAnimation
							sequence={placeholderArray.flatMap((p) => [
								`Search by "${p}"`,
								500,
							])}
							wrapper="span"
							speed={50}
							repeat={Infinity}
						/>
					</span>
				)}
			</div>

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
	);
}
