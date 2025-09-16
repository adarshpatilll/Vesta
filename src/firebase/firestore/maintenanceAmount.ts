import { ensureSocietyId } from "../../utils/ensureSocietyId";
import { db, doc, getDoc, setDoc } from "../firebaseServices";

export const setMaintenanceAmount = async (
	societyId: string,
	amount: number
) => {
	societyId = await ensureSocietyId(societyId);

	const ref = doc(db, "societies", societyId, "settings", "maintenance");
	await setDoc(ref, { amount }, { merge: true });
};

export const getMaintenanceAmount = async (societyId: string) => {
	societyId = await ensureSocietyId(societyId);

	const ref = doc(db, "societies", societyId, "settings", "maintenance");
	const snapshot = await getDoc(ref);
	return snapshot.data()?.amount;
};
