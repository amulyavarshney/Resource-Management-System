import http from "./httpInstance";

export type WeekData = {
	week1: number;
	week2: number;
	week3: number;
	week4: number;
	week5?: number;
};

export type WeekDataKey = {
	userId: number;
	projectId: number;
	year: number;
	month: number;
};

export type TimesheetRow = {
    projectId: number;
    projectNumber: string;
    projectTitle: string;
    week1Hours: number;
    week2Hours: number;
    week3Hours: number;
    week4Hours: number;
    week5Hours?: number;
    totalHours: number;
}

class WeekDataService {
	async getWorkHours() {
		try {
			const response = await http.get<WeekData[]>("/weekData");
			return response.data;
		} catch (error) {
			console.error("Error while fetching all work hours", error);
			throw error;
		}
	}

	async getWorkHoursByYearAndMonth(year: number, month: number) {
		try {
			const response = await http.get<WeekData[]>(`/weekData/${year}/${month}`);
			return response.data;
		} catch (error) {
			console.error(
				`Error while fetching week data for ${month}, ${year}`,
				error
			);
			return {
				week1: 0,
				week2: 0,
				week3: 0,
				week4: 0,
				week5: 0,
			};
		}
	}

	async getWorkHour(key: WeekDataKey) {
		const endPointPath = this.constructEndPoint(key);
		const response = await http.get<WeekData>(endPointPath);
		return response.data;
	}

	async getWorkHourArray(key: WeekDataKey) {
		try {
			const endPointPath = this.constructEndPoint(key);
			const response = await http.get<WeekData>(endPointPath);
			response.data.week5 ??= 0;
			return this.objectToArray(response.data);
		} catch (error) {
			console.error(
				`Error while fetching work hour for key ${JSON.stringify(key)}`,
				error
			);
			throw error;
		}
	}

	async addWorkHour(key: WeekDataKey, workHour: WeekData) {
		try {
			const endPointPath = this.constructEndPoint(key);
			const response = await http.put<WeekData>(endPointPath, workHour);
			return response.data;
		} catch (error) {
			console.error(
				`Error while adding work hour for key ${JSON.stringify(key)}`,
				error
			);
			throw error;
		}
	}

	async removeWorkHour(key: WeekDataKey) {
		try {
			const endPointPath = this.constructEndPoint(key);
			const response = await http.delete<WeekData>(endPointPath);
			return response.data;
		} catch (error) {
			console.error(
				`Error while removing work hour for key ${JSON.stringify(key)}`,
				error
			);
			throw error;
		}
	}

	private constructEndPoint(key: WeekDataKey) {
		return `/weekData/${key.userId}/${key.projectId}/${key.year}/${key.month}`;
	}

	private objectToArray(obj: WeekData): number[] {
		return Object.values(obj);
	}
}

const weekDataService = new WeekDataService();
export default weekDataService;
