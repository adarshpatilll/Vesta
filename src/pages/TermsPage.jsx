import BackButtonOrLink from "../components/BackButtonOrLink";
import { motion } from "framer-motion";

const TermsPage = () => {
	const containerVariants = {
		hidden: { opacity: 0, y: 16 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				staggerChildren: 0.08,
				delayChildren: 0.12,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				type: "spring",
				stiffness: 90,
				damping: 18,
			},
		},
	};

	return (
		<div className="min-h-screen bg-neutral-950 text-light flex items-center justify-center p-6">
			<motion.div
				initial="hidden"
				animate="visible"
				variants={containerVariants}
				className="max-w-3xl w-full bg-dark shadow-lg rounded-2xl p-8"
			>
				<motion.h1
					variants={itemVariants}
					className="text-xl sm:text-2xl md:text-3xl font-bold text-accent mb-6 flex items-center justify-between"
				>
					<span>Terms of Service</span>
					<BackButtonOrLink isLink className={"font-normal"} />
				</motion.h1>

				<motion.p
					variants={itemVariants}
					className="mb-4 text-base sm:text-lg"
				>
					By using <span className="font-semibold text-accent">Vesta</span>
					, you agree to the following terms:
				</motion.p>

				<motion.h2
					variants={itemVariants}
					className="text-base sm:text-xl font-semibold mt-6 mb-2"
				>
					1. Use of Service
				</motion.h2>
				<motion.p
					variants={itemVariants}
					className="mb-4 text-light/70 text-sm sm:text-base"
				>
					This app is provided to help societies manage meetings, expenses,
					and residents. You may not misuse the service for unauthorized
					access, spamming, or illegal purposes.
				</motion.p>

				<motion.h2
					variants={itemVariants}
					className="text-base sm:text-xl font-semibold mt-6 mb-2"
				>
					2. User Responsibilities
				</motion.h2>
				<motion.ul
					variants={itemVariants}
					className="list-disc pl-6 mb-4 text-light/70 text-sm sm:text-base"
				>
					<motion.li variants={itemVariants}>
						You are responsible for the accuracy of the data you submit.
					</motion.li>
					<motion.li variants={itemVariants}>
						You must keep your account secure and not share your login
						credentials.
					</motion.li>
					<motion.li variants={itemVariants}>
						Admins have rights to manage residents and financial records
						within their society.
					</motion.li>
				</motion.ul>

				<motion.h2
					variants={itemVariants}
					className="text-base sm:text-xl font-semibold mt-6 mb-2"
				>
					3. Limitations of Liability
				</motion.h2>
				<motion.p
					variants={itemVariants}
					className="mb-4 text-light/70 text-sm sm:text-base"
				>
					We are not responsible for any damages or losses resulting from
					misuse of the app or unauthorized access to your Google account.
				</motion.p>

				<motion.h2
					variants={itemVariants}
					className="text-base sm:text-xl font-semibold mt-6 mb-2"
				>
					4. Modifications
				</motion.h2>
				<motion.p
					variants={itemVariants}
					className="mb-4 text-light/70 text-sm sm:text-base"
				>
					We reserve the right to update or modify these terms at any time.
					Continued use of the app indicates acceptance of the changes.
				</motion.p>

				<motion.p
					variants={itemVariants}
					className="text-xs text-neutral-500 mt-6 sm:text-sm"
				>
					Last updated: 17 September 2025
				</motion.p>
			</motion.div>
		</div>
	);
};

export default TermsPage;
