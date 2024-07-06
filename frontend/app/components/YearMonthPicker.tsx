import React, { useState } from "react";
import DatePicker from "react-datepicker";
import weeksList from "@/app/api/services/weeksList";
import "react-datepicker/dist/react-datepicker.css";

type YearMonthPickerProps = {
	onChange: (date: Date) => void;
};

export default function YearMonthPicker({ onChange }: YearMonthPickerProps) {
	const [date, setDate] = useState(new Date());

	const handleChange = (date: Date) => {
		setDate(date);
		onChange(date);
	};

	return (
		<DatePicker
			selected={date}
			onChange={handleChange}
			dateFormat="MM/yyyy"
			showMonthYearPicker
			customInput={
				<button className="py-2 px-4 text-indigo-600 hover:text-indigo-800 dark:text-gray-300 dark:hover:text-gray-100 font-medium hover:font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-indigo-600 hover:border-indigo-800 dark:border-gray-300 dark:hover:border-gray-100 rounded cursor-pointer">
					{weeksList.getMonthName(date.getMonth() + 1)}, {date.getFullYear()}
				</button>
			}
		/>
	);
}
