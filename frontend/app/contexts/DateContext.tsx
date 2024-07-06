"use client";
import {
	ReactNode,
	createContext,
	useState,
	Dispatch,
	SetStateAction,
	useContext,
} from "react";

// Define props for DateProvider
type DateProviderProps = {
	children: ReactNode;
};

// Define types for DateContext
type DateContextType = {
	year: number;
	month: number;
	setYear: Dispatch<SetStateAction<number>>;
	setMonth: Dispatch<SetStateAction<number>>;
};

// Define default values for DateContext
const DateContext = createContext<DateContextType>({
	year: new Date().getFullYear(),
	month: new Date().getMonth() + 1,
	setYear: () => {},
	setMonth: () => {},
});

const DateProvider = ({ children }: DateProviderProps) => {
	// Initialize state variables
	const [year, setYear] = useState<number>(new Date().getFullYear());
	const [month, setMonth] = useState<number>(new Date().getMonth() + 1);

	const value = {
		year,
		setYear,
		month,
		setMonth,
	};

	return (
		// Set value as the values and setter functions for month and year
		<DateContext.Provider value={value}>{children}</DateContext.Provider>
	);
};

const useDate = () => useContext(DateContext);

// Export DateProvider and useDate
export { DateProvider, useDate };
