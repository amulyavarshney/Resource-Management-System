import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import dashboardService, { UserDashboardViewModel } from "@/app/api/services/dashboard";
import weeksList, { Week } from "@/app/api/services/weeksList";
import SortImage from "@/app/components/SortImage";

type DashboardTableProps = {
	month: number;
	year: number;
	userData: UserDashboardViewModel[];
	totals: {
		week1Hours: number;
		week2Hours: number;
		week3Hours: number;
		week4Hours: number;
		week5Hours: number;
		totalHours: number;
	};
	sortConfig: { column: string; isAscending: boolean };
	setSortConfig: (value: { column: string; isAscending: boolean }) => void;
};

const DashboardTable = ({
	month,
	year,
	userData,
	totals,
	sortConfig,
	setSortConfig,
}: DashboardTableProps) => {
	const [weeks, setWeeks] = useState<Week[]>([]);
	const numWeeks = weeks.length;

	useEffect(() => {
		const loadWeeks = async () => {
			try {
				const data = await weeksList.getWeeksInMonth(year, month);
				setWeeks(data);
			} catch (error) {
				toast.error(`Failed to load Weeks: ${error}`);
			}
		};
		loadWeeks();
	}, [year, month]);

	const headings: { title: string; field: string }[] = [
		{ title: "Name", field: "name" },
		// { title: "Email", field: "email" },
		{ title: "Employee Type", field: "is_external" },
		{ title: "Total Projects", field: "total_projects" },
		{ title: "Week 1 Hours", field: "total_week1_hours" },
		{ title: "Week 2 Hours", field: "total_week2_hours" },
		{ title: "Week 3 Hours", field: "total_week3_hours" },
		{ title: "Week 4 Hours", field: "total_week4_hours" },
		{ title: numWeeks == 5 ? "Week 5 Hours" : "", field: "total_week5_hours" },
		{ title: "Total Hours", field: "totalHours" },
	];

	const requestSort = (column: string) => {
		let isAscending = sortConfig.column === column && sortConfig.isAscending;
		setSortConfig({ column, isAscending: !isAscending });
	};

	const tableHeader = useMemo(
		() => (
			<>
				{headings.map(
					(heading) =>
						heading.title && (
							<th
								key={heading.title}
								className="px-3 pt-3 text-sm font-medium text-blue-800 dark:text-blue-500 tracking-wider border-x border-t dark:border-gray-600"
								onClick={() => requestSort(heading.field)}
							>
								<div className="flex justify-center items-center gap-2">
									{heading.title}
									<SortImage field={heading.field} sortConfig={sortConfig} />
								</div>
							</th>
						)
				)}
			</>
		),
		[numWeeks, sortConfig]
	);

	const tableSubHeader = useMemo(() => {
		return (
			<>
				<th className="text-xs font-medium text-blue-800 dark:text-blue-500 uppercase tracking-wider border-x border-b dark:border-gray-600"></th>
				<th className="text-xs font-medium text-blue-800 dark:text-blue-500 uppercase tracking-wider border-x border-b dark:border-gray-600"></th>
				<th className="text-xs font-medium text-blue-800 dark:text-blue-500 uppercase tracking-wider border-x border-b dark:border-gray-600"></th>
				{weeks.map((week, index) => (
					<th
						key={index}
						className="px-3 pb-2 text-xs font-medium text-blue-800 dark:text-blue-500 tracking-wider border-x border-b dark:border-gray-600"
					>
						{/* {week.start} - {week.end} */}
						<div> ({week.days} days) </div>
					</th>
				))}
				<th className="text-xs font-medium text-blue-800 dark:text-blue-500 uppercase tracking-wider border-x border-b dark:border-gray-600"></th>
			</>
		);
	}, [weeks]);

	const tableBody = useMemo(
		() => (
			<>
				{userData.map((data) => (
					<tr key={data.user_id} className="text-center whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-600">
						<td className="px-3 py-2 text-left font-semibold text-blue-500 whitespace-nowrap border dark:border-gray-600">
							<Link href={`user/${data.user_id}`}>{dashboardService.getFullName(data)}</Link>
						</td>
						<td className="px-3 py-2 border dark:border-gray-600">
							{data.is_external ? "EXT" : "FTE"}
						</td>
						<td className="px-3 py-2 border dark:border-gray-600">
							{data.total_projects}
						</td>
						<td className="px-3 py-2 border dark:border-gray-600">
							{data.total_week1_hours}
						</td>
						<td className="px-3 py-2 border dark:border-gray-600">
							{data.total_week2_hours}
						</td>
						<td className="px-3 py-2 border dark:border-gray-600">
							{data.total_week3_hours}
						</td>
						<td className="px-3 py-2 border dark:border-gray-600">
							{data.total_week4_hours}
						</td>
						{numWeeks === 5 && (
							<td className="px-3 py-2 border dark:border-gray-600">
								{data.total_week5_hours}
							</td>
						)}
						<td className="px-3 py-2 border dark:border-gray-600">
							{data.totalHours}
						</td>
					</tr>
				))}
			</>
		),
		[year, month, weeks, userData]
	);

	const tableFooter = useMemo(
		() => (
			<tr className="font-bold text-center text-xs text-blue-800 dark:text-blue-500 whitespace-nowrap">
				<td className="whitespace-nowrap border dark:border-gray-600"></td>
				<td className="px-3 py-2 uppercase tracking-wider border dark:border-gray-600">
					Total
				</td>
				<td className="border dark:border-gray-600"></td>
				<td className="border dark:border-gray-600">
					{totals.week1Hours}
				</td>
				<td className="border dark:border-gray-600">
					{totals.week2Hours}
				</td>
				<td className="border dark:border-gray-600">
					{totals.week3Hours}
				</td>
				<td className="border dark:border-gray-600">
					{totals.week4Hours}
				</td>
				{numWeeks == 5 && (
					<td className="border dark:border-gray-600">
						{totals.week5Hours}
					</td>
				)}
				<td className="border dark:border-gray-600">
					{totals.totalHours}
				</td>
			</tr>
		),
		[weeks, totals]
	);

	return (
		<table className="min-w-full">
			<thead className="sticky -top-1 text-center gap-2 bg-indigo-100 dark:bg-gray-800">
				<tr>{tableHeader}</tr>
				<tr>{tableSubHeader}</tr>
			</thead>
			<tbody className="bg-gray-100 dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600 text-xs">
				{tableBody}
			</tbody>
			<tfoot className="sticky bottom-0 bg-indigo-100 dark:bg-gray-800">{tableFooter}</tfoot>
		</table>
	);
};

export default DashboardTable;
