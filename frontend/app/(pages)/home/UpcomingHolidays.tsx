import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import holidayService, { Holiday } from "@/app/api/services/holiday";
import weeksList from "@/app/api/services/weeksList";

export default function UpcomingHolidays() {
	const router = useRouter();
	const year = new Date().getFullYear();
	const [holidays, setHolidays] = useState<Holiday[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			const res = await holidayService.getUpcomingHolidays(year, 3);
			setHolidays(res);
		};
		fetchData();
	}, [year]);

	return (
		<>
			<div id="Holidays" className="overflow-x-auto">
				<div className="min-w-fit max-w-xs bg-white shadow-sm hover:shadow-lg border hover:border-1.5 border-gray-200 rounded-lg m-3 p-5">
					{/* <div className="min-w-fit max-w-xs bg-white transition-colors transform bg-gradient-to-br from-indigo-200 to-indigo-50 shadow-sm hover:shadow-lg border hover:border-1.5 border-gray-300 rounded-lg m-3 p-5">*/}
					<div
						className="flex justify-between items-center cursor-pointer"
						onClick={() => router.push("/holidays")}
					>
						<h3 className="text-md font-semibold pr-2">Upcoming Holidays</h3>
						<span className="text-md font-semibold">{"-->"}</span>
					</div>
					<ul className="list-none">
						{holidays.map((holiday, index) => (
							<li key={index} className="mt-3">
								<div className="flex flex-col">
									<div className="inline-block">
										<span className="text-sm font-semibold pr-2">
											{holiday.date.getDate()}{" "}
											{weeksList
												.getMonthName(holiday.date.getMonth() + 1)
												.slice(0, 3)}
										</span>
										<span className="text-xs">
											{weeksList.getDayName(holiday.date.getDay())}
										</span>
									</div>
									<h4
										className="text-sm font-medium break-normal"
										title={holiday.name}
									>
										{holiday.name}
									</h4>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</>
	);
}
