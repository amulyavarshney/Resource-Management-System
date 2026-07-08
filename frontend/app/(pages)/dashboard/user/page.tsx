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
	UserDashboardViewModel,
} from "@/app/api/services/dashboard";

export default function Dashboard() {
	const { data: session } = useSession();
	const [loading, setLoading] = useState(true);
	const [sortConfig, setSortConfig] = useState({
		column: "name",
		isAscending: true,
	});
	const [userData, setUserData] = useState<UserDashboardViewModel[]>([]);
	const [totals, setTotals] = useState({
		week1Hours: 0,
		week2Hours: 0,
		week3Hours: 0,
		week4Hours: 0,
		week5Hours: 0,
		totalHours: 0,
	});
	const { year, month } = useDate();
	const { search } = useSearch();

	function toLowerCase(
		input: boolean | number | string
	): boolean | number | string {
		if (typeof input === "string") {
			return input.toLowerCase();
		}
		return input;
	}

	const loadAndSortUserDashboard = async () => {
		const fetchedDashboard = await dashboardService.getUserDashboard(
			year,
			month,
			session?.user.department,
			session?.user.region
		);

		// Filter the user dashboard data based on search string
		const filteredDashboard = search
			? fetchedDashboard.filter(
					(data) =>
						dashboardService.getFullName(data).toLowerCase().includes(search.toLowerCase()) ||
						data.email.includes(search)
			  )
			: fetchedDashboard;

		let total = {
			week1Hours: 0,
			week2Hours: 0,
			week3Hours: 0,
			week4Hours: 0,
			week5Hours: 0,
			totalHours: 0,
		};
		filteredDashboard.forEach((data) => {
			total.week1Hours += data.total_week1_hours;
			total.week2Hours += data.total_week2_hours;
			total.week3Hours += data.total_week3_hours;
			total.week4Hours += data.total_week4_hours;
			total.week5Hours += data.total_week5_hours;
			total.totalHours += data.totalHours;
		});
		setTotals(total);

		// Sort the user dashboard data based on selected column
		const sortedDashboard = filteredDashboard.sort((a, b) => {
			let aValue, bValue;
			if(sortConfig.column === "name") {
				aValue = dashboardService.getFullName(a).toLowerCase();
				bValue = dashboardService.getFullName(b).toLowerCase();
			} 
			else {
				aValue = toLowerCase(a[sortConfig.column]);
				bValue = toLowerCase(b[sortConfig.column]);
			}

			if (aValue < bValue) {
				return sortConfig.isAscending ? -1 : 1;
			}
			if (aValue > bValue) {
				return sortConfig.isAscending ? 1 : -1;
			}
			return 0;
		});

		setUserData(sortedDashboard);
		setLoading(false);
	};

	useEffect(() => {
		loadAndSortUserDashboard();
	}, [year, month, search, sortConfig]);

	if (loading) {
		return <Loading />;
	}

	if (session?.user?.role === Role.Employee) {
		return <Unauthorized />;
	}

	return (
		session?.user?.role && (
			<div>
				<div className="flex flex-col p-6">
					<div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
						<div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
							<div className="w-full min-h-fit max-h-[80vh] shadow-md overflow-x-auto sm:rounded-lg">
								<DashboardTable
									year={year}
									month={month}
									userData={userData}
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
