import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CircularLoader from "../components/CircularLoader";

const restrictedPaths = [
	"/manage-society/manage-residents/add",
	"/manage-society/manage-residents/update",
	"/manage-society/add-transactions",
];

const ProtectedRoutes = () => {
	const { isAuthenticated, loading, isEditAccess } = useAuth();
	const location = useLocation();

	// ⏳ Show loader while checking auth status
	if (loading) {
		return (
			<div className="h-screen w-full bg-dark text-light">
				<CircularLoader label="Loading User..." />
			</div>
		);
	}

	// 🚪 Redirect to login if not authenticated
	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	// 🚫 Block restricted paths if edit access is false
	if (!isEditAccess && restrictedPaths.includes(location.pathname)) {
		return (
			<Navigate
				to="/access-denied"
				state={{ isEditNavigate: true }}
				replace
			/>
		);
	}

	// ✅ Otherwise allow
	return <Outlet />;
};

export default ProtectedRoutes;

/* Old Code */
// const ProtectedRoutes = () => {
// 	const { isAuthenticated, loading } = useAuth();

// 	if (loading) {
// 		return (
// 			<div className="h-screen w-full bg-dark text-light">
// 				<CircularLoader label="Loading User..." />
// 			</div>
// 		);
// 	}

// 	if (!isAuthenticated) {
// 		return <Navigate to="/login" replace />;
// 	}

// 	return <Outlet />;
// };

// export default ProtectedRoutes;
