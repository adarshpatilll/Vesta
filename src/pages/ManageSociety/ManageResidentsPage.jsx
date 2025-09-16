import { motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import { Eye, Pencil, PlusCircle } from "lucide-react";
import ButtonCard from "../../components/ButtonCard";
import BackButtonOrLink from "../../components/BackButtonOrLink";

const ManageResidentsPage = () => {
	const location = useLocation();
	const isBasePath = location.pathname === "/manage-society/manage-residents";

	const buttons = [
		{ icon: Eye, label: "View Residents", to: "view" },
		{ icon: Pencil, label: "Update Residents", to: "update" },
		{ icon: PlusCircle, label: "Add Resident", to: "add" },
	];

	return (
		<section className="mx-auto max-w-5xl">
			{isBasePath ? (
				<motion.div
					initial="hidden"
					animate="visible"
					variants={{
						hidden: { opacity: 0 },
						visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
					}}
					className="grid gap-4 p-4 md:grid-cols-3"
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
							transition={{ duration: 0.4 }}
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

export default ManageResidentsPage;
