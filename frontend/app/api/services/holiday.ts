import { toast } from "react-hot-toast";
import http from "./httpInstance";
import { Region } from "@/nextauth";
import { toApiDate } from "./utils";

export enum HolidayType {
	Compulsory = "Compulsory",
	Festival = "Festival",
}

export type HolidayBase = {
	date: Date;
	name: string;
	type: HolidayType;
};

export type Holiday = HolidayBase & {
	region: Region;
};

export type PersonalHoliday = HolidayBase & {
	user_id: number;
	show: boolean;
};

class HolidayService {
	async getAllHolidays(region?: Region) {
		try {
			const response = await http.get<Holiday[]>(
				`/holiday/all?${region ? `region=${region}&` : ""}`.replace(/[?&]$/, "")
			);
			return response.data;
		} catch (error) {
			console.error("Error while fetching Holidays", error);
			throw error;
		}
	}

	async getAllPersonalHolidays(userId?: number, region?: Region) {
		try {
			const response = await http.get<Holiday[]>(
				`/holiday/personal?${userId ? `user_id=${userId}&` : ""}${
					region ? `region=${region}&` : ""
				}`.replace(/[?&]$/, "")
			);
			return response.data;
		} catch (error) {
			console.error("Error while fetching Personal Holidays", error);
			throw error;
		}
	}

	async getHolidays(year: number, userId?: number, region?: Region) {
		try {
			let holidays: Array<Holiday[]> = Array.from({ length: 12 }, () => []);
			const response = await http.get<Holiday[]>(
				`/holiday/${year}?${userId ? `user_id=${userId}&` : ""}${
					region ? `region=${region}&` : ""
				}`.replace(/[?&]$/, "")
			);
			response.data.map((holiday) => {
				holiday.date = new Date(holiday.date);
				const month = holiday.date.getMonth();
				holidays[month].push(holiday);
			});
			return holidays;
		} catch (error) {
			console.error("Error while fetching Holidays", error);
			throw error;
		}
	}

	async getUpcomingHolidays(
		year: number,
		userId?: number,
		region?: Region,
		limit?: number
	) {
		try {
			const currentDate = new Date();
			currentDate.setHours(0, 0, 0, 0);
			const response = await http.get<Holiday[]>(
				`/holiday/${year}?${userId ? `user_id=${userId}&` : ""}${
					region ? `region=${region}&` : ""
				}`.replace(/[?&]$/, "")
			);
			response.data.map((holiday) => (holiday.date = new Date(holiday.date)));
			const holidays = response.data.filter(
				(holiday) => holiday.date >= currentDate
			);
			return holidays.slice(0, limit);
		} catch (error) {
			console.error("Error while fetching upcoming Holidays", error);
			throw error;
		}
	}

	async getHolidaysInMonth(
		year: number,
		month: number,
		userId?: number,
		region?: Region
	) {
		try {
			const response = await http.get<Holiday[]>(
				`/holiday/${year}/${month}?${userId ? `user_id=${userId}&` : ""}${
					region ? `region=${region}&` : ""
				}`.replace(/[?&]$/, "")
			);
			response.data.map((holiday) => (holiday.date = new Date(holiday.date)));
			return response.data;
		} catch (error) {
			console.error("Error while fetching Holidays", error);
			throw error;
		}
	}

	getHolidaysCountInAWeek(holidays: Holiday[], weekStart: Date, weekEnd: Date) {
		let count = 0;
		for (const holiday of holidays) {
			const date = new Date(holiday.date);
			// Adjust weekEnd to the end of the day
			weekEnd.setHours(23, 59, 59, 999);
			if (weekStart <= date && date <= weekEnd) {
				count++;
			}
		}
		return count;
	}

	async getHoliday(date: Date, userId?: number, region?: Region) {
		try {
			const formattedDate = toApiDate(date);
			const response = await http.get<Holiday>(
				`/holiday?date=${formattedDate}&${userId ? `user_id=${userId}&` : ""}${
					region ? `region=${region}&` : ""
				}`.replace(/[?&]$/, "")
			);
			return response.data;
		} catch (error) {
			console.error(`Error while fetching Holiday for date ${date}`, error);
			throw error;
		}
	}

	async addHoliday(holiday: HolidayBase, userId?: number, region?: Region) {
		try {
			const response = await http.post<Holiday>("/holiday", {
				...holiday,
				...(userId !== undefined ? { user_id: userId } : {}),
				...(region !== undefined ? { region } : {}),
			});
			toast.success("Holiday added successfully.");
			return response.data;
		} catch (error) {
			console.error(
				`Error while adding holiday for date ${holiday.date}`,
				error
			);
			throw error;
		}
	}

	async addHolidays(holidays: Holiday[], userId?: number) {
		try {
			const response = await http.post<Holiday[]>(
				`/holiday?${userId ? `user_id=${userId}&` : ""}`.replace(/[?&]$/, ""),
				holidays
			);
			return response.data;
		} catch (error) {
			console.error(`Error while adding holidays`, error);
			throw error;
		}
	}

	async updateHoliday(date: Date, holiday: Holiday, region?: Region) {
		try {
			const formattedDate = toApiDate(date);
			const response = await http.patch<Holiday[]>(
				`/holiday?date=${formattedDate}&${
					region ? `region=${region}&` : ""
				}`.replace(/[?&]$/, ""),
				holiday
			);
			return response.data;
		} catch (error) {
			console.error(`Error while updating holiday`, error);
			throw error;
		}
	}

	async updateHolidayWithUserId(date: Date, userId: number, holiday: Holiday) {
		try {
			const formattedDate = toApiDate(date);
			const response = await http.patch<Holiday[]>(
				`/holiday/${userId}?date=${formattedDate}&`.replace(/[?&]$/, ""),
				holiday
			);
			return response.data;
		} catch (error) {
			console.error(
				`Error while updating holiday with userId: ${userId}`,
				error
			);
			throw error;
		}
	}

	async importHolidays(excelData: FormData) {
		try {
			const response = await http.post<Holiday>(
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
			const response = await http.post<PersonalHoliday>(
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
			const response = await http.delete<Holiday>(
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
