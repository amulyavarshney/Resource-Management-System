import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Role } from "@/nextauth.d";
import packageInfo from "@/package.json";
import Navigator from "./Navigator";

export type NavItem = {
	name: string;
	href: string;
	show: boolean;
};

const { name, version } = packageInfo;

export default function Navbar() {
	const path = usePathname();
	const { data: session } = useSession();

	const navigation: NavItem[] = [
		{ name: "Home", href: "/home", show: true },
		{
			name: "Timesheet",
			href: "/timesheet",
			show: session?.user.role !== Role.Executive,
		},
		{
			name: "View",
			href: "/view",
			show: session?.user.role !== Role.Executive,
		},
		{ name: "Holidays", href: "/holidays", show: true },
		{
			name: "Dashboard",
			href: "/dashboard",
			show: session?.user.role !== Role.Employee,
		},
		{
			name: "Admin Page",
			href: "/admin",
			show:
				session?.user.role !== Role.Employee &&
				session?.user.role !== Role.Management,
		},
	];

	return (
		<nav className="w-full mx-auto sm:mx-0 px-2 bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-900 shadow-xl">
			<div className="flex justify-between h-16">
				<div className="flex">
					<div className="flex-shrink-0 flex items-center">
						<Image
							width={40}
							height={40}
							src="/company_logo.svg"
							alt="Company Logo"
						/>
					</div>
					<div className="sm:hidden ml-6 mt-4">
						<h1 className="font-bold text-lg text-indigo-900 dark:text-white">{name}</h1>
						<h5 className="text-xs text-indigo-800 dark:text-white">v{version}</h5>
					</div>
					<div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8 cursor-pointer">
						{navigation.map(
							(item) =>
								item.show && (
									<Link
										key={item.name}
										href={item.href}
										className={`px-1 pt-1 inline-flex items-center font-medium text-sm sm:text-md border-b-2 hover:text-indigo-800 hover:border-indigo-800 dark:hover:text-gray-100 dark:hover:border-gray-100 ${
											path === item.href
												? "text-indigo-900 border-indigo-900 dark:text-gray-200 dark:border-gray-200"
												: "text-indigo-700 dark:text-white border-transparent"
										}`}
									>
										{item.name}
									</Link>
								)
						)}
					</div>
				</div>
				<Navigator navigation={navigation} />
			</div>
		</nav>
	);
}
