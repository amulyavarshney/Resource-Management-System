import { toast } from "react-hot-toast";
import { Department, Region } from "@/nextauth.d";
import http from "./httpInstance";
import type { ApiMessage, ApiProject, ApiProjectUpdate } from "../generated";

/** Form/create payload — department/region are bitmask ints (may be combined). */
export type ProjectCreateViewModel = {
	number: string;
	title: string;
	business?: string | null;
	department: number;
	region: number;
	description?: string | null;
};

export type ProjectUpdateViewModel = Partial<ProjectCreateViewModel>;

/** API project row with loose index access for table sorting. */
export type Project = ApiProject & {
	[key: string]: string | number | null | undefined;
};

class ProjectService {
	async getProjects(department?: Department, region?: Region) {
		try {
			const response = await http.get<ApiProject[]>(
				`/project?${department ? `department=${department}&` : ""}${
					region ? `region=${region}&` : ""
				}`.replace(/[?&]$/, "")
			);
			return response.data as Project[];
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
			const response = await http.get<ApiProject[]>(
				`/project/${year}/${month}?${
					department ? `department=${department}&` : ""
				}${region ? `region=${region}&` : ""}`.replace(/[?&]$/, "")
			);
			return response.data as Project[];
		} catch (error) {
			console.error("Error while fetching Projects by Year and Month", error);
			throw error;
		}
	}

	async getProject(id: number) {
		try {
			const response = await http.get<ApiProject>(`/project/${id}`);
			return response.data as Project;
		} catch (error) {
			console.error(`Error while fetching Project with id ${id}`, error);
			throw error;
		}
	}

	async addProject(project: ProjectCreateViewModel) {
		try {
			const response = await http.post<ApiProject>("/project", project);
			toast.success("Project added successfully.");
			return response.data as Project;
		} catch (error) {
			console.error("Error while adding Project", error);
			toast.error("An error occurred while adding new project.");
			throw error;
		}
	}

	async importProjects(excelData: FormData) {
		try {
			const response = await http.post<ApiMessage>("/project/import", excelData);
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
			const response = await http.patch<ApiProject>(
				`/project/${id}`,
				project as ApiProjectUpdate
			);
			toast.success("Project updated successfully.");
			return response.data as Project;
		} catch (error) {
			console.error(`Error while updating Project with id ${id}`, error);
			toast.error(`Error updating project: ${error}`);
			throw error;
		}
	}

	async removeProject(id: number, deleteNow?: boolean) {
		try {
			const response = await http.delete<ApiMessage>(
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
