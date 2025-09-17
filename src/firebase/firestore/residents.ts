import { ensureSocietyId } from "../../utils/ensureSocietyId";
import {
	addDoc,
	collection,
	db,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	setDoc,
	Timestamp,
	updateDoc,
} from "../firebaseServices";
import getMonthKey from "./../../utils/getMonthKey";

interface Resident {
	id: string;
	flatNo: string;
	ownerName: string;
	ownerContact: string;
	type: "owner" | "tenant";
	tenantName?: string;
	tenantContact?: string;
	maintenance: { [monthKey: string]: "paid" | "unpaid" };
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

// Add resident
export const addResident = async (
	societyId: string,
	data: {
		flatNo: string;
		ownerName: string;
		ownerContact: string;
		type: "owner" | "tenant";
		tenantName?: string;
		tenantContact?: string;
	}
) => {
   !societyId && (societyId = await ensureSocietyId(societyId));
   
	try {
		const monthKey = getMonthKey();

		const residentRef = collection(db, "societies", societyId, "residents");
		const residentDocRef = await addDoc(residentRef, {
			...data,
			maintenance: {
				[monthKey]: "unpaid",
			},
			createdAt: Timestamp.now(),
			updatedAt: Timestamp.now(),
		});

		await setDoc(residentDocRef, { id: residentDocRef.id }, { merge: true });

		return residentDocRef.id;
	} catch (error) {
		throw error;
	}
};

// Get resident by ID
export const getResidentById = async (
	societyId: string,
	residentId: string
) => {
	!societyId && (societyId = await ensureSocietyId(societyId));

	try {
		const residentRef = doc(
			db,
			"societies",
			societyId,
			"residents",
			residentId
		);
		const residentSnap = await getDoc(residentRef);
		return residentSnap.exists() ? (residentSnap.data() as Resident) : null;
	} catch (error) {
		throw error;
	}
};

// Get all residents
export const getAllResidents = async (societyId: string) => {
   !societyId && (societyId = await ensureSocietyId(societyId));
   
	try {
		const residentsRef = collection(db, "societies", societyId, "residents");
		const snapshot = await getDocs(residentsRef);

		const residents = snapshot.docs.map((doc) => ({ ...doc.data() }));

		// Custom sorting function for flatNo
		residents.sort((a, b) => {
			// Helper function to extract parts and handle purely numeric strings
			const parseFlatNo = (flatNo) => {
				const match = flatNo.match(/^([a-zA-Z]*)([0-9]*)$/);
				// If the match is not found or is purely numeric, handle it as a number
				if (!match) {
					return { alpha: "", num: parseInt(flatNo) };
				}
				return {
					alpha: match[1].toUpperCase(),
					num: parseInt(match[2]),
				};
			};

			const flatA = parseFlatNo(a.flatNo);
			const flatB = parseFlatNo(b.flatNo);

			// Compare the alphabetic parts first
			if (flatA.alpha < flatB.alpha) return -1;
			if (flatA.alpha > flatB.alpha) return 1;

			// If alphabetic parts are the same, compare the numeric parts
			return flatA.num - flatB.num;
		});

		return residents;
	} catch (error) {
		throw error;
	}
};

// Update resident
export const updateResident = async (
	societyId: string,
	residentId: string,
	data: {
		flatNo?: string;
		ownerName?: string;
		ownerContact?: string;
		type?: "owner" | "tenant";
		tenantName?: string;
		tenantContact?: string;
	}
) => {
   !societyId && (societyId = await ensureSocietyId(societyId));
   
	try {
		const residentRef = doc(
			db,
			"societies",
			societyId,
			"residents",
			residentId
		);
		await updateDoc(residentRef, {
			...data,
			updatedAt: Timestamp.now(),
		});
	} catch (error) {
		throw error;
	}
};

// Delete resident
export const deleteResident = async (societyId: string, residentId: string) => {
	!societyId && (societyId = await ensureSocietyId(societyId));
   
	try {
		const residentRef = doc(
			db,
			"societies",
			societyId,
			"residents",
			residentId
		);
		await deleteDoc(residentRef);
	} catch (error) {
		throw error;
	}
};
