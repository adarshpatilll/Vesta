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
	const [user, setUser] = useState();
	const [societyId, setSocietyId] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
			setLoading(true);

			if (currentUser) {
				try {
					const adminDetails = await getAdminDetails(currentUser.uid);
					if (adminDetails && adminDetails.isAuthorizedBySuperAdmin) {
						// User is authenticated and authorized
						setUser({
							...currentUser,
							adminDetails,
						});
						setSocietyId(adminDetails.societyId);
						setIsAuthenticated(true);
					} else {
						// User is not authorized
						await logoutAdmin();
					}
				} catch (err) {
					// Handle error fetching admin details
					console.error("❌ Error fetching admin details:", err);
					await logoutAdmin();
				}
			} else {
				// No user is signed in
				setUser(null);
				setSocietyId(null);
				setIsAuthenticated(false);
			}

			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				setUser,

				societyId,
				setSocietyId,

				loading,
				setLoading,
				isAuthenticated,

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

	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return context;
};
