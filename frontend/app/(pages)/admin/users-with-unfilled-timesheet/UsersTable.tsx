import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import userService, { User } from "@/app/api/services/user";
import CopyButton from "./CopyButton";

const headings: { title: string; field: string; canCopy: boolean }[] = [
	{ title: "Name", field: "name", canCopy: false },
	{ title: "Email", field: "email", canCopy: true },
	{ title: "Employee Type", field: "isExternal", canCopy: false },
];

type UsersTableProps = {
	users: User[];
	sortConfig: { column: string; isAscending: boolean };
	setSortConfig: (value: { column: string; isAscending: boolean }) => void;
};

export default function UsersTable({
	users,
	sortConfig,
	setSortConfig,
}: UsersTableProps) {
	const extUsers = users.filter((user) => user.isExternal).length;

	const requestSort = (column: string) => {
		let isAscending = sortConfig.column === column && sortConfig.isAscending;
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
								{sortConfig.column === heading.field && (
									<Image
										src={
											sortConfig.column === heading.field
												? sortConfig.isAscending
													? "/arrow-up.svg"
													: "/arrow-down.svg"
												: "/arrow-up.svg"
										}
										alt="Sort"
										className={
											sortConfig.column === heading.field
												? "opacity-100"
												: "opacity-0"
										}
										height={25}
										width={25}
									/>
								)}
							</div>
							{heading.canCopy ? <CopyButton users={users} /> : <span></span>}
						</div>
					</th>
				))}
			</>
		),
		[sortConfig]
	);

	const tableBody = useMemo(
		() => (
			<>
				{users.map((data) => (
					<tr key={data.id} className="hover:bg-gray-50">
						<td className="p-2 font-semibold text-blue-700 whitespace-nowrap border">
							<Link href={`/dashboard/user/${data.userId}`}>{userService.getFullName(data)}</Link>
						</td>
						<td className="p-2 whitespace-nowrap border">{data.email}</td>
						<td className="p-2 text-center whitespace-nowrap border">
							{data.isExternal ? "EXT" : "FTE"}
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
					FTE = {users.length-extUsers}, EXT = {extUsers}
				</td>
			</tr>
		),
		[users]
	);

	return (
		<table className="min-w-min max-w-full divide-y divide-gray-200">
			<thead className="sticky -top-1 bg-indigo-200">
				<tr>{tableHeader}</tr>
			</thead>
			<tbody className="bg-white divide-y divide-gray-200 text-xs">
				{tableBody}
			</tbody>
			<tfoot className="sticky bottom-0 bg-indigo-200">{tableFooter}</tfoot>
		</table>
	);
}

// page.tsx
// "use client";
// import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";
// import { Role } from "@/nextauth.d";
// import Loading from "@/app/components/Loading";
// import SearchBox from "@/app/components/SearchBox";
// import Unauthorized from "@/app/components/Unauthorized";
// import dashboardService from "@/app/api/services/dashboard";
// import { User } from "@/app/api/services/user";
// import UsersTable from "./UsersTable";

// export default function UsersWithUnfilledTimesheet() {
// 	const { data: session } = useSession();
// 	const [loading, setLoading] = useState(true);
// 	const [search, setSearch] = useState<string>("");
// 	const [sortConfig, setSortConfig] = useState({
// 		column: "name",
// 		isAscending: true,
// 	});
// 	const [users, setUsers] = useState<User[]>([]);
// 	const year = new Date().getFullYear();
// 	const month = new Date().getMonth() + 1;

// 	function toLowerCase(
// 		input: boolean | Date | number | string
// 	): boolean | number | string {
// 		if (typeof input === "string") {
// 			return input.toLowerCase();
// 		} else if (input instanceof Date) {
// 			return input.toDateString();
// 		}
// 		return input;
// 	}

// 	const loadAndSortUserDashboard = async () => {
// 		const fetchedUsers = await dashboardService.getUsersWithUnfilledTimesheet(
// 			year,
// 			month,
// 			session?.user.department,
// 			session?.user.region
// 		);

// 		// Filter the users data based on search string
// 		const filteredUsers = search
// 			? fetchedUsers.filter(
// 					(data) =>
// 						data.firstName.toLowerCase().includes(search.toLowerCase()) ||
// 						data.lastName.toLowerCase().includes(search.toLowerCase()) ||
// 						data.email.includes(search)
// 			  )
// 			: fetchedUsers;

// 		// Sort the users data based on selected column
// 		const sortedUsers = filteredUsers.sort((a, b) => {
// 			const aValue = toLowerCase(a[sortConfig.column]);
// 			const bValue = toLowerCase(b[sortConfig.column]);

// 			if (aValue < bValue) {
// 				return sortConfig.isAscending ? -1 : 1;
// 			}
// 			if (aValue > bValue) {
// 				return sortConfig.isAscending ? 1 : -1;
// 			}
// 			return 0;
// 		});

// 		setUsers(sortedUsers);
// 		setLoading(false);
// 	};

// 	useEffect(() => {
// 		loadAndSortUserDashboard();
// 	}, [search, sortConfig]);

// 	if (loading) {
// 		return <Loading />;
// 	}

// 	if (session?.user?.role === Role.Employee) {
// 		return <Unauthorized />;
// 	}

// 	const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
// 		let filteredUsers = users.filter((user) =>
// 			user.email.includes(event.target.value.toLowerCase())
// 		);
// 		setUsers(filteredUsers);
// 	};

// 	return (
// 		session?.user?.role && (
// 			<div className="min-h-screen max-h-full bg-gray-100">
// 				<SearchBox field="User" search={search} setSearch={setSearch} />
// 				<div className="flex flex-col p-6">
// 					<div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
// 						<div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
// 							<div className="min-w-min max-w-max min-h-fit max-h-[80vh] shadow-md overflow-x-auto border-b border-gray-200 sm:rounded-lg">
// 								{/* <SelectMenu
// 									name="Employee Type"
// 									values={["FTE", "EXT"]}
// 									onChange={handleChange}
// 								/> */}
// 								<UsersTable
// 									users={users}
// 									sortConfig={sortConfig}
// 									setSortConfig={setSortConfig}
// 								/>
// 							</div>
// 						</div>
// 					</div>
// 				</div>
// 			</div>
// 		)
// 	);
// }
