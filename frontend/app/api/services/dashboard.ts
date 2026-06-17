import { Department, Region } from "@/nextauth";
import http from "./httpInstance";
import { Project } from "./project";
import { User } from "./user";

export type DashboardViewModel = {
	totalProjects: number;
	totalUsers: number;
	totalIntUsers: number;
	totalExtUsers: number;
	totalWorkHours: number;
	totalIntWorkHours: number;
	totalExtWorkHours: number;
};

export type ProjectDashboardMetrics = {
	[key: string]: number | string;
	projectId: number;
	projectNumber: string;
	projectTitle: string;
	business: string;
	department: Department;
	region: Region;
	totalIntUsers: number;
	totalExtUsers: number;
	totalUsers: number;
	totalIntWorkHours: number;
	totalExtWorkHours: number;
	totalWorkHours: number;
};

export type ProjectDashboardViewModel = ProjectDashboardMetrics & {
	users: User[];
};

export type UserDashboardMetrics = {
	[key: string]: number | string | boolean;
	userId: number;
	userName: string;
	firstName: string;
	lastName: string;
	email: string;
	isExternal: boolean;
	parentId: number;
	totalProjects: number;
	totalWeek1Hours: number;
	totalWeek2Hours: number;
	totalWeek3Hours: number;
	totalWeek4Hours: number;
	totalWeek5Hours: number;
	totalHours: number;
};

export type UserDashboardViewModel = UserDashboardMetrics & {
	projects: Project[];
};

class DashboardService {
	getFullName(user: UserDashboardViewModel) {
		return `${user.firstName} ${user.lastName}`;
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
			data.totalIntUsers = data.totalUsers - data.totalExtUsers;
			data.totalIntWorkHours = data.totalWorkHours - data.totalExtWorkHours;
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
						data.totalWeek1Hours +
						data.totalWeek2Hours +
						data.totalWeek3Hours +
						data.totalWeek4Hours +
						data.totalWeek5Hours)
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
				data.totalWeek1Hours +
				data.totalWeek2Hours +
				data.totalWeek3Hours +
				data.totalWeek4Hours +
				data.totalWeek5Hours;
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
				data.totalWeek1Hours +
				data.totalWeek2Hours +
				data.totalWeek3Hours +
				data.totalWeek4Hours +
				data.totalWeek5Hours;
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
