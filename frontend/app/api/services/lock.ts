import { Department, Region } from "@/nextauth";
import http from "./httpInstance";

class LockService {
	async getLock(department?: Department, region?: Region) {
		try {
			const response = await http.get(
				`/lock${department ? `?department=${department}` : ""}${
					region ? `?region=${region}` : ""
				}`
			);
			return response.data;
		} catch (error) {
			console.error("Error while fetching Lock", error);
			throw error;
		}
	}

	async setLock(isLocked: boolean, department?: Department, region?: Region) {
		try {
			const response = await http.post(
				`/lock?isLocked=${isLocked}${
					department ? `?department=${department}` : ""
				}${region ? `?region=${region}` : ""}`
			);
			return response.data;
		} catch (error) {
			console.error("Error while setting the Lock", error);
			throw error;
		}
	}
}

const lockService = new LockService();
export default lockService;
