import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebaseServices";
import { onAuthStateChanged } from "firebase/auth";
import {
	findSocietyIdByUid,
	loginAdmin,
	getAdminDetails,
	logoutAdmin,
	registerAdmin,
} from "../firebase/firestore/admin";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [societyId, setSocietyId] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isEditAccess, setIsEditAccess] = useState(false);
	const [isSuperAdmin, setIsSuperAdmin] = useState(false);
	const [isRegistration, setIsRegistration] = useState(false);

	useEffect(() => {
		if (isRegistration) {
			setLoading(false);
			return;
		}

		const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
			setLoading(true);

			if (!currentUser) {
				setUser(null);
				setSocietyId(null);
				setIsAuthenticated(false);
				setIsEditAccess(false);
				setIsSuperAdmin(false);
				setLoading(false);
				return;
			}

			try {
				const adminDetails = await getAdminDetails(currentUser.uid);

				if (adminDetails && adminDetails.isAuthorizedBySuperAdmin) {
					setUser({ ...currentUser, adminDetails });
					setSocietyId(adminDetails.societyId);
					setIsEditAccess(adminDetails.isEditAccess ?? false);
					setIsSuperAdmin(adminDetails.isSuperAdmin ?? false);
					setIsAuthenticated(true);
				} else {
					console.warn(
						"❌ No admin details found or not authorized. Logging out."
					);
					await logoutAdmin();
				}
			} catch (err) {
				console.error(
					"❌ Error fetching admin details at AuthContext:",
					err
				);
				await logoutAdmin();
			} finally {
				setLoading(false);
			}
		});

		return () => unsubscribe();
	}, [isRegistration]);

	return (
		<AuthContext.Provider
			value={{
				user,
				setUser,

				isEditAccess,
				isSuperAdmin,
				setIsSuperAdmin,

				setIsRegistration,

				societyId,
				setSocietyId,

				loading,
				setLoading,

				isAuthenticated,
				setIsAuthenticated,

				loginAdmin,
				logoutAdmin,
				registerAdmin,
				getAdminDetails,
				findSocietyIdByUid,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within an AuthProvider");
	return context;
};
