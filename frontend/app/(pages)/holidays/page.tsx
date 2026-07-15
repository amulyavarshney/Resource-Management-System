"use client";
import { useEffect, useState } from "react";
import { useSession } from "@/app/contexts/AuthContext";
import SelectMenu from "@/app/components/SelectMenu";
import holidayService, { Holiday } from "@/app/api/services/holiday";
import weeksList from "@/app/api/services/weeksList";
import AddHolidayForm from "./AddHolidayForm";

export default function Holidays() {
	const { data: session } = useSession();
	const [year, setYear] = useState(new Date().getFullYear());
	const [holidays, setHolidays] = useState<Array<Holiday[]>>(
		Array(12).fill([])
	);
	const [refetch, setRefetch] = useState<boolean>(false);
	const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
	const handleCloseForm = () => {
		setIsFormVisible(false);
		setRefetch(!refetch);
	};

	const fetchData = async () => {
		const res = await holidayService.getHolidays(year, session?.user.id);
		setHolidays(res);
	};

	useEffect(() => {
		fetchData();
	}, [year, refetch]);

	const handleDelete = async (date: Date) => {
		await holidayService.removeHoliday(date, session?.user.id);
		setRefetch(!refetch);
	};

	const years = Array.from(
		{ length: 10 },
		(_, i) => new Date().getFullYear() - i + 1
	);

	const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		let newYear = parseInt(event.target.value);
		setYear(newYear);
	};

	return (
		session && (
			<div className="min-h-screen">
				<div className="flex justify-end">
					<button
						className="m-2 px-2 inline-flex gap-1 items-center text-sm bg-indigo-500 dark:bg-indigo-800 border dark:border-indigo-900 fill-white rounded-md shadow-md"
						onClick={() => setIsFormVisible(true)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
						>
							<path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4z"></path>
							<path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
						</svg>
						<span className="text-md text-white font-medium">Add</span>
					</button>
					{isFormVisible && (
						<div className="fixed inset-0 bg-black bg-opacity-50 z-10">
							<AddHolidayForm userId={session.user.id} onClose={handleCloseForm} />
						</div>
					)}
					<SelectMenu
						name="year"
						values={years}
						defaultValue={year}
						onChange={handleChange}
					/>
				</div>
				{holidays.every((holiday) => holiday.length == 0) ? (
					<div className="bg-white shadow-md dark:bg-gray-600 border border-gray-300 rounded-sm m-3 py-32 text-center">
						<h3 className="pb-2 font-bold text-sm text-gray-500 dark:text-gray-200">
							It&apos;s lonely here !
						</h3>
						<h5 className="text-xs text-gray-400 dark:text-gray-300">
							The Admin is yet to publish the holiday list, check again later.
						</h5>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-fr">
						{Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
							const holidaysInMonth = holidays[month - 1];
							return (
								<div
									key={month}
									className="bg-white shadow-md dark:bg-gray-600 border border-gray-300 rounded-md p-3 m-2"
								>
									<div className="flex justify-between">
										<h1 className="font-bold">
											{weeksList.getMonthName(month).slice(0, 3)} {year}
										</h1>
										{/* <button onClick={addHolidays}>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="24"
												height="24"
												viewBox="0 0 24 24"
											>
												<path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4z"></path>
												<path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
											</svg>
										</button> */}
									</div>
									<hr className="my-3 border-b-1 border-gray-300" />
									{holidaysInMonth.length > 0 ? (
										holidaysInMonth.map((holiday, index) => (
											<div
												key={index}
												className="flex justify-between items-center text-center text-black dark:text-white gap-5"
											>
												<div className="flex-row">
													<h2 className="text-xl">{holiday.date.getDate()}</h2>
													<h6 className="text-sm">
														{weeksList
															.getDayName(holiday.date.getDay())
															.slice(0, 3)}
													</h6>
												</div>
												<span className="text-md">{holiday.name}</span>
												<div className="flex gap-2">
													{/* <button onClick={editHoliday}>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="24"
															height="24"
															viewBox="0 0 24 24"
														>
															<path d="m18.988 2.012 3 3L19.701 7.3l-3-3zM8 16h3l7.287-7.287-3-3L8 13z"></path>
															<path d="M19 19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .896-2 2v14c0 1.104.897 2 2 2h14a2 2 0 0 0 2-2v-8.668l-2 2V19z"></path>
														</svg>
													</button> */}
													<button
														className="dark:fill-white cursor-pointer"
														onClick={() => handleDelete(holiday.date)}
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="24"
															height="24"
															viewBox="0 0 24 24"
														>
															<path d="M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8h2V6h-4V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H3v2h2zM9 4h6v2H9zM8 8h9v12H7V8z"></path>
															<path d="M9 10h2v8H9zm4 0h2v8h-2z"></path>
														</svg>
													</button>
												</div>
											</div>
										))
									) : (
										<div className="relative top-1/3 text-xs text-center text-gray-500 dark:text-gray-200">
											No Holidays
										</div>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>
		)
	);
}
