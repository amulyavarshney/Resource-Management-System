import Image from "next/image";
import toast from "react-hot-toast";
import { writeFile } from "xlsx-js-style";
import weeksList from "@/app/api/services/weeksList";
import { TimesheetRow } from "@/app/api/services/weekData";
import { generateReport } from "@/app/(pages)/timesheet/components/MailReport";

type TimesheetReportProps = {
	year: number;
	month: number;
	userId: number;
	rowData: TimesheetRow[];
	weeksSum: number[];
};

const TimesheetReport = ({
	month,
	year,
	userId,
	rowData,
	weeksSum,
}: TimesheetReportProps) => {
	const exportReportToExcel = async () => {
		try {
			const res = await generateReport(year, month, userId, rowData, weeksSum);

			if (!res) {
				throw new Error("Failed to generate report");
			}

			const { workbook } = res;

			let fileName = prompt(
				"Please enter the name for the file:",
				`Timesheet Report - ${weeksList.getMonthName(month)} ${year}`
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
			className="cursor-pointer"
			title="Export Timesheet to Excel"
			onClick={exportReportToExcel}
		>
			<Image src="/xls.png" width={40} height={40} alt="Export Timesheet" />
		</button>
	);
};

export default TimesheetReport;
