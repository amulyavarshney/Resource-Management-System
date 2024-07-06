"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useDate } from "@/app/contexts/DateContext";
import { Role } from "@/nextauth.d";
import Link from "next/link";
import toast from "react-hot-toast";
import Loading from "@/app/components/Loading";
import Unauthorized from "@/app/components/Unauthorized";
import dashboardService, {
	UserDashboardViewModel,
} from "@/app/api/services/dashboard";
import weeksList, { Week } from "@/app/api/services/weeksList";

const UserDetail = ({ params }: { params: { id: number } }) => {
	const { data: session } = useSession();
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<UserDashboardViewModel>();
	const { year, month } = useDate();
	const [weeks, setWeeks] = useState<Week[]>([]);
	const numWeeks = weeks.length;

	useEffect(() => {
		const loadWeeks = async () => {
			try {
				const data = await weeksList.getWeeksInMonth(
					year,
					month,
					session?.user.id
				);
				setWeeks(data);
				setLoading(false);
			} catch (error) {
				setLoading(false);
				toast.error(`Failed to load Weeks: ${error}`);
			}
		};
		loadWeeks();
	}, [year, month]);

	useEffect(() => {
		const fetchData = async () => {
			const res = await dashboardService.getUserDashboardById(
				year,
				month,
				params.id
			);
			setData(res);
			setLoading(false);
		};

		fetchData();
	}, [year, month, params.id]);

	if (loading) {
		return <Loading />;
	}

	if (session?.user?.role === Role.Employee) {
		return <Unauthorized />;
	}

	return (
		session?.user?.role &&
		data && (
			<div className="min-h-max dark:bg-gray-900">
				<div className="flex justify-center items-center gap-5">
					<div className="flex-col">
						<h1 className="text-4xl p-3 font-bold text-center tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl md:text-6xl">
							{dashboardService.getFullName(data)}
						</h1>
						<h2 className="text-2xl p-3 font-bold text-center tracking-tight text-gray-700 dark:text-gray-200 sm:text-3xl md:text-4xl">
							{data.email}
						</h2>
					</div>
					<div className="flex flex-col items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-150 border-gray-400 dark:border-gray-600 rounded-full shadow-inner">
						<h3 className="text-lg p-3 font-bold text-center tracking-tight sm:text-lg md:text-xl">
							{data.isExternal ? "EXT" : "FTE"}
						</h3>
					</div>
				</div>
				<div className="flex flex-col sm:flex-row justify-evenly items-center">
					{[
						{ title: "Total Projects", value: data.totalProjects },
						{ title: "Total Week 1 Hours", value: data.totalWeek1Hours },
						{ title: "Total Week 2 Hours", value: data.totalWeek2Hours },
						{ title: "Total Week 3 Hours", value: data.totalWeek3Hours },
						{ title: "Total Week 4 Hours", value: data.totalWeek4Hours },
						numWeeks == 5
							? { title: "Total Week 5 Hours", value: data.totalWeek5Hours }
							: null,
						{ title: "Total Hours", value: data.totalHours },
					].map(
						(item, index) =>
							item && (
								<div
									key={index}
									className="m-1 px-4 sm:px-2 w-fit sm:w-28 h-28 text-center bg-gray-200 dark:bg-gray-800 border border-gray-400 dark:border-gray-600 shadow-lg rounded-full"
								>
									<div className="text-2xl sm:text-sm pt-8 text-gray-600 dark:text-gray-400">
										{item.title}
									</div>
									<div className="text-2xl sm:text-lg font-bold text-gray-800 dark:text-gray-200">
										{item.value}
									</div>
								</div>
							)
					)}
				</div>
				<div className="mt-5 flex w-full items-center rounded-full h-14">
					<div className="flex-1 border-b border-gray-300 dark:border-gray-600"></div>
					<div className="px-6 py-4 text-gray-700 dark:text-gray-300 text-lg sm:text-xl md:text-2xl font-semibold leading-7 rounded-full border border-gray-300 dark:border-gray-600">
						Projects
					</div>
					<div className="flex-1 border-b border-gray-300 dark:border-gray-600"></div>
				</div>
				<div className="px-6 flex flex-wrap justify-center">
					{data?.projects.map((value, index) => (
						<div
							key={index}
							className="m-4 bg-gray-200 dark:bg-gray-800 border border-gray-400 dark:border-gray-600 shadow-md rounded-lg overflow-hidden max-w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
						>
							<div className="p-4">
								<div className="text-sm font-medium text-gray-700 dark:text-gray-300">
									{value.number}
								</div>
								<div className="font-bold text-xl text-indigo-500">
									<Link href={`../project/${value.id}`}>{value.title}</Link>
								</div>
								<div className="flex justify-center py-2">
									<div className="flex-col">
										<div className="flex flex-col items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-150 border-gray-400 dark:border-gray-600 rounded-full shadow-inner">
											<div className="font-bold text-lg">
												{value.workingHours}
											</div>
											<div className="text-xs font-medium">hours</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		)
	);
};

export default UserDetail;
