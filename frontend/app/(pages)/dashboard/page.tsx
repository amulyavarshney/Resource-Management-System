"use client";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useDate } from "@/app/contexts/DateContext";
import { Role } from "@/nextauth.d";
import Unauthorized from "@/app/components/Unauthorized";
import dashboardService, {
	DashboardViewModel,
} from "@/app/api/services/dashboard";
import StatItem from "./components/StatsCard";

const headings = [
	{
		label: "Projects",
		value: "totalProjects",
		href: "/dashboard/project",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="40"
				height="40"
				viewBox="0 0 24 24"
			>
				<path d="M5 22h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2h-2a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1H5c-1.103 0-2 .897-2 2v15c0 1.103.897 2 2 2M5 5h2v2h10V5h2v15H5z" />
				<path d="m11 13.586-1.793-1.793-1.414 1.414L11 16.414l5.207-5.207-1.414-1.414z" />
			</svg>
		),
	},
	{
		label: "Users",
		value: "totalUsers",
		fteValue: "totalIntUsers",
		extValue: "totalExtUsers",
		href: "/dashboard/user",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="40"
				height="40"
				viewBox="0 0 24 24"
			>
				<path d="M12 2A10.13 10.13 0 0 0 2 12a10 10 0 0 0 4 7.92V20h.1a9.7 9.7 0 0 0 11.8 0h.1v-.08A10 10 0 0 0 22 12 10.13 10.13 0 0 0 12 2M8.07 18.93A3 3 0 0 1 11 16.57h2a3 3 0 0 1 2.93 2.36 7.75 7.75 0 0 1-7.86 0m9.54-1.29A5 5 0 0 0 13 14.57h-2a5 5 0 0 0-4.61 3.07A8 8 0 0 1 4 12a8.1 8.1 0 0 1 8-8 8.1 8.1 0 0 1 8 8 8 8 0 0 1-2.39 5.64" />
				<path d="M12 6a3.91 3.91 0 0 0-4 4 3.91 3.91 0 0 0 4 4 3.91 3.91 0 0 0 4-4 3.91 3.91 0 0 0-4-4m0 6a1.91 1.91 0 0 1-2-2 1.91 1.91 0 0 1 2-2 1.91 1.91 0 0 1 2 2 1.91 1.91 0 0 1-2 2" />
			</svg>
		),
	},
	{
		label: "Working Hours",
		value: "totalWorkHours",
		fteValue: "totalIntWorkHours",
		extValue: "totalExtWorkHours",
		href: "",
		icon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="40"
				height="40"
				viewBox="0 0 24 24"
			>
				<path d="M19 22h1v-2h-1v-1a7.01 7.01 0 0 0-3.433-6.02c-.355-.21-.567-.547-.567-.901v-.158c0-.354.212-.691.566-.9A7.02 7.02 0 0 0 19 5V4h1V2H4v2h1v1a7.02 7.02 0 0 0 3.434 6.021c.354.209.566.545.566.9v.158c0 .354-.212.691-.566.9A7.02 7.02 0 0 0 5 19v1H4v2zM17 4v1a5 5 0 0 1-1.004 3H8.004A5 5 0 0 1 7 5V4zM9.45 14.702c.971-.574 1.55-1.554 1.55-2.623V12h2v.079c0 1.068.579 2.049 1.551 2.623A4.98 4.98 0 0 1 16.573 17H7.427a4.98 4.98 0 0 1 2.023-2.298" />
			</svg>
		),
	},
];

export default function Dashboard() {
	const { data: session } = useSession();
	const { year, month } = useDate();
	const [data, setData] = useState<DashboardViewModel>();

	useEffect(() => {
		const fetchData = async () => {
			const res = await dashboardService.getDashboard(
				year,
				month,
				session?.user.department,
				session?.user.region
			);
			setData(res);
		};
		fetchData();
	}, [year, month]);

	if (session?.user?.role === Role.Employee) {
		return <Unauthorized />;
	}

	return (
		session?.user?.role && (
			<div>
				<div id="Dashboard" className="hidden overflow-x-auto overflow-y-auto">
					<table className="divide-y divide-gray-200 table-auto border-collapse border border-gray-400">
						<tbody className="bg-white divide-y divide-gray-200">
							{headings.map((item, index) => (
								<tr key={index}>
									<td className="px-6 py-4 whitespace-nowrap border">
										{item.label}
									</td>
									<td
										id="dashbardValues"
										className="px-6 py-4 text-center whitespace-nowrap border"
									>
										{data?.[item.value as keyof typeof data]}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="mx-3 xl:mx-auto my-24 max-w-7xl grid gap-16 sm:grid-cols-2 lg:grid-cols-3">
					{headings.map((item, index) => (
						<StatItem
							key={index}
							label={item.label}
							value={data?.[item.value as keyof typeof data]}
							fteValue={item.fteValue ? data?.[item.fteValue as keyof typeof data] : undefined}
							extValue={item.extValue ? data?.[item.extValue as keyof typeof data] : undefined}
							href={item.href}
							icon={item.icon}
						/>
					))}
				</div>
			</div>
		)
	);
}
