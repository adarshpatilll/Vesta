import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";

export default function TransactionList({ filteredTx, selectedTab }) {
	const scrollRef = useRef(null);
	const [isScrollable, setIsScrollable] = useState(false);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;

		const checkScroll = () => {
			setIsScrollable(el.scrollHeight > el.clientHeight);
		};

		checkScroll(); // run on mount
		window.addEventListener("resize", checkScroll); // update on resize
		return () => window.removeEventListener("resize", checkScroll);
	}, [filteredTx]);

	return (
		<div className="relative p-4">
			<div
				ref={scrollRef}
				className="overflow-y-auto hide-scrollbar relative tx-scroll"
			>
				{filteredTx.length > 0 ? (
					<motion.ul
						initial="hidden"
						animate="visible"
						variants={{
							hidden: { opacity: 0 },
							visible: {
								opacity: 1,
								transition: { staggerChildren: 0.1 },
							},
						}}
						className={`space-y-3 ${isScrollable ? "pb-1" : ""}`} // 👈 keep padding for bottom visibility
					>
						{filteredTx.map((tx) => (
							<motion.li
								key={tx.id}
								variants={{
									hidden: { opacity: 0, y: 10 },
									visible: { opacity: 1, y: 0 },
								}}
								transition={{ duration: 0.3 }}
								className="flex items-center justify-between rounded-lg bg-neutral-800 border border-neutral-700 p-3"
							>
								<div className="space-y-1">
									<p className="font-medium text-sm text-light">
										{tx.description}
									</p>
									<p className="text-xs text-neutral-400">
										{tx.date
											? dayjs(tx.date?.toDate?.() || tx.date).format(
													"DD MMM, YYYY"
											  )
											: tx.monthKey}
									</p>
								</div>
								<span
									className={`font-semibold ${
										tx.type === "credit"
											? "text-green-400"
											: "text-red-400"
									}`}
								>
									₹{Number(tx.amount).toLocaleString()}
								</span>
							</motion.li>
						))}
					</motion.ul>
				) : (
					<p className="text-center text-sm text-neutral-500">
						No {selectedTab} transactions this month.
					</p>
				)}
			</div>

			{/* Only show shadow when scroll is possible */}
			{isScrollable && (
				<div className="pointer-events-none absolute bottom-0 left-0 w-full h-7 rounded-b-2xl bg-gradient-to-t from-neutral-900 to-transparent" />
			)}
		</div>
	);
}
