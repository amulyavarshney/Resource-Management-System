import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import holidayService, { Holiday } from "@/app/api/services/holiday";
import Legend, { getClassName } from "@/app/components/Legend";

type HolidayCalendarProps = {
	date: Date;
	setDate: Dispatch<SetStateAction<Date>>;
};

export default function HolidayCalendar({
	date,
	setDate,
}: HolidayCalendarProps) {
	const [year, setYear] = useState<number>(new Date().getFullYear());
	const [month, setMonth] = useState<number>(new Date().getMonth());
	const [holidays, setHolidays] = useState<Holiday[]>([]);

	const setToday = () => {
		setYear(new Date().getFullYear());
		setMonth(new Date().getMonth());
		setDate(new Date());
	};

	const handlePrevious = () => {
		if (month == 0) {
			setYear(year - 1);
			setMonth(11);
		} else {
			setMonth(month - 1);
		}
	};

	const handleNext = () => {
		if (month == 11) {
			setYear(year + 1);
			setMonth(0);
		} else {
			setMonth(month + 1);
		}
	};

	const fetchHolidays = async () => {
		const data = await holidayService.getHolidaysInMonth(year, month + 1);
		setHolidays(data);
	};

	useEffect(() => {
		fetchHolidays();
	}, [date]);

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
				<div className="flex w-full items-center rounded-full h-14">
					<div className="flex-1 border-b border-gray-300 dark:border-gray-600"></div>
					<button className="flex items-center justify-center text-gray-700 dark:text-gray-300 rounded-full border border-gray-300 dark:border-gray-600">
						<div className="group px-4 py-2 flex items-center justify-center">
							<button
								title="Go to Previous Year"
								className="text-lg font-semibold leading-7"
								onClick={() => setYear(year - 1)}
							>
								{"<<"}
							</button>
						</div>
						<div className="border-x-2 border-gray-300 dark:border-gray-600 outline-none text-lg py-2 px-4">
							<button
								title="Go to Previous Month"
								className="text-lg font-semibold leading-7"
								onClick={handlePrevious}
							>
								{"<"}
							</button>
						</div>
						<div className="outline-none text-lg py-2 px-3">
							<button
								title="Go to Today"
								className="text-sm leading-7"
								onClick={setToday}
							>
								Go to Today
							</button>
						</div>
						<div className="border-x-2 border-gray-300 dark:border-gray-600 outline-none text-lg py-2 px-4">
							<button
								title="Go to Next Month"
								className="text-lg font-semibold leading-7"
								onClick={handleNext}
							>
								{">"}
							</button>
						</div>
						<div className="group px-4 py-2 flex items-center justify-center">
							<button
								title="Go to Next Year"
								className="text-lg font-semibold leading-7"
								onClick={() => setYear(year + 1)}
							>
								{">>"}
							</button>
						</div>
					</button>
					<div className="flex-1 border-b border-gray-300 dark:border-gray-600"></div>
				</div>
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
						<button key={"k" + index}></button>
					)).concat(
						days.map((day) => {
							return (
								<button
									key={day}
									onClick={() => setDate(new Date(year, month, day))}
									className={`relative flex justify-center items-center h-12 w-12 sm:h-14 sm:w-16 cursor-pointer ${
										date.getDate() === day
											? "bg-blue-400 dark:bg-blue-700"
											: "hover:bg-gray-300 active:bg-blue-300 dark:hover:bg-gray-600 dark:active:bg-blue-700"
									}`}
								>
									<div
										className={`flex justify-center items-center h-8 w-8
										${getClassName(new Date(year, month, day), holidays, [])}`}
									>
										{day}
									</div>
								</button>
							);
						})
					)}
				</div>
			</div>
			<Legend />
		</div>
	);
}
