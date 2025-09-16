import { useMemo } from "react";
import { useLocation } from "react-router-dom";

function getHeadingFromPath(path) {
	if (!path) return "Manage Society";

	// remove query/hash, normalize, split into segments
	const clean = path.split("?")[0].split("#")[0].replace(/\/+$/, "");
	const segments = clean.split("/").filter(Boolean); // ['manage-society','manage-residents','add']

	// find index of manage-society if your app may have prefix (like /app/manage-society/...)
	const msIndex = segments.indexOf("manage-society");
	const start = msIndex >= 0 ? msIndex : 0; // start reading from here (or 0)

	// helper to safely read segment at offset
	const seg = (i) => segments[start + i];

	// cases
	if (seg(0) === "manage-society") {
		if (seg(1) === "manage-residents") {
			// more specific checks first
			if (seg(2) === "view") return "View Residents";
			if (seg(2) === "update") return "Update Residents";
			if (seg(2) === "add") return "Add Resident";
			return "Manage Residents";
		}

		if (seg(1) === "add-transactions") return "Add Transactions";

		// fallback
		return "Manage Society";
	}

	// fallback for other routes
	return "Manage Society";
}

export default function UseHeading() {
	const location = useLocation();

	const heading = useMemo(
		() => getHeadingFromPath(location.pathname),
		[location.pathname]
	);

	return heading;
}
