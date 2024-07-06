import React, { useState } from "react";
import { toast } from "react-hot-toast";
import holidayService from "@/app/api/services/holiday";
import projectService from "@/app/api/services/project";
import userService from "@/app/api/services/user";

export enum AddField {
	Projects = "Projects",
	Users = "Users",
	Holidays = "Holidays",
}

export default function ImportFromExcel({ field }: { field: AddField }) {
	const [file, setFile] = useState<File | null>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (files && files.length > 0) {
			setFile(files[0]);
		}
	};

	const handleImport = async () => {
		const formData = new FormData();
		formData.append("excelFile", file as File);
		if (file) {
			if (field === AddField.Projects) {
				await projectService.importProjects(formData);
			} else if (field === AddField.Users) {
				await userService.importUsers(formData);
			} else if (field === AddField.Holidays) {
				await holidayService.importHolidays(formData);
			}
		} else {
			toast.error("Please select a file to import.");
		}
	};

	return (
		<div className="m-2 flex flex-col items-center justify-center space-y-2">
			<label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
				Import {field.toString()} from Excel
			</label>
			<div className="flex flex-col sm:flex-row items-center space-x-4 space-y-4 sm:space-y-0">
				<input
					type="file"
					accept=".xlsx, .xls"
					onChange={handleFileChange}
					className="dark:[color-scheme:dark] p-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-md text-xs text-gray-700 dark:text-gray-300 leading-4 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				/>
				<button
					onClick={handleImport}
					className="inline-flex items-center px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
				>
					Import
				</button>
			</div>
		</div>
	);
}
