import { ChangeEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { Department, Region } from "@/nextauth.d";
import projectService, {
	ProjectCreateViewModel,
} from "@/app/api/services/project";
import ImportFromExcel, { AddField } from "./ImportFromExcel";

export default function AddProjects() {
	const { data: session } = useSession();
	const department = session?.user.department
		.toString()
		.split(", ")
		// .map((value) => value.trim())
		.reduce(
			(acc, value) => acc | Department[value as keyof typeof Department],
			0
		);
	const region = session?.user.region
		.toString()
		.split(", ")
		// .map((value) => value.trim())
		.reduce((acc, value) => acc | Region[value as keyof typeof Region], 0);
	const [project, setProject] = useState<ProjectCreateViewModel>({
		number: "",
		title: "",
		business: "",
		department: department ?? Department.None,
		region: region ?? Region.None,
		description: "",
	});

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		setProject({ ...project, [e.target.name]: e.target.value });
	};

	const handleAdd = async () => {
		await projectService.addProject(project);
	};

	return (
		<>
			<ImportFromExcel field={AddField.Projects} />
			<div className="m-1 flex flex-col items-center justify-center space-y-4 bg-white dark:bg-gray-900 rounded-xl shadow-xl">
				<nav className="p-2 w-full text-center text-md font-bold bg-gray-300 dark:bg-gray-700 rounded-t-md border-b border-gray-500 dark:border-gray-300">
					Add Project
				</nav>
				<form
					onSubmit={handleAdd}
					className="px-5 pb-3 w-full space-y-2 dark:[color-scheme:dark]"
				>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Project Number
						<input
							type="text"
							name="number"
							placeholder="Project Number"
							value={project.number}
							onChange={handleChange}
							className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
						/>
					</label>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Project Title
						<input
							type="text"
							name="title"
							placeholder="Project Title"
							value={project.title}
							onChange={handleChange}
							className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
						/>
					</label>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Business
						<input
							type="text"
							name="business"
							placeholder="Business"
							value={project.business}
							onChange={handleChange}
							className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
						/>
					</label>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Department
						<div className="flex flex-wrap">
							{Object.keys(Department)
								.filter((key) => isNaN(Number(key)))
								.map((key) => (
									<label key={key} className="flex items-center space-x-1 m-1">
										<input
											type="checkbox"
											value={key}
											checked={
												(project.department &
													Department[key as keyof typeof Department]) !=
												0
											}
											onChange={(e: ChangeEvent<HTMLInputElement>) =>
												setProject({
													...project,
													department:
														project.department ^
														Department[
															e.target.value as keyof typeof Department
														],
												})
											}
											className="form-checkbox h-5 w-5 text-indigo-600"
										/>
										<span>{key}</span>
									</label>
								))}
						</div>
					</label>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Region
						<div className="flex flex-wrap">
							{Object.keys(Region)
								.filter((key) => isNaN(Number(key)))
								.map((key) => (
									<label key={key} className="flex items-center space-x-1 m-1">
										<input
											type="checkbox"
											value={key}
											checked={
												(project.region & Region[key as keyof typeof Region]) !=
												0
											}
											onChange={(e: ChangeEvent<HTMLInputElement>) =>
												setProject({
													...project,
													region:
														project.region ^
														Region[e.target.value as keyof typeof Region],
												})
											}
											className="form-checkbox h-5 w-5 text-indigo-600"
										/>
										<span>{key}</span>
									</label>
								))}
						</div>
					</label>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Description
						<textarea
							name="description"
							placeholder="Description"
							value={project.description}
							onChange={(e) =>
								setProject({ ...project, description: e.target.value })
							}
							className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
						/>
					</label>
					<div className="flex justify-center">
						<button
							type="submit"
							className="py-2.5 px-5 text-xs bg-indigo-500 dark:bg-indigo-800 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-full cursor-pointer font-semibold text-center shadow-xs transition-all duration-500"
						>
							Add Project
						</button>
					</div>
				</form>
			</div>
		</>
	);
}
