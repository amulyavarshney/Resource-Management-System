"use client";
import {
	ReactNode,
	createContext,
	useState,
	Dispatch,
	SetStateAction,
	useContext,
} from "react";

// Define types for SearchContext
type SearchContextType = {
	search: string;
	setSearch: Dispatch<SetStateAction<string>>;
};

// Define default values for SearchContext
const SearchContext = createContext<SearchContextType>({
	search: "",
	setSearch: () => {},
});

// Define props for SearchProvider
type SearchProviderProps = {
	children: ReactNode;
};

const SearchProvider = ({ children }: SearchProviderProps) => {
	// Initialize state variables
	const [search, setSearch] = useState<string>("");
	const value = {
		search, setSearch
	};

	return (
		// Set value as the values and setter functions for search
		<SearchContext.Provider value={value}>{children}</SearchContext.Provider>
	);
};

const useSearch = () => useContext(SearchContext);

// Export SearchProvider and useSearch
export { SearchProvider, useSearch };
