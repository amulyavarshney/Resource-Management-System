import { toast } from "react-hot-toast";
import http from "./httpInstance";

export enum LeaveType {
	Casual = "Casual Leave",
	Planned = "Planned Leave",
	Sick = "Sick Leave",
	Unplanned = "Unplanned Leave",
}

export enum LeaveSession {
	FullDay = "Full Day",
	HalfDay = "Half Day",
}

export type Leave = {
	date: Date;
	type: LeaveType;
	session: LeaveSession;
	user_id: Number;
};

class LeaveService {
	async getLeaves(userId: number, date?: Date) {
		try {
			const response = await http.get<Leave[]>(
				`/leave/${userId}${date ? `?date=${date}` : ""}`
			);
			return response.data;
		} catch (error) {
			console.error("Error while fetching Leaves", error);
			throw error;
		}
	}

	async getLeavesInMonth(year: number, month: number, userId: number) {
		try {
			const response = await http.get<Leave[]>(
				`/leave/${year}/${month}/${userId}`
			);
			return response.data;
		} catch (error) {
			console.error("Error while fetching Leaves", error);
			throw error;
		}
	}

	getLeavesCountInAWeek(leaves: Leave[], weekStart: Date, weekEnd: Date) {
		let count = 0;
		for (const leave of leaves) {
			const date = new Date(leave.date);
			// Adjust weekEnd to the end of the day
			weekEnd.setHours(23, 59, 59, 999);
			if (weekStart <= date && date <= weekEnd) {
				if (
					LeaveSession[
						leave.session as unknown as keyof typeof LeaveSession
					] === LeaveSession.FullDay
				)
					count += 1;
				else count += 0.5;
			}
		}
		return count;
	}

	async addLeave(leave: Leave) {
		try {
			const response = await http.post<Leave>("/leave", leave);
			toast.success("Leave added successfully.");
			return response.data;
		} catch (error) {
			console.error("Error while adding Leave", error);
			toast.error("An error occurred while adding new leave.");
			throw error;
		}
	}

	async removeLeave(date: Date, userId: Number) {
		try {
			const formattedDate = date.toDateString();
			const response = await http.delete<Leave>(
				`/leave/${userId}?date=${formattedDate}`
			);
			toast.success("Leave removed successfully.");
			return response.data;
		} catch (error) {
			console.error("Error while removing Leave", error);
			toast.error("An error occurred while removing a leave.");
			throw error;
		}
	}
}

const leaveService = new LeaveService();
export default leaveService;
