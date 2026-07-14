import http from "./httpInstance";
import type { ApiWeekData, ApiWeekDataUpdate } from "../generated";

/** Hours payload — matches OpenAPI WeekDataUpdate / WeekDataResponse weeks. */
export type WeekData = ApiWeekDataUpdate;

export type WeekDataKey = {
	user_id: number;
	project_id: number;
	year: number;
	month: number;
};

export type TimesheetRow = {
	project_id: number;
	project_number: string;
	project_title: string;
	week1Hours: number;
	week2Hours: number;
	week3Hours: number;
	week4Hours: number;
	week5Hours?: number;
	totalHours: number;
};

function isAxiosNotFound(error: unknown): boolean {
	return (
		typeof error === "object" &&
		error !== null &&
		"response" in error &&
		(error as { response?: { status?: number } }).response?.status === 404
	);
}

class WeekDataService {
	async getWorkHours(): Promise<ApiWeekData[]> {
		const response = await http.get<ApiWeekData[]>("/weekData");
		return response.data;
	}

	async getWorkHoursByYearAndMonth(
		year: number,
		month: number
	): Promise<ApiWeekData[]> {
		const response = await http.get<ApiWeekData[]>(
			`/weekData/${year}/${month}`
		);
		return response.data;
	}

	async getWorkHour(key: WeekDataKey): Promise<ApiWeekData> {
		const response = await http.get<ApiWeekData>(this.constructEndPoint(key));
		return response.data;
	}

	async getWorkHourArray(key: WeekDataKey): Promise<number[]> {
		try {
			const response = await http.get<ApiWeekData>(this.constructEndPoint(key));
			const data = response.data;
			data.week5 ??= 0;
			return this.objectToArray(data);
		} catch (error) {
			// Missing row is normal for a new project/month — treat as zeros.
			if (isAxiosNotFound(error)) {
				return [0, 0, 0, 0, 0];
			}
			console.error(
				`Error while fetching work hour for key ${JSON.stringify(key)}`,
				error
			);
			throw error;
		}
	}

	async addWorkHour(
		key: WeekDataKey,
		workHour: WeekData
	): Promise<ApiWeekData> {
		const response = await http.put<ApiWeekData>(
			this.constructEndPoint(key),
			workHour
		);
		return response.data;
	}

	async removeWorkHour(key: WeekDataKey): Promise<ApiWeekData> {
		const response = await http.delete<ApiWeekData>(
			this.constructEndPoint(key)
		);
		return response.data;
	}

	private constructEndPoint(key: WeekDataKey) {
		return `/weekData/${key.user_id}/${key.project_id}/${key.year}/${key.month}`;
	}

	private objectToArray(obj: ApiWeekData): number[] {
		return [
			obj.week1 ?? 0,
			obj.week2 ?? 0,
			obj.week3 ?? 0,
			obj.week4 ?? 0,
			obj.week5 ?? 0,
		];
	}
}

const weekDataService = new WeekDataService();
export default weekDataService;
