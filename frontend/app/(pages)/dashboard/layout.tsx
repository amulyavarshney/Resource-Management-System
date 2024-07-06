"use client";
import { DateProvider } from "@/app/contexts/DateContext";
import { SearchProvider } from "@/app/contexts/SearchContext";
import Header from "./components/Header";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<DateProvider>
			<SearchProvider>
				<main className="h-screen">
					<Header />
					{children}
				</main>
			</SearchProvider>
		</DateProvider>
	);
}
