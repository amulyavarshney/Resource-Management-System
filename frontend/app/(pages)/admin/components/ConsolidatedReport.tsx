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
				a.projectTitle.localeCompare(b.projectTitle)
			);
			const consolidatedReport = [];
			const consolidatedTimingReport = [];
			let totalExtHours = 0,
				totalIntHours = 0;
			for (const projectData of projectDashboard) {
				const {
					projectNumber,
					projectTitle,
					business,
					department,
					totalIntWorkHours,
					totalExtWorkHours,
					totalWorkHours,
					users: projectUsers,
				} = projectData;
				for (const user of projectUsers) {
					const {
						isExternal,
						week1Hours,
						week2Hours,
						week3Hours,
						week4Hours,
						week5Hours,
					} = user;
					const fullName = userService.getFullName(user);
					let extHours = 0,
						intHours = 0;
					if (isExternal) {
						extHours =
							week1Hours + week2Hours + week3Hours + week4Hours + week5Hours;
						totalExtHours += extHours;
					} else {
						intHours =
							week1Hours + week2Hours + week3Hours + week4Hours + week5Hours;
						totalIntHours += intHours;
					}
					consolidatedReport.push({
						projectNumber,
						projectTitle,
						business: business ?? department,
						fullName,
						type: isExternal ? "EXT" : "FTE",
						intHours,
						extHours,
					});
				}
				consolidatedTimingReport.push({
					projectNumber,
					projectTitle,
					business: business ?? department,
					totalIntWorkHours,
					totalExtWorkHours,
					totalWorkHours,
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
						dashboard.totalIntWorkHours,
						dashboard.totalExtWorkHours,
						dashboard.totalWorkHours,
					],
					// ["", "Total Hours", dashboard.totalWorkHours],
					// ["", "Total Internal Hours", dashboard.totalIntWorkHours],
					// ["", "Total External Hours", dashboard.totalExtWorkHours],
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