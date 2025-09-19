import { createContext, useContext, useEffect, useState } from "react";
import { getAllResidents } from "../firebase/firestore/residents";
import { getNotifications } from "../firebase/firestore/notifications";
import { getBalance } from "../firebase/firestore/balance";
import { getMaintenanceAmount } from "../firebase/firestore/maintenanceAmount";
import {
	getPaymentCycle,
	markMaintenancePaid,
	autoMarkUnpaidResidents,
} from "../firebase/firestore/paymentCycle";
import { useAuth } from "./AuthContext";

const SocietyContext = createContext();

export const SocietyProvider = ({ children }) => {
	const { user, societyId } = useAuth();

	const [residents, setResidents] = useState([]);
	const [notifications, setNotifications] = useState([]);
	const [balance, setBalance] = useState(null);
	const [maintenanceAmount, setMaintenanceAmount] = useState(null);
	const [paymentCycle, setPaymentCycle] = useState(null);

	const [loading, setLoading] = useState(true);

	// Fetch initial data when user or societyId changes
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);

			try {
				const [
					residentsData,
					balanceData,
					maintenanceAmountData,
					paymentCycleData,
				] = await Promise.all([
					getAllResidents(societyId),
					getBalance(societyId),
					getMaintenanceAmount(societyId),
					getPaymentCycle(societyId),
				]);

				setResidents(residentsData);
				setBalance(balanceData);
				setMaintenanceAmount(maintenanceAmountData);
				setPaymentCycle(paymentCycleData);
			} catch (error) {
				console.error("Error fetching data at Society Context:", error);
			} finally {
				setLoading(false);
			}
		};

		if (user && societyId) {
			fetchData();
		}
	}, [user, societyId]);

	// Auto mark unpaid residents when component mounts
	useEffect(() => {
		if (user && societyId) {
			autoMarkUnpaidResidents(societyId);
		}
	}, [user, societyId]);

	// Real-time updates for notifications
	useEffect(() => {
		if (user && societyId) {
			let unsubscribe;

			// IIFE to handle async function in useEffect
			(async () => {
				unsubscribe = await getNotifications(societyId, (data) => {
					setNotifications(data);
				});
			})();

			// Cleanup subscription on unmount
			return () => {
				if (unsubscribe) unsubscribe();
			};
		}
	}, [user, societyId]);

	return (
		<SocietyContext.Provider
			value={{
				loading,
				societyId,

				residents,
				notifications,
				balance,
				maintenanceAmount,
				paymentCycle,

				setResidents,
				setNotifications,
				setBalance,
				setMaintenanceAmount,
				setPaymentCycle,

				markMaintenancePaid,
				autoMarkUnpaidResidents,
			}}
		>
			{children}
		</SocietyContext.Provider>
	);
};

export const useSociety = () => {
	const context = useContext(SocietyContext);

	if (!context) {
		throw new Error("useSociety must be used within a SocietyProvider");
	}

	return context;
};
