import { RouterProvider } from "react-router-dom";
import router from "./routes/router";
import ResponsiveToaster from "./components/ResponsiveToaster";
import React from "react";

const App = () => {
	return (
		<React.Fragment>
			<RouterProvider router={router} />

			<ResponsiveToaster />
		</React.Fragment>
	);
};

export default App;
