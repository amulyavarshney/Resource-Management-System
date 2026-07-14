"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useDate } from "@/app/contexts/DateContext";
import { Role } from "@/nextauth.d";
import Link from "next/link";
import Loading from "@/app/components/Loading";
import Unauthorized from "@/app/components/Unauthorized";
import dashboardService, {
	ProjectDashboardViewModel,
} from "@/app/api/services/dashboard";
import userService from "@/app/api/services/user";

const ProjectDetail = ({ params }: { params: { id: number } }) => {
	const { data: session } = useSession();
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<ProjectDashboardViewModel>();
	const { year, month } = useDate();

	useEffect(() => {
		const fetchData = async () => {
			const res = await dashboardService.getProjectDashboardById(
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
				<h2 className="text-2xl sm:text-3xl md:text-4xl p-3 font-bold text-center tracking-tight text-gray-700 dark:text-gray-200">
					{data.project_number}
				</h2>
				<h1 className="text-3xl sm:text-4xl md:text-6xl p-3 font-bold text-center tracking-tight text-gray-900 dark:text-gray-100">
					{data.project_title}
				</h1>
				<div className="px-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{[
						{ title: "Total Internal Users", value: data.total_int_users },
						{ title: "Total External Users", value: data.total_ext_users },
						{ title: "Total Users", value: data.total_users },
						{
							title: "Total Internal Working Hours",
							value: data.total_int_work_hours,
						},
						{
							title: "Total External Working Hours",
							value: data.total_ext_work_hours,
						},
						{ title: "Total Working Hours", value: data.total_work_hours },
					].map((item, index) => (
						<div
							key={index}
							className="mx-2 sm:mx-4 my-2 p-3 text-center bg-gray-200 dark:bg-gray-800 border border-gray-400 dark:border-gray-600 shadow-lg rounded-full"
						>
							<div className="text-sm text-gray-600 dark:text-gray-400">
								{item.title}
							</div>
							<div className="text-lg font-bold text-gray-800 dark:text-gray-200">
								{item.value}
							</div>
						</div>
					))}
				</div>
				<div className="mt-5 flex w-full items-center rounded-full h-14">
					<div className="flex-1 border-b border-gray-300 dark:border-gray-600"></div>
					<div className="px-6 py-4 text-gray-700 dark:text-gray-300 text-lg sm:text-xl md:text-2xl font-semibold leading-7 rounded-full border border-gray-300 dark:border-gray-600">
						Users
					</div>
					<div className="flex-1 border-b border-gray-300 dark:border-gray-600"></div>
				</div>
				<div className="px-3 flex flex-wrap justify-around">
					{(data?.users ?? []).map((value, index) => (
						<div
							key={index}
							className="m-2 sm:m-4 bg-gray-200 dark:bg-gray-800 border border-gray-400 dark:border-gray-600 shadow-lg rounded-lg overflow-hidden relative"
						>
							{value.is_external && (
								<div className="absolute top-0 right-0 w-10 h-10 pt-1 pr-0.5 text-center text-sm font-bold italic bg-gradient-to-br from-indigo-500 to-indigo-200 rounded-bl-full">
									ext
								</div>
							)}
							<div className="p-3">
								<div className="font-bold text-xl text-indigo-500">
									<Link href={`../user/${value.id}`}>
										{userService.getFullName(value)}
									</Link>
								</div>
								<div className="text-sm text-gray-700 dark:text-gray-300">
									{value.email}
								</div>
								<div className="flex w-full items-center rounded-full">
									<div className="flex-1 border-b border-gray-400 dark:border-gray-600"></div>
									<span className="text-gray-600 dark:text-gray-400 text-lg font-semibold leading-8 px-2 py-1">
										Working Hours
									</span>
									<div className="flex-1 border-b border-gray-400 dark:border-gray-600"></div>
								</div>
								<div className="py-2 flex justify-between items-center gap-2">
									{[
										"week1_hours",
										"week2_hours",
										"week3_hours",
										"week4_hours",
										"week5_hours",
									].map(
										(week, index) =>
											(value[week as keyof typeof value] as number | null) !== null && (
												<div key={index}>
													<div className="flex flex-col items-center justify-center w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-gray-150 border border-gray-400 dark:border-gray-600 rounded sm:rounded-full shadow-lg">
														<div className="font-bold text-lg">
															{value[week as keyof typeof value] as number}
														</div>
													</div>
													<div className="mt-1 text-xs text-center">{`${
														week.charAt(0).toUpperCase() +
														week.slice(1, 4) +
														" " +
														week.charAt(4)
													}`}</div>
												</div>
											)
									)}
									<span className="-mt-5">=</span>
									<div className="flex-col">
										<div className="flex flex-col items-center justify-center w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-gray-150 border border-gray-400 dark:border-gray-600 rounded sm:rounded-full shadow-lg">
											<div className="font-bold text-md">
												{(value.week1_hours ?? 0) +
													(value.week2_hours ?? 0) +
													(value.week3_hours ?? 0) +
													(value.week4_hours ?? 0) +
													(value.week5_hours ?? 0)}
											</div>
										</div>
										<div className="mt-1 text-xs text-center">Total</div>
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

export default ProjectDetail;
