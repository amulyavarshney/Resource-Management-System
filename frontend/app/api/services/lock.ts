import { Department, Region } from "@/nextauth";
import http from "./httpInstance";

class LockService {
	async getLock(department?: Department, region?: Region) {
		try {
			const params = new URLSearchParams();
			if (department != null) params.append("department", String(department));
			if (region != null) params.append("region", String(region));
			const query = params.toString() ? `?${params}` : "";
			const response = await http.get(`/lock${query}`);
			return response.data as boolean;
		} catch (error) {
			console.error("Error while fetching Lock", error);
			throw error;
		}
	}

	async setLock(isLocked: boolean, department?: Department, region?: Region) {
		try {
			const params = new URLSearchParams({ is_locked: String(isLocked) });
			if (department != null) params.append("department", String(department));
			if (region != null) params.append("region", String(region));
			const response = await http.post(`/lock?${params}`);
			return response.data;
		} catch (error) {
			console.error("Error while setting the Lock", error);
			throw error;
		}
	}
}

const lockService = new LockService();
export default lockService;
