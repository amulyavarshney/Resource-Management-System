"use client";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSettings } from "@/app/contexts/SettingsContext";
import { useSearch } from "@/app/contexts/SearchContext";
import { Role } from "@/nextauth.d";
import Unauthorized from "@/app/components/Unauthorized";
import projectService, { Project } from "@/app/api/services/project";
import Table from "./components/Timesheet";
import { sortProjects } from "@/app/api/services/utils";

export default function Timesheet() {
	const { data: session } = useSession();
	const { search } = useSearch();
	const { showFavourites } = useSettings();

	const year = new Date().getFullYear();
	const month = new Date().getMonth() + 1;
	const userId = session?.user.id ?? 0;

	const [fetchedProjects, setFetchedProjects] = useState<Project[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [sortConfig, setSortConfig] = useState({
		column: "title",
		isAscending: true,
	});
	const [favourites, setFavourites] = useState<number[]>([]);

	const fetchProjects = async () => {
		const fetchedProjects = await projectService.getProjectsByYearAndMonth(
			year,
			month,
			session?.user.department
		);
		setFetchedProjects(fetchedProjects);
	};

	useEffect(() => {
		fetchProjects();
	}, []);

	const filterAndSortProjects = async (fetchedProjects: Project[]) => {
		try {
			const favouritesSet = new Set(favourites);

			let filteredProjects = showFavourites
				? fetchedProjects.filter((project) => favouritesSet.has(project.id))
				: fetchedProjects;

			filteredProjects = search
				? filteredProjects.filter(
						(project) =>
							project.number.includes(search) ||
							project.title.toLowerCase().includes(search.toLowerCase())
				  )
				: filteredProjects;

			// Separate projects into favourites and others
			const favouriteProjects = filteredProjects.filter((project) =>
				favouritesSet.has(project.id)
			);
			const otherProjects = filteredProjects.filter(
				(project) => !favouritesSet.has(project.id)
			);

			// Sort each group individually
			const sortedFavouriteProjects = sortProjects(
				favouriteProjects,
				sortConfig
			);
			const sortedOtherProjects = sortProjects(otherProjects, sortConfig);

			// Merge and finalize sorting
			const mergedProjects = [
				...sortedFavouriteProjects,
				...sortedOtherProjects,
			];

			setProjects(mergedProjects);
		} catch (error) {
			toast.error(`Failed to filter and sort projects: ${error}`);
		}
	};

	useEffect(() => {
		filterAndSortProjects(fetchedProjects);
	}, [fetchedProjects, showFavourites, favourites, search, sortConfig]);

	useEffect(() => {
		const key = `favouriteProjects-${userId}`;
		const storedFavourites = localStorage.getItem(key);
		if (storedFavourites) {
			setFavourites(JSON.parse(storedFavourites));
		}
	}, []);

	if (session?.user?.role === Role.Executive) {
		return <Unauthorized />;
	}

	return (
		<Table
			projects={projects}
			favouriteProjects={favourites}
			setFavouriteProjects={setFavourites}
			sortConfig={sortConfig}
			setSortConfig={setSortConfig}
		/>
	);
}
