import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocietyProvider } from "./context/SocietyContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Register service worker
if (import.meta.env.DEV && "serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register("/service-worker.js")
			.then((reg) => console.log("Dev SW registered:", reg))
			.catch((err) => console.error("Dev SW registration failed:", err));
	});
}

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<AuthProvider>
			<SocietyProvider>
				<GoogleOAuthProvider
					clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
				>
					<App />
				</GoogleOAuthProvider>
			</SocietyProvider>
		</AuthProvider>
	</StrictMode>
);
