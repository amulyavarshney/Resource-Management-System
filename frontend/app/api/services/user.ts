import { toast } from "react-hot-toast";
import { Department, Region, Role } from "@/nextauth.d";
import http from "./httpInstance";

export type {
	ApiUser,
	ApiUserCreate,
	ApiUserUpdate,
	ApiRole,
	ApiDepartment,
	ApiRegion,
} from "../generated";

/** Create payload used by admin/register forms. Values align with OpenAPI UserCreate. */
export type UserCreateViewModel = {
	emp_id?: number;
	user_name: string;
	first_name: string;
	last_name: string;
	email: string;
	department: Department;
	region: Region;
	role: Role;
	work_hours_per_day: number;
	parent_id: number;
};

export type UserUpdateViewModel = Partial<UserCreateViewModel>;

/** API user row — fields match OpenAPI UserResponse (role/dept/region are numeric enums). */
export type User = UserCreateViewModel & {
	id: number;
	is_external: boolean;
	is_password_protected?: boolean;
	last_saved_time: Date | string | null;
	week1_hours: number;
	week2_hours: number;
	week3_hours: number;
	week4_hours: number;
	week5_hours: number;
};

class UserService {
	getFullName(user: { first_name: string; last_name: string }) {
		return `${user.first_name} ${user.last_name}`;
	}

	async getUsers(department?: Department, region?: Region) {
		try {
			const response = await http.get<User[]>(
				`/user?${department ? `department=${department}&` : ""}${
					region ? `region=${region}&` : ""
				}`.replace(/[?&]$/, "")
			);
			return response.data;
		} catch (error) {
			console.error("Error while fetching Users", error);
			toast.error(`Error fetching users: ${error}`);
			throw error;
		}
	}

	async getManagers(department?: Department, region?: Region) {
		try {
			const response = await http.get<User[]>(
				`/user/managers?${department ? `department=${department}&` : ""}${
					region ? `region=${region}&` : ""
				}`.replace(/[?&]$/, "")
			);
			return response.data;
		} catch (error) {
			console.error("Error while fetching Managers", error);
			toast.error(`Error fetching managers: ${error}`);
			throw error;
		}
	}

	async getUsersByYearAndMonth(
		year: number,
		month: number,
		department?: Department,
		region?: Region
	) {
		try {
			const response = await http.get<User[]>(
				`/user/${year}/${month}?${
					department ? `department=${department}&` : ""
				}${region ? `region=${region}&` : ""}`.replace(/[?&]$/, "")
			);
			return response.data;
		} catch (error) {
			console.error("Error while fetching Users by Year and Month", error);
			throw error;
		}
	}

	async getUsersByParentId(
		year: number,
		month: number,
		parentId: number,
		department?: Department,
		region?: Region
	) {
		try {
			const response = await http.get<User[]>(
				`/user/${year}/${month}/parent/${parentId}?${
					department ? `department=${department}&` : ""
				}${region ? `region=${region}&` : ""}`.replace(/[?&]$/, "")
			);
			return response.data;
		} catch (error) {
			console.error(
				"Error while fetching Users under the same Parent by Year and Month",
				error
			);
			throw error;
		}
	}

	async getUser(id: number) {
		try {
			const response = await http.get<User>(`/user/${id}`);
			return response.data;
		} catch (error) {
			console.error(`Error while fetching User with id ${id}`, error);
			throw error;
		}
	}

	async getUserByEmpId(empId: number) {
		try {
			const allUsers = await this.getUsers();
			const user = allUsers.find((user) => user.emp_id === empId);
			if (user) return user;
			throw new Error(`User with empId ${empId} not found`);
		} catch (error) {
			console.error(`Error while fetching User with empId ${empId}`, error);
			throw error;
		}
	}

	async getUserByEmail(email: string, backendToken?: string) {
		try {
			const headers = backendToken
				? { Authorization: `Bearer ${backendToken}` }
				: undefined;
			const response = await http.get<User[]>("/user", { headers });
			const user = response.data.find((u) => u.email === email);
			if (user) return user;
			throw new Error(`User with email ${email} not found`);
		} catch (error) {
			console.error(`Error while fetching User with email ${email}`, error);
			throw error;
		}
	}

	async addUser(user: UserCreateViewModel) {
		try {
			const response = await http.post<User>("/user", user);
			toast.success("User added successfully.");
			return response.data;
		} catch (error) {
			console.error("Error while adding User", error);
			toast.error("An error occurred while adding new user.");
			throw error;
		}
	}

	async importUsers(excelData: FormData) {
		try {
			const response = await http.post<User>("/user/import", excelData);
			toast.success("Users imported successfully.");
			return response.data;
		} catch (error) {
			console.error("Error while importing Users", error);
			toast.error("An error occurred while importing users from Excel file.");
			throw error;
		}
	}

	async updateUser(id: number, user: UserUpdateViewModel) {
		try {
			const response = await http.patch<User>(`/user/${id}`, user);
			toast.success("User updated successfully.");
			return response.data;
		} catch (error) {
			console.error(`Error while updating User with id ${id}`, error);
			toast.error(`Error updating user: ${error}`);
			throw error;
		}
	}

	async updateLastSavedTime(id: number) {
		try {
			const last_saved_time = new Date().toISOString();
			const response = await http.patch<User>(
				`/user/${id}/lastSavedTime?last_saved_time=${encodeURIComponent(last_saved_time)}`
			);
			return response.data;
		} catch (error) {
			console.error(`Error while updating User with id ${id}`, error);
			throw error;
		}
	}

	async removeUser(id: number, deleteNow?: boolean) {
		try {
			const response = await http.delete<User>(
				`/user/${id}${deleteNow ? `?delete_now=${deleteNow}` : ""}`
			);
			return response.data;
		} catch (error) {
			console.error(`Error while removing User with id ${id}`, error);
			throw error;
		}
	}

	async changePassword(
		id: number,
		newPassword: string,
		confirmPassword: string,
		oldPassword: string,
	) {
		try {
			if (newPassword !== confirmPassword) {
				throw Error(`Error: Password Mismatch`);
			}
			const response = await http.patch<User>(`/user/${id}/changePassword`, {
				old_password: oldPassword,
				new_password: newPassword,
			});
			return response.data;
		} catch (error) {
			console.error("Error while changing password", error);
			throw error;
		}
	}

	async removePassword(id: number, password: string) {
		try {
			const response = await http.patch<User>(`/user/${id}/removePassword`, {
				password,
			});
			return response.data;
		} catch (error) {
			console.error("Error while removing password", error);
			throw error;
		}
	}
}

const userService = new UserService();
export default userService;
