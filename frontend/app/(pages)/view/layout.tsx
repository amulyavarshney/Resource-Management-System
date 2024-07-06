import { DateProvider } from "@/app/contexts/DateContext";
import { SearchProvider } from "@/app/contexts/SearchContext";
import { WeeksProvider } from "@/app/contexts/WeeksContext";
// import Header from "./components/Header";

export default function ViewLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<DateProvider>
			<SearchProvider>
				<WeeksProvider>
					{/* <Header /> */}
					{children}
				</WeeksProvider>
			</SearchProvider>
		</DateProvider>
	);
}
