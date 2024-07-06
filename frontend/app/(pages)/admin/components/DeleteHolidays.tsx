import { useState } from "react";
import holidayService from "@/app/api/services/holiday";
import HolidayCalendar from "./HolidayCalendar";

export default function DeleteHolidays() {
	const [date, setDate] = useState<Date>(new Date());

	const handleDelete = async (e: React.FormEvent) => {
		e.preventDefault();
		await holidayService.removeHoliday(date);
		setDate(new Date());
	};

	return (
		<div className="py-2">
			<HolidayCalendar date={date} setDate={setDate} />
			<form className="space-y-4">
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
					Date
					<input
						type="text"
						placeholder="Date"
						value={date.toDateString()}
						disabled
						onChange={(e) => setDate(new Date(e.target.value))}
						className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
					/>
				</label>
				<button
					onClick={handleDelete}
					className="py-2.5 px-5 text-xs bg-red-500 dark:bg-red-800 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-full cursor-pointer font-semibold text-center shadow-xs transition-all duration-500"
				>
					Delete
				</button>
			</form>
		</div>
	);
}
