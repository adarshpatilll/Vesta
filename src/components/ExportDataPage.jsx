import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import dayjs from "dayjs";
import { exportSocietyData } from "../utils/exportSocietyData";
import { useAuth } from "../context/AuthContext";
import MonthSelector from "../components/MonthSelector";
import { IoIosArrowBack } from "react-icons/io";
import { syncToGoogleSheetsReact } from "../utils/syncToGoogleSheetsReact";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import {
	getGoogleSheetToken,
	updateGoogleSheetToken,
} from "../firebase/firestore/admin";
import { IoLogOut } from "react-icons/io5";
import SkeletonTransaction from "./SkeletonTransaction";

const ranges = [
	{ value: "currentMonth", label: "Current Month" },
	{ value: "lastMonth", label: "Last Month" },
	{ value: "last3", label: "Last 3 Months" },
	{ value: "last6", label: "Last 6 Months" },
	{ value: "lastYear", label: "Last 1 Year" },
	{ value: "tillNow", label: "Till Now" }, // From the beginning of records to current month ex: july 2025 to current month
	{ value: "custom", label: "Custom Range" },
];

const ExportDataPage = ({ onClose, exportType }) => {
	const { societyId } = useAuth();

	const [rangeIndex, setRangeIndex] = useState(0);
	const [fromMonth, setFromMonth] = useState(
		dayjs().subtract(1, "month").format("YYYY-MM")
	);
	const [toMonth, setToMonth] = useState(dayjs().format("YYYY-MM"));
	const [loading, setLoading] = useState(false);
	const [fetchLoading, setFetchLoading] = useState(false);
	const [token, setToken] = useState(null);

	const currentRange = ranges[rangeIndex];

	const handlePrevRange = () =>
		setRangeIndex((prev) => (prev > 0 ? prev - 1 : prev));
	const handleNextRange = () =>
		setRangeIndex((prev) => (prev < ranges.length - 1 ? prev + 1 : prev));

	const resolveRange = () => {
		let start = fromMonth;
		let end = toMonth;

		if (currentRange.value !== "custom") {
			const current = dayjs();
			switch (currentRange.value) {
				case "currentMonth":
					start = current.format("YYYY-MM");
					end = start;
					break;
				case "lastMonth":
					start = current.subtract(1, "month").format("YYYY-MM");
					end = start;
					break;
				case "last3":
					start = current.subtract(3, "month").format("YYYY-MM");
					end = current.format("YYYY-MM");
					break;
				case "last6":
					start = current.subtract(6, "month").format("YYYY-MM");
					end = current.format("YYYY-MM");
					break;
				case "lastYear":
					start = current.subtract(1, "year").format("YYYY-MM");
					end = current.format("YYYY-MM");
					break;
				case "tillNow":
					start = import.meta.env.VITE_MIN_MONTH_KEY || "2023-07"; // Default to July 2023 if not set
					end = current.format("YYYY-MM");
					break;
			}
		}
		return { start, end };
	};

	const handleExportExcel = async () => {
		const { start, end } = resolveRange();
		setLoading(true);

		toast.promise(
			exportSocietyData(societyId, start, end),
			{
				loading: "Exporting Excel...",
				success: "Excel exported successfully 🎉",
				error: "Failed to export Excel",
				finally: () => setLoading(false),
			},
			{ duration: 3000 }
		);
	};

	// 🔹 Fetch stored Google token on mount
	useEffect(() => {
		if (exportType === "sheets") {
			setFetchLoading(true);
			getGoogleSheetToken()
				.then((t) => {
					if (t) setToken(t);
					setTimeout(() => setFetchLoading(false), 500); // slight delay for better UX
				})
				.catch((err) => {
					console.error("Error fetching Google Sheet token:", err);
					setTimeout(() => setFetchLoading(false), 500); // slight delay for better UX
				});
		}
	}, [exportType]);

	// 🔹 Top-level Google Login hook
	const googleLogin = useGoogleLogin({
		scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file", // Full access to Google Sheets and Drive.file
		onSuccess: (tokenResponse) => {
			updateGoogleSheetToken(tokenResponse.access_token);
			setToken(tokenResponse.access_token);
			setLoading(false);
		},
		onError: (error) => {
			console.error("❌ Login Failed:", error);
			toast.error("Google login failed");
			setLoading(false);
		},
		error_callback: (error) => {
			console.error("❌ Login Error Callback:", error.message);

			if (error.type === "popup_closed") {
				toast.error(error.message || "Google login cancelled");
			} else if (error.type === "popup_failed_to_open") {
				toast.error(error.message || "Failed to open Google login popup");
			} else {
				toast.error("Google login failed");
			}

			setLoading(false);
		},
	});

	const handleGoogleLogin = () => {
		setLoading(true);
		googleLogin();
	};

	const handleGoogleLogout = () => {
		googleLogout();
		setToken(null);
		updateGoogleSheetToken(null);
		toast.success("Logged out from Google");
	};

	const handleSyncSheets = async () => {
		if (!token) {
			toast("Please sign in with Google first.");
			return;
		}

		setLoading(true);
		try {
			const { start, end } = resolveRange();
			const url = await syncToGoogleSheetsReact(
				societyId,
				start,
				end,
				token
			);
			toast.success("Synced to Google Sheets 🎉");
			window.open(url, "_blank");
		} catch (err) {
			console.error("❌ Sync error:", err);
			if (err.error === "popup_closed_by_user")
				toast.error("Google login cancelled");
			else toast.error("Google Sheets sync failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			className="bg-dark text-light hide-scrollbar flex max-h-[80vh] w-[90%] flex-col gap-7 overflow-y-auto rounded-xl p-4 sm:w-[90%] sm:max-w-lg sm:rounded-2xl sm:p-6"
		>
			{/* Header */}
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">
					{exportType === "excel"
						? "Export Society Data"
						: "Sync Society Data"}
				</h2>

				{exportType === "sheets" && token ? (
					<button
						onClick={handleGoogleLogout}
						className="rounded-md bg-red-700 px-2 py-1 text-sm font-medium text-light hover:bg-red-600"
					>
						<IoLogOut size={20} />
					</button>
				) : null}
			</div>

			{/* Loading / Auth States */}
			{fetchLoading ? (
				<SkeletonTransaction />
			) : exportType === "sheets" && !token ? (
				<div className="flex items-center justify-center gap-2">
					<FcGoogle size={24} />
					<h1 className="text-light text-sm sm:text-base">
						Please sign in with Google to continue
					</h1>
				</div>
			) : null}

			{/* Range Selector */}
			{exportType === "excel" || (exportType === "sheets" && token) ? (
				<div className="flex flex-col gap-2">
					<p className="text-sm text-neutral-400">Select Range</p>
					<div className="flex items-center justify-between gap-4 text-sm bg-neutral-800 rounded-lg border border-neutral-700 px-3 py-2">
						<button
							onClick={handlePrevRange}
							className="text-light rounded-md bg-neutral-700 px-1.5 py-1 hover:bg-neutral-600 disabled:opacity-50"
							disabled={rangeIndex === 0}
						>
							<IoIosArrowBack size={18} />
						</button>
						<span className="font-medium">{currentRange.label}</span>
						<button
							onClick={handleNextRange}
							className="text-light rounded-md bg-neutral-700 px-1.5 py-1 hover:bg-neutral-600 disabled:opacity-50"
							disabled={rangeIndex === ranges.length - 1}
						>
							<IoIosArrowBack size={18} className="rotate-180" />
						</button>
					</div>
				</div>
			) : null}

			{/* Custom Range Pickers */}
			{currentRange.value === "custom" ? (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 10 }}
					transition={{ duration: 0.3, ease: "easeInOut" }}
					className="grid grid-cols-1 gap-4"
				>
					<div className="flex flex-col gap-2">
						<p className="text-sm text-neutral-400">Select Start Month</p>
						<div className="w-full bg-neutral-800 rounded-lg border border-neutral-700 px-3 py-2">
							<MonthSelector value={fromMonth} onChange={setFromMonth} />
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<p className="text-sm text-neutral-400">Select End Month</p>
						<div className="w-full bg-neutral-800 rounded-lg border border-neutral-700 px-3 py-2">
							<MonthSelector value={toMonth} onChange={setToMonth} />
						</div>
					</div>
				</motion.div>
			) : null}

			<div className="flex justify-end gap-3 flex-wrap">
				<button
					onClick={onClose}
					className="rounded-md bg-neutral-700 px-4 py-2 text-sm font-medium text-light hover:bg-neutral-600"
				>
					Cancel
				</button>

				{exportType === "excel" ? (
					<button
						disabled={loading}
						onClick={handleExportExcel}
						className="rounded-md bg-indigo-700 px-4 py-2 text-sm font-medium text-light hover:bg-indigo-600 disabled:opacity-50"
					>
						{loading ? "Exporting..." : "Export Excel"}
					</button>
				) : null}

				{exportType === "sheets" && !token ? (
					<button
						disabled={loading}
						onClick={handleGoogleLogin}
						className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-light hover:bg-green-600 disabled:opacity-50"
					>
						{fetchLoading ? (
							<span className="text-transparent bg-gradient-to-r from-green-800 to-green-900 animate-pulse rounded">
								Fetching...
							</span>
						) : !token && loading ? (
							"Signing in..."
						) : (
							"Sign In to Google"
						)}
					</button>
				) : null}

				{exportType === "sheets" && token ? (
					<button
						disabled={loading}
						onClick={handleSyncSheets}
						className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-light hover:bg-green-600 disabled:opacity-50"
					>
						{fetchLoading ? (
							<span className="text-transparent bg-gradient-to-r from-green-800 to-green-900 animate-pulse rounded">
								Fetching...
							</span>
						) : token && loading ? (
							"Syncing..."
						) : (
							"Sync to Sheets"
						)}
					</button>
				) : null}
			</div>
		</motion.div>
	);
};

export default ExportDataPage;
