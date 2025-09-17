import { createBrowserRouter } from "react-router-dom";

import PublicRoutes from "./PublicRoutes";
import ProtectedRoutes from "./ProtectedRoutes";

import AppContent from "../content/AppContent";
import Layout from "../components/Layout";

import NotFound from "./../pages/NotFound";

import HomePage from "../pages/HomePage";

import LoginPage from "./../pages/LoginPage";
import RegisterPage from "./../pages/RegisterPage";
import ResetPasswordPage from "./../pages/ResetPasswordPage";
import NewPassword from "./../pages/NewPassword";

import AccountPage from "./../pages/AccountPage";

import ManageSocietyPage from "../pages/ManageSocietyPage";

import ManageResidentsPage from "../pages/ManageSociety/ManageResidentsPage";
import AddTransactionsPage from "../pages/ManageSociety/AddTransactionsPage";

import AddResidentPage from "../pages/ManageSociety/ManageResidents/AddResidentPage";
import UpdateResidentsPage from "../pages/ManageSociety/ManageResidents/UpdateResidentsPage";
import ViewResidentsPage from "../pages/ManageSociety/ManageResidents/ViewResidentsPage";
import TermsPage from "./../pages/TermsPage";
import PrivacyPage from "./../pages/PrivacyPage";

const PublicRoutesArray = [
	{
		path: "/login",
		element: <LoginPage />,
	},
	{
		path: "/register",
		element: <RegisterPage />,
	},
	{
		path: "/reset-password",
		element: <ResetPasswordPage />,
	},
];

const ProtectedRoutesArray = [
	{
		path: "/",
		element: <HomePage />,
	},
	{
		path: "/account",
		element: <AccountPage />,
	},
	{
		path: "/manage-society",
		element: <ManageSocietyPage />,
		children: [
			{
				path: "manage-residents",
				element: <ManageResidentsPage />,
				children: [
					{
						path: "update",
						element: <UpdateResidentsPage />,
					},
					{
						path: "view",
						element: <ViewResidentsPage />,
					},
					{
						path: "add",
						element: <AddResidentPage />,
					},
				],
			},
			{
				path: "add-transactions",
				element: <AddTransactionsPage />,
			},
		],
	},
];

const router = createBrowserRouter([
	// Public Routes
	{
		element: <PublicRoutes />,
		children: [
			{
				element: <AppContent />,
				children: PublicRoutesArray,
			},
		],
	},

	// Universal routes
	{
		path: "/new-password", // universal route (no auth wrapper)
		element: <NewPassword />,
	},

	{
		path: "/terms",
		element: <TermsPage />,
	},

	{
		path: "/privacy",
		element: <PrivacyPage />,
	},

	// Protected Routes
	{
		element: <ProtectedRoutes />,
		children: [
			{
				element: <Layout />,
				children: [
					{
						element: <AppContent />,
						children: ProtectedRoutesArray,
					},
				],
			},
		],
	},

	// Not Found Routes
	{
		path: "*",
		element: <NotFound />,
	},
]);

export default router;
