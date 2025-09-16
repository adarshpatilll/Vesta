import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MonthSelector from "../components/MonthSelector";
import { useAuth } from "../context/AuthContext";
import { getMonthlyBalance } from "../firebase/firestore/balance"; // 👈 new fn
import { getTransactions } from "../firebase/firestore/transactions";
import SkeletonTransaction from "../components/SkeletonTransaction";
import dayjs from "dayjs";
import CircularLoader from "../components/CircularLoader";

const HomePage = () => {
	const { societyId } = useAuth();
	const [monthKey, setMonthKey] = useState(dayjs().format("YYYY-MM"));
	const [transactions, setTransactions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedTab, setSelectedTab] = useState("credit");
	const [monthlyData, setMonthlyData] = useState({
		balance: 0,
		credit: 0,
		debit: 0,
		carryForward: 0,
	});

	// Fetch monthly balance
	useEffect(() => {
		const fetchBalance = async () => {
			try {
				const data = await getMonthlyBalance(societyId, monthKey);
				setMonthlyData(data);
			} catch (err) {
				console.error(err);
			}
		};
		fetchBalance();
	}, [societyId, monthKey]);

	// Fetch transactions
	useEffect(() => {
		const fetchTx = async () => {
			setLoading(true);
			try {
				const tx = await getTransactions(societyId, monthKey);
				setTransactions(tx);
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		fetchTx();
	}, [societyId, monthKey]);

	const filteredTx = transactions.filter((t) => t.type === selectedTab);

	return (
		<section className="mx-auto max-w-4xl px-2 py-2">
			{/* Month Selector */}
			<div className="mb-6">
				<MonthSelector value={monthKey} onChange={setMonthKey} />
			</div>

			{/* Balance + Expense + Remaining Cards */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
			>
				{/* Monthly Balance */}
				<div className="rounded-xl bg-neutral-800 border border-neutral-700 p-4 md:p-6 shadow-lg flex flex-col items-center justify-center">
					<p className="text-sm text-neutral-400">
						Balance ({dayjs(monthKey).format("MMM YYYY")})
					</p>
					<h2 className="text-2xl font-bold text-yellow-400">
						₹{monthlyData.balance}
					</h2>
					<p className="text-xs text-neutral-500">
						Carry Forward: ₹{monthlyData.carryForward}
					</p>
				</div>

				{/* Monthly Credit + Debit */}
				<div className="grid grid-cols-2 gap-4">
					{/* Monthly Credit */}
					<div className="w-full rounded-xl bg-neutral-800 border border-neutral-700 p-4 md:p-6 shadow-lg flex flex-col items-center justify-center">
						<p className="text-sm text-neutral-400">Total Credits</p>
						<h2 className="text-xl font-bold text-green-400">
							₹{monthlyData.credit}
						</h2>
					</div>

					{/* Monthly Debit */}
					<div className="w-full rounded-xl bg-neutral-800 border border-neutral-700 p-4 md:p-6 shadow-lg flex flex-col items-center justify-center">
						<p className="text-sm text-neutral-400">Total Debits</p>
						<h2 className="text-xl font-bold text-red-400">
							₹{monthlyData.debit}
						</h2>
					</div>
				</div>
			</motion.div>

			{/* Transactions Panel */}
			<div className="bg-dark rounded-2xl border border-neutral-700 shadow-md">
				{/* Header Tabs */}
				<div className="flex items-center border-b border-neutral-700">
					<button
						onClick={() => setSelectedTab("credit")}
						className={`flex-1 py-3 text-center font-medium transition ${
							selectedTab === "credit"
								? "text-green-400 border-b-2 border-green-400"
								: "text-neutral-400 border-b-2 border-transparent hover:text-light"
						}`}
					>
						Credits
					</button>
					<button
						onClick={() => setSelectedTab("debit")}
						className={`flex-1 py-3 text-center font-medium transition ${
							selectedTab === "debit"
								? "text-red-400 border-b-2 border-red-400"
								: "text-neutral-400 border-b-2 border-transparent hover:text-light"
						}`}
					>
						Debits
					</button>
				</div>

				{/* Transactions List */}
				{loading ? (
					<div className="overflow-y-auto hide-scrollbar p-6 max-h-[42svh]">
						<ul className="space-y-3">
							{[...Array(2)].map((_, i) => (
								<SkeletonTransaction key={i} />
							))}
						</ul>
					</div>
				) : (
					<div className="overflow-y-auto hide-scrollbar p-4 max-h-[42svh]">
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
								className="space-y-3"
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
													? dayjs(
															tx.date?.toDate?.() || tx.date
													  ).format("DD MMM, YYYY")
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
				)}
			</div>
		</section>
	);
};

export default HomePage;
