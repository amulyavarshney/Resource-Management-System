import { useState } from "react";
import toast from "react-hot-toast";
import userPreferencesService from "@/app/api/services/userPreferences";

type FavouritesProps = {
	projectId: number;
	favouriteProjects: number[];
	setFavouriteProjects: (value: number[]) => void;
};

export default function Favourites({
	projectId,
	favouriteProjects,
	setFavouriteProjects,
}: FavouritesProps) {
	const [pending, setPending] = useState(false);
	const isFavourite = favouriteProjects.includes(projectId);

	const toggleFavourite = async () => {
		if (pending) return;
		setPending(true);
		try {
			const next = isFavourite
				? await userPreferencesService.removeFavourite(projectId)
				: await userPreferencesService.addFavourite(projectId);
			setFavouriteProjects(next);
		} catch (error) {
			console.error("Failed to update favourite", error);
			toast.error("Failed to update favourite");
		} finally {
			setPending(false);
		}
	};

	return (
		<button
			type="button"
			className="cursor-pointer disabled:opacity-50"
			disabled={pending}
			aria-pressed={isFavourite}
			aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
			onClick={toggleFavourite}
		>
			{isFavourite ? (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					className="fill-indigo-600 dark:fill-gray-100"
				>
					<path d="M21.947 9.179a1.001 1.001 0 0 0-.868-.676l-5.701-.453-2.467-5.461a.998.998 0 0 0-1.822-.001L8.622 8.05l-5.701.453a1 1 0 0 0-.619 1.713l4.213 4.107-1.49 6.452a1 1 0 0 0 1.53 1.057L12 18.202l5.445 3.63a1.001 1.001 0 0 0 1.517-1.106l-1.829-6.4 4.536-4.082c.297-.268.406-.686.278-1.065z"></path>
				</svg>
			) : (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					className="fill-indigo-600 dark:fill-gray-100"
				>
					<path d="m6.516 14.323-1.49 6.452a.998.998 0 0 0 1.529 1.057L12 18.202l5.445 3.63a1.001 1.001 0 0 0 1.517-1.106l-1.829-6.4 4.536-4.082a1 1 0 0 0-.59-1.74l-5.701-.454-2.467-5.461a.998.998 0 0 0-1.822 0L8.622 8.05l-5.701.453a1 1 0 0 0-.619 1.713l4.214 4.107zm2.853-4.326a.998.998 0 0 0 .832-.586L12 5.43l1.799 3.981a.998.998 0 0 0 .832.586l3.972.315-3.271 2.944c-.284.256-.397.65-.293 1.018l1.253 4.385-3.736-2.491a.995.995 0 0 0-1.109 0l-3.904 2.603 1.05-4.546a1 1 0 0 0-.276-.94l-3.038-2.962 4.09-.326z"></path>
				</svg>
			)}
		</button>
	);
}
