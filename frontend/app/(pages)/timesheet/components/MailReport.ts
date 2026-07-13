import toast from "react-hot-toast";
import { utils, write } from "xlsx-js-style";
import mailService from "@/app/api/services/mail";
import leaveService, { LeaveSession } from "@/app/api/services/leave";
import projectService, { Project } from "@/app/api/services/project";
import userService, { User } from "@/app/api/services/user";
import weekDataService, {
	TimesheetRow,
	WeekDataKey,
} from "@/app/api/services/weekData";
import weeksList from "@/app/api/services/weeksList";
import {
	Header,
	Heading,
	Footer,
	applyStylesToExcel,
} from "@/app/components/ExcelStyles";

type TimesheetReportProps = {
	year: number;
	month: number;
	userId: number;
};

const MAX_HOURS = Number(process.env.NEXT_PUBLIC_MAX_HOURS) || 8;

export const generateReport = async (
	year: number,
	month: number,
	userId: number,
	rowData?: TimesheetRow[],
	weeksTotal?: number[]
) => {
	try {
		const leaves = await leaveService.getLeavesInMonth(year, month, userId);
		const formattedLeaves = leaves
			.map((leave) => {
				const day = new Date(leave.date).getDate();
				// const sessionAbbreviation =
				// 	LeaveSession[
				// 		leave?.session as unknown as keyof typeof LeaveSession
				// 	] === LeaveSession.FirstHalf
				// 		? "(F)"
				// 		: LeaveSession[
				// 				leave?.session as unknown as keyof typeof LeaveSession
				// 		  ] === LeaveSession.SecondHalf
				// 		? "(S)"
				// 		: "";
				const isHalfDay =
					LeaveSession[
						leave?.session as unknown as keyof typeof LeaveSession
					] === LeaveSession.HalfDay;
				return `${isHalfDay ? "(": ""}${day}${isHalfDay ? ")": ""}`;
			})
			.join(", ");
		const weeks = await weeksList.getWeeksInMonth(year, month, userId);
		const numWeeks = weeks.length;
		const totalDays = weeks.reduce((total, week) => total + week.days, 0);
		const user = await userService.getUser(userId);

		let projects: Project[] = [];
		const timesheet = [];
		let weeksSum = [0, 0, 0, 0, 0, 0];

		if (rowData) {
			rowData.forEach(
				(row) =>
					row.totalHours > 0 && timesheet.push(Object.values(row).slice(1))
			);
			weeksSum = weeksTotal ? weeksTotal : [0, 0, 0, 0, 0, 0];
		} else {
			projects = await projectService.getProjectsByYearAndMonth(
				year,
				month,
				user.department,
				user.region
			);
			projects.sort((a, b) => a.title.localeCompare(b.title));

			for (const project of projects) {
				const key: WeekDataKey = {
					user_id: userId,
					project_id: project.id,
					year,
					month,
				};
				const weekData = await weekDataService.getWorkHourArray(key);
				const { number, title } = project;
				const [week1, week2, week3, week4, week5] = weekData;
				const total = weekData.reduce((total, value) => total + value, 0);
				if (total > 0)
					timesheet.push({
						number,
						title,
						week1,
						week2,
						week3,
						week4,
						week5,
						total,
					});
				weeksSum[0] += week1;
				weeksSum[1] += week2;
				weeksSum[2] += week3;
				weeksSum[3] += week4;
				weeksSum[4] += week5;
				weeksSum[5] += total;
			}
		}

		const header: Header = {
			Timesheet: [
				[userService.getFullName(user), "", "", "", "", "", "", ""],
				[user.department.toLocaleString(), "", "", "", "", "", "", ""],
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
				leaves && [`Leaves: ${formattedLeaves}`, "", "", "", "", "", "", ""],
			],
		};

		const headings: Heading = {
			Timesheet: [
				"Project Number",
				"Project Title",
				"Week1 Hours",
				"Week2 Hours",
				"Week3 Hours",
				"Week4 Hours",
				"Week5 Hours",
				"Total Hours",
			],
		};

		const subHeadings: Heading = {
			Timesheet: [
				"",
				"",
				`(${weeks[0].days} days)`,
				`(${weeks[1].days} days)`,
				`(${weeks[2].days} days)`,
				`(${weeks[3].days} days)`,
				numWeeks > 4 ? `(${weeks[4]?.days} days)` : "(0 days)",
				`(${totalDays} days)`,
			],
		};

		const dataToExport = {
			Timesheet: timesheet,
		};

		const footer: Footer = {
			Timesheet: [
				["", "Total", ...weeksSum],
				["", "", "", "", "", "", "Max Hours", totalDays * MAX_HOURS],
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
				subHeadings[sectionName],
				...arrOfArr,
				...footer[sectionName],
			]);
			applyStylesToExcel(
				worksheet,
				header[sectionName].length,
				footer[sectionName].length,
				true
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
		return {
			workbook,
			user,
			totalProjects: rowData ? rowData.length : projects.length,
			totalHours: weeksSum[weeksSum.length - 1],
			totalDays,
		};
	} catch (error) {
		toast.error(`Failed to generate Excel: ${error}`);
	}
};

export const exportReportAndSendMail = async ({
	month,
	year,
	userId,
}: TimesheetReportProps) => {
	try {
		const res = await generateReport(year, month, userId);

		if (!res) {
			throw new Error("Failed to generate report");
		}

		const { workbook, user, totalProjects, totalHours, totalDays } = res;

		const wbout = write(workbook, {
			bookType: "xlsx",
			bookSST: true,
			type: "binary",
		});

		const blob = new Blob([s2ab(wbout)], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});

		// Convert blob to base64
		const reader = new FileReader();
		reader.readAsDataURL(blob);
		reader.onloadend = function () {
			const base64data = reader.result;
			// Now you have the Excel file as a base64 encoded string
			sendEmailWithAttachment(
				year,
				month,
				user,
				totalProjects,
				totalHours,
				totalDays * MAX_HOURS,
				base64data
			);
		};
	} catch (error) {
		toast.error(`Failed to export data to Excel: ${error}`);
	}
};

function s2ab(s: any) {
	const buf = new ArrayBuffer(s.length);
	const view = new Uint8Array(buf);
	for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
	return buf;
}

function sendEmailWithAttachment(
	year: number,
	month: number,
	user: User,
	totalProjects: number,
	totalHours: number,
	maxHours: number,
	base64data: string | ArrayBuffer | null
) {
	// const dataUrl = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64data}`;
	const attachments = base64data ? [base64data.toString()] : [];

	const message = `<div>
		<p>Dear ${userService.getFullName(user)},</p>
		<h4>Your work hours for the month of ${weeksList.getMonthName(
			month
		)} ${year} have been successfully saved.</h4>
		<p>Please find attached your timesheet report for reference.</p>
		<table border="1" cellspacing="0" cellpadding="5">
        	<tr>
        	    <th>Total Projects</th>
        	    <td>${totalProjects}</td>
        	</tr>
        	<tr>
        	    <th>Total Work Hours</th>
        	    <td>${totalHours}/${maxHours}</td>
        	</tr>
    	</table>
		<p>For any further inquiries or assistance, please do not hesitate to contact us. However, please note that this email is a system-generated confirmation and does not require a response.</p>
		<p>Thank you for your cooperation. We appreciate your hard work and dedication.</p>
		<p>Best Wishes,</p>
		<p>Team Timesheet</p>
	</div>`;

	// Call your mail service's send method
	mailService.send(
		`Timesheet is saved for ${weeksList.getMonthName(month)} ${year}`,
		message,
		"Normal",
		[user.email],
		[],
		[],
		attachments
	);
}
