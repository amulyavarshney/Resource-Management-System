"use client";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import { useSession } from "@/app/contexts/AuthContext";
import SearchBox from "@/app/components/SearchBox";
import { useSearch } from "@/app/contexts/SearchContext";
import YearMonthPicker from "@/app/components/YearMonthPicker";
import { useDate } from "@/app/contexts/DateContext";

const Header = () => {
	const { year, month, setYear, setMonth } = useDate();
	const { data: session } = useSession();
	const { search, setSearch } = useSearch();
	const [showUserData, setShowUserData] = useState(false);

	const handleDateChange = (date: Date) => {
		setYear(date.getFullYear());
		setMonth(date.getMonth() + 1);
	};

	const userData = useMemo(() => {
		return (
			<div className="sticky left-0 text-center">
				<h1 className="text-3xl font-medium text-indigo-800 hover:text-indigo-900 dark:text-gray-200 dark:hover:text-gray-100 hover:font-bold">
					{session?.user.name}
				</h1>
				<h2 className="text-md font-medium text-blue-700 hover:text-blue-800 dark:text-gray-300 dark:hover:text-gray-200 hover:text-lg">
					{session?.user.email}
				</h2>
				<h3 className="text-lg font-medium text-indigo-700 hover:text-indigo-800 dark:text-gray-300 dark:hover:text-gray-200 hover:text-xl">
					{session?.user.department}
				</h3>
			</div>
		);
	}, [session, month, year]);

	return (
		<header className="w-full">
			<div className="flex justify-between items-center">
				<div className="px-9 sm:px-36"></div>
				<div className="inline-flex justify-center items-center gap-3 cursor-pointer">
					<YearMonthPicker onChange={handleDateChange} />
					<button onClick={() => setShowUserData(!showUserData)}>
						{showUserData ? (
							<Image
								src={"/chevron-up.svg"}
								alt="Expand Header"
								width={25}
								height={25}
							/>
						) : (
							<Image
								src={"/chevron-down.svg"}
								alt="Expand Header"
								width={25}
								height={25}
							/>
						)}
					</button>
				</div>
				<div className="mx-2 inline-flex gap-5">
					<div className="hidden sm:block m-2">
						<SearchBox field="Project" search={search} setSearch={setSearch} />
					</div>
				</div>
			</div>
			{showUserData && userData}
			<div className="m-2 flex justify-center sm:hidden">
				<SearchBox field="Project" search={search} setSearch={setSearch} />
			</div>
		</header>
	);
};

export default Header;
