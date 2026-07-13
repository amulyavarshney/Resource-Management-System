import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import toast from "react-hot-toast";
import lockService from "@/app/api/services/lock";
import userService from "@/app/api/services/user";
import { Project } from "@/app/api/services/project";
import weekDataService, {
	WeekData,
	WeekDataKey,
} from "@/app/api/services/weekData";
import weeksList from "@/app/api/services/weeksList";
import WeekInput from "./WeekInput";
import { exportReportAndSendMail } from "./MailReport";
import { useWeeks } from "@/app/contexts/WeeksContext";
import SortImage from "@/app/components/SortImage";
import FavouriteButton from "./FavouriteButton";

type TableProps = {
	projects: Project[];
	favouriteProjects: number[];
	setFavouriteProjects: (value: number[]) => void;
	sortConfig: { column: string; isAscending: boolean };
	setSortConfig: (value: { column: string; isAscending: boolean }) => void;
};

export default function Table({
	projects,
	favouriteProjects,
	setFavouriteProjects,
	sortConfig,
	setSortConfig,
}: TableProps) {
	const { data: session } = useSession();

	const year = new Date().getFullYear();
	const month = new Date().getMonth() + 1;
	const userId = session?.user.id ?? 0;

	const [maxHours, setMaxHours] = useState<number>(8);
	const fetchMaxWorkHours = async () => {
		const max_hours = (await userService.getUser(userId)).work_hours_per_day;
		setMaxHours(max_hours);
	};
	useEffect(() => {
		fetchMaxWorkHours();
	}, []);

	const { isFormVisible, weeks, setWeeks } = useWeeks();
	const numWeeks = weeks.length;

	const reloadWeeks = async () => {
		try {
			const data = await weeksList.getWeeksInMonth(
				year,
				month,
				session?.user.id
			);
			setWeeks(data);
		} catch (error) {
			toast.error(`Failed to reload Weeks: ${error}`);
		}
	};

	useEffect(() => {
		reloadWeeks();
	}, [isFormVisible]);

	const [weeklyData, setWeeklyData] = useState<Map<number, number[]>>(
		new Map()
	);
	const weeklyDataRef = useRef(weeklyData);

	const updateWeeklyData = (projectId: number, weekData: number[]) => {
		if (weekData) {
			weeklyData.set(projectId, weekData);
			setWeeklyData(new Map(weeklyData));
			weeklyDataRef.current = weeklyData;
		}
	};

	const displayExceedMaxHoursAlert = (weekNumber: number) =>
		alert(
			`The total hours for Week ${
				weekNumber + 1
			} must be less than or equal to ${weeks[weekNumber].days * maxHours}.`
		);

	const weeksSumRef = useRef(Array(numWeeks).fill(0));
	const weeksSum: Array<number> = useMemo(() => {
		const newWeeksSum = Array(numWeeks).fill(0);
		let showAlert = true;
		weeklyData.forEach((weekData) => {
			newWeeksSum.forEach((_, index) => {
				newWeeksSum[index] += weekData[index];
				if (
					showAlert &&
					weeks[index] &&
					newWeeksSum[index] > weeks[index].days * maxHours
				) {
					showAlert = false;
					displayExceedMaxHoursAlert(index);
				}
			});
		});
		weeksSumRef.current = newWeeksSum;
		return newWeeksSum;
	}, [weeklyData]);

	const [isLocked, setIsLocked] = useState(false);

	useEffect(() => {
		const fetchLock = async () => {
			const lock = await lockService.getLock();
			setIsLocked(lock);
		};

		fetchLock();

		// Then set up an interval to call fetchLock every X milliseconds
		const intervalId = setInterval(
			fetchLock,
			Number(process.env.NEXT_PUBLIC_FETCH_LOCK_INTERVAL) || 60_000
		); // milliseconds (default 60s)

		// Clean up function to clear the interval when the component unmounts
		return () => clearInterval(intervalId);
	}, []);

	const handleSubmit = async () => {
		// Check if any value in weeksSum is greater than or equal to maxHours
		const invalidWeekSumIndex = weeksSumRef.current.findIndex(
			(value, index) => value > weeks[index].days * maxHours
		);
		if (invalidWeekSumIndex !== -1) {
			displayExceedMaxHoursAlert(invalidWeekSumIndex);
			// Toast({heading: "Invalid Total", message: `The total hours for Week ${invalidWeekSumIndex + 1} must be less than or equal to ${weeks[invalidWeekSumIndex].days * 8}.`});
			return;
		}

		try {
			await Promise.all(
				Array.from(weeklyDataRef.current, ([projectId, projectWeeklyData]) => {
					const key: WeekDataKey = {
						user_id: userId,
						project_id: projectId,
						year,
						month,
					};
					const weekData: WeekData = {
						week1: projectWeeklyData[0],
						week2: projectWeeklyData[1],
						week3: projectWeeklyData[2],
						week4: projectWeeklyData[3],
						week5: numWeeks === 5 ? projectWeeklyData[4] : undefined,
					};
					return weekDataService.addWorkHour(key, weekData);
				})
			);
			await userService.updateLastSavedTime(userId);
			toast.success("Saved Successfully!");
		} catch (error) {
			toast.error("Failed to save data");
		}
		try {
			exportReportAndSendMail({ year, month, userId });
		} catch (error) {
			toast.error("Error occured while sending a mail");
		}
	};

	const saveButton = (
		<>
			<button
				type="submit"
				onClick={handleSubmit}
				className="px-4 py-2 inline-flex justify-center items-center rounded-md bg-indigo-500 hover:bg-indigo-400 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-200 transition-all text-sm gap-1 cursor-pointer"
			>
				<Image src="/save.svg" width={20} height={20} alt="Save Button" />
				Save
			</button>
		</>
	);

	const requestSort = (column: string) => {
		let isAscending = sortConfig.column === column && sortConfig.isAscending;
		setSortConfig({ column, isAscending: !isAscending });
	};

	const headerRow = useMemo(() => {
		return (
			<>
				<th
					onClick={() => requestSort("number")}
					className="px-3 py-1 text-center text-lg font-bold text-blue-800 dark:text-blue-500 uppercase tracking-wider border dark:border-gray-600"
				>
					<div className="flex justify-center items-center gap-2">
						Project Number
						<SortImage field="number" sortConfig={sortConfig} />
					</div>
				</th>
				<th
					onClick={() => requestSort("title")}
					className="px-3 py-1 text-center text-lg font-bold text-blue-800 dark:text-blue-500 uppercase tracking-wider border dark:border-gray-600"
				>
					<div className="flex justify-center items-center gap-2">
						Project Title
						<SortImage field="title" sortConfig={sortConfig} />
					</div>
				</th>
				{weeks.map((week, index: number) => (
					<th key={index} className="border dark:border-gray-600">
						<div className="px-3 py-1 text-center text-lg font-bold text-blue-800 dark:text-blue-500 uppercase tracking-wider">
							Week {index + 1}
						</div>
						<div className="-py-1 text-[0.6rem] font-bold text-blue-800 dark:text-blue-500 tracking-wider">
							{week.start} - {week.end}
						</div>
						<div className="px-3 pb-1 text-center text-sm font-medium text-blue-800 dark:text-blue-500 tracking-wider">
							{" "}
							({`${week.days} ${week.days > 1 ? "days" : "day"}`}){" "}
						</div>
					</th>
				))}
				<th className="px-3 py-1 border dark:border-gray-600">
					<div className="flex-col">
						<div className="text-center text-lg font-bold text-blue-800 dark:text-blue-500 uppercase tracking-wider">
							Total
						</div>
						{!isLocked ? (
							saveButton
						) : (
							<div
								className="px-4 py-2 inline-flex justify-center items-center rounded-md bg-red-700 text-black font-semibold text-sm capitalize"
								title="Timesheet is locked. Contact Admin Support!"
							>
								<Image
									src="/lock.svg"
									width={20}
									height={20}
									alt="Export button"
								/>
								Locked
							</div>
						)}
					</div>
				</th>
			</>
		);
	}, [weeks, isLocked, sortConfig]);

	const tableBody = (
		<>
			{projects.map((project) => (
				<tr key={project.id} className="hover:bg-gray-200 dark:hover:bg-gray-600">
					<td className="px-3 py-1 whitespace-nowrap border dark:border-gray-600">
						{project.number}
					</td>
					<td className="px-3 py-1 whitespace-nowrap border dark:border-gray-600">
						<div className="flex flex-row justify-between items-center gap-3">
							<h1>{project.title}</h1>
							<FavouriteButton
								projectId={project.id}
								favouriteProjects={favouriteProjects}
								setFavouriteProjects={setFavouriteProjects}
							/>
						</div>
					</td>
					<WeekInput
						userId={userId}
						projectId={project.id}
						year={year}
						month={month}
						weeks={weeks}
						isLocked={isLocked}
						updateWeeklyData={updateWeeklyData}
					/>
				</tr>
			))}
		</>
	);

	const footerRow = useMemo(() => {
		const total = weeksSum.reduce((total, value) => total + value, 0);
		return (
			<tr>
				<td className="px-6 py-4 text-center whitespace-nowrap border dark:border-gray-600"></td>
				<td className="px-6 py-3 text-lg text-center text-md font-bold text-blue-800 dark:text-blue-500 uppercase tracking-wider border dark:border-gray-600">
					Total
				</td>
				{weeksSum.map((_, index) => (
					<td
						key={index}
						className="px-6 py-4 text-lg text-center font-bold text-blue-800 dark:text-blue-500 whitespace-nowrap border dark:border-gray-600"
					>
						{weeksSum[index]}
					</td>
				))}
				<td className="px-6 py-4 text-lg text-center font-bold text-blue-800 dark:text-blue-500 whitespace-nowrap border dark:border-gray-600">
					{total}
				</td>
			</tr>
		);
	}, [weeksSum]);

	return (
		<div className="h-screen overflow-x-auto">
			<table className="w-full divide-y table-auto">
				<thead className="sticky -top-1 bg-indigo-100 dark:bg-gray-800 shadow-md">
					<tr className="text-xs sm:text-sm md:text-md lg:text-lg">
						{headerRow}
					</tr>
				</thead>
				<tbody className="bg-gray-100 dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600 text-xs sm:text-sm md:text-md lg:text-lg">
					{tableBody}
				</tbody>
				<tfoot className="sticky bottom-0 bg-indigo-100 dark:bg-gray-800 shadow-md text-xs sm:text-sm md:text-md lg:text-lg">
					{footerRow}
				</tfoot>
			</table>
		</div>
	);
}
