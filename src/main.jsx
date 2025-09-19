import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import AppProvider from "./provider/AppProvider.jsx";
import ErrorBoundary from "@/components/ErrorBoundary.js";
import ErrorFallback from "@/components/ErrorFallback.js";

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
		<ErrorBoundary fallback={<ErrorFallback />}>
			<AppProvider>
				<App />
			</AppProvider>
		</ErrorBoundary>
	</StrictMode>
);
