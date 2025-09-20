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
			await setDoc(societyRef, {
				createdAt: Timestamp.now(),
				createdBy: {
					id: user.uid,
					name: data.name,
					email,
				},
			});
		}

		const adminRef = collection(societyRef, "admins");
		const existingAdminsSnap = await getDocs(adminRef);
		const isFirstAdmin = existingAdminsSnap.empty;

		const batch = writeBatch(db);

		// If first admin for this society, set defaults
		if (isFirstAdmin) {
			await setPaymentCycle(data.societyId, 1, 10); // Default cycle 1-10 of month
			await setMaintenanceAmount(data.societyId, 500); // Default amount 500
			await updateBalance(data.societyId, 0, "initial"); // Initialize balance to 0
		}

		// Add admin details to Firestore
		batch.set(doc(adminRef, user.uid), {
			id: user.uid,
			name: data.name,
			email,
			phone: data.phone,
			flatNo: data.flatNo,
			societyId: data.societyId,
			googleSheetToken: null,
			isSuperAdmin: isFirstAdmin, // First admin is super admin
			isAuthorizedBySuperAdmin: isFirstAdmin, // First admin is authorized by default
			createdAt: Timestamp.now(),
		});

		await batch.commit();

		return { user, isFirstAdmin };
	} catch (error) {
		throw error;
	}
};

export const loginAdmin = async (email: string, password: string) => {
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
		const adminDoc = snap.docs[0].data();

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
