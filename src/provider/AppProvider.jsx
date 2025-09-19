import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../context/AuthContext";
import { SocietyProvider } from "../context/SocietyContext";

const AppProvider = ({ children }) => {
	return (
		<AuthProvider>
			<SocietyProvider>
				<GoogleOAuthProvider
					clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
				>
					{children}
				</GoogleOAuthProvider>
			</SocietyProvider>
		</AuthProvider>
	);
};

export default AppProvider;
