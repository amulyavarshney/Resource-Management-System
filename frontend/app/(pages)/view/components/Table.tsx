import { useEffect, useMemo, useState } from "react";
import { Week } from "@/app/api/services/weeksList";
import { TimesheetRow } from "@/app/api/services/weekData";
import leaveService, { Leave } from "@/app/api/services/leave";
import { useDate } from "@/app/contexts/DateContext";
import { useSession } from "next-auth/react";
import SortImage from "@/app/components/SortImage";
import { getClassName } from "@/app/components/Legend";

type TableProps = {
	weeks: Week[];
	rowData: TimesheetRow[];
	weeksSum: number[];
	sortConfig: { column: keyof TimesheetRow; isAscending: boolean };
	setSortConfig: (value: {
		column: keyof TimesheetRow;
		isAscending: boolean;
	}) => void;
};

const Table = ({
	weeks,
	rowData,
	weeksSum,
	sortConfig,
	setSortConfig,
}: TableProps) => {
	const numWeeks = weeks.length;
	const { year, month } = useDate();
	const { data: session, status } = useSession();
	const [isChecked, setIsChecked] = useState(false);
	const [leaves, setLeaves] = useState<Leave[]>([]);

	const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setIsChecked(e.target.checked);
	};

	const fetchLeaves = async () => {
		const data = await leaveService.getLeavesInMonth(
			year,
			month,
			session?.user.id || 0
		);
		setLeaves(data);
	};

	useEffect(() => {
		fetchLeaves();
	}, []);

	const requestSort = (column: keyof TimesheetRow) => {
		let isAscending = sortConfig.column === column && sortConfig.isAscending;
		setSortConfig({ column, isAscending: !isAscending });
	};

	const headerRow = useMemo(() => {
		return (
			<tr className="text-xs sm:text-sm md:text-md lg:text-lg">
				<th
					onClick={() => requestSort("project_number")}
					className="px-3 py-1 text-center text-lg font-bold text-blue-800 dark:text-blue-500 uppercase tracking-wider border dark:border-gray-600"
				>
					<div className="flex justify-center items-center gap-2">
						Project Number
						<SortImage field="project_number" sortConfig={sortConfig} />
					</div>
				</th>
				<th
					onClick={() => requestSort("project_title")}
					className="px-3 py-1 text-center text-lg font-bold text-blue-800 dark:text-blue-500 uppercase tracking-wider border dark:border-gray-600"
				>
					<div className="flex justify-center items-center gap-2">
						Project Title
						<SortImage field="project_title" sortConfig={sortConfig} />
					</div>
				</th>
				{weeks.map((week, index: number) => (
					<th
						key={index}
						className="border dark:border-gray-600"
						onClick={() =>
							requestSort(`week${index + 1}Hours` as keyof TimesheetRow)
						}
					>
						<div className="px-3 py-1 text-center text-lg font-bold text-blue-800 dark:text-blue-500 uppercase tracking-wider">
							<div className="flex justify-center items-center gap-2">
								Week {index + 1}
								<SortImage field={`week${index + 1}Hours` as keyof TimesheetRow} sortConfig={sortConfig} />
							</div>
						</div>
						<div className="text-[0.6rem] font-bold text-blue-800 dark:text-blue-500 tracking-wider">
							{week.start} - {week.end}
						</div>
						<div className="px-3 pb-1 text-center text-sm font-medium text-blue-800 dark:text-blue-500 tracking-wider">
							{" "}
							({`${week.days} ${week.days > 1 ? "days" : "day"}`}){" "}
						</div>
					</th>
				))}
				<th
					onClick={() => requestSort("totalHours")}
					className="px-3 py-1 text-center text-lg font-bold text-blue-800 dark:text-blue-500 uppercase tracking-wider border dark:border-gray-600"
				>
					<div className="flex justify-center items-center gap-2">
						Total
						<SortImage field="totalHours" sortConfig={sortConfig} />
					</div>
				</th>
			</tr>
		);
	}, [weeks, sortConfig]);

	const tableBody = useMemo(
		() => (
			<>
				{rowData
					.filter((row) => isChecked || row.totalHours > 0)
					.map((row) => (
						<tr key={row.project_id} className="hover:bg-gray-200 dark:hover:bg-gray-600">
							{Object.values(row).map((data, index) =>
								index > 0 && index <= numWeeks + 3 ? (
									<td
										key={index}
										className="px-3 py-1 whitespace-nowrap border dark:border-gray-600 text-center"
									>
										{data}
									</td>
								) : (
									<></>
								)
							)}
						</tr>
					))}
			</>
		),
		[rowData, isChecked]
	);

	const footerRow = useMemo(() => {
		return (
			<tr>
				<td className="px-6 py-4 text-center whitespace-nowrap border dark:border-gray-600"></td>
				<td className="px-6 py-3 text-lg text-center text-md font-bold text-blue-800 dark:text-blue-500 uppercase tracking-wider border dark:border-gray-600">
					Total
				</td>
				{weeksSum.map((value, index) => (
					<td
						key={index}
						className="px-6 py-4 text-lg text-center font-bold text-blue-800 dark:text-blue-500 whitespace-nowrap border dark:border-gray-600"
					>
						{value}
					</td>
				))}
			</tr>
		);
	}, [weeksSum]);

	return (
		<div className="h-screen overflow-x-auto">
			<div className="flex justify-between">
				<div className="px-16"></div>
				<div className="flex justify-center items-center">
					<h1 className="text-xl font-bold">
						{leaves.length > 0 ? "Leaves:" : ""}
					</h1>
					{leaves.map((leave, index) => (
						<div
							key={index}
							className={`flex justify-center items-center h-8 w-8 m-2 ${getClassName(
								new Date(leave.date),
								[],
								leaves
							)}`}
						>
							{new Date(leave.date).getDate()}
						</div>
					))}
				</div>
				<label className="m-2 flex justify-end items-center">
					<input
						type="checkbox"
						checked={isChecked}
						onChange={handleCheckboxChange}
						className="form-checkbox"
					/>
					<span className="ml-2">Show All Projects</span>
				</label>
			</div>
			<table className="w-full divide-y divide-gray-200 table-auto">
				<thead className="sticky -top-1 bg-indigo-100 dark:bg-gray-800 shadow-md">
					{headerRow}
				</thead>
				<tbody className="bg-gray-100 dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600 text-xs sm:text-sm md:text-md lg:text-lg">
					{tableBody}
				</tbody>
				<tfoot className="sticky bottom-0 bg-indigo-100 dark:bg-gray-800 shadow-md text-xs sm:text-sm md:text-md lg:text-lg">
					{footerRow}
				</tfoot>
			</table>
		</div>
	);
};

export default Table;
