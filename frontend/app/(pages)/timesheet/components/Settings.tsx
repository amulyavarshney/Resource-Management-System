import { useSettings } from "@/app/contexts/SettingsContext";
import { useState } from "react";

// type SettingsProps = {
// 	isChecked: boolean;
// 	setIsChecked: (value: boolean) => void;
// };

export default function Settings() {
	const [dropdown, setDropdown] = useState<boolean>(false);
	const { showFavourites, setShowFavourites } = useSettings();

	const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setShowFavourites(e.target.checked);
	};

	return (
		<label
			// title="Toggle Favourites"
			className="inline-flex items-center cursor-pointer group"
		>
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
		// <div className="flex-col">
		// 	<button className="cursor-pointer" onClick={() => setDropdown(!dropdown)}>
		// 		<svg
		// 			xmlns="http://www.w3.org/2000/svg"
		// 			width="24"
		// 			height="24"
		// 			viewBox="0 0 24 24"
		// 		>
		// 			<path d="m2.344 15.271 2 3.46a1 1 0 0 0 1.366.365l1.396-.806c.58.457 1.221.832 1.895 1.112V21a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1.598a8.094 8.094 0 0 0 1.895-1.112l1.396.806c.477.275 1.091.11 1.366-.365l2-3.46a1.004 1.004 0 0 0-.365-1.366l-1.372-.793a7.683 7.683 0 0 0-.002-2.224l1.372-.793c.476-.275.641-.89.365-1.366l-2-3.46a1 1 0 0 0-1.366-.365l-1.396.806A8.034 8.034 0 0 0 15 4.598V3a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v1.598A8.094 8.094 0 0 0 7.105 5.71L5.71 4.904a.999.999 0 0 0-1.366.365l-2 3.46a1.004 1.004 0 0 0 .365 1.366l1.372.793a7.683 7.683 0 0 0 0 2.224l-1.372.793c-.476.275-.641.89-.365 1.366zM12 8c2.206 0 4 1.794 4 4s-1.794 4-4 4-4-1.794-4-4 1.794-4 4-4z"></path>
		// 		</svg>
		// 	</button>
		// 	{dropdown && (
		// 		<div className="absolute top-28 right-0 p-3 border">
		// 			<label className="m-2 flex justify-end">
		// 				<input
		// 					type="checkbox"
		// 					checked={showFavourites}
		// 					onChange={handleCheckboxChange}
		// 					className="form-checkbox"
		// 				/>
		// 				<span className="ml-2">Show Favourites</span>
		// 			</label>
		// 		</div>
		// 	)}
		// </div>
	);
}
