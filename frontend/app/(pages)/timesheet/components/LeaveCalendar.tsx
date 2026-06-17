import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import holidayService, { Holiday } from "@/app/api/services/holiday";
import leaveService, { Leave } from "@/app/api/services/leave";
import Legend, { getClassName } from "@/app/components/Legend";

interface LeaveCalendarProps {
	year: number;
	month: number;
	userId: number;
	selectedDay: number;
	setSelectedDay: Dispatch<SetStateAction<number>>;
}

export default function LeaveCalendar({
	year,
	month,
	userId,
	selectedDay,
	setSelectedDay,
}: LeaveCalendarProps) {
	const [holidays, setHolidays] = useState<Holiday[]>([]);
	const [savedLeaves, setSavedLeaves] = useState<Leave[]>([]);

	const fetchHolidays = async () => {
		const data = await holidayService.getHolidaysInMonth(year, month + 1);
		setHolidays(data);
	};

	useEffect(() => {
		fetchHolidays();
	}, []);

	const fetchLeaves = async () => {
		const data = await leaveService.getLeavesInMonth(year, month + 1, userId);
		setSavedLeaves(data);
	};

	useEffect(() => {
		fetchLeaves();
	}, [selectedDay]);

	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const startDay = new Date(year, month, 1).getDay();

	const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
	const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	return (
		<div className="flex-col">
			<div className="inline-flex flex-col bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-500 shadow rounded-md">
				<h2 className="my-2 text-center text-lg font-medium">
					{new Date(year, month).toLocaleString("default", { month: "long" })}{" "}
					{year}
				</h2>
				<div className="grid grid-cols-7">
					{weekdays.map((day, index) => (
						<div
							key={index}
							className="text-center text-gray-800 dark:text-gray-200 pb-1 border-b border-gray-300 dark:border-gray-500"
						>
							{day}
						</div>
					))}
					{Array.from({ length: startDay }, (_, index) => (
						<div key={index}></div>
					))
						.concat(
							days.map((day) => {
								const leave = savedLeaves.find(
									(leave) => new Date(leave.date).toDateString() === new Date(year, month, day).toDateString()
								);
								return (
									<button
										key={day}
										onClick={() => setSelectedDay(day)}
										className={`relative flex justify-center items-center h-12 w-12 sm:h-14 sm:w-16 cursor-pointer ${
											selectedDay === day
												? "bg-blue-400 dark:bg-blue-700"
												: "hover:bg-gray-300 active:bg-blue-300 dark:hover:bg-gray-600 dark:active:bg-blue-700"
										}`}
									>
										<div
											className={`flex justify-center items-center h-8 w-8
										${getClassName(new Date(year, month, day), holidays, savedLeaves)}`}
										>
											{day}
										</div>
									</button>
								);
							})
						)
						.map((day, index) => {
							if (index < startDay) return <div key={index}></div>;
							return day;
						})}
				</div>
			</div>
			<Legend hasLeaves={true} />
		</div>
	);
}
