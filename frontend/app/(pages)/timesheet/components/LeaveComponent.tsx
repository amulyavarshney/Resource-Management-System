import { useEffect, useState } from "react";
import LeaveForm from "./LeaveForm";
import leaveService, { Leave } from "@/app/api/services/leave";
import { useSession } from "next-auth/react";
import { useWeeks } from "@/app/contexts/WeeksContext";
import { getClassName } from "@/app/components/Legend";

export default function LeaveComponent() {
	const year = new Date().getFullYear();
	const month = new Date().getMonth() + 1;
	const { data: session } = useSession();
	const { isFormVisible, setIsFormVisible } = useWeeks();
	const [leaves, setLeaves] = useState<Leave[]>([]);

	const fetchLeaves = async () => {
		const data = await leaveService.getLeavesInMonth(
			year,
			month,
			session?.user.id ?? 0
		);
		setLeaves(data);
	};

	useEffect(() => {
		fetchLeaves();
	}, [isFormVisible]);

	const handleCloseForm = () => {
		setIsFormVisible(false);
	};

	return (
		<>
			<div className="flex justify-center items-center">
				<h1 className="text-xl font-bold">
					{leaves.length > 0 ? "Leaves:" : ""}
				</h1>
				{leaves.map((leave, index) => (
					<div
						key={index}
						className={`flex justify-center items-center h-8 w-8 m-2 ${getClassName(
							new Date(leave.date),
							[],
							leaves
						)}`}
					>
						{new Date(leave.date).getDate()}
					</div>
				))}
			</div>
			<div className="text-center text-sm text-gray-500 dark:text-gray-300 font-medium">
				Missed logging any leave?
				<button
					type="button"
					className="px-3 ease-out duration-300 font-medium hover:font-semibold leading-6 text-indigo-600 hover:text-indigo-700 dark:text-gray-300 dark:hover:text-gray-200 cursor-pointer"
					onClick={() => setIsFormVisible(true)}
				>
					Update here
				</button>
			</div>
			{isFormVisible && (
				<div className="fixed inset-0 overflow-y-auto bg-black bg-opacity-50 z-10">
					<LeaveForm onClose={handleCloseForm} />
				</div>
			)}
		</>
	);
}
