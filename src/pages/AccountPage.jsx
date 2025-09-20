import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MailIcon, User } from "lucide-react";
import { Link } from "react-router-dom";
import Divider from "@/components/Divider";
import CircularLoader from "@/components/CircularLoader";
import PaymentCycle from "@/components/PaymentCycle";
import MaintenanceAmount from "@/components/MaintenanceAmount";
import ExportDataPage from "@/components/ExportDataPage";
import { motion } from "framer-motion";

const AccountPage = () => {
	const { user, loading: authLoading, getAdminDetails } = useAuth();

	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);

	const [showExportModal, setShowExportModal] = useState(false);
	const [exportType, setExportType] = useState(""); // "excel" or "sheets"

	// Fetch Admin details
	useEffect(() => {
		const fetchProfile = async () => {
			if (user) {
				try {
					// Fetch current user details
					const details = await getAdminDetails(user.uid);
					setProfile(details);
				} catch (err) {
					console.error("Error fetching user details:", err);
				} finally {
					setLoading(false);
				}
			} else {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [user]);

	if (loading || authLoading) {
		return <CircularLoader label="Loading Account..." />;
	}

	if (!user) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="bg-dark fixed top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1"
			>
				<p className="mb-4">You are not logged in.</p>
				<Link
					to="/login"
					className="text-light rounded-lg bg-yellow-600 px-4 py-2 transition hover:bg-yellow-500"
				>
					Go to Login
				</Link>
			</motion.div>
		);
	}

	const name = profile?.name || "Anonymous";
	const email = profile?.email || "No email set";
	const flatNo = profile?.flatNo || "No flat number set";
	const phone = profile?.phone || "No phone number set";
	const societyName =
		profile?.societyId
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ") || "No society name set";

	const initials = name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<>
			<div className="bg-dark flex min-h-[calc(100vh-152px)] justify-center py-4 md:min-h-[calc(100vh-88px)]">
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease: "easeOut" }}
					className="bg-dark relative flex w-full flex-col justify-between rounded-2xl border border-neutral-700 px-6 py-8 shadow-xl md:max-w-4xl md:px-8"
				>
					{/* Profile Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="flex flex-col items-center gap-3 md:flex-row md:justify-between md:gap-5"
					>
						<motion.div
							initial={{ scale: 0.8, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 0.5, delay: 0.3 }}
							whileHover={{ scale: 1.05 }}
							className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-yellow-500 bg-neutral-800 shadow-md md:h-18 md:w-20"
						>
							{name !== "Anonymous" ? (
								<span className="text-2xl font-bold text-yellow-500 md:text-3xl">
									{initials}
								</span>
							) : (
								<User className="h-10 w-10 text-yellow-500 md:h-12 md:w-12" />
							)}
						</motion.div>

						{/* Name, Email, Flat No., Phone No., Society Id (Name) */}
						<div className="flex w-full min-w-0 flex-col items-center md:items-start">
							<h2 className="text-light truncate text-base font-bold md:text-xl">
								{name}
							</h2>
							<p className="max-w-full truncate text-sm text-neutral-400 md:text-base">
								{email}
							</p>

							<p className="max-w-full truncate text-sm text-neutral-500 md:text-base">
								Society Name.: {societyName || "No society name set"}
							</p>
							<p className="max-w-full truncate text-sm text-neutral-500 md:text-base">
								Phone: {phone || "No phone number set"}
							</p>
							<p className="max-w-full truncate text-sm text-neutral-500 md:text-base">
								Flat No.: {flatNo || "No flat number set"}
							</p>
						</div>
					</motion.div>

					<Divider className="my-5 md:my-6" />

					{/* Update Payment Cycle */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
					>
						<PaymentCycle societyId={profile?.societyId} />
					</motion.div>

					<Divider className="my-5 md:my-6" />

					{/* Update Maintenance Amount */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.5 }}
					>
						<MaintenanceAmount societyId={profile?.societyId} />
					</motion.div>

					<Divider className="my-5 md:my-6" />

					{/* Export Data */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.5 }}
					>
						<div className="flex flex-col gap-3">
							<h3 className="text-light text-base font-semibold md:text-lg">
								Export Society Data
							</h3>

							<div className="flex flex-col items-center justify-between gap-2 rounded-lg border border-neutral-700 px-3 py-2 sm:flex-row">
								<span className="text-light/70 text-sm">
									Click on button to download excel file.
								</span>
								<button
									className="rounded-lg bg-green-700/30 border border-green-700 px-3 py-1 text-light hover:bg-green-600 text-xs sm:text-sm transition"
									onClick={() => {
										setExportType("excel");
										setShowExportModal(true);
									}}
								>
									<span>Export Now</span>
								</button>
							</div>
						</div>
					</motion.div>

					<Divider className="my-5 md:my-6" />

					{/* Sync Data to Google Sheets */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.5 }}
					>
						<div className="flex flex-col gap-3">
							<h3 className="text-light text-base font-semibold md:text-lg">
								Sync to Google Sheets
							</h3>

							<div className="flex flex-col items-center justify-between gap-2 rounded-lg border border-neutral-700 px-3 py-2 sm:flex-row">
								<span className="text-light/70 text-sm">
									Click on button to sync data.
								</span>
								<button
									className="rounded-lg bg-green-700/30 border border-green-700 px-3 py-1 text-light hover:bg-green-600 text-xs sm:text-sm transition"
									onClick={() => {
										setExportType("sheets");
										setShowExportModal(true);
									}}
								>
									<span>Sync Now</span>
								</button>
							</div>
						</div>
					</motion.div>

					<Divider className="my-5 md:my-6" />

					{/* Help Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.5 }}
						className="flex flex-col gap-2"
					>
						<h3 className="text-light text-base sm:text-lg font-semibold">
							Need Help?
						</h3>
						<p className="text-light/70 flex flex-col gap-1 sm:text-base">
							<span className="text-justify text-xs">
								If you have any questions or need assistance, feel free
								to reach out to{" "}
								<span className="text-rose-400 font-semibold">
									Adarsh Patil
								</span>
								.
							</span>
							<span className=" flex items-center gap-1.5">
								<MailIcon size={13} className="inline text-blue-400" />
								<a
									href="mailto:adarsh.patil6266@gmail.com"
									className="text-yellow-400 text-xs"
								>
									adarsh.patil6266@gmail.com
								</a>
							</span>
						</p>
					</motion.div>

					<Divider className="my-5 md:my-6" />

					{/* Back / Home */}
					<motion.div
						className="text-center text-sm text-neutral-400"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.6 }}
					>
						<Link
							to="/"
							className="font-medium text-yellow-400 hover:text-yellow-300"
						>
							<span className="text-light/80">Go to</span> Home
						</Link>
					</motion.div>
				</motion.div>
			</div>

			{showExportModal && (
				<div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
					<ExportDataPage
						onClose={() => setShowExportModal(false)}
						exportType={exportType}
					/>
				</div>
			)}
		</>
	);
};

export default AccountPage;
