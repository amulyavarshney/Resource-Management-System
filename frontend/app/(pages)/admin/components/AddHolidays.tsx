import { FormEvent, useState } from "react";
import ImportFromExcel, { AddField } from "./ImportFromExcel";
import holidayService, {
	HolidayBase,
	HolidayType,
	HOLIDAY_TYPE_NAMES,
} from "@/app/api/services/holiday";
import { useSession } from "@/app/contexts/AuthContext";

export default function AddHolidays() {
	const { data: session } = useSession();
	const [holiday, setHoliday] = useState<HolidayBase>({
		date: new Date(),
		name: "",
		type: HolidayType.Compulsory,
	});

	const handleAdd = async (e: FormEvent) => {
		e.preventDefault();
		await holidayService.addHoliday(holiday, undefined, session?.user.region);
	};

	return (
		<>
			<ImportFromExcel field={AddField.Holidays} />
			<div className="m-1 flex flex-col items-center justify-center space-y-4 bg-white dark:bg-gray-900 rounded-xl shadow-xl">
				<nav className="p-2 w-full text-center text-md font-bold bg-gray-300 dark:bg-gray-700 rounded-t-md border-b border-gray-500 dark:border-gray-300">
					Add Holiday
				</nav>
				<form
					onSubmit={handleAdd}
					className="px-5 pb-3 w-full space-y-2 dark:[color-scheme:dark]"
				>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Date
						<input
							type="date"
							placeholder="Date"
							value={holiday.date.toISOString().split("T")[0]}
							onChange={(e) =>
								setHoliday({ ...holiday, date: new Date(e.target.value) })
							}
							className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
						/>
					</label>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Name
						<input
							type="text"
							placeholder="Name"
							value={holiday.name}
							onChange={(e) => setHoliday({ ...holiday, name: e.target.value })}
							className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
						/>
					</label>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Type
						<select
							value={Number(holiday.type)}
							onChange={(e) =>
								setHoliday({
									...holiday,
									type: Number(e.target.value) as HolidayType,
								})
							}
							className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
						>
							{HOLIDAY_TYPE_NAMES.map((key) => (
								<option value={HolidayType[key]} key={key}>
									{key}
								</option>
							))}
						</select>
					</label>
					<div className="flex justify-center">
						<button
							type="submit"
							className="py-2.5 px-5 text-xs bg-indigo-500 dark:bg-indigo-800 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-full cursor-pointer font-semibold text-center shadow-xs transition-all duration-500"
						>
							Add Holiday
						</button>
					</div>
				</form>
			</div>
		</>
	);
}
