import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MonthSelector from "../components/MonthSelector";
import { useAuth } from "../context/AuthContext";
import { getMonthlyBalance } from "../firebase/firestore/balance"; // 👈 new fn
import { getTransactions } from "../firebase/firestore/transactions";
import SkeletonTransaction from "../components/SkeletonTransaction";
import dayjs from "dayjs";
import TransactionList from "../components/TransactionList";
import { useSociety } from "@/context/SocietyContext";

const HomePage = () => {
	const { societyId } = useAuth();
	const { setTransactions: setContextTransactions } = useSociety();
	const [monthKey, setMonthKey] = useState(dayjs().format("YYYY-MM"));
	const [transactions, setTransactions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [balanceLoading, setBalanceLoading] = useState(false);
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
			setBalanceLoading(true);
			try {
				const data = await getMonthlyBalance(societyId, monthKey);
				setMonthlyData(data);
			} catch (err) {
				console.error(err);
			} finally {
				setTimeout(() => setBalanceLoading(false), 300); // slight delay for better UX
			}
		};

		if (societyId && monthKey) {
			fetchBalance();
		}
	}, [societyId, monthKey]);

	// Fetch transactions
	useEffect(() => {
		const fetchTx = async () => {
			setLoading(true);
			try {
				const tx = await getTransactions(societyId, monthKey);
				setTransactions(tx);
				setContextTransactions(tx); // update context
			} catch (err) {
				console.error(err);
			} finally {
				setTimeout(() => setLoading(false), 300); // slight delay for better UX
			}
		};

		if (societyId && monthKey) {
			fetchTx();
		}
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
					<div className="text-sm text-neutral-400">
						{balanceLoading ? (
							<Skeleton className="h-5 w-36 mb-1" />
						) : (
							`Balance (${dayjs(monthKey).format("MMM YYYY")})`
						)}
					</div>
					<h2 className="text-2xl font-bold text-yellow-400">
						{balanceLoading ? (
							<Skeleton className="h-6 w-24 mb-1" />
						) : (
							`₹${monthlyData.balance}`
						)}
					</h2>
					<div className="text-xs text-neutral-500">
						{balanceLoading ? (
							<Skeleton className="h-4 w-32" />
						) : (
							`Carry Forward: ₹${monthlyData.carryForward}`
						)}
					</div>
				</div>

				{/* Monthly Credit + Debit */}
				<div className="grid grid-cols-2 gap-4">
					{/* Monthly Credit */}
					<div className="w-full rounded-xl bg-neutral-800 border border-neutral-700 p-4 md:p-6 shadow-lg flex flex-col items-center justify-center">
						<div className="text-sm text-neutral-400">Total Credits</div>
						<h2 className="text-xl font-bold text-green-400">
							{balanceLoading ? (
								<Skeleton className="h-6 w-24 mt-1" />
							) : (
								`₹${monthlyData.credit}`
							)}
						</h2>
					</div>

					{/* Monthly Debit */}
					<div className="w-full rounded-xl bg-neutral-800 border border-neutral-700 p-4 md:p-6 shadow-lg flex flex-col items-center justify-center">
						<div className="text-sm text-neutral-400">Total Debits</div>
						<h2 className="text-xl font-bold text-red-400">
							{balanceLoading ? (
								<Skeleton className="h-6 w-24 mt-1" />
							) : (
								`₹${monthlyData.debit}`
							)}
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
					<div className="overflow-y-auto hide-scrollbar p-4 max-h-[42vh]">
						<ul className="space-y-3">
							{[...Array(2)].map((_, i) => (
								<SkeletonTransaction key={i} />
							))}
						</ul>
					</div>
				) : (
					<TransactionList
						filteredTx={filteredTx}
						selectedTab={selectedTab}
					/>
				)}
			</div>
		</section>
	);
};

export default HomePage;

const Skeleton = ({ className = "" }) => {
	return (
		<div className={`animate-pulse bg-neutral-700 rounded ${className}`} />
	);
};
