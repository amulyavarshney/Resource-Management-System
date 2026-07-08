import { Department, Region } from "@/nextauth";
import http from "./httpInstance";
import { Project } from "./project";
import { User } from "./user";

export type DashboardViewModel = {
	total_projects: number;
	total_users: number;
	total_int_users: number;
	total_ext_users: number;
	total_work_hours: number;
	total_int_work_hours: number;
	total_ext_work_hours: number;
};

export type ProjectDashboardMetrics = {
	[key: string]: number | string;
	project_id: number;
	project_number: string;
	project_title: string;
	business: string;
	department: Department;
	region: Region;
	total_int_users: number;
	total_ext_users: number;
	total_users: number;
	total_int_work_hours: number;
	total_ext_work_hours: number;
	total_work_hours: number;
};

export type ProjectDashboardViewModel = ProjectDashboardMetrics & {
	users: User[];
};

export type UserDashboardMetrics = {
	[key: string]: number | string | boolean;
	user_id: number;
	user_name: string;
	first_name: string;
	last_name: string;
	email: string;
	is_external: boolean;
	parent_id: number;
	total_projects: number;
	total_week1_hours: number;
	total_week2_hours: number;
	total_week3_hours: number;
	total_week4_hours: number;
	total_week5_hours: number;
	totalHours: number;
};

export type UserDashboardViewModel = UserDashboardMetrics & {
	projects: Project[];
};

class DashboardService {
	getFullName(user: UserDashboardViewModel) {
		return `${user.first_name} ${user.last_name}`;
	}

	async getDashboard(
		year: number,
		month: number,
		department?: Department,
		region?: Region
	) {
		try {
			const response = await http.get<DashboardViewModel>(
				`/dashboard/${encodeURIComponent(year)}/${encodeURIComponent(month)}?${
					department ? `department=${encodeURIComponent(department)}&` : ""
				}${region ? `region=${encodeURIComponent(region)}&` : ""}`.replace(
					/[?&]$/,
					""
				)
			);
			const data = response.data;
			data.total_int_users = data.total_users - data.total_ext_users;
			data.total_int_work_hours = data.total_work_hours - data.total_ext_work_hours;
			return data;
		} catch (error) {
			throw error;
		}
	}

	async getProjectDashboard(
		year: number,
		month: number,
		department?: Department,
		region?: Region
	) {
		try {
			const response = await http.get<ProjectDashboardViewModel[]>(
				`/dashboard/${encodeURIComponent(year)}/${encodeURIComponent(
					month
				)}/project?${
					department ? `department=${encodeURIComponent(department)}&` : ""
				}${region ? `region=${encodeURIComponent(region)}&` : ""}`.replace(
					/[?&]$/,
					""
				)
			);
			return response.data;
		} catch (error) {
			console.error("Error while fetching Project Dashboard", error);
			throw error;
		}
	}

	async getProjectDashboardById(
		year: number,
		month: number,
		projectId: number
	) {
		try {
			const response = await http.get<ProjectDashboardViewModel>(
				`/dashboard/${encodeURIComponent(year)}/${encodeURIComponent(
					month
				)}/project/${encodeURIComponent(projectId)}`
			);
			return response.data;
		} catch (error) {
			console.error(
				`Error while fetching Project Dashboard with id ${projectId}`,
				error
			);
			throw error;
		}
	}

	async getOverallProjectDashboardById(projectId: number) {
		try {
			const response = await http.get<ProjectDashboardViewModel>(
				`/dashboard/project/${encodeURIComponent(projectId)}`
			);
			return response.data;
		} catch (error) {
			console.error(
				`Error while fetching Project Dashboard with id: ${projectId}`,
				error
			);
			throw error;
		}
	}

	async getUserDashboard(
		year: number,
		month: number,
		department?: Department,
		region?: Region
	) {
		try {
			const response = await http.get<UserDashboardViewModel[]>(
				`/dashboard/${encodeURIComponent(year)}/${encodeURIComponent(
					month
				)}/user?${
					department ? `department=${encodeURIComponent(department)}&` : ""
				}${region ? `region=${encodeURIComponent(region)}&` : ""}`.replace(
					/[?&]$/,
					""
				)
			);
			const dashboardData = response.data;
			dashboardData.map(
				(data) =>
					(data.totalHours =
						data.total_week1_hours +
						data.total_week2_hours +
						data.total_week3_hours +
						data.total_week4_hours +
						data.total_week5_hours)
			);
			return dashboardData;
		} catch (error) {
			console.error("Error while fetching User Dashboard", error);
			throw error;
		}
	}

	async getUserDashboardById(year: number, month: number, userId: number) {
		try {
			const response = await http.get<UserDashboardViewModel>(
				`/dashboard/${encodeURIComponent(year)}/${encodeURIComponent(
					month
				)}/user/${encodeURIComponent(userId)}`
			);
			const data = response.data;
			data.totalHours =
				data.total_week1_hours +
				data.total_week2_hours +
				data.total_week3_hours +
				data.total_week4_hours +
				data.total_week5_hours;
			return data;
		} catch (error) {
			console.error(
				`Error while fetching User Dashboard with id: $userId}`,
				error
			);
			throw error;
		}
	}

	async getOverallUserDashboardById(userId: number) {
		try {
			const response = await http.get<UserDashboardViewModel>(
				`/dashboard/user/${encodeURIComponent(userId)}`
			);
			const data = response.data;
			data.totalHours =
				data.total_week1_hours +
				data.total_week2_hours +
				data.total_week3_hours +
				data.total_week4_hours +
				data.total_week5_hours;
			return data;
		} catch (error) {
			console.error(
				`Error while fetching User Dashboard with id: ${userId}`,
				error
			);
			throw error;
		}
	}

	async getUserDashboardByParentId(
		year: number,
		month: number,
		parentId: number,
		region?: Region
	) {
		try {
			const response = await http.get<UserDashboardViewModel[]>(
				`/dashboard/${encodeURIComponent(year)}/${encodeURIComponent(
					month
				)}/parent/${encodeURIComponent(parentId)}?${
					region ? `region=${encodeURIComponent(region)}&` : ""
				}`.replace(/[?&]$/, "")
			);
			return response.data;
		} catch (error) {
			console.error(
				`Error fetching User Dashboard with parentId: ${parentId}`,
				error
			);
			throw error;
		}
	}

	async getUsersWithUnfilledTimesheet(
		year: number,
		month: number,
		department?: Department,
		region?: Region
	) {
		try {
			const response = await http.get<User[]>(
				`/dashboard/${encodeURIComponent(year)}/${encodeURIComponent(
					month
				)}/users-with-unfilled-timesheet?${
					department ? `department=${encodeURIComponent(department)}&` : ""
				}${region ? `region=${encodeURIComponent(region)}&` : ""}`.replace(
					/[?&]$/,
					""
				)
			);
			return response.data;
		} catch (error) {
			console.error(
				"Error while fetching Users with unfilled timesheet",
				error
			);
			throw error;
		}
	}
}

const dashboardService = new DashboardService();
export default dashboardService;
