import { RouterProvider } from "react-router-dom";
import router from "./routes/router";
import ResponsiveToaster from "./components/ResponsiveToaster";
import React from "react";
import useAntiInspect from "./hooks/useAntiInspect";

const App = () => {
	useAntiInspect();

	return (
		<React.Fragment>
			<RouterProvider router={router} />

			<ResponsiveToaster />
		</React.Fragment>
	);
};

export default App;
