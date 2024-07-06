"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useDate } from "@/app/contexts/DateContext";
import { useSearch } from "@/app/contexts/SearchContext";
import { Role } from "@/nextauth.d";
import Loading from "@/app/components/Loading";
import Unauthorized from "@/app/components/Unauthorized";
import DashboardTable from "./DashboardTable";
import dashboardService, {
	ProjectDashboardViewModel,
} from "@/app/api/services/dashboard";

export default function Dashboard() {
	const { data: session } = useSession();
	const [loading, setLoading] = useState(true);
	const [sortConfig, setSortConfig] = useState({
		column: "projectTitle",
		isAscending: true,
	});
	const [projectData, setProjectData] = useState<ProjectDashboardViewModel[]>(
		[]
	);
	const [totals, setTotals] = useState({ extWorkHours: 0, workHours: 0 });
	const { year, month } = useDate();
	const { search } = useSearch();

	function toLowerCase(input: number | string): number | string {
		if (typeof input === "string") {
			return input.toLowerCase();
		}
		return input;
	}

	const loadAndSortProjectDashboard = async () => {
		const fetchedDashboard = await dashboardService.getProjectDashboard(
			year,
			month,
			session?.user.department,
			session?.user.region
		);

		// Filter the project dashboard data based on search string
		const filteredDashboard = search
			? fetchedDashboard.filter(
					(data) =>
						data.projectNumber.includes(search) ||
						data.projectTitle.toLowerCase().includes(search.toLowerCase())
			  )
			: fetchedDashboard;

		let total = { extWorkHours: 0, workHours: 0 };
		filteredDashboard.forEach((data) => {
			total.extWorkHours += data.totalExtWorkHours;
			total.workHours += data.totalWorkHours;
		});
		setTotals(total);

		// Sort the project dashboard data based on selected column
		const sortedDashboard = filteredDashboard.sort((a, b) => {
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

		setProjectData(sortedDashboard);
		setLoading(false);
	};

	useEffect(() => {
		loadAndSortProjectDashboard();
	}, [year, month, search, sortConfig]);

	if (loading) {
		return <Loading />;
	}

	if (session?.user?.role === Role.Employee) {
		return <Unauthorized />;
	}

	return (
		session?.user?.role && (
			<div className="">
				<div className="flex flex-col p-6">
					<div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
						<div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
							<div className="w-full min-h-fit max-h-[80vh] shadow-md overflow-x-auto border-b border-gray-200 sm:rounded-lg">
								<DashboardTable
									year={year}
									month={month}
									projectData={projectData}
									totals={totals}
									sortConfig={sortConfig}
									setSortConfig={setSortConfig}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	);
}
