import http from "./httpInstance";

export type FavouritesResponse = {
	project_ids: number[];
};

class UserPreferencesService {
	async getFavourites(): Promise<number[]> {
		const response = await http.get<FavouritesResponse>("/preferences/favourites");
		return response.data.project_ids;
	}

	async replaceFavourites(projectIds: number[]): Promise<number[]> {
		const response = await http.put<FavouritesResponse>("/preferences/favourites", {
			project_ids: projectIds,
		});
		return response.data.project_ids;
	}

	async addFavourite(projectId: number): Promise<number[]> {
		const response = await http.post<FavouritesResponse>(
			`/preferences/favourites/${projectId}`
		);
		return response.data.project_ids;
	}

	async removeFavourite(projectId: number): Promise<number[]> {
		const response = await http.delete<FavouritesResponse>(
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
