import { Department, Region } from "@/nextauth";
import http from "./httpInstance";
import type {
	ApiDashboard,
	ApiProject,
	ApiProjectDashboard,
	ApiUser,
	ApiUserDashboard,
} from "../generated";
import type { User } from "./user";

export type DashboardViewModel = ApiDashboard;

export type ProjectDashboardUser = ApiUser & {
	week1_hours?: number | null;
	week2_hours?: number | null;
	week3_hours?: number | null;
	week4_hours?: number | null;
	week5_hours?: number | null;
};

export type ProjectDashboardViewModel = Omit<ApiProjectDashboard, "users"> & {
	users?: ProjectDashboardUser[] | null;
	[key: string]: unknown;
};

/** UI extension: summed week hours for tables. */
export type UserDashboardViewModel = ApiUserDashboard & {
	totalHours: number;
	projects?: ApiProject[] | null;
	type?: string;
	[key: string]: unknown;
};

function withTotalHours(data: ApiUserDashboard): UserDashboardViewModel {
	return {
		...data,
		totalHours:
			(data.total_week1_hours || 0) +
			(data.total_week2_hours || 0) +
			(data.total_week3_hours || 0) +
			(data.total_week4_hours || 0) +
			(data.total_week5_hours || 0),
	};
}

class DashboardService {
	getFullName(user: Pick<UserDashboardViewModel, "first_name" | "last_name">) {
		return `${user.first_name} ${user.last_name}`;
	}

	async getDashboard(
		year: number,
		month: number,
		department?: Department,
		region?: Region
	): Promise<DashboardViewModel> {
		const response = await http.get<ApiDashboard>(
			`/dashboard/${encodeURIComponent(year)}/${encodeURIComponent(month)}?${
				department ? `department=${encodeURIComponent(department)}&` : ""
			}${region ? `region=${encodeURIComponent(region)}&` : ""}`.replace(
				/[?&]$/,
				""
			)
		);
		return response.data;
	}

	async getProjectDashboard(
		year: number,
		month: number,
		department?: Department,
		region?: Region
	) {
		const response = await http.get<ApiProjectDashboard[]>(
			`/dashboard/${encodeURIComponent(year)}/${encodeURIComponent(
				month
			)}/project?${
				department ? `department=${encodeURIComponent(department)}&` : ""
			}${region ? `region=${encodeURIComponent(region)}&` : ""}`.replace(
				/[?&]$/,
				""
			)
		);
		return response.data as ProjectDashboardViewModel[];
	}

	async getProjectDashboardById(
		year: number,
		month: number,
		projectId: number
	) {
		const response = await http.get<ApiProjectDashboard>(
			`/dashboard/${encodeURIComponent(year)}/${encodeURIComponent(
				month
			)}/project/${encodeURIComponent(projectId)}`
		);
		return response.data as ProjectDashboardViewModel;
	}

	async getOverallProjectDashboardById(projectId: number) {
		const response = await http.get<ApiProjectDashboard>(
			`/dashboard/project/${encodeURIComponent(projectId)}`
		);
		return response.data as ProjectDashboardViewModel;
	}

	async getUserDashboard(
		year: number,
		month: number,
		department?: Department,
		region?: Region
	) {
		const response = await http.get<ApiUserDashboard[]>(
			`/dashboard/${encodeURIComponent(year)}/${encodeURIComponent(
				month
			)}/user?${
				department ? `department=${encodeURIComponent(department)}&` : ""
			}${region ? `region=${encodeURIComponent(region)}&` : ""}`.replace(
				/[?&]$/,
				""
			)
		);
		return response.data.map(withTotalHours);
	}

	async getUserDashboardById(year: number, month: number, userId: number) {
		const response = await http.get<ApiUserDashboard>(
			`/dashboard/${encodeURIComponent(year)}/${encodeURIComponent(
				month
			)}/user/${encodeURIComponent(userId)}`
		);
		return withTotalHours(response.data);
	}

	async getOverallUserDashboardById(userId: number) {
		const response = await http.get<ApiUserDashboard>(
			`/dashboard/user/${encodeURIComponent(userId)}`
		);
		return withTotalHours(response.data);
	}

	async getUserDashboardByParentId(
		year: number,
		month: number,
		parentId: number,
		region?: Region
	) {
		const response = await http.get<ApiUserDashboard[]>(
			`/dashboard/${encodeURIComponent(year)}/${encodeURIComponent(
				month
			)}/parent/${encodeURIComponent(parentId)}?${
				region ? `region=${encodeURIComponent(region)}&` : ""
			}`.replace(/[?&]$/, "")
		);
		return response.data.map(withTotalHours);
	}

	async getUsersWithUnfilledTimesheet(
		year: number,
		month: number,
		department?: Department,
		region?: Region
	) {
		const response = await http.get<ApiUserDashboard[]>(
			`/dashboard/${encodeURIComponent(year)}/${encodeURIComponent(
				month
			)}/users-with-unfilled-timesheet?${
				department ? `department=${encodeURIComponent(department)}&` : ""
			}${region ? `region=${encodeURIComponent(region)}&` : ""}`.replace(
				/[?&]$/,
				""
			)
		);
		return response.data.map(withTotalHours);
	}
}

const dashboardService = new DashboardService();
export default dashboardService;

// Re-export for callers that imported User via dashboard historically
export type { User };
