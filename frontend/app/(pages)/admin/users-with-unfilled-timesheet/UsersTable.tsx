import { useMemo } from "react";
import Link from "next/link";
import dashboardService, {
	UserDashboardViewModel,
} from "@/app/api/services/dashboard";
import SortImage from "@/app/components/SortImage";
import CopyButton from "./CopyButton";

const headings: { title: string; field: string; canCopy: boolean }[] = [
	{ title: "Name", field: "name", canCopy: false },
	{ title: "Email", field: "email", canCopy: true },
	{ title: "Employee Type", field: "is_external", canCopy: false },
];

type UsersTableProps = {
	users: UserDashboardViewModel[];
	sortConfig: { column: string; isAscending: boolean };
	setSortConfig: (value: { column: string; isAscending: boolean }) => void;
};

export default function UsersTable({
	users,
	sortConfig,
	setSortConfig,
}: UsersTableProps) {
	const extUsers = users.filter((user) => user.is_external).length;

	const requestSort = (column: string) => {
		const isAscending = sortConfig.column === column && sortConfig.isAscending;
		setSortConfig({ column, isAscending: !isAscending });
	};

	const tableHeader = useMemo(
		() => (
			<>
				{headings.map((heading) => (
					<th key={heading.field} className="border">
						<div className="flex justify-between">
							<span></span>
							<div
								title={`Sort by ${heading.title}`}
								onClick={() => requestSort(heading.field)}
								className="p-2 flex justify-center items-center gap-2 cursor-pointer"
							>
								<h3 className="text-center text-sm font-medium text-indigo-800 tracking-wider">
									{heading.title}
								</h3>
								<SortImage field={heading.field} sortConfig={sortConfig} />
							</div>
							{heading.canCopy ? <CopyButton users={users} /> : <span></span>}
						</div>
					</th>
				))}
			</>
		),
		[sortConfig, users]
	);

	const tableBody = useMemo(
		() => (
			<>
				{users.map((data) => (
					<tr key={data.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
						<td className="p-2 font-semibold text-blue-700 dark:text-blue-300 whitespace-nowrap border">
							<Link href={`/dashboard/user/${data.user_id}`}>
								{dashboardService.getFullName(data)}
							</Link>
						</td>
						<td className="p-2 whitespace-nowrap border">{data.email}</td>
						<td className="p-2 text-center whitespace-nowrap border">
							{data.is_external ? "EXT" : "FTE"}
						</td>
					</tr>
				))}
			</>
		),
		[users]
	);

	const tableFooter = useMemo(
		() => (
			<tr>
				<td className="px-6 py-3 font-bold text-center text-xs text-indigo-800 uppercase tracking-wider border">
					Count
				</td>
				<td className="px-6 py-3 font-bold text-center text-xs text-indigo-700 whitespace-nowrap border">
					{users.length}
				</td>
				<td className="px-6 py-3 font-bold text-center text-xs text-indigo-700 whitespace-nowrap border">
					FTE = {users.length - extUsers}, EXT = {extUsers}
				</td>
			</tr>
		),
		[users, extUsers]
	);

	return (
		<table className="min-w-min max-w-full divide-y divide-gray-200 dark:divide-gray-700">
			<thead className="sticky -top-1 bg-indigo-200 dark:bg-indigo-900">
				<tr>{tableHeader}</tr>
			</thead>
			<tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700 text-xs">
				{tableBody}
			</tbody>
			<tfoot className="sticky bottom-0 bg-indigo-200 dark:bg-indigo-900">
				{tableFooter}
			</tfoot>
		</table>
	);
}
