import React from "react";
import Breadcrumb from "@/app/components/Breadcrumb";
import SearchBox from "@/app/components/SearchBox";
import YearMonthPicker from "@/app/components/YearMonthPicker";
import { useDate } from "@/app/contexts/DateContext";
import { useSearch } from "@/app/contexts/SearchContext";
import DashboardReport from "./DashboardReport";
import { usePathname } from "next/navigation";

export default function Header() {
	const { year, month, setYear, setMonth } = useDate();
	const path = usePathname();
	const onChange = (date: Date) => {
		setYear(date.getFullYear());
		setMonth(date.getMonth() + 1);
	};

	const { search, setSearch } = useSearch();
	return (
		<div className="m-2 flex justify-between">
			<Breadcrumb />
			{!(path === "/dashboard") && (
				<SearchBox search={search} setSearch={setSearch} />
			)}
			<div className="flex items-center space-x-5">
				<DashboardReport year={year} month={month} />
				<YearMonthPicker onChange={onChange} />
			</div>
		</div>
	);
}
