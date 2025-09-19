import { ensureSocietyId } from "../../utils/ensureSocietyId";
import {
	collection,
	db,
	deleteDoc,
	doc,
	getDoc,
	onSnapshot,
	setDoc,
	Timestamp,
} from "../firebaseServices";

/**
 * Add notification for unpaid maintenance
 * @param societyId
 * @param residentId
 * @param monthKey
 */
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

/**
 * Delete a notification by ID
 * @param societyId
 * @param notificationId // Format: `${residentId}-${monthKey}` (e.g., `resident123-2023-09`)
 */
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

/**
 * Get notifications for a resident
 * @param societyId
 * @param callback Optional callback to handle real-time updates
 * @returns Unsubscribe function to stop listening
 */
export async function getNotifications(
	societyId: string,
	callback?: (data: any) => void
): Promise<any> {
	!societyId && (societyId = await ensureSocietyId(societyId));

	try {
		const ref = collection(db, "societies", societyId, "notifications");

		// Start listening to changes in the notifications collection
		const unsubscribe = onSnapshot(ref, (snapshot) => {
			const data = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));

			if (callback) {
				callback(data);
			}
		});

		return unsubscribe; // Return the unsubscribe function to stop listening when needed
	} catch (error: any) {
		throw error;
	}
}
