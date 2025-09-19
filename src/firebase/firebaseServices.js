import { auth, db } from "./firebaseConfig";
import {
	collection,
	doc,
	setDoc,
	getDoc,
	getDocs,
	updateDoc,
	deleteDoc,
	Timestamp,
	addDoc,
	where,
	query,
	onSnapshot,
} from "firebase/firestore";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
} from "firebase/auth";

export {
	auth,
	db,
	collection,
	doc,
	setDoc,
	getDoc,
	getDocs,
	updateDoc,
	deleteDoc,
	Timestamp,
	addDoc,
	where,
	query,
	onSnapshot,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
};
