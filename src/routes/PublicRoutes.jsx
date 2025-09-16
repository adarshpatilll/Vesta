import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CircularLoader from "./../components/CircularLoader";

const PublicRoutes = () => {
	const { isAuthenticated, loading } = useAuth();

	if (loading) {
		return (
			<div className="h-screen w-full bg-dark text-light">
				<CircularLoader />
			</div>
		);
	}

	if (isAuthenticated) {
		return <Navigate to="/" />;
	}

	return <Outlet />;
};

export default PublicRoutes;
