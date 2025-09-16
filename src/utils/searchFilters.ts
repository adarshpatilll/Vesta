export const searchFilter = (
	data: Array<any>,
	query: string,
	keys: Array<string>
): Array<any> => {
	return data.filter((item) =>
		keys
			.filter(Boolean)
			.some((field) =>
				item[field].toLowerCase().includes(query.toLowerCase())
			)
	);
};
