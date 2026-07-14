import { toast } from "react-hot-toast";
import http from "./httpInstance";
import { toApiDate } from "./utils";
import type { ApiLeave, ApiLeaveCreate, ApiMessage } from "../generated";

/** Numeric values match backend `LeaveType` IntEnum. */
export enum LeaveType {
	Casual = 0,
	Planned = 1,
	Sick = 2,
	Unplanned = 3,
}

/** Labels sent on create (backend parse_by_name_or_description). */
export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
	[LeaveType.Casual]: "Casual Leave",
	[LeaveType.Planned]: "Planned Leave",
	[LeaveType.Sick]: "Sick Leave",
	[LeaveType.Unplanned]: "Unplanned Leave",
};

export const LEAVE_TYPE_NAMES = Object.keys(LeaveType).filter((key) =>
	Number.isNaN(Number(key))
) as Array<keyof typeof LeaveType>;

/** Numeric values match backend `LeaveSession` IntEnum. */
export enum LeaveSession {
	FullDay = 0,
	HalfDay = 1,
}

export const LEAVE_SESSION_LABELS: Record<LeaveSession, string> = {
	[LeaveSession.FullDay]: "Full Day",
	[LeaveSession.HalfDay]: "Half Day",
};

export const LEAVE_SESSION_NAMES = Object.keys(LeaveSession).filter((key) =>
	Number.isNaN(Number(key))
) as Array<keyof typeof LeaveSession>;

/** UI/API leave row — date may be hydrated to Date in the client. */
export type Leave = Omit<ApiLeave, "date"> & { date: string | Date };

class LeaveService {
	async getLeaves(userId: number, date?: Date): Promise<Leave[]> {
		const query = date ? `?date=${toApiDate(date)}` : "";
		const response = await http.get<ApiLeave[]>(`/leave/${userId}${query}`);
		return response.data;
	}

	async getLeavesInMonth(
		year: number,
		month: number,
		userId: number
	): Promise<Leave[]> {
		const response = await http.get<ApiLeave[]>(
			`/leave/${year}/${month}/${userId}`
		);
		return response.data;
	}

	getLeavesCountInAWeek(leaves: Leave[], weekStart: Date, weekEnd: Date) {
		let count = 0;
		const end = new Date(weekEnd);
		end.setHours(23, 59, 59, 999);
		for (const leave of leaves) {
			const date = new Date(leave.date);
			if (weekStart <= date && date <= end) {
				if (Number(leave.session) === LeaveSession.FullDay) count += 1;
				else count += 0.5;
			}
		}
		return count;
	}

	async addLeave(leave: Leave): Promise<Leave> {
		try {
			const body: ApiLeaveCreate = {
				date:
					typeof leave.date === "string"
						? leave.date.slice(0, 10)
						: toApiDate(leave.date),
				type:
					LEAVE_TYPE_LABELS[leave.type as LeaveType] ??
					LEAVE_TYPE_LABELS[LeaveType.Casual],
				session:
					LEAVE_SESSION_LABELS[leave.session as LeaveSession] ??
					LEAVE_SESSION_LABELS[LeaveSession.FullDay],
				user_id: Number(leave.user_id),
			};
			const response = await http.post<ApiLeave>("/leave", body);
			toast.success("Leave added successfully.");
			return response.data;
		} catch (error) {
			console.error("Error while adding Leave", error);
			toast.error("An error occurred while adding new leave.");
			throw error;
		}
	}

	async removeLeave(date: Date | string, userId: number): Promise<ApiMessage> {
		try {
			const formattedDate =
				typeof date === "string" ? date.slice(0, 10) : toApiDate(date);
			const response = await http.delete<ApiMessage>(
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
