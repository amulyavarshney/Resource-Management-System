import dashboardService, { UserDashboardViewModel } from "./dashboard";
import { Project } from "./project";
import userService, { User } from "./user";

export function toLowerCase(input: number | string): number | string {
	if (typeof input === "string") {
		return input.toLowerCase();
	}
	return input;
}

/** Local calendar date as YYYY-MM-DD for FastAPI `date` query/path params. */
export function toApiDate(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

export function sortProjects(
	projects: Project[],
	sortConfig: { column: string; isAscending: boolean }
) {
	return projects.sort((a, b) => {
		const aValue = toLowerCase(a[sortConfig.column]);
		const bValue = toLowerCase(b[sortConfig.column]);
		return sortConfig.isAscending
			? aValue < bValue
				? -1
				: 1
			: aValue > bValue
			? -1
			: 1;
	});
}

export function sortUsers(users: User[]) {
	return users.sort((a, b) => {
		const fullName_A = userService.getFullName(a);
		const fullName_B = userService.getFullName(b);
		return fullName_A.localeCompare(fullName_B);
	});
}

export function sortUsersDashboard(users: UserDashboardViewModel[]) {
	return users.sort((a, b) => {
		const fullName_A = dashboardService.getFullName(a);
		const fullName_B = dashboardService.getFullName(b);
		return fullName_A.localeCompare(fullName_B);
	});
}