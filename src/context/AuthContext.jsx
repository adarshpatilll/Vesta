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
	const [loading, setLoading] = useState(true);
	const [societyId, setSocietyId] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
			if (currentUser) {
				setUser(currentUser);
				setIsAuthenticated(true);
				const societyId = await findSocietyIdByUid(currentUser.uid);
				setSocietyId(societyId);
			} else {
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
