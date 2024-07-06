import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import LeaveCalendar from "./LeaveCalendar";
import leaveService, {
	Leave,
	LeaveType,
	LeaveSession,
} from "@/app/api/services/leave";

export default function LeaveForm({ onClose }: { onClose: () => void }) {
	const { data: session } = useSession();
	const year = new Date().getFullYear();
	const month = new Date().getMonth();
	const [day, setDay] = useState<number>(new Date().getDate());
	const [leave, setLeave] = useState<Leave>({
		date: new Date(year, month, day),
		type: LeaveType.Casual,
		session: LeaveSession.FullDay,
		userId: session?.user.id ?? 0,
	});
	const [savedLeaves, setSavedLeaves] = useState<Leave[]>([]);

	const fetchLeaves = async () => {
		const data = await leaveService.getLeavesInMonth(
			year,
			month + 1,
			session?.user.id || 0
		);
		setSavedLeaves(data);
	};

	useEffect(() => {
		fetchLeaves();
	}, []);

	useEffect(() => {
		const newLeave = savedLeaves.find(
			(item) => new Date(item.date) === new Date(year, month, day)
		);
		const date = new Date();
		const newDate = new Date(
			year,
			month,
			day,
			date.getHours() + 5,
			date.getMinutes() + 30,
			date.getSeconds(),
			date.getMilliseconds()
		);
		if (newLeave) setLeave(newLeave);
		else setLeave({ ...leave, date: newDate });
	}, [day]);

	// Calculate the start and end of the current month
	const startOfMonth = new Date();
	startOfMonth.setDate(1);
	const endOfMonth = new Date();
	endOfMonth.setMonth(endOfMonth.getMonth() + 1);
	endOfMonth.setDate(0);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await leaveService.addLeave(leave);
		setDay(day + 1);
		if (leave) setSavedLeaves([...savedLeaves, leave]);
	};

	const handleDelete = async (e: React.FormEvent) => {
		e.preventDefault();
		await leaveService.removeLeave(leave.date, leave.userId);
		setDay(day + 1);
	};

	return (
		<div className="w-full h-full flex items-center justify-center">
			<div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl">
				<nav className="flex justify-between items-center p-2 bg-gray-300 dark:bg-gray-700 rounded-t-md border-b border-gray-500 dark:border-gray-300">
					<div className="p-1 text-md text-black dark:text-white font-semibold">
						Add Leaves
					</div>
					<div onClick={onClose} className="dark:fill-white rotate-45">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
						>
							<path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
						</svg>
					</div>
				</nav>
				<div className="p-3 flex flex-col md:flex-row gap-3">
					<form className="space-y-4">
						<div>
							<label
								htmlFor="leaveDate"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Date:
							</label>
							<input
								value={new Date(year, month, day).toDateString()}
								disabled
								className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
							/>
						</div>
						<div>
							<label
								htmlFor="leaveType"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Type:
							</label>
							<select
								id="type"
								key={leave.type}
								// value={Object.values(LeaveType).find(
								// 	(value) =>
								// 		value ===
								// 		leave.type
								// )}
								// defaultValue="Select Leave Type"
								value={Object.keys(LeaveType).find(
									(key) =>
										LeaveType[key as keyof typeof LeaveType] ===
										leave.type
								)}
								onChange={(e) =>
									setLeave({
										...leave,
										type:
											LeaveType[e.target.value as keyof typeof LeaveType],
									})
								}
								className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
							>
								<option value="">Select Leave Type</option>
								{Object.entries(LeaveType).map(([key, value]) => (
									<option key={key} value={key}>
										{value}
									</option>
								))}
							</select>
						</div>
						<div>
							<label
								htmlFor="leaveSession"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Session:
							</label>
							<select
								id="session"
								key={leave.session}
								// value={Object.values(LeaveSession).find(
								// 	(value) =>
								// 		value ===
								// 		leave.session
								// )}
								// defaultValue="Select Session"
								value={Object.keys(LeaveSession).find(
									(key) =>
										LeaveSession[key as keyof typeof LeaveSession] ===
										leave.session
								)}
								onChange={(e) =>
									setLeave({
										...leave,
										session:
											LeaveSession[e.target.value as keyof typeof LeaveSession],
									})
								}
								className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
							>
								<option value="">Select Session</option>
								{Object.entries(LeaveSession).map(([key, value]) => (
									<option key={key} value={key}>
										{value}
									</option>
								))}
							</select>
						</div>
						<button
							onClick={handleSubmit}
							className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-700 hover:bg-indigo-600 dark:bg-indigo-800 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
						>
							Add
						</button>
						<button
							onClick={handleDelete}
							className="m-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-700 hover:bg-red-600 dark:bg-red-800 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
						>
							Delete
						</button>
					</form>
					<LeaveCalendar
						year={year}
						month={month}
						userId={session?.user.id || 0}
						selectedDay={day}
						setSelectedDay={setDay}
					/>
				</div>
			</div>
		</div>
	);
}
