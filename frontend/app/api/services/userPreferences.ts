import http from "./httpInstance";
import type { ApiFavourites } from "../generated";

export type FavouritesResponse = ApiFavourites;

class UserPreferencesService {
	async getFavourites(): Promise<number[]> {
		const response = await http.get<ApiFavourites>("/preferences/favourites");
		return response.data.project_ids;
	}

	async replaceFavourites(projectIds: number[]): Promise<number[]> {
		const response = await http.put<ApiFavourites>("/preferences/favourites", {
			project_ids: projectIds,
		});
		return response.data.project_ids;
	}

	async addFavourite(projectId: number): Promise<number[]> {
		const response = await http.post<ApiFavourites>(
			`/preferences/favourites/${projectId}`
		);
		return response.data.project_ids;
	}

	async removeFavourite(projectId: number): Promise<number[]> {
		const response = await http.delete<ApiFavourites>(
			`/preferences/favourites/${projectId}`
		);
		return response.data.project_ids;
	}
}

const userPreferencesService = new UserPreferencesService();
export default userPreferencesService;

/** @deprecated use userPreferencesService methods */
export const addToFavourites = async (_userId: number, projectId: number) =>
	userPreferencesService.addFavourite(projectId);

/** @deprecated use userPreferencesService methods */
export const removeFromFavourites = async (_userId: number, projectId: number) =>
	userPreferencesService.removeFavourite(projectId);
