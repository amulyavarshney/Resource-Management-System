"use client";
import {
	ReactNode,
	createContext,
	useState,
	Dispatch,
	SetStateAction,
	useContext,
} from "react";

// Define types for SettingsContext
type SettingsContextType = {
	showFavourites: boolean;
	setShowFavourites: Dispatch<SetStateAction<boolean>>;
};

// Define default values for SettingsContext
const SettingsContext = createContext<SettingsContextType>({
	showFavourites: false,
	setShowFavourites: () => {},
});

// Define props for SettingsProvider
type SettingsProviderProps = {
	children: ReactNode;
};

const SettingsProvider = ({ children }: SettingsProviderProps) => {
	// Initialize state variables
	const [showFavourites, setShowFavourites] = useState<boolean>(false);
	const value = {
		showFavourites,
		setShowFavourites,
	};

	return (
		// Set value as the values and setter functions for search
		<SettingsContext.Provider value={value}>
			{children}
		</SettingsContext.Provider>
	);
};

const useSettings = () => useContext(SettingsContext);

// Export SettingsProvider and useSettings
export { SettingsProvider, useSettings };
