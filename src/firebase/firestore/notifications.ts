import { ensureSocietyId } from "../../utils/ensureSocietyId";
import {
	collection,
	db,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	setDoc,
	Timestamp,
} from "../firebaseServices";

// Save unpaid notification
export async function addUnpaidNotification(
	societyId: string,
	residentId: string,
	monthKey: string
) {
	!societyId && (societyId = await ensureSocietyId(societyId));

	const residentRef = doc(db, "societies", societyId, "residents", residentId);
	const residentSnap = await getDoc(residentRef);

	const flatNo = residentSnap.exists()
		? residentSnap.data().flatNo
		: "Unknown Flat";

	const ref = doc(
		db,
		"societies",
		societyId,
		"notifications",
		`${residentId}-${monthKey}`
	);
	await setDoc(
		ref,
		{
			residentId,
			flatNo,
			month: monthKey,
			message: `Resident ${flatNo} has not paid maintenance for ${monthKey}`,
			status: "unread",
			createdAt: Timestamp.now(),
		},
		{ merge: true }
	);
}

// Delete notification once maintenance is paid or status is read
export async function deleteNotification(
	societyId: string,
	notificationId: string
) {
	!societyId && (societyId = await ensureSocietyId(societyId));

	try {
		const ref = doc(
			db,
			"societies",
			societyId,
			"notifications",
			notificationId
		);
		await deleteDoc(ref);
	} catch (error) {
		throw error;
	}
}

// Get notifications
export async function getNotifications(societyId: string): Promise<any> {
	!societyId && (societyId = await ensureSocietyId(societyId));

	try {
		const ref = collection(db, "societies", societyId, "notifications");
		const snap = await getDocs(ref);
		return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
	} catch (error: any) {
		throw error;
	}
}
