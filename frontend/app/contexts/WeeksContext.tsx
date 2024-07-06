"use client";
import React, { createContext, useContext, useState } from "react";
import { Week } from "../api/services/weeksList";

type WeeksContextType = {
	isFormVisible: boolean;
	setIsFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
	weeks: Week[];
	setWeeks: React.Dispatch<React.SetStateAction<Week[]>>;
};

const WeeksContext = createContext<WeeksContextType>({
	isFormVisible: false,
	setIsFormVisible: () => {},
	weeks: [],
	setWeeks: () => {},
});

export const WeeksProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
	const [weeks, setWeeks] = useState<Week[]>([]);

	return (
		<WeeksContext.Provider
			value={{ isFormVisible, setIsFormVisible, weeks, setWeeks }}
		>
			{children}
		</WeeksContext.Provider>
	);
};

export const useWeeks = () => {
	const context = useContext(WeeksContext);
	return context;
};
