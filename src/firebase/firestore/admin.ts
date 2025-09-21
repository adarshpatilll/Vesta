import { ensureSocietyId } from "../../utils/ensureSocietyId";
import {
	collection,
	doc,
	getDoc,
	getDocs,
	setDoc,
	Timestamp,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	db,
	auth,
	updateDoc,
	writeBatch,
	query,
	collectionGroup,
	where,
	addDoc,
} from "../firebaseServices";
import { updateBalance } from "./balance";
import { setMaintenanceAmount } from "./maintenanceAmount";
import { setPaymentCycle } from "./paymentCycle";

// Find societyId by Uid
export const findSocietyIdByUid = async (uid: string) => {
	if (!uid) {
		const user = auth.currentUser;
		if (!user) {
			throw new Error("No authenticated user found");
		}
		uid = user.uid;
	}

	try {
		const adminQuery = query(
			collectionGroup(db, "admins"),
			where("id", "==", uid)
		);
		const snap = await getDocs(adminQuery);

		if (snap.empty) {
			throw new Error("Admin not found");
		}

		return snap.docs[0].data().societyId;
	} catch (error) {
		throw error;
	}
};

interface IAdmin {
	id?: string;
	name: string;
	email: string;
	phone: string;
	flatNo: string;
	societyId: string;
	googleSheetToken: string | null;
	isSuperAdmin: boolean;
	isAuthorizedBySuperAdmin: boolean;
	isEditAccess?: boolean;
	createdAt: Timestamp;
	updatedAt?: Timestamp;
}

// Register a new admin and set default payment cycle and maintenance amount
export const registerAdmin = async (
	data: {
		name: string;
		phone: string;
		flatNo: string;
		societyId: string;
	},
	email: string,
	password: string
): Promise<{
	user: any;
	isFirstAdmin: boolean;
	adminDetails: IAdmin;
}> => {
	try {
		// 1️⃣ Create user in Firebase Auth
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password
		);
		const user = userCredential.user;

		// 2️⃣ Convert societyId to Firestore-safe ID if needed
		const societyRef = doc(
			db,
			"societies",
			data.societyId.trim().replace(/\s+/g, "-").toLowerCase() // Firestore-safe ID conversion: Shyam Kunj  -> shyam-kunj
		);

		// 3️⃣ Check if society exists
		const societySnap = await getDoc(societyRef);
		const isFirstAdmin = !societySnap.exists();

		// 4️⃣ If society doesn’t exist, create it
		if (isFirstAdmin) {
			await setDoc(societyRef, {
				createdAt: Timestamp.now(),
				updatedAt: Timestamp.now(),
				createdBy: {
					id: user.uid,
					name: data.name,
					email,
				},
			});

			// Set defaults for first admin
			await setPaymentCycle(data.societyId, 1, 10);
			await setMaintenanceAmount(data.societyId, 500);
			await updateBalance(data.societyId, 0, "initial");
		}

		// 5️⃣ Add admin to society admins collection
		const adminRef = doc(collection(societyRef, "admins"), user.uid);
		await setDoc(adminRef, {
			id: user.uid,
			name: data.name,
			email,
			phone: data.phone,
			flatNo: data.flatNo,
			societyId: data.societyId,
			googleSheetToken: null,
			isSuperAdmin: isFirstAdmin,
			isAuthorizedBySuperAdmin: isFirstAdmin,
			isEditAccess: isFirstAdmin,
			createdAt: Timestamp.now(),
		});

		// Also return data needed for context so that we don't have to fetch again
		return {
			user: user as any,
			isFirstAdmin: isFirstAdmin as boolean,
			adminDetails: {
				id: user.uid,
				name: data.name,
				email,
				phone: data.phone,
				flatNo: data.flatNo,
				societyId: data.societyId,
				googleSheetToken: null,
				isSuperAdmin: isFirstAdmin,
				isAuthorizedBySuperAdmin: isFirstAdmin,
				isEditAccess: isFirstAdmin,
				createdAt: Timestamp.now(),
			} as IAdmin,
		};
	} catch (error) {
		console.error("Error registering admin:", error);
		throw error;
	}
};

export const loginAdmin = async (
	email: string,
	password: string
): Promise<{
	user: any;
	societyId: string;
	isAuthorizedBySuperAdmin: boolean;
	adminDoc: IAdmin;
}> => {
	try {
		// Step 1: Auth login
		const userCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password
		);
		const user = userCredential.user;

		// Step 2: Fetch admin doc
		const adminQuery = query(
			collectionGroup(db, "admins"),
			where("id", "==", user.uid)
		);
		const snap = await getDocs(adminQuery);
		const adminDoc = snap.docs[0].data() as IAdmin;

		const { societyId, isAuthorizedBySuperAdmin } = adminDoc;

		return { user, societyId, isAuthorizedBySuperAdmin, adminDoc };
	} catch (error) {
		throw error;
	}
};

// Update googleSheetToken for admin
export const updateGoogleSheetToken = async (token: string) => {
	const user = auth.currentUser;
	if (!user) {
		throw new Error("No authenticated user found");
	}

	try {
		const societyId = await ensureSocietyId();
		if (!societyId) {
			throw new Error("Society not found");
		}

		const adminRef = doc(db, "societies", societyId, "admins", user.uid);
		await updateDoc(adminRef, { googleSheetToken: token });

		return true;
	} catch (error) {
		throw error;
	}
};

// Update admin profile details
export const updateAdminDetails = async (data: {
	name?: string;
	email?: string;
	phone?: string;
	flatNo?: string;
}) => {
	const user = auth.currentUser;
	if (!user) {
		throw new Error("No authenticated user found");
	}

	try {
		const societyId = await ensureSocietyId();
		if (!societyId) {
			throw new Error("Society not found");
		}

		const adminRef = doc(db, "societies", societyId, "admins", user.uid);
		await updateDoc(adminRef, data);

		return true;
	} catch (error) {
		throw error;
	}
};

// Get googleSheetToken for admin
export const getGoogleSheetToken = async () => {
	const user = auth.currentUser;
	if (!user) {
		throw new Error("No authenticated user found");
	}

	try {
		const societyId = await ensureSocietyId();
		if (!societyId) {
			throw new Error("Society not found");
		}

		const adminRef = doc(db, "societies", societyId, "admins", user.uid);
		const adminSnap = await getDoc(adminRef);
		if (adminSnap.exists()) {
			return adminSnap.data().googleSheetToken;
		} else {
			throw new Error("Admin not found");
		}
	} catch (error) {
		throw error;
	}
};

// Get admin details
export const getAdminDetails = async (
	uid: string,
	societyId?: string
): Promise<IAdmin> => {
	if (!uid) {
		const user = auth.currentUser;
		if (!user) {
			throw new Error("No authenticated user found");
		}
		uid = user.uid;
	}

	try {
		// Fetch societyId if not provided
		if (!societyId) {
			societyId = await findSocietyIdByUid(uid);
		}

		const adminRef = doc(db, "societies", societyId, "admins", uid);
		const adminSnap = await getDoc(adminRef);

		if (adminSnap.exists()) {
			return { ...(adminSnap.data() as IAdmin) };
		} else {
			throw new Error("Admin not found");
		}
	} catch (error) {
		throw error;
	}
};

// Authorize or unauthorize an admin (only by super admin)
export const authorizeOrUnauthorizeAdmin = async (
	adminId: string,
	authorize: boolean
) => {
	const user = auth.currentUser;
	if (!user) {
		throw new Error("No authenticated user found");
	}
	// Ensure current user is super admin
	const currentAdminDetails = await getAdminDetails(user.uid);
	if (!currentAdminDetails.isSuperAdmin) {
		throw new Error("Only super admin can authorize other admins");
	}

	try {
		const societyId = await ensureSocietyId();
		if (!societyId) {
			throw new Error("Society not found");
		}

		const adminRef = doc(db, "societies", societyId, "admins", adminId);
		// if athorize is false, also remove edit access
		if (!authorize) {
			await updateDoc(adminRef, {
				isAuthorizedBySuperAdmin: authorize,
				isEditAccess: false,
			});
			return true;
		}

		await updateDoc(adminRef, { isAuthorizedBySuperAdmin: authorize });

		return true;
	} catch (error) {
		throw error;
	}
};

// Surrender super admin role to another admin
export const surrenderSuperAdminRole = async (newSuperAdminId: string) => {
	const user = auth.currentUser;
	if (!user) {
		throw new Error("No authenticated user found");
	}

	// Ensure current user is super admin
	const currentAdminDetails = await getAdminDetails(user.uid);
	if (!currentAdminDetails.isSuperAdmin) {
		throw new Error("Only super admin can surrender their role");
	}

	try {
		const societyId = await ensureSocietyId();
		if (!societyId) {
			throw new Error("Society not found");
		}

		// Assign super admin role to new user
		const newSuperAdminRef = doc(
			db,
			"societies",
			societyId,
			"admins",
			newSuperAdminId
		);
		await updateDoc(newSuperAdminRef, { isSuperAdmin: true });

		// Remove super admin role from current user
		const currentAdminRef = doc(
			db,
			"societies",
			societyId,
			"admins",
			user.uid
		);
		await updateDoc(currentAdminRef, { isSuperAdmin: false });

		return true;
	} catch (error) {
		throw error;
	}
};

// Give or remove edit access to an admin
export const giveOrRemoveEditAccess = async (
	adminId: string,
	giveAccess: boolean
) => {
	const user = auth.currentUser;
	if (!user) {
		throw new Error("No authenticated user found");
	}

	// Ensure current user is super admin
	const currentAdminDetails = await getAdminDetails(user.uid);
	if (!currentAdminDetails.isSuperAdmin) {
		throw new Error("Only super admin can give or remove edit access");
	}

	try {
		const societyId = await ensureSocietyId();
		if (!societyId) {
			throw new Error("Society not found");
		}

		const adminRef = doc(db, "societies", societyId, "admins", adminId);
		await updateDoc(adminRef, { isEditAccess: giveAccess });

		return true;
	} catch (error) {
		throw error;
	}
};

// Get all admins in a society
export const getAllAdmins = async (societyId: string) => {
	// Ensure societyId is provided
	!societyId && (societyId = await ensureSocietyId());

	const user = auth.currentUser;
	if (!user) {
		throw new Error("No authenticated user found");
	}

	try {
		const adminRef = collection(db, "societies", societyId, "admins");
		const snap = await getDocs(adminRef);

		// Exclude current user from the list
		const admins = snap.docs
			.map((doc) => doc.data())
			.filter((admin) => admin.id !== user.uid);

		return admins;
	} catch (error) {
		throw error;
	}
};

// Logout admin
export const logoutAdmin = async () => {
	try {
		await signOut(auth);
	} catch (error) {
		throw error;
	}
};
