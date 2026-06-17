import { DateProvider } from "@/app/contexts/DateContext";
import { SearchProvider } from "@/app/contexts/SearchContext";
import { WeeksProvider } from "@/app/contexts/WeeksContext";

export default function ViewLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<DateProvider>
			<SearchProvider>
				<WeeksProvider>
					{children}
				</WeeksProvider>
			</SearchProvider>
		</DateProvider>
	);
}
