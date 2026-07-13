"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDate } from "@/app/contexts/DateContext";
import { Role } from "@/nextauth.d";
import toast from "react-hot-toast";
import Loading from "@/app/components/Loading";
import Unauthorized from "@/app/components/Unauthorized";
import projectService from "@/app/api/services/project";
import weekDataService, {
	TimesheetRow,
	WeekDataKey,
} from "@/app/api/services/weekData";
import weeksList from "@/app/api/services/weeksList";
import Table from "./components/Table";
import { useSearch } from "@/app/contexts/SearchContext";
import { useWeeks } from "@/app/contexts/WeeksContext";
import TimesheetReport from "./components/TimesheetReport";
import Header from "./components/Header";

export default function Timesheet() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const { weeks, setWeeks } = useWeeks();
	const { search } = useSearch();
	const [sortConfig, setSortConfig] = useState<{
		column: keyof TimesheetRow;
		isAscending: boolean;
	}>({
		column: "project_title",
		isAscending: true,
	});
	const { year, month } = useDate();
	const numWeeks = weeks.length;
	const userId = session?.user.id || 0;
	const [rowData, setRowData] = useState<TimesheetRow[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth");
		}
	}, [status, router]);

	useEffect(() => {
		const loadWeeks = async () => {
			const data = await weeksList.getWeeksInMonth(year, month, userId);
			setWeeks(data);
		};
		loadWeeks();
	}, [year, month]);

	function toLowerCase(input?: number | string): number | string {
		if (typeof input === "string") {
			return input.toLowerCase();
		}
		return input ?? 0;
	}

	const filterAndSortRowData = async () => {
		try {
			const projects = await projectService.getProjectsByYearAndMonth(
				year,
				month,
				session?.user.department
			);
			const fetchedRowData: TimesheetRow[] = [];
			for (const project of projects) {
				const key: WeekDataKey = {
					user_id: userId,
					project_id: project.id,
					year,
					month,
				};
				const weekData = await weekDataService.getWorkHour(key);
				const totalHours = Object.values(weekData).reduce(
					(acc, val) => acc + (val || 0),
					0
				);
				fetchedRowData.push({
					project_id: project.id,
					project_number: project.number,
					project_title: project.title,
					week1Hours: weekData.week1,
					week2Hours: weekData.week2,
					week3Hours: weekData.week3,
					week4Hours: weekData.week4,
					week5Hours: weekData.week5 ?? 0,
					totalHours: totalHours,
				});
			}

			// Filter the row Data based on search string
			const filteredRowData = search
				? fetchedRowData.filter(
						(row) =>
							row.project_number.includes(search) ||
							row.project_title.toLowerCase().includes(search.toLowerCase())
				  )
				: fetchedRowData;

			// Sort the row data based on selected column
			const sortedRowData = filteredRowData.sort((a, b) => {
				const aValue = toLowerCase(a[sortConfig.column]);
				const bValue = toLowerCase(b[sortConfig.column]);

				if (aValue < bValue) {
					return sortConfig.isAscending ? -1 : 1;
				}
				if (aValue > bValue) {
					return sortConfig.isAscending ? 1 : -1;
				}
				return 0;
			});

			setRowData(sortedRowData);
			setLoading(false);
		} catch (error) {
			toast.error(`Failed to load Timesheet Data: ${error}`);
		}
	};

	useEffect(() => {
		filterAndSortRowData();
	}, [year, month, search, sortConfig]);

	const weeksSum = useMemo(() => {
		const newWeeksSum = Array(numWeeks + 1).fill(0);
		rowData.forEach((row) => {
			{
				Object.values(row).forEach((value, index) => {
					if (index > 2) newWeeksSum[index - 3] += value;
				});
			}
		});
		return newWeeksSum.slice(0, numWeeks + 1);
	}, [rowData]);

	if (status == "loading" || loading) {
		return <Loading />;
	}

	if (session?.user?.role === Role.Executive) {
		return <Unauthorized />;
	}

	return (
		session && (
			<div className="min-h-screen max-h-full">
				<div className="flex justify-between items-start">
					<Header />
					<div className="px-2 py-4">
						<TimesheetReport
							year={year}
							month={month}
							userId={userId}
							rowData={rowData}
							weeksSum={weeksSum}
						/>
					</div>
				</div>
				<Table
					weeks={weeks}
					rowData={rowData}
					weeksSum={weeksSum}
					sortConfig={sortConfig}
					setSortConfig={setSortConfig}
				/>
			</div>
		)
	);
}
