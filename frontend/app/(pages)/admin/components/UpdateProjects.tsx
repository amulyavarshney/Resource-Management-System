import { useState, useEffect, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { Department, Region } from "@/nextauth.d";
import toast from "react-hot-toast";
import projectService, {
	Project,
	ProjectUpdateViewModel,
} from "@/app/api/services/project";

export default function UpdateProjects() {
	const { data: session } = useSession();
	const [projects, setProjects] = useState<Project[]>([]);
	const [project, setProject] = useState<
		ProjectUpdateViewModel & { id?: number }
	>();

	const fetchProjects = async () => {
		try {
			const data = await projectService.getProjects(session?.user.department);
			data.sort((a, b) => a.title.localeCompare(b.title));
			setProjects(data);
		} catch (error) {
			toast.error(`Error fetching projects: ${error}`);
		}
	};

	useEffect(() => {
		fetchProjects();
	}, []);

	const handleProjectSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedProjectId = parseInt(event.target.value);
		const selectedProject = projects.find(
			(project) => project.id === selectedProjectId
		);

		if (selectedProject) {
			const department = selectedProject.department
				.toString()
				.split(", ")
				// .map((value) => value.trim())
				.reduce(
					(acc, value) => acc | Department[value as keyof typeof Department],
					0
				);
			selectedProject.department = department;
			const region = selectedProject.region
				.toString()
				.split(", ")
				.reduce((acc, value) => acc | Region[value as keyof typeof Region], 0);
			selectedProject.region = region;
			selectedProject.id = selectedProjectId;
			setProject(selectedProject);
		}
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		setProject({ ...project, [e.target.name]: e.target.value });
	};

	const handleUpdate = async () => {
		if (project) {
			const projectUpdateViewModel: ProjectUpdateViewModel =
				project as ProjectUpdateViewModel;
			await projectService.updateProject(
				project.id ?? 0,
				projectUpdateViewModel
			);
			fetchProjects();
		} else {
			toast.error("Project not found.");
		}
	};

	return (
		<div className="p-2">
			<div className="flex w-full items-center rounded-full h-14">
				<div className="flex-1 border-b border-gray-300 dark:border-gray-600"></div>
				<div className="px-3 py-2 text-gray-700 dark:text-gray-300 text-sm font-semibold leading-7 rounded-full border border-gray-300 dark:border-gray-600">
					Select Project
				</div>
				<div className="flex-1 border-b border-gray-300 dark:border-gray-600"></div>
			</div>
			<select
				className="m-1 p-2 bg-gray-300 dark:bg-gray-600 border border-gray-500 dark:border-gray-400 rounded-md shadow-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
				onChange={handleProjectSelect}
			>
				<option value="">Select a Project</option>
				{projects.map((project) => (
					<option value={project.id} key={project.id}>
						{project.title}
					</option>
				))}
			</select>
			{project && (
				<div className="m-1 flex flex-col items-center justify-center space-y-4 bg-white dark:bg-gray-900 rounded-xl shadow-xl">
					<nav className="p-2 w-full text-center text-md font-bold bg-gray-300 dark:bg-gray-700 rounded-t-md border-b border-gray-500 dark:border-gray-300">
						Update Project
					</nav>
					<form
						onSubmit={handleUpdate}
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
										<label
											key={key}
											className="flex items-center space-x-1 m-1"
										>
											<input
												type="checkbox"
												value={key}
												checked={
													((project.department ?? 0) &
														Department[key as keyof typeof Department]) !=
													0
												}
												onChange={(e: ChangeEvent<HTMLInputElement>) =>
													setProject({
														...project,
														department:
															(project.department ?? 0) ^
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
										<label
											key={key}
											className="flex items-center space-x-1 m-1"
										>
											<input
												type="checkbox"
												value={key}
												checked={
													((project.region ?? 0) &
														Region[key as keyof typeof Region]) !=
													0
												}
												onChange={(e: ChangeEvent<HTMLInputElement>) =>
													setProject({
														...project,
														region:
															(project.region ?? 0) ^
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
							Project Description
							<textarea
								placeholder="Project Description"
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
								Update Project
							</button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
}
