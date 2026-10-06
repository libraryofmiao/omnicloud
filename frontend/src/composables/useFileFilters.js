export function matchesUpdatedFilter(value, filter) {
	if (!value) return false;
	if (filter === 'all') return true;

	const fileDate = new Date(value);
	const now = new Date();
	const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const last7Start = new Date(todayStart);
	last7Start.setDate(last7Start.getDate() - 6);
	const last30Start = new Date(todayStart);
	last30Start.setDate(last30Start.getDate() - 29);
	const thisYearStart = new Date(now.getFullYear(), 0, 1);
	const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
	const lastYearEnd = new Date(now.getFullYear(), 0, 1);

	switch (filter) {
		case 'today':
			return fileDate >= todayStart;
		case 'last7':
			return fileDate >= last7Start;
		case 'last30':
			return fileDate >= last30Start;
		case 'thisYear':
			return fileDate >= thisYearStart;
		case 'lastYear':
			return fileDate >= lastYearStart && fileDate < lastYearEnd;
		default:
			return true;
	}
}
