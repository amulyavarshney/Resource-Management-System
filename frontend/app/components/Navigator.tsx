"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { NavItem } from "./Navbar";
import UserPopover from "./UserPopover";

type NavigatorProps = {
	navigation: NavItem[];
};

export default function Navigator({ navigation }: NavigatorProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [isNavVisible, setNavVisible] = useState<boolean>(false);
	const [isDropdown, setDropdown] = useState<boolean>(false);

	const userDropdown: NavItem[] = [
		{ name: "My Profile", href: "/profile", show: true },
	];

	useEffect(() => {
		const handleClickOutside = () => {
			setDropdown(false);
			setNavVisible(false);
		};
		document.addEventListener("click", handleClickOutside);
		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, [isDropdown, isNavVisible]);

	return (
		<div className="flex">
			{pathname === "/profile" ? (
				<button
					className="invisible sm:visible absolute top-4 right-0 text-indigo-600 hover:text-indigo-800 dark:text-white dark:hover:text-gray-200 px-3 py-2 text-sm font-medium cursor-pointer"
					onClick={() => {
						router.push("/api/auth/signout");
					}}
				>
					Sign Out
				</button>
			) : (
				<div className="group mx-3 my-2 invisible sm:visible absolute top-1.5 right-0 dark:border-2 rounded-full shadow-xl cursor-pointer">
					<Image
						src="/user.svg"
						alt="user"
						width={40}
						height={40}
						onClick={() => setDropdown(!isDropdown)}
						className="shadow-md rounded-full"
					/>
					<div
						className={`invisible ${
							!isDropdown && "group-hover:visible"
						} absolute top-14 right-0 z-10`}
					>
						<UserPopover />
					</div>
				</div>
			)}
			{isDropdown && (
				<div className="absolute top-16 right-0 w-fit bg-white dark:bg-gray-800 border dark:border-gray-900 shadow-lg z-10">
					<ul>
						{userDropdown.map(
							(item) =>
								item.show && (
									<li key={item.name} className="px-4 py-2 hover:bg-indigo-100 dark:hover:bg-gray-600">
										<Link
											href={item.href}
											className="text-indigo-600 hover:text-indigo-700 dark:text-gray-100 dark:hover:text-gray-200 text-md font-medium cursor-pointer"
											onClick={() => setDropdown(!isDropdown)}
										>
											{item.name}
										</Link>
									</li>
								)
						)}
						<hr className="mx-2 border-b-1 border-blueGray-300" />
						<li className="px-4 py-2 hover:bg-indigo-100 dark:hover:bg-gray-600">
							<button
								className="text-indigo-600 hover:text-indigo-800 dark:text-white dark:hover:text-gray-200 text-sm font-medium cursor-pointer"
								onClick={() => {
									router.push("/api/auth/signout");
								}}
							>
								Sign Out
							</button>
						</li>
					</ul>
				</div>
			)}
			<div className="sm:hidden flex-shrink-0 flex items-center">
				<button onClick={() => setNavVisible(!isNavVisible)} className="fill-indigo-800 dark:fill-white">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
					>
						<path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
					</svg>
				</button>
			</div>
			{isNavVisible && (
				<div className="sm:hidden absolute top-16 right-0 w-fit bg-white dark:bg-gray-800 border dark:border-gray-900 shadow-lg z-10">
					<ul>
						{[...navigation, ...userDropdown].map(
							(item) =>
								item.show && (
									<li key={item.name} className="px-4 py-2 hover:bg-indigo-100 dark:hover:bg-gray-600">
									<Link
										href={item.href}
										className="text-indigo-600 hover:text-indigo-700 dark:text-gray-100 dark:hover:text-gray-200 text-md font-medium cursor-pointer"
										onClick={() => setNavVisible(!isNavVisible)}
									>
										{item.name}
									</Link>
								</li>
								)
						)}
						<hr className="mx-2 border-b-1 border-blueGray-300" />
						<li className="px-4 py-2 hover:bg-indigo-100 dark:hover:bg-gray-600">
							<button
								className="text-indigo-600 hover:text-indigo-800 dark:text-white dark:hover:text-gray-200 text-sm font-medium cursor-pointer"
								onClick={() => {
									router.push("/api/auth/signout");
								}}
							>
								Sign Out
							</button>
						</li>
					</ul>
				</div>
			)}
		</div>
	);
}
