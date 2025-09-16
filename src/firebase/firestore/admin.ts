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
		const societiesRef = collection(db, "societies");
		const societiesSnap = await getDocs(societiesRef);

		for (const societyDoc of societiesSnap.docs) {
			const adminRef = doc(db, "societies", societyDoc.id, "admins", uid);
			const adminSnap = await getDoc(adminRef);

			if (adminSnap.exists()) {
				return societyDoc.id;
			}
		}

		throw new Error("Society not found");
	} catch (error) {
		throw error;
	}
};

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
) => {
	try {
		// Create user in Firebase Authentication
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password
		);

		const user = userCredential.user;

		// Create society document if not exists
		const societyRef = doc(db, "societies", data.societyId);
		const societySnap = await getDoc(societyRef);
		if (!societySnap.exists()) {
			await setDoc(
				societyRef,
				{
					createdAt: Timestamp.now(),
					createdBy: { id: user.uid, name: data.name, email: email },
				},
				{ merge: true }
			); // Create if not exists
		}

		let isFirstAdmin = false; // Flag to indicate if this is the first admin

		// Set default payment cycle (1-10) and maintenance amount (500) if this is a new society
		const existingAdminsSnap = await getDocs(
			collection(db, "societies", data.societyId, "admins")
		);
		if (existingAdminsSnap.empty) {
			isFirstAdmin = true;
			// First admin for this society, set defaults
			await setPaymentCycle(data.societyId, 1, 10); // Default payment cycle to 1-10, can be changed later
			await setMaintenanceAmount(data.societyId, 500); // Default maintenance amount to 500, can be changed later
			await updateBalance(data.societyId, 0, "initial"); // Initialize balance to 0
		}

		// Add admin details to Firestore
		const adminRef = doc(db, "societies", data.societyId, "admins", user.uid);
		await setDoc(adminRef, {
			id: user.uid,
			name: data.name,
			email: email,
			phone: data.phone,
			flatNo: data.flatNo,
			societyId: data.societyId,
			googleSheetToken: null,
			isSuperAdmin: isFirstAdmin, // First admin is super admin
			createdAt: Timestamp.now(),
		});

		return { user, isFirstAdmin };
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

// Login admin
export const loginAdmin = async (email: string, password: string) => {
	try {
		const userCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password
		);
		const user = userCredential.user;

		// Find societyId by uid
		const societyId = await findSocietyIdByUid(user.uid);
		if (!societyId) {
			throw new Error("Society not found for this admin");
		}

		return { user, societyId };
	} catch (error) {
		throw error;
	}
};

// Get admin details
export const getAdminDetails = async (uid: string, societyId: string) => {
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
			return { uid, ...adminSnap.data() };
		} else {
			throw new Error("Admin not found");
		}
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
