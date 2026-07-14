import Image from "next/image";
import { useState } from "react";
import holidayService, {
	HolidayBase,
	HolidayType,
	HOLIDAY_TYPE_NAMES,
} from "@/app/api/services/holiday";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

const AddHolidayForm = ({
	userId,
	onClose,
}: {
	userId: number;
	onClose: () => void;
}) => {
	const [holiday, setHoliday] = useState<HolidayBase>({
		date: new Date(),
		name: "",
		type: HolidayType.Compulsory,
	});

	const handleAdd = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await holidayService.addHoliday(holiday, userId);
		} catch (error) {
			toast.error("Holiday is not saved.");
		}
	};

	return (
		<div className="w-full h-full flex justify-center items-center">
			<div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl">
				<nav className="flex justify-between items-center p-2 bg-gray-300 dark:bg-gray-700 rounded-t-md border-b border-gray-500 dark:border-gray-300">
					<div className="p-1 text-md text-black dark:text-white font-semibold">
						Add Personal Holiday
					</div>
					<div onClick={onClose} className="dark:fill-white rotate-45">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
						>
							<path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
						</svg>
					</div>
				</nav>
				<form
					className="m-5 space-y-4 dark:[color-scheme:dark]"
					onSubmit={handleAdd}
				>
					<div>
						<label
							className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							htmlFor="date"
						>
							Date
						</label>
						<input
							className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
							id="date"
							type="date"
							placeholder="Date"
							value={holiday.date.toISOString().split("T")[0]}
							onChange={(e) =>
								setHoliday({ ...holiday, date: new Date(e.target.value) })
							}
						/>
					</div>
					<div>
						<label
							className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							htmlFor="name"
						>
							Name
						</label>
						<input
							className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
							id="name"
							type="text"
							placeholder="Name"
							value={holiday.name}
							onChange={(e) => setHoliday({ ...holiday, name: e.target.value })}
						/>
					</div>
					<div>
						<label
							className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							htmlFor="type"
						>
							Type
						</label>
						<select
							className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
							id="type"
							value={Number(holiday.type)}
							onChange={(e) =>
								setHoliday({
									...holiday,
									type: Number(e.target.value) as HolidayType,
								})
							}
						>
							{HOLIDAY_TYPE_NAMES.map((key) => (
								<option key={key} value={HolidayType[key]}>
									{key}
								</option>
							))}
						</select>
					</div>
					<div className="flex items-center justify-end space-x-4">
						<button
							type="button"
							onClick={onClose}
							className="py-2.5 px-5 text-xs bg-indigo-50 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-gray-600 text-indigo-500 dark:text-gray-300 rounded-full cursor-pointer font-semibold text-center shadow-xs transition-all duration-500"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="py-2.5 px-5 text-xs bg-indigo-500 dark:bg-indigo-800 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-full cursor-pointer font-semibold text-center shadow-xs transition-all duration-500"
						>
							Add Holiday
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddHolidayForm;
