"use client";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useDate } from "@/app/contexts/DateContext";
import { useSearch } from "@/app/contexts/SearchContext";
import { Role } from "@/nextauth.d";
import Loading from "@/app/components/Loading";
import Unauthorized from "@/app/components/Unauthorized";
import dashboardService, {
	UserDashboardViewModel,
} from "@/app/api/services/dashboard";
import UsersTable from "./UsersTable";

export default function UsersWithUnfilledTimesheetPage() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const { year, month } = useDate();
	const { search } = useSearch();
	const [loading, setLoading] = useState(true);
	const [users, setUsers] = useState<UserDashboardViewModel[]>([]);
	const [sortConfig, setSortConfig] = useState({
		column: "name",
		isAscending: true,
	});

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth");
		}
	}, [status, router]);

	useEffect(() => {
		if (!session?.user) return;

		const load = async () => {
			setLoading(true);
			try {
				const data = await dashboardService.getUsersWithUnfilledTimesheet(
					year,
					month,
					session.user.department,
					session.user.region
				);
				setUsers(data);
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [session?.user, year, month]);

	const sortedUsers = useMemo(() => {
		const filtered = search
			? users.filter(
					(user) =>
						dashboardService
							.getFullName(user)
							.toLowerCase()
							.includes(search.toLowerCase()) ||
						user.email.toLowerCase().includes(search.toLowerCase())
			  )
			: [...users];

		const direction = sortConfig.isAscending ? 1 : -1;
		return filtered.sort((a, b) => {
			if (sortConfig.column === "name") {
				return (
					dashboardService.getFullName(a).localeCompare(dashboardService.getFullName(b)) *
					direction
				);
			}
			if (sortConfig.column === "email") {
				return a.email.localeCompare(b.email) * direction;
			}
			if (sortConfig.column === "is_external") {
				return (Number(a.is_external) - Number(b.is_external)) * direction;
			}
			return 0;
		});
	}, [users, search, sortConfig]);

	if (
		session?.user?.role === Role.Employee ||
		session?.user?.role === Role.Management
	) {
		return <Unauthorized />;
	}

	if (loading || status === "loading") {
		return <Loading />;
	}

	return (
		<div className="p-4 flex flex-col gap-4">
			<div>
				<h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
					Users with Unfilled Timesheet
				</h1>
				<p className="text-sm text-gray-600 dark:text-gray-300">
					{year}-{String(month).padStart(2, "0")} · {sortedUsers.length} user
					{sortedUsers.length === 1 ? "" : "s"}
				</p>
			</div>
			<div className="overflow-x-auto">
				<UsersTable
					users={sortedUsers}
					sortConfig={sortConfig}
					setSortConfig={setSortConfig}
				/>
			</div>
		</div>
	);
}
