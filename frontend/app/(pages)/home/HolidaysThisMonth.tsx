import { useEffect, useState } from "react";
import holidayService, { Holiday } from "@/app/api/services/holiday";
import weeksList from "@/app/api/services/weeksList";
import HeaderLink from "@/app/components/HeaderLink";

export default function HolidaysThisMonth() {
	const year = new Date().getFullYear();
	const month = new Date().getMonth() + 1;
	const [holidays, setHolidays] = useState<Holiday[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			const res = await holidayService.getHolidaysInMonth(year, month);
			setHolidays(res);
		};
		fetchData();
	}, [year]);

	return (
		<>
			<div id="Holidays" className="overflow-x-auto">
				<div className="min-w-fit max-w-xs m-3 p-5 bg-white dark:bg-gray-700 border hover:border-1.5 border-gray-200 dark:border-gray-400 rounded-lg shadow-sm hover:shadow-lg">
					<HeaderLink href="/holidays" title="Holidays this month" className="text-lg" />
					{holidays.length > 0 ? (
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
											className="text-md font-medium break-normal"
											title={holiday.name}
										>
											{holiday.name}
										</h4>
									</div>
								</li>
							))}
						</ul>
					) : (
						<p className="text-sm">No Holidays</p>
					)}
				</div>
			</div>
		</>
	);
}
