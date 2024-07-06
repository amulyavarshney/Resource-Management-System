import { useEffect, useState } from "react";
import Image from "next/image";
import dashboardService, {
	UserDashboardViewModel,
} from "@/app/api/services/dashboard";
import userService, { User } from "@/app/api/services/user";

type CardProfileProps = {
	user: User;
};

export default function CardProfile({ user }: CardProfileProps) {
	const year = new Date().getFullYear();
	const month = new Date().getMonth() + 1;

	const [userData, setUserData] = useState<UserDashboardViewModel>();
	const [userStats, setUserStats] = useState<UserDashboardViewModel>();
	useEffect(() => {
		const fetchUserData = async () => {
			const data = await dashboardService.getUserDashboardById(
				year,
				month,
				user.id
			);
			setUserData(data);
			const overallStats = await dashboardService.getOverallUserDashboardById(
				user.id
			);
			setUserStats(overallStats);
		};
		fetchUserData();
	}, [year, month]);

	return (
		userData && (
			<div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
				<div className="ml-auto top-0 right-0 w-16 h-16 pt-4 text-center text-sm font-bold italic bg-gradient-to-br from-indigo-500 to-indigo-200 rounded-tr-lg rounded-bl-full shadow-inner">
					{user.isExternal ? "EXT" : "FTE"}
				</div>
				<div className="flex-col p-5 text-center">
					<Image
						src="/user.svg"
						width={200}
						height={200}
						alt="user"
						className="m-5 mx-auto max-w-150-px h-auto shadow-xl hover:shadow-2xl rounded-full ring-4 ring-indigo-700 ring-offset-2"
					/>
					<h2 className="text-2xl font-semibold hover:font-extrabold leading-normal text-indigo-500 uppercase">
						{userService.getFullName(user)}
					</h2>
					<div className="flex justify-center items-center gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							className="fill-gray-800 dark:fill-gray-200"
						>
							<path d="M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2m0 2v.511l-8 6.223-8-6.222V6zM4 18V9.044l7.386 5.745a.994.994 0 0 0 1.228 0L20 9.044 20.002 18z" />
						</svg>
						<h5 className="text-sm text-gray-800 dark:text-gray-200 leading-normal font-medium hover:font-bold">
							{user.email}
						</h5>
					</div>
					<h3 className="text-lg leading-normal text-indigo-700 dark:text-indigo-400 font-medium hover:font-bold">
						{user.department}
					</h3>
					<div className="flex flex-wrap sm:flex-nowrap md:flex-wrap xl:flex-nowrap gap-3 justify-around m-3">
						<div className="p-2 bg-white dark:bg-gray-900 border hover:border-2 border-indigo-500 shadow-md hover:shadow-xl rounded-md text-center">
							<div className="flex justify-center p-4 gap-4">
								<div>
									<span className="text-xl font-bold block uppercase tracking-wide text-indigo-500">
										{userData.totalProjects}
									</span>
									<span className="text-sm text-indigo-600 dark:text-indigo-400">
										Projects
									</span>
								</div>
								<div>
									<span className="text-xl font-bold block uppercase tracking-wide text-indigo-500">
										{userData.totalHours}
									</span>
									<span className="text-sm text-indigo-600 dark:text-indigo-400">
										Working Hours
									</span>
								</div>
							</div>
							<h3 className="font-bold text-center text-indigo-500">
								This Month
							</h3>
						</div>
						<div className="p-2 bg-white dark:bg-gray-900 border hover:border-2 border-indigo-500 shadow-md hover:shadow-xl rounded-md text-center">
							<div className="flex justify-center p-4 gap-4">
								<div>
									<span className="text-xl font-bold block uppercase tracking-wide text-indigo-500">
										{userStats?.totalProjects}
									</span>
									<span className="text-sm text-indigo-600 dark:text-indigo-400">
										Projects
									</span>
								</div>
								<div>
									<span className="text-xl font-bold block uppercase tracking-wide text-indigo-500">
										{userStats?.totalHours}
									</span>
									<span className="text-sm text-indigo-600 dark:text-indigo-400">
										Working Hours
									</span>
								</div>
							</div>
							<h3 className="font-bold text-center text-indigo-500">
								Since Oct 2023
							</h3>
						</div>
					</div>
				</div>
			</div>
		)
	);
}
