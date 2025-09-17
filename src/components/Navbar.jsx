import { Link, NavLink } from "react-router-dom";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSociety } from "../context/SocietyContext";

const links = [
	{ to: "/", label: "Home" },
	{ to: "/manage-society", label: "Manage Society" },
	{ to: "/account", label: "Account" },
];

const Navbar = () => {
	const { logoutAdmin, getAdminDetails, setUser, setSocietyId } = useAuth();
	const {
		setResidents,
		setNotifications,
		setBalance,
		setMaintenanceAmount,
		setPaymentCycle,
	} = useSociety();

	const [userDetails, setUserDetails] = useState(null);

	useEffect(() => {
		const fetchUserDetails = async () => {
			const details = await getAdminDetails();
			setUserDetails(details);
		};

		fetchUserDetails();
	}, [getAdminDetails]);

	// Set initial context state on logout to avoid stale data issues after logout and login with different user
	const handleLogout = async () => {
		try {
			await logoutAdmin();
			setUser(null);
			setSocietyId(null);
			setResidents([]);
			setNotifications([]);
			setBalance(null);
			setMaintenanceAmount(null);
			setPaymentCycle(null);
			toast.success(`Goodbye, ${userDetails?.name || "Investor"}!`, {
				duration: 3000,
			});
		} catch (error) {
			toast.error("Failed to log out. Try again.");
		}
	};

	return (
		<motion.nav
			initial={{ y: -60, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
			className="bg-dark text-light fixed top-0 left-0 right-0 z-40 flex h-14 w-full items-center justify-between border-b border-b-neutral-600 px-5 py-1"
		>
			{/* Logo */}
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.4, delay: 0.2 }}
			>
				<Link
					to={"/"}
					className="flex items-center justify-center text-xl font-bold tracking-wider"
				>
					<span className="bg-gradient-to-l from-yellow-400 to-light bg-clip-text text-transparent">
						Vesta
					</span>
				</Link>
			</motion.div>

			{/* Links */}
			<motion.div
				className="hidden w-auto items-center justify-between gap-2 text-sm md:flex"
				initial="hidden"
				animate="visible"
				variants={{
					hidden: {},
					visible: {
						transition: { staggerChildren: 0.15, delayChildren: 0.3 },
					},
				}}
			>
				{links.map(({ to, label }) => (
					<motion.div
						key={to}
						variants={{
							hidden: { opacity: 0, y: -10 },
							visible: { opacity: 1, y: 0 },
						}}
						transition={{ duration: 0.3, ease: "easeOut" }}
					>
						<NavLink
							to={to}
							className={({ isActive }) =>
								`hover:bg-light/15 rounded-md px-4 py-1 transition-colors duration-200 ${
									isActive ? "bg-light/15" : ""
								}`
							}
						>
							{label}
						</NavLink>
					</motion.div>
				))}
			</motion.div>

			{/* Logout Button */}
			<motion.button
				onClick={handleLogout}
				whileTap={{ scale: 0.9 }}
				whileHover={{ scale: 1.06 }}
				transition={{ type: "spring", stiffness: 300 }}
				className="text-dark rounded-full bg-yellow-500 px-2 py-2 transition-colors duration-200 hover:bg-yellow-600"
			>
				<RiLogoutCircleRLine size={20} />
			</motion.button>
		</motion.nav>
	);
};

export default Navbar;
