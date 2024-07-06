import React, { useState, useEffect } from "react";
import weekDataService, { WeekDataKey } from "@/app/api/services/weekData";
import { Week } from "@/app/api/services/weeksList";

interface WeekInputProps {
	userId: number;
	projectId: number;
	year: number;
	month: number;
	weeks: Week[];
	isLocked: boolean;
	updateWeeklyData: (projectId: number, data: number[]) => void;
}

const WeekInput = ({
	userId,
	projectId,
	year,
	month,
	weeks,
	isLocked,
	updateWeeklyData,
}: WeekInputProps) => {
	const numWeeks = weeks.length;
	const [weekData, setWeekData] = useState<number[]>(Array(numWeeks).fill(0));
	const [total, setTotal] = useState(0);

	useEffect(() => {
		const key: WeekDataKey = {
			userId,
			projectId,
			year,
			month,
		};

		const loadWorkHours = async () => {
			const weekData = await weekDataService.getWorkHourArray(key);
			setWeekData(weekData);
			setTotal(weekData.reduce((acc, val) => acc + val, 0));
			updateWeeklyData(projectId, weekData);
		};

		loadWorkHours();
	}, []);

	const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
		if (e.target.value === "0") {
			e.target.value = "";
		}
	};

	const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		if (e.target.value === "") {
			e.target.value = "0";
		}
	};

	const handleInputChange = (idx: number, value: string) => {
		const parsedValue = parseInt(value, 10) || 0;
		if (parsedValue > weeks[idx].days * 8) {
			alert(`Input should be less than or equal to ${weeks[idx].days * 8}`);
			return;
		}
		const newWeekData = [...weekData];
		newWeekData[idx] = parsedValue;
		setWeekData(newWeekData);

		const newTotal = newWeekData.reduce((acc, val) => acc + val, 0);
		setTotal(newTotal);

		updateWeeklyData(projectId, newWeekData);
	};

	const handleKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>,
		idx: number
	) => {
		if (e.key === "ArrowRight" && idx < weekData.length - 1) {
			(
				document.getElementById(
					`project${projectId}week${idx + 2}`
				) as HTMLInputElement
			).focus();
		} else if (e.key === "ArrowLeft" && idx > 0) {
			(
				document.getElementById(
					`project${projectId}week${idx}`
				) as HTMLInputElement
			).focus();
		}
	};

	return (
		<>
			{weekData.map(
				(value, index) =>
					index < numWeeks && (
						<td key={index} className="px-6 py-1 whitespace-nowrap">
							<div className="flex justify-center items-center">
								<input
									id={`project${projectId}week${index + 1}`}
									name={`week${index + 1}`}
									value={value ?? 0}
									onFocus={handleInputFocus}
									onBlur={handleInputBlur}
									onChange={(e) => {
										e.target.value = e.target.value.replace(/[^0-9]/g, "");
										handleInputChange(index, e.target.value);
									}}
									onKeyDown={(e) => handleKeyDown(e, index)}
									min={0}
									step={1}
									required={index !== 4}
									type="text"
									maxLength={3}
									className="dark:[color-scheme:dark] block w-12 p-1 text-center border border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-200 dark:focus:border-gray-200 text-base sm:text-sm"
									disabled={isLocked}
								/>
							</div>
						</td>
					)
			)}
			<td className="px-6 py-2 text-lg text-center font-bold text-blue-800 dark:text-blue-500 whitespace-nowrap border dark:border-gray-600">
				{total}
			</td>
		</>
	);
};

export default WeekInput;
