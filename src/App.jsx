import { RouterProvider } from "react-router-dom";
import ResponsiveToaster from "./components/ResponsiveToaster";
import React from "react";
import useAntiInspect from "./hooks/useAntiInspect";
import UnderMaintenance from "./components/UnderMaintenance";
import AppRouter from "./routes/router";

const App = () => {
	useAntiInspect();

	// Disable console errors in production
	if (import.meta.env.VITE_DEV === "false") {
		console.error = () => {};
	}

	// Maintenance Mode Check - Toggle via .env file
	if (import.meta.env.VITE_MAINTENANCE_MODE === "true") {
		return <UnderMaintenance />;
	}

	return (
		<>
			<RouterProvider router={AppRouter()} />

			<ResponsiveToaster />
		</>
	);
};

export default App;
