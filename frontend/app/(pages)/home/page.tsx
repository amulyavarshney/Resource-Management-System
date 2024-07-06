"use client";
import Image from "next/image";
import React from "react";
import { useSession } from "next-auth/react";
import { Role } from "@/nextauth.d";
import HolidaysThisMonth from "./HolidaysThisMonth";
import packageInfo from "@/package.json";
import Timer from "@/app/components/Timer";
import HeaderLink from "@/app/components/HeaderLink";

export default function Home() {
	const { name, version } = packageInfo;
	const deadline = new Date();
	const { data: session } = useSession();
	return (
		<div className="min-h-max flex flex-col">
			<header className="hidden sm:block m-10 text-center space-y-5">
				<h1 className="text-5xl font-bold text-indigo-900 dark:text-white">
					Welcome to {name}
				</h1>
				<p className="text-lg font-semibold text-indigo-800 dark:text-white">
					Version {version}
				</p>
			</header>
			<div className="h-full flex-col px-4 space-y-5">
				<Timer deadline={deadline} />
				<div className="sm:flex space-y-5 sm:space-x-5 sm:space-y-0 justify-between items-center p-6">
					<HolidaysThisMonth />
					<div className="sm:flex space-y-5 sm:space-x-5 sm:space-y-0">
						{session?.user.role != Role.Executive && (
							<HeaderLink
								href="/timesheet"
								title="Fill Timesheet"
								className="text-lg"
								isButton={true}
							/>
						)}
						{(session?.user.role == Role.Admin ||
							session?.user.role == Role.Developer) && (
							<HeaderLink
								href="/admin"
								title="Go to Admin Page"
								className="text-lg"
								isButton={true}
							/>
						)}
					</div>
					<Image
						src="/timesheet.png"
						alt="Timesheet"
						width={500}
						height={500}
						className="hidden sm:block"
					/>
				</div>
				<div className="flex justify-end"></div>
			</div>
			<footer className="w-full sticky bottom-0">
				<div className="p-4 text-indigo-600 border-t-2 shadow-[rgba(0,0,0,0.1)_0_20px_25px_-5px] bg-gray-100 dark:bg-gray-800 dark:text-white">
					<p>
						&copy; {new Date().getFullYear()} {name}. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
