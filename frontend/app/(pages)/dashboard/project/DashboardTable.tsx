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
	{ title: "Project Number", field: "projectNumber" },
	{ title: "Project Title", field: "projectTitle" },
	{ title: "FTE Users", field: "totalIntUsers" },
	{ title: "EXT Users", field: "totalExtUsers" },
	{ title: "Total Users", field: "totalUsers" },
	{ title: "FTE Work Hours", field: "totalIntWorkHours" },
	{ title: "EXT Work Hours", field: "totalExtWorkHours" },
	{ title: "Total Work Hours", field: "totalWorkHours" },
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
					<tr key={data.projectId} className="text-center whitespace-nowrap hover:bg-gray-200 dark:hover:bg-gray-600">
						<td className="px-3 py-2 border dark:border-gray-600">
							{data.projectNumber}
						</td>
						<td className="px-3 py-2 text-left font-semibold text-blue-500 whitespace-nowrap border dark:border-gray-600">
							<Link href={`project/${data.projectId}`}>{data.projectTitle}</Link>
						</td>
						<td className="px-3 py-2 border dark:border-gray-600">{data.totalIntUsers}</td>
						<td className="px-3 py-2 border dark:border-gray-600">{data.totalExtUsers}</td>
						<td className="px-3 py-2 border dark:border-gray-600">{data.totalUsers}</td>
						<td className="px-3 py-2 border dark:border-gray-600">{data.totalIntWorkHours}</td>
						<td className="px-3 py-2 border dark:border-gray-600">{data.totalExtWorkHours}</td>
						<td className="px-3 py-2 border dark:border-gray-600">{data.totalWorkHours}</td>
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
