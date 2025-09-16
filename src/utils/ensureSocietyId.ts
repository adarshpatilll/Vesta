import { auth } from "../firebase/firebaseConfig";
import { findSocietyIdByUid } from "../firebase/firestore/admin";

// Get current user's societyId if not provided
const ensureSocietyId = async (societyId?: string) => {
	if (!societyId) {
		const user = auth.currentUser;
		if (!user) {
			throw new Error("No authenticated user found");
		}
		societyId = await findSocietyIdByUid(user.uid);
	}
	return societyId;
};

export { ensureSocietyId };
