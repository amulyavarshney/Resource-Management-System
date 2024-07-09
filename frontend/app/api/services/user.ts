import { toast } from "react-hot-toast";
import { Department, Region, Role } from "@/nextauth.d";
import http from "./httpInstance";

export type UserCreateViewModel = {
	empId?: number;
	userName: string;
	firstName: string;
	lastName: string;
	email: string;
	department: Department;
	region: Region;
	role: Role;
	workHoursPerDay: number;
	parentId: number;
};

export type UserUpdateViewModel = Partial<UserCreateViewModel>;

export type User = UserCreateViewModel & {
	[key: string]: number | string | boolean | Date;
	id: number;
	isExternal: boolean;
	lastSavedTime: Date;
	week1Hours: number;
	week2Hours: number;
	week3Hours: number;
	week4Hours: number;
	week5Hours: number;
};

class UserService {
	getFullName(user: User) {
		return `${user.firstName} ${user.lastName}`;
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
			const user = allUsers.find((user) => user.empId === empId);
			if (user) return user;
			throw new Error(`User with empId ${empId} not found`);
		} catch (error) {
			console.error(`Error while fetching User with empId ${empId}`, error);
			throw error;
		}
	}

	async getUserByEmail(email: string) {
		try {
			const allUsers = await this.getUsers();
			const user = allUsers.find((user) => user.email === email);
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
			const user = {
				lastSavedTime: new Date(),
			};
			const response = await http.patch<User>(`/user/${id}`, user);
			return response.data;
		} catch (error) {
			console.error(`Error while updating User with id ${id}`, error);
			throw error;
		}
	}

	async removeUser(id: number, deleteNow?: boolean) {
		try {
			const response = await http.delete<User>(
				`/user/${id}${deleteNow ? `?deleteNow=${deleteNow}` : ""}`
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
		oldPassword?: string,
	) {
		try {
			if (newPassword !== confirmPassword) {
				throw Error(`Error: Password Mismatch`);
			}
			const password = oldPassword
				? { oldPassword: oldPassword, newPassword: newPassword }
				: { newPassword: newPassword };
			const response = await http.patch<User>(
				`/user/${id}/changePassword`,
				password
			);
			return response.data;
		} catch (error) {
			console.error("Error while changing password", error);
			throw error;
		}
	}

	async removePassword(id: number, password: string) {
		try {
			const response = await http.patch<User>(
				`/user/${id}/removePassword?password=${password}`
			);
			return response.data;
		} catch (error) {
			console.error("Error while removing password", error);
			throw error;
		}
	}
}

const userService = new UserService();
export default userService;
