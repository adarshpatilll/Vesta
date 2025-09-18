import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../context/AuthContext";
import { SocietyProvider } from "../context/SocietyContext";
import ErrorBoundary from "../components/ErrorBoundary";
import ErrorFallback from "../components/ErrorFallback";

const AppProvider = ({ children }) => {
	return (
		<ErrorBoundary fallback={<ErrorFallback />}>
			<AuthProvider>
				<SocietyProvider>
					<GoogleOAuthProvider
						clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
					>
						{children}
					</GoogleOAuthProvider>
				</SocietyProvider>
			</AuthProvider>
		</ErrorBoundary>
	);
};

export default AppProvider;
