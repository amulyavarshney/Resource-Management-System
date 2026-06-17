import { useSettings } from "@/app/contexts/SettingsContext";

export default function Settings() {
	const { showFavourites, setShowFavourites } = useSettings();

	const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setShowFavourites(e.target.checked);
	};

	return (
		<label className="inline-flex items-center cursor-pointer group">
			<input
				type="checkbox"
				checked={showFavourites}
				className="sr-only peer"
				onChange={handleCheckboxChange}
			/>
			<div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
			<span className="hidden group-hover:block absolute top-32 right-1 bg-black dark:bg-gray-300 text-white dark:text-black border-white p-1 rounded-md shadow-md ms-3 text-sm">
				{!showFavourites ? "Show Favourites" : "Show All Projects"}
			</span>
		</label>
	);
}
