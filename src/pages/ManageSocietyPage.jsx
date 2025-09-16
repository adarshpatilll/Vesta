import { motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import { Users, PlusCircle } from "lucide-react";
import ButtonCard from "../components/ButtonCard";
import BackButtonOrLink from "./../components/BackButtonOrLink";
import UseHeading from "./../hooks/UseHeading";

const ManageSocietyPage = () => {
	const location = useLocation();
	const isBasePath = location.pathname === "/manage-society";

	const heading = UseHeading();

	// if heading is "Add Resident", remove dynamic header
	const showHeader =
		heading === "View Residents" || heading === "Update Residents";

	const buttons = [
		{ icon: Users, label: "Manage Residents", to: "manage-residents" },
		{ icon: PlusCircle, label: "Add Transactions", to: "add-transactions" },
	];

	return (
		<section className="mx-auto max-w-5xl">
			{/* Dynamic Header */}
			<div
				hidden={showHeader}
				className="w-full flex items-center justify-between px-4"
			>
				<h1 className="text-lg font-semibold">{heading}</h1>
				<BackButtonOrLink isLink />
			</div>

			{/* Buttons */}
			{isBasePath ? (
				<motion.div
					initial="hidden"
					animate="visible"
					variants={{
						hidden: { opacity: 0 },
						visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
					}}
					className="grid gap-4 p-4 md:grid-cols-2"
				>
					{buttons.map((btn, i) => (
						<motion.div
							key={i}
							variants={{
								hidden: { opacity: 0, y: 20 },
								visible: { opacity: 1, y: 0 },
							}}
							whileHover={{ scale: 1.03 }}
							whileTap={{ scale: 0.97 }}
							transition={{ duration: 0.2 }}
						>
							<ButtonCard
								icon={btn.icon}
								label={btn.label}
								to={btn.to}
							/>
						</motion.div>
					))}
				</motion.div>
			) : (
				<Outlet />
			)}
		</section>
	);
};

export default ManageSocietyPage;
