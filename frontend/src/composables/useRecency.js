export function startOfWeek(date) {
	const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const day = copy.getDay();
	const diff = day === 0 ? -6 : 1 - day;
	copy.setDate(copy.getDate() + diff);
	copy.setHours(0, 0, 0, 0);
	return copy;
}

export function resolveRecencyGroup(value) {
	if (!value) return 'older';
	const fileDate = new Date(value);
	const now = new Date();
	const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const yesterdayStart = new Date(todayStart);
	yesterdayStart.setDate(yesterdayStart.getDate() - 1);
	const thisWeekStart = startOfWeek(now);
	const lastWeekStart = new Date(thisWeekStart);
	lastWeekStart.setDate(lastWeekStart.getDate() - 7);
	const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
	const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
	const thisYearStart = new Date(now.getFullYear(), 0, 1);
	const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);

	if (fileDate >= todayStart) return 'today';
	if (fileDate >= yesterdayStart) return 'yesterday';
	if (fileDate >= thisWeekStart) return 'thisWeek';
	if (fileDate >= lastWeekStart) return 'lastWeek';
	if (fileDate >= thisMonthStart) return 'thisMonth';
	if (fileDate >= lastMonthStart) return 'lastMonth';
	if (fileDate >= thisYearStart) return 'thisYear';
	if (fileDate >= lastYearStart) return 'lastYear';
	return 'older';
}
