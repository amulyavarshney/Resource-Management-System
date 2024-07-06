import { useSession } from "next-auth/react";
import Image from "next/image";
import toast from "react-hot-toast";
import { utils, writeFile } from "xlsx-js-style";
import dashboardService from "@/app/api/services/dashboard";
import weeksList from "@/app/api/services/weeksList";
import {
	Header,
	Heading,
	Footer,
	ExportFileProps,
	applyStylesToExcel,
} from "@/app/components/ExcelStyles";
import { sortUsersDashboard } from "@/app/api/services/utils";

const DashboardReport = ({ year, month }: ExportFileProps) => {
	const { data: session } = useSession();
	const exportReportToExcel = async () => {
		try {
			const dashboard = await dashboardService.getDashboard(
				year,
				month,
				session?.user.department,
				session?.user.region
			);
			const projectDashboard = await dashboardService.getProjectDashboard(
				year,
				month,
				session?.user.department,
				session?.user.region
			);
			projectDashboard.sort((a, b) =>
				a.projectTitle.localeCompare(b.projectTitle)
			);
			let userDashboard = await dashboardService.getUserDashboard(
				year,
				month,
				session?.user.department,
				session?.user.region
			);
			userDashboard = sortUsersDashboard(userDashboard);

			const projectDashboardReport = [],
				userDashboardReport = [];

			for (const projectData of projectDashboard) {
				const {
					projectNumber,
					projectTitle,
					totalIntUsers,
					totalExtUsers,
					totalUsers,
					totalIntWorkHours,
					totalExtWorkHours,
					totalWorkHours,
				} = projectData;
				projectDashboardReport.push({
					projectNumber,
					projectTitle,
					totalIntUsers,
					totalExtUsers,
					totalUsers,
					totalIntWorkHours,
					totalExtWorkHours,
					totalWorkHours,
				});
			}

			const weekTotal = {
				week1: 0,
				week2: 0,
				week3: 0,
				week4: 0,
				week5: 0,
			};

			for (const userData of userDashboard) {
				const { userId, email, isExternal, projects, ...userMetrics } =
					userData;
				const name = dashboardService.getFullName(userData);
				userMetrics.type = isExternal ? "EXT" : "FTE";
				const {
					type,
					totalProjects,
					totalWeek1Hours,
					totalWeek2Hours,
					totalWeek3Hours,
					totalWeek4Hours,
					totalWeek5Hours,
					totalHours,
				} = userMetrics;
				userDashboardReport.push({
					name,
					type,
					totalProjects,
					totalWeek1Hours,
					totalWeek2Hours,
					totalWeek3Hours,
					totalWeek4Hours,
					totalWeek5Hours,
					totalHours,
				});

				weekTotal.week1 += totalWeek1Hours;
				weekTotal.week2 += totalWeek2Hours;
				weekTotal.week3 += totalWeek3Hours;
				weekTotal.week4 += totalWeek4Hours;
				weekTotal.week5 += totalWeek5Hours;
			}

			const header: Header = {
				"Project Dashboard": [
					[
						`${weeksList.getMonthName(month)}, ${year}`,
						"",
						"",
						"",
						"",
						"",
						"",
						"",
					],
					[
						`${session?.user.department} `,
						"",
						"",
						"",
						"",
						"",
						"",
						"",
					],
					[
						`${session?.user.region} `,
						"",
						"",
						"",
						"",
						"",
						"",
						"",
					],
				],
				"User Dashboard": [
					[
						`${weeksList.getMonthName(month)}, ${year}`,
						"",
						"",
						"",
						"",
						"",
						"",
						"",
						"",
					],
					[
						`${session?.user.department} `,
						"",
						"",
						"",
						"",
						"",
						"",
						"",
					],
					[
						`${session?.user.region} `,
						"",
						"",
						"",
						"",
						"",
						"",
						"",
					],
				],
			};
			const headings: Heading = {
				"Project Dashboard": [
					"Project Number",
					"Project Title",
					"Total FT Employees",
					"Total EXT Employees",
					"Total Employees",
					"Total FTE Hours",
					"Total EXT Hours",
					"Total Hours",
				],
				"User Dashboard": [
					"Name",
					"Employee Type",
					"Total Projects",
					"Week1",
					"Week2",
					"Week3",
					"Week4",
					"Week5",
					"Total Hours",
				],
			};
			const dataToExport = {
				"Project Dashboard": projectDashboardReport,
				"User Dashboard": userDashboardReport,
			};
			const footer: Footer = {
				"Project Dashboard": [
					[
						"",
						"TOTAL",
						"",
						"",
						"",
						dashboard.totalIntWorkHours,
						dashboard.totalExtWorkHours,
						dashboard.totalWorkHours,
					],
				],
				"User Dashboard": [
					[
						"",
						"TOTAL",
						"",
						weekTotal.week1,
						weekTotal.week2,
						weekTotal.week3,
						weekTotal.week4,
						weekTotal.week5,
						dashboard.totalWorkHours,
					],
				],
			};

			const json = JSON.stringify(dataToExport, null, 2);

			const jsonData = JSON.parse(json);
			const workbook = utils.book_new();

			for (let sectionName in jsonData) {
				const arrOfArr = jsonData[sectionName].map((obj: any) =>
					Object.values(obj)
				);
				const worksheet = utils.aoa_to_sheet([
					...header[sectionName],
					headings[sectionName],
					...arrOfArr,
					...footer[sectionName],
				]);

				applyStylesToExcel(
					worksheet,
					header[sectionName].length,
					footer[sectionName].length
				);

				utils.sheet_add_aoa(
					worksheet,
					[["Created at " + new Date().toISOString()]],
					{
						origin: -1,
					}
				);
				utils.book_append_sheet(workbook, worksheet, sectionName);
			}

			let fileName = prompt(
				"Please enter the name for the file:",
				`${session?.user
					.department} Dashboard Report - ${weeksList.getMonthName(
					month
				)} ${year}`
			);
			if (fileName) {
				writeFile(workbook, `${fileName}.xlsx`, {
					type: "binary",
					bookType: "xlsx",
					bookSST: true,
				});
			}
		} catch (error) {
			toast.error(`Failed to export data to JSON: ${error}`);
		}
	};

	return (
		<button title="Export Report to Excel" onClick={exportReportToExcel}>
			<Image src="/xls.png" width={40} height={40} alt="Export button" />
		</button>
	);
};

export default DashboardReport;
