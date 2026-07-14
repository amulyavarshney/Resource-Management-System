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
import userService from "@/app/api/services/user";

export default function ConsolidatedReport({ year, month }: ExportFileProps) {
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
				a.project_title.localeCompare(b.project_title)
			);
			const consolidatedReport = [];
			const consolidatedTimingReport = [];
			let totalExtHours = 0,
				totalIntHours = 0;
			for (const projectData of projectDashboard) {
				const {
					project_number,
					project_title,
					business,
					department,
					total_int_work_hours,
					total_ext_work_hours,
					total_work_hours,
					users: projectUsers,
				} = projectData;
				for (const user of projectUsers ?? []) {
					const {
						is_external,
						week1_hours = 0,
						week2_hours = 0,
						week3_hours = 0,
						week4_hours = 0,
						week5_hours = 0,
					} = user;
					const fullName = userService.getFullName(user);
					let extHours = 0,
						intHours = 0;
					if (is_external) {
						extHours =
							(week1_hours ?? 0) +
							(week2_hours ?? 0) +
							(week3_hours ?? 0) +
							(week4_hours ?? 0) +
							(week5_hours ?? 0);
						totalExtHours += extHours;
					} else {
						intHours =
							(week1_hours ?? 0) +
							(week2_hours ?? 0) +
							(week3_hours ?? 0) +
							(week4_hours ?? 0) +
							(week5_hours ?? 0);
						totalIntHours += intHours;
					}
					consolidatedReport.push({
						projectNumber: project_number,
						projectTitle: project_title,
						business: business ?? department,
						fullName,
						type: is_external ? "EXT" : "FTE",
						intHours,
						extHours,
					});
				}
				consolidatedTimingReport.push({
					projectNumber: project_number,
					projectTitle: project_title,
					business: business ?? department,
					totalIntWorkHours: total_int_work_hours,
					totalExtWorkHours: total_ext_work_hours,
					totalWorkHours: total_work_hours,
				});
			}
			const header: Header = {
				"Consolidated Report": [
					[`${weeksList.getMonthName(month)}, ${year}`, "", "", "", "", "", ""],
				],
				"Consolidated Timing Report": [
					[`${weeksList.getMonthName(month)}, ${year}`, "", "", "", "", ""],
				],
			};
			const headings: Heading = {
				"Consolidated Report": [
					"Project Number",
					"Project Title",
					"Business",
					"Name",
					"Employee Type",
					"FTE Hours",
					"EXT Hours",
				],
				"Consolidated Timing Report": [
					"Project Number",
					"Project Title",
					"Business",
					"Total FTE Hours",
					"Total EXT Hours",
					"Total Hours",
				],
			};
			const dataToExport = {
				"Consolidated Report": consolidatedReport,
				"Consolidated Timing Report": consolidatedTimingReport,
			};
			const footer: Footer = {
				"Consolidated Report": [
					["", "", "", "", "TOTAL", totalIntHours, totalExtHours],
					[
						"",
						"",
						"",
						"",
						"TOTAL HOURS",
						"(EXT+FTE)",
						totalIntHours + totalExtHours,
					],
				],
				"Consolidated Timing Report": [
					[
						"",
						"",
						"TOTAL",
						dashboard.total_int_work_hours,
						dashboard.total_ext_work_hours,
						dashboard.total_work_hours,
					],
					// ["", "Total Hours", dashboard.total_work_hours],
					// ["", "Total Internal Hours", dashboard.total_int_work_hours],
					// ["", "Total External Hours", dashboard.total_ext_work_hours],
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
					.department} Consolidated Report - ${weeksList.getMonthName(
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
		<button
			className="py-3 cursor-pointer"
			title="Download Consolidated Report"
			onClick={exportReportToExcel}
		>
			<Image src="/xls.png" width={40} height={40} alt="Export button" />
		</button>
	);
};