import { useState, useEffect } from "react";
import Image from "next/image";
import lockService from "@/app/api/services/lock";
import ConsolidatedReport from "./ConsolidatedReport";

export default function LockTimesheet() {
	const [isLocked, setIsLocked] = useState(false);
	const year = new Date().getFullYear();
	const month = new Date().getMonth() + 1;

	useEffect(() => {
		const checkLockStatus = async () => {
			const response = await lockService.getLock();
			setIsLocked(response);
		};

		checkLockStatus();
	}, []);

	const toggleLock = async () => {
		await lockService.setLock(!isLocked);
		setIsLocked(!isLocked);
	};

	return (
		<div className="m-2">
			<button
				type="button"
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
