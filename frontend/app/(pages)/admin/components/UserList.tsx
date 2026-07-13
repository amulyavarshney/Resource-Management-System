import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import dashboardService, {
	UserDashboardViewModel,
} from "@/app/api/services/dashboard";
import StatItem from "../../dashboard/components/StatsCard";

export default function UserList() {
	const { data: session } = useSession();
	const year = new Date().getFullYear();
	const month = new Date().getMonth() + 1;
	const [users, setUsers] = useState<UserDashboardViewModel[]>([]);
	const [ext, setExt] = useState(0);

	const fetchUsers = async () => {
		const data = await dashboardService.getUsersWithUnfilledTimesheet(
			year,
			month,
			session?.user.department,
			session?.user.region
		);
		setUsers(data);
		setExt(data.filter((user) => user.is_external).length);
	};

	useEffect(() => {
		if (!session?.user) return;
		fetchUsers();
	}, [session?.user]);

	return (
		<div className="inline-flex p-3">
			<StatItem
				label="Users with Unfilled Timesheet"
				value={users.length}
				fteValue={users.length - ext}
				extValue={ext}
				href="/admin/users-with-unfilled-timesheet"
				icon={
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="40"
						height="40"
						viewBox="0 0 24 24"
					>
						<path d="M12 2A10.13 10.13 0 0 0 2 12a10 10 0 0 0 4 7.92V20h.1a9.7 9.7 0 0 0 11.8 0h.1v-.08A10 10 0 0 0 22 12 10.13 10.13 0 0 0 12 2M8.07 18.93A3 3 0 0 1 11 16.57h2a3 3 0 0 1 2.93 2.36 7.75 7.75 0 0 1-7.86 0m9.54-1.29A5 5 0 0 0 13 14.57h-2a5 5 0 0 0-4.61 3.07A8 8 0 0 1 4 12a8.1 8.1 0 0 1 8-8 8.1 8.1 0 0 1 8 8 8 8 0 0 1-2.39 5.64" />
						<path d="M12 6a3.91 3.91 0 0 0-4 4 3.91 3.91 0 0 0 4 4 3.91 3.91 0 0 0 4-4 3.91 3.91 0 0 0-4-4m0 6a1.91 1.91 0 0 1-2-2 1.91 1.91 0 0 1 2-2 1.91 1.91 0 0 1 2 2 1.91 1.91 0 0 1-2 2" />
					</svg>
				}
			/>
		</div>
	);
}
