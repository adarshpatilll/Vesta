import { RouterProvider } from "react-router-dom";
import router from "./routes/router";
import ResponsiveToaster from "./components/ResponsiveToaster";
import React from "react";
import useAntiInspect from "./hooks/useAntiInspect";
import UnderMaintenance from "./components/UnderMaintenance";

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
		<React.Fragment>
			<RouterProvider router={router} />

			<ResponsiveToaster />
		</React.Fragment>
	);
};

export default App;
