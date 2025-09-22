import React, { useState } from "react";
import { motion } from "framer-motion";
import SkeletonTransaction from "./SkeletonTransaction";
import SearchSelect from "./SearchSelect";
import { Fingerprint, PenToolIcon, PersonStanding } from "lucide-react";
import AuthorizeOrUnauthorizeAdminModal from "./AuthorizeOrUnauthorizeAdminModal";
import SurrenderSuperAdminModal from "./SurrenderSuperAdminModal";
import AdminEditAccessModal from "./AdminEditAccessModal";

const AdminAuthStatusBundle = ({
	setUser,
	setIsSuperAdmin,
	allAdmins,
	loadingAdmins,
	setAllAdmins,
}) => {
	const [selectedAdmin, setSelectedAdmin] = useState(null);
	const [showAuthorizeModal, setShowAuthorizeModal] = useState(false);

	const [selectedAdminForSurrender, setSelectedAdminForSurrender] =
		useState(null);
	const [showSurrenderModal, setShowSurrenderModal] = useState(false);

	const [selectedAdminForEditAccess, setSelectedAdminForEditAccess] =
		useState(null);
	const [showEditAccessModal, setShowEditAccessModal] = useState(false);

	return (
		<>
			{/* Authorize New Admin only for Super Admins not for Admins with Edit Access */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}
			>
				<div className="flex flex-col gap-3">
					<h3 className="text-light text-sm font-semibold md:text-base">
						Authorize or Unauthorize Admin
					</h3>

					{loadingAdmins ? (
						<SkeletonTransaction />
					) : (
						<SearchSelect
							forAuthorization={true}
							defaultValue={"Select Admin"}
							value={selectedAdmin}
							options={allAdmins
								.filter((admin) => !admin.isSuperAdmin)
								.map((admin) => ({
									label: `${admin.name}-${admin.email}`,
									value: admin.name,
									...admin,
								}))}
							onChange={(option) => setSelectedAdmin(option)}
							autoFocus={false}
							forOnChangeReturnsObject={true}
						/>
					)}

					<motion.button
						onClick={() => setShowAuthorizeModal(true)}
						disabled={!selectedAdmin}
						className={`text-dark flex items-center justify-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 transition text-sm ${
							selectedAdmin ? "hover:bg-yellow-700" : ""
						} disabled:cursor-not-allowed disabled:opacity-70`}
					>
						<Fingerprint size={16} />{" "}
						{selectedAdmin
							? selectedAdmin?.isAuthorizedBySuperAdmin
								? "Unauthorize Admin"
								: "Authorize Admin"
							: "Select an Admin"}
					</motion.button>
				</div>
			</motion.div>

			{/* Give Edit Access to admin who is not Super Admin and authorized */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="mt-5 md:mt-6"
			>
				<div className="flex flex-col gap-3">
					<h3 className="text-light text-sm font-semibold md:text-base">
						Give or Remove Edit Access
					</h3>

					{loadingAdmins ? (
						<SkeletonTransaction />
					) : (
						<SearchSelect
							forEditAccess={true}
							defaultValue={"Select Admin"}
							value={selectedAdminForEditAccess}
							options={allAdmins
								.filter(
									(admin) =>
										admin.isAuthorizedBySuperAdmin &&
										!admin.isSuperAdmin
								)
								.map((admin) => ({
									label: `${admin.name}-${admin.email}`,
									value: admin.name,
									...admin,
								}))}
							onChange={(option) =>
								setSelectedAdminForEditAccess(option)
							}
							autoFocus={false}
							forOnChangeReturnsObject={true}
						/>
					)}

					<motion.button
						onClick={() => setShowEditAccessModal(true)}
						disabled={!selectedAdminForEditAccess}
						className={`text-dark flex items-center justify-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 transition text-sm ${
							selectedAdminForEditAccess ? "hover:bg-yellow-700" : ""
						} disabled:cursor-not-allowed disabled:opacity-70`}
					>
                  <PenToolIcon size={16} />{" "}
						{selectedAdminForEditAccess
							? selectedAdminForEditAccess?.isEditAccess
								? "Remove Edit Access"
								: "Give Edit Access"
							: "Select an Admin"}
					</motion.button>
				</div>
			</motion.div>

			{/* Surrender Super Admin Access to Authorized Admin only for Super Admins */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.3 }}
				className="mt-5 md:mt-6"
			>
				<div className="flex flex-col gap-3">
					<h3 className="text-light text-sm font-semibold md:text-base">
						Surrender Super Admin Access
					</h3>

					{loadingAdmins ? (
						<SkeletonTransaction />
					) : (
						<SearchSelect
							defaultValue={"Select Admin to Surrender"}
							value={selectedAdminForSurrender}
							options={allAdmins
								.filter(
									(admin) =>
										admin.isAuthorizedBySuperAdmin &&
										admin.isEditAccess &&
										!admin.isSuperAdmin
								)
								.map((admin) => ({
									label: `${admin.name}-${admin.email}`,
									value: admin.name,
									...admin,
								}))}
							onChange={(option) => setSelectedAdminForSurrender(option)}
							autoFocus={false}
							forOnChangeReturnsObject={true}
						/>
					)}

					<motion.button
						onClick={() => setShowSurrenderModal(true)}
						disabled={!selectedAdminForSurrender}
						className={`text-dark flex items-center justify-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 transition text-sm ${
							selectedAdminForSurrender ? "hover:bg-yellow-700" : ""
						} disabled:cursor-not-allowed disabled:opacity-70`}
					>
                  <PersonStanding size={16} />
						Surrender Now
					</motion.button>
				</div>
			</motion.div>

			{/* Modals */}
			{showAuthorizeModal && (
				<AuthorizeOrUnauthorizeAdminModal
					selectedAdmin={selectedAdmin}
					setSelectedAdmin={setSelectedAdmin}
					setAllAdmins={setAllAdmins}
					onClose={() => setShowAuthorizeModal(false)}
				/>
			)}

			{showSurrenderModal && (
				<SurrenderSuperAdminModal
					selectedAdmin={selectedAdminForSurrender}
					setSelectedAdmin={setSelectedAdminForSurrender}
					setAllAdmins={setAllAdmins}
					setUser={setUser}
					setIsSuperAdmin={setIsSuperAdmin}
					onClose={() => setShowSurrenderModal(false)}
				/>
			)}

			{showEditAccessModal && (
				<AdminEditAccessModal
					selectedAdmin={selectedAdminForEditAccess}
					setSelectedAdmin={setSelectedAdminForEditAccess}
					setAllAdmins={setAllAdmins}
					onClose={() => setShowEditAccessModal(false)}
				/>
			)}
		</>
	);
};

export default AdminAuthStatusBundle;
