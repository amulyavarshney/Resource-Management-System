import { useMemo } from "react";
import Link from "next/link";
import { ProjectDashboardViewModel } from "@/app/api/services/dashboard";
import SortImage from "@/app/components/SortImage";

type DashboardTableProps = {
	month: number;
	year: number;
	projectData: ProjectDashboardViewModel[];
	totals: { extWorkHours: number, workHours: number };
	sortConfig: { column: string; isAscending: boolean };
	setSortConfig: (value: { column: string; isAscending: boolean }) => void;
};

const headings: { title: string; field: string }[] = [
	{ title: "Project Number", field: "project_number" },
	{ title: "Project Title", field: "project_title" },
	{ title: "FTE Users", field: "total_int_users" },
	{ title: "EXT Users", field: "total_ext_users" },
	{ title: "Total Users", field: "total_users" },
	{ title: "FTE Work Hours", field: "total_int_work_hours" },
	{ title: "EXT Work Hours", field: "total_ext_work_hours" },
	{ title: "Total Work Hours", field: "total_work_hours" },
];

const DashboardTable = ({
	month,
	year,
	projectData,
	totals,
	sortConfig,
	setSortConfig,
}: DashboardTableProps) => {

	const requestSort = (column: string) => {
		let isAscending = sortConfig.column === column && sortConfig.isAscending;
		setSortConfig({ column, isAscending: !isAscending });
	};

	const tableHeader = useMemo(
		() => (
			<tr>
				{headings.map((heading) => (
					<th
						key={heading.title}
						className="px-3 py-3 text-sm font-medium text-blue-800 dark:text-blue-500 tracking-wider border dark:border-gray-600"
						onClick={() => requestSort(heading.field)}
					>
						<div className="flex justify-center items-center gap-2">
							{heading.title}
							<SortImage field={heading.field} sortConfig={sortConfig} />
						</div>
					</th>
				))}
			</tr>
		),
		[sortConfig]
	);

	const tableBody = useMemo(
		() => (
			<>
				{projectData.map((data) => (
					<tr key={data.project_id} className="text-center whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-600">
						<td className="px-3 py-2 border dark:border-gray-600">
							{data.project_number}
						</td>
						<td className="px-3 py-2 text-left font-semibold text-blue-500 whitespace-nowrap border dark:border-gray-600">
							<Link href={`/dashboard/project/detail?id=${data.project_id}`}>{data.project_title}</Link>
						</td>
						<td className="px-3 py-2 border dark:border-gray-600">{data.total_int_users}</td>
						<td className="px-3 py-2 border dark:border-gray-600">{data.total_ext_users}</td>
						<td className="px-3 py-2 border dark:border-gray-600">{data.total_users}</td>
						<td className="px-3 py-2 border dark:border-gray-600">{data.total_int_work_hours}</td>
						<td className="px-3 py-2 border dark:border-gray-600">{data.total_ext_work_hours}</td>
						<td className="px-3 py-2 border dark:border-gray-600">{data.total_work_hours}</td>
					</tr>
				))}
			</>
		),
		[year, month, projectData]
	);

	const tableFooter = useMemo(
		() => (
			<tr className="font-bold text-center text-xs text-blue-800 dark:text-blue-500 whitespace-nowrap">
				<td className="whitespace-nowrap border dark:border-gray-600"></td>
				<td className="px-3 py-2 uppercase tracking-wider border dark:border-gray-600">
					Total
				</td>
				<td className="border dark:border-gray-600"></td>
				<td className="border dark:border-gray-600"></td>
				<td className="border dark:border-gray-600"></td>
				<td className="border dark:border-gray-600">
					{totals.workHours - totals.extWorkHours}
				</td>
				<td className="border dark:border-gray-600">
					{totals.extWorkHours}
				</td>
				<td className="border dark:border-gray-600">
					{totals.workHours}
				</td>
			</tr>
		),
		[totals]
	);

	return (
		<table className="min-w-full divide-y divide-gray-200">
			<thead className="sticky -top-1 text-center gap-2 bg-indigo-100 dark:bg-gray-800">{tableHeader}</thead>
			<tbody className="bg-gray-100 dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600 text-xs">
				{tableBody}
			</tbody>
			<tfoot className="sticky bottom-0 bg-indigo-100 dark:bg-gray-800">{tableFooter}</tfoot>
		</table>
	);
};

export default DashboardTable;
