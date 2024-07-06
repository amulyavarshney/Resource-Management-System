"use client";
import { SearchProvider } from "@/app/contexts/SearchContext";
import { SettingsProvider } from "@/app/contexts/SettingsContext";
import { WeeksProvider } from "@/app/contexts/WeeksContext";
import Header from "./components/Header";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SettingsProvider>
			<SearchProvider>
				<WeeksProvider>
					<Header />
					{children}
				</WeeksProvider>
			</SearchProvider>
		</SettingsProvider>
	);
}
