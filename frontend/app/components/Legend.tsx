import React from "react";
import { Leave, LeaveSession, LeaveType } from "../api/services/leave";
import { Holiday, HolidayType } from "../api/services/holiday";

export function getClassName(
	date: Date,
	holidays: Holiday[],
	savedLeaves: Leave[]
) {
	const isHoliday = holidays.some(
		(holiday) => new Date(holiday.date).toDateString() === date.toDateString()
	);
	const isLeave = savedLeaves.some(
		(leave) => new Date(leave.date).toDateString() === date.toDateString()
	);
	const isWeekend = date.getDay() === 0 || date.getDay() === 6;
	if (isHoliday) {
		const type = holidays.find(
			(holiday) => new Date(holiday.date).toDateString() === date.toDateString()
		)?.type;
		switch (Number(type)) {
			case HolidayType.Compulsory:
				return "text-white rounded-full bg-yellow-400 hover:bg-yellow-600";
			case HolidayType.Festival:
				return "text-white rounded-full bg-purple-400 hover:bg-purple-600";
			default:
				return "";
		}
	} else if (isLeave) {
		const leave = savedLeaves.find(
			(leave) => new Date(leave.date).toDateString() === date.toDateString()
		);
		let className = "text-white rounded-full shadow-md ";
		switch (Number(leave?.type)) {
			case LeaveType.Casual:
				className += "bg-pink-400 hover:bg-pink-600 ";
				break;
			case LeaveType.Planned:
				className += "bg-green-400 hover:bg-green-600 ";
				break;
			case LeaveType.Sick:
				className += "bg-orange-400 hover:bg-orange-600 ";
				break;
			case LeaveType.Unplanned:
				className += "bg-red-400 hover:bg-red-600 ";
				break;
			default:
				break;
		}
		switch (Number(leave?.session)) {
			case LeaveSession.FullDay:
				className += "border-2 border-gray-800 dark:border-gray-200";
				break;
			case LeaveSession.HalfDay:
				className +=
					"border-2 border-gray-800 dark:border-gray-200 border-dashed";
				break;
			default:
				break;
		}
		return className;
	}
	return isWeekend ? "font-medium text-red-600 dark:text-red-400" : "";
}

export default function Legend({ hasLeaves }: { hasLeaves?: boolean }) {
	return (
		<div>
			<div className="flex justify-around">
				<div>
					<h3 className="text-sm font-semibold m-1">Holidays</h3>
					<ol>
						<li className="flex items-center text-sm mb-1">
							<span className="inline-block w-4 h-4 mr-2 rounded-full bg-yellow-500"></span>
							<h3>Compulsory</h3>
						</li>
						<li className="flex items-center text-sm mb-1">
							<span className="inline-block w-4 h-4 mr-2 rounded-full bg-purple-500"></span>
							<h3>Festival</h3>
						</li>
					</ol>
				</div>
				{hasLeaves && (
					<div>
						<h3 className="text-sm font-semibold m-1">Leaves</h3>
						<ol>
							<li className="flex items-center text-sm mb-1">
								<span className="inline-block w-4 h-4 mr-2 rounded-full bg-pink-500"></span>
								<h3>Casual Leave</h3>
							</li>
							<li className="flex items-center text-sm mb-1">
								<span className="inline-block w-4 h-4 mr-2 rounded-full bg-green-500"></span>
								<h3>Planned Leave</h3>
							</li>
							<li className="flex items-center text-sm mb-1">
								<span className="inline-block w-4 h-4 mr-2 rounded-full bg-orange-500"></span>
								<h3>Sick Leave</h3>
							</li>
							<li className="flex items-center text-sm mb-1">
								<span className="inline-block w-4 h-4 mr-2 rounded-full bg-red-500"></span>
								<h3>Unplanned Leave</h3>
							</li>
							{/* <li className="flex items-center text-sm mb-1">
							<span className="inline-block w-4 h-4 mr-1 rounded-full border-2 border-black border-dashed"></span>
							<span className="mr-2 text-xs font-bold">F</span>
							<h3>First Half</h3>
						</li>
						<li className="flex items-center text-sm mb-1">
							<span className="inline-block w-4 h-4 mr-1 rounded-full border-2 border-black border-dashed"></span>
							<span className="mr-2 text-xs font-bold">S</span>
							<h3>Second Half</h3>
						</li> */}
							<li className="flex items-center text-sm mb-1">
								<span className="inline-block w-4 h-4 mr-1 rounded-full border-2 border-gray-800 dark:border-gray-200"></span>
								<h3>Full Day</h3>
							</li>
							<li className="flex items-center text-sm mb-1">
								<span className="inline-block w-4 h-4 mr-1 rounded-full border-2 border-gray-800 dark:border-gray-200 border-dashed"></span>
								<h3>Half Day</h3>
							</li>
						</ol>
					</div>
				)}
				<div>
					<h3 className="text-sm font-semibold m-1">Miscellaneous</h3>
					<ol>
						<li className="flex items-center text-sm mb-1">
							<span className="inline-block w-4 h-4 mr-2 bg-blue-400 dark:bg-blue-700"></span>
							<h3>Selected Day</h3>
						</li>
						<li className="flex items-center text-sm mb-1">
							<span className="inline-block w-4 h-4 mr-2 text-center">#</span>
							<h3>Weekday</h3>
						</li>
						<li className="flex items-center text-sm mb-1">
							<span className="inline-block w-4 h-4 mr-2 text-red-600 dark:text-red-400 text-center ">
								#
							</span>
							<h3>Weekend</h3>
						</li>
					</ol>
				</div>
			</div>
		</div>
	);
}
