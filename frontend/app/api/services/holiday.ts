import { toast } from "react-hot-toast";
import http from "./httpInstance";
import { Region } from "@/nextauth";
import { toApiDate } from "./utils";
import type {
	ApiHoliday,
	ApiHolidayCreate,
	ApiHolidayUpdate,
	ApiMessage,
} from "../generated";

/** Numeric values match backend `HolidayType` IntEnum. */
export enum HolidayType {
	Compulsory = 0,
	Festival = 1,
}

export const HOLIDAY_TYPE_NAMES = Object.keys(HolidayType).filter((key) =>
	Number.isNaN(Number(key))
) as Array<keyof typeof HolidayType>;

export type HolidayBase = {
	date: Date;
	name: string;
	type: HolidayType | number;
};

export type Holiday = Omit<ApiHoliday, "date" | "type" | "region"> & {
	date: Date;
	type: number;
	region?: Region | number | null;
};

export type PersonalHoliday = Holiday & {
	user_id: number;
	show: boolean;
};

function hydrateHoliday(row: ApiHoliday): Holiday {
	return { ...row, date: new Date(row.date) };
}

function toHolidayCreate(
	holiday: HolidayBase,
	userId?: number,
	region?: Region
): ApiHolidayCreate {
	const date =
		holiday.date instanceof Date
			? toApiDate(holiday.date)
			: String(holiday.date).slice(0, 10);
	return {
		date,
		name: holiday.name,
		type: Number(holiday.type) as ApiHolidayCreate["type"],
		...(userId !== undefined ? { user_id: userId } : {}),
		...(region !== undefined ? { region: region as ApiHolidayCreate["region"] } : {}),
	};
}

class HolidayService {
	async getAllHolidays(region?: Region) {
		const response = await http.get<ApiHoliday[]>(
			`/holiday/all?${region ? `region=${region}&` : ""}`.replace(/[?&]$/, "")
		);
		return response.data.map(hydrateHoliday);
	}

	async getAllPersonalHolidays(userId?: number, region?: Region) {
		const response = await http.get<ApiHoliday[]>(
			`/holiday/personal?${userId ? `user_id=${userId}&` : ""}${
				region ? `region=${region}&` : ""
			}`.replace(/[?&]$/, "")
		);
		return response.data.map(hydrateHoliday);
	}

	async getHolidays(year: number, userId?: number, region?: Region) {
		const holidays: Array<Holiday[]> = Array.from({ length: 12 }, () => []);
		const response = await http.get<ApiHoliday[]>(
			`/holiday/${year}?${userId ? `user_id=${userId}&` : ""}${
				region ? `region=${region}&` : ""
			}`.replace(/[?&]$/, "")
		);
		for (const row of response.data) {
			const holiday = hydrateHoliday(row);
			holidays[holiday.date.getMonth()].push(holiday);
		}
		return holidays;
	}

	async getUpcomingHolidays(
		year: number,
		userId?: number,
		region?: Region,
		limit?: number
	) {
		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);
		const response = await http.get<ApiHoliday[]>(
			`/holiday/${year}?${userId ? `user_id=${userId}&` : ""}${
				region ? `region=${region}&` : ""
			}`.replace(/[?&]$/, "")
		);
		const holidays = response.data
			.map(hydrateHoliday)
			.filter((holiday) => holiday.date >= currentDate);
		return holidays.slice(0, limit);
	}

	async getHolidaysInMonth(
		year: number,
		month: number,
		userId?: number,
		region?: Region
	) {
		const response = await http.get<ApiHoliday[]>(
			`/holiday/${year}/${month}?${userId ? `user_id=${userId}&` : ""}${
				region ? `region=${region}&` : ""
			}`.replace(/[?&]$/, "")
		);
		return response.data.map(hydrateHoliday);
	}

	getHolidaysCountInAWeek(holidays: Holiday[], weekStart: Date, weekEnd: Date) {
		let count = 0;
		const end = new Date(weekEnd);
		end.setHours(23, 59, 59, 999);
		for (const holiday of holidays) {
			const date = new Date(holiday.date);
			if (weekStart <= date && date <= end) count++;
		}
		return count;
	}

	async getHoliday(date: Date, userId?: number, region?: Region) {
		const formattedDate = toApiDate(date);
		const response = await http.get<ApiHoliday>(
			`/holiday?date=${formattedDate}&${userId ? `user_id=${userId}&` : ""}${
				region ? `region=${region}&` : ""
			}`.replace(/[?&]$/, "")
		);
		return hydrateHoliday(response.data);
	}

	async addHoliday(holiday: HolidayBase, userId?: number, region?: Region) {
		try {
			const response = await http.post<ApiHoliday>(
				"/holiday",
				toHolidayCreate(holiday, userId, region)
			);
			toast.success("Holiday added successfully.");
			return hydrateHoliday(response.data);
		} catch (error) {
			console.error(
				`Error while adding holiday for date ${holiday.date}`,
				error
			);
			throw error;
		}
	}

	async addHolidays(holidays: Holiday[], userId?: number) {
		const payload = holidays.map((h) =>
			toHolidayCreate(h, userId ?? h.user_id ?? undefined, h.region as Region | undefined)
		);
		const response = await http.post<ApiHoliday[]>(
			`/holiday?${userId ? `user_id=${userId}&` : ""}`.replace(/[?&]$/, ""),
			payload
		);
		return response.data.map(hydrateHoliday);
	}

	async updateHoliday(date: Date, holiday: Holiday, region?: Region) {
		const formattedDate = toApiDate(date);
		const body: ApiHolidayUpdate = {
			name: holiday.name,
			type: Number(holiday.type) as ApiHolidayUpdate["type"],
			region: (region ?? holiday.region) as ApiHolidayUpdate["region"],
			user_id: holiday.user_id,
			show: holiday.show,
		};
		const response = await http.patch<ApiHoliday>(
			`/holiday?date=${formattedDate}&${
				region ? `region=${region}&` : ""
			}`.replace(/[?&]$/, ""),
			body
		);
		return response.data as unknown as Holiday;
	}

	async updateHolidayWithUserId(date: Date, userId: number, holiday: Holiday) {
		const formattedDate = toApiDate(date);
		const body: ApiHolidayUpdate = {
			name: holiday.name,
			type: Number(holiday.type) as ApiHolidayUpdate["type"],
			user_id: userId,
			show: holiday.show,
		};
		const response = await http.patch<ApiHoliday>(
			`/holiday/${userId}?date=${formattedDate}`,
			body
		);
		return response.data as unknown as Holiday;
	}

	async importHolidays(excelData: FormData) {
		try {
			const response = await http.post<ApiMessage>(
				"/holiday/importHolidays",
				excelData
			);
			toast.success("Holidays imported successfully.");
			return response.data;
		} catch (error) {
			console.error("Error while importing Holidays", error);
			toast.error(
				"An error occurred while importing holidays from Excel file."
			);
			throw error;
		}
	}

	async importPersonalHolidays(excelData: FormData) {
		try {
			const response = await http.post<ApiMessage>(
				"/holiday/importPersonalHolidays",
				excelData
			);
			toast.success("Personal Holidays imported successfully.");
			return response.data;
		} catch (error) {
			console.error("Error while importing Personal Holidays", error);
			toast.error(
				"An error occurred while importing personal holidays from Excel file."
			);
			throw error;
		}
	}

	async removeHoliday(date: Date, userId?: number, region?: Region) {
		try {
			const formattedDate = toApiDate(date);
			const response = await http.delete<ApiMessage>(
				`/holiday/?date=${encodeURIComponent(formattedDate)}&${
					userId ? `user_id=${encodeURIComponent(userId)}&` : ""
				}${region ? `region=${encodeURIComponent(region)}&` : ""}`.replace(
					/[?&]$/,
					""
				)
			);
			toast.success("Holiday removed successfully.");
			return response.data;
		} catch (error) {
			console.error("Error while removing Holiday", error);
			toast.error("An error occurred while removing a holiday.");
			throw error;
		}
	}
}

const holidayService = new HolidayService();
export default holidayService;
