import { useState, useEffect } from "react";
import { CronJob } from "cron";
import Image from "next/image";
import lockService from "@/app/api/services/lock";
import ConsolidatedReport from "./ConsolidatedReport";

export default function LockTimesheet() {
	const [isLocked, setIsLocked] = useState(false);
	const year = new Date().getFullYear();
	const month = new Date().getMonth() + 1;

	// Schedule a job to run at 00:00 on the 1st day of each month
	new CronJob(
		"0 0 1 * *",
		() => {
			setIsLocked(false); // Unlock Timesheet
			// Lock the Timesheet after a certain duration
			setTimeout(
				() => {
					setIsLocked(true);
				},
				1000 * 60 * 60 * 24 * (Number(process.env.NEXT_PUBLIC_LAST_DATE) || 25)
			); // after LAST_DATE
		},
		null,
		true
	);

	useEffect(() => {
		const checkLockStatus = async () => {
			const response = await lockService.getLock();
			setIsLocked(response);
		};

		checkLockStatus();

		// const intervalId = setInterval(
		// 	() => {
		// 		const date = new Date();
		// 		if (date.getDate() === 1) {
		// 			setIsLocked(false);
		// 		}
		//         else if (date.getDate() === Number(process.env.NEXT_PUBLIC_LAST_DATE)) {
		//             setIsLocked(true);
		//         }
		// 	},
		// 	1000 * 60 * 60 * 24
		// ); // Check every day

		// return () => {
		// 	clearInterval(intervalId);
		// };
	}, []);

	const toggleLock = async () => {
		await lockService.setLock(!isLocked);
		setIsLocked(!isLocked);
	};

	return (
		// <div className="absolute top-20 left-1/2 transform -translate-x-1/2 sm:left-auto sm:transform-none sm:right-2 z-10">
		<div className="m-2">
			<button
				onClick={toggleLock}
				className={`p-2 w-44 inline-flex justify-around items-center text-white font-semibold text-sm cursor-pointer rounded-md ${
					isLocked ? "bg-green-600" : "bg-red-600"
				}`}
			>
				<Image
					src={isLocked ? "unlock.svg" : "lock.svg"}
					alt=""
					width={25}
					height={25}
				/>
				{isLocked ? "Unlock Timesheet" : "Lock Timesheet"}
			</button>
			{isLocked && (
				<div className="w-44 flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg shadow-md">
					<ConsolidatedReport year={year} month={month} />
				</div>
			)}
		</div>
	);
}
