import { toast } from "react-hot-toast";
import { Department, Region } from "@/nextauth.d";
import http from "./httpInstance";

export type ProjectCreateViewModel = {
	number: string;
	title: string;
	business?: string;
	department: Department;
	region: Region;
	description?: string;
};

export type ProjectUpdateViewModel = Partial<ProjectCreateViewModel>;

export type Project = ProjectCreateViewModel & {
	[key: string]: number | string;
	id: number;
	working_hours: number;
};

class ProjectService {
	async getProjects(department?: Department, region?: Region) {
		try {
			const response = await http.get<Project[]>(
				`/project?${department ? `department=${department}&` : ""}${
					region ? `region=${region}&` : ""
				}`.replace(/[?&]$/, "")
			);
			return response.data;
		} catch (error) {
			console.error("Error while fetching Projects", error);
			throw error;
		}
	}

	async getProjectsByYearAndMonth(
		year: number,
		month: number,
		department?: Department,
		region?: Region
	) {
		try {
			const response = await http.get<Project[]>(
				`/project/${year}/${month}?${
					department ? `department=${department}&` : ""
				}${region ? `?region=${region}&` : ""}`.replace(/[?&]$/, "")
			);
			return response.data;
		} catch (error) {
			console.error("Error while fetching Projects by Year and Month", error);
			throw error;
		}
	}

	async getProject(id: number) {
		try {
			const response = await http.get<Project>(`/project/${id}`);
			return response.data;
		} catch (error) {
			console.error(`Error while fetching Project with id ${id}`, error);
			throw error;
		}
	}

	async addProject(project: ProjectCreateViewModel) {
		try {
			const response = await http.post<Project>("/project", project);
			toast.success("Project added successfully.");
			return response.data;
		} catch (error) {
			console.error("Error while adding Project", error);
			toast.error("An error occurred while adding new project.");
			throw error;
		}
	}

	async importProjects(excelData: FormData) {
		try {
			const response = await http.post<Project>("/project/import", excelData);
			toast.success("Projects imported successfully.");
			return response.data;
		} catch (error) {
			console.error("Error while importing Projects", error);
			toast.error(
				"An error occurred while importing projects from Excel file."
			);
			throw error;
		}
	}

	async updateProject(id: number, project: ProjectUpdateViewModel) {
		try {
			const response = await http.patch<Project>(`/project/${id}`, project);
			toast.success("Project updated successfully.");
			return response.data;
		} catch (error) {
			console.error(`Error while updating Project with id ${id}`, error);
			toast.error(`Error updating project: ${error}`);
			throw error;
		}
	}

	async removeProject(id: number, deleteNow?: boolean) {
		try {
			const response = await http.delete<Project>(
				`/project/${id}${deleteNow ? `?delete_now=${deleteNow}` : ""}`
			);
			return response.data;
		} catch (error) {
			console.error(`Error while removing Project with id ${id}`, error);
			throw error;
		}
	}
}

const projectService = new ProjectService();
export default projectService;
