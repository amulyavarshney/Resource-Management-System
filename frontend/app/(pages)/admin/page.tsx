"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Role } from "@/nextauth.d";
import Unauthorized from "@/app/components/Unauthorized";
import AddHolidays from "./components/AddHolidays";
import AddProjects from "./components/AddProjects";
import AddUsers from "./components/AddUsers";
import DeleteHolidays from "./components/DeleteHolidays";
import DeleteProjects from "./components/DeleteProjects";
import DeleteUsers from "./components/DeleteUsers";
import UpdateProjects from "./components/UpdateProjects";
import UpdateUsers from "./components/UpdateUsers";
import LockTimesheet from "./components/LockTimesheet";
import UserList from "./components/UserList";

const components: Record<string, React.FC> = {
	"Add Users": AddUsers,
	"Add Projects": AddProjects,
	"Add Holidays": AddHolidays,
	"Update Users": UpdateUsers,
	"Update Projects": UpdateProjects,
	"Delete Users": DeleteUsers,
	"Delete Projects": DeleteProjects,
	"Delete Holidays": DeleteHolidays
};

export default function AdminPage() {
	const { data: session } = useSession();
	const [selectedComponent, setSelectedComponent] = useState("Add Users");

	const ComponentToRender = components[selectedComponent];

	if (
		session?.user?.role === Role.Employee ||
		session?.user.role === Role.Management
	) {
		return <Unauthorized />;
	}

	return (
		session?.user?.role && (
			<div className="min-h-screen flex flex-col sm:flex-row justify-around items-center sm:items-start">
				<div className="w-fit">
					<div className="m-2 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-md rounded-md">
						<select
							value={selectedComponent}
							onChange={(e) => setSelectedComponent(e.target.value)}
							className="my-1 w-full p-2 bg-gray-300 dark:bg-gray-600 border border-gray-500 dark:border-gray-400 rounded-md shadow-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
						>
							{Object.keys(components).map((key) => (
								<option key={key} value={key}>
									{key}
								</option>
							))}
						</select>
						<ComponentToRender />
					</div>
				</div>
				<div className="w-fit flex-col">
					<UserList />
					<LockTimesheet />
				</div>
			</div>
		)
	);
}
