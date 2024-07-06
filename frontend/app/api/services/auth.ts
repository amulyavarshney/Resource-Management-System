import http from "./httpInstance";

class AuthService {
	async login(user: Record<"email" | "password", string>) {
		let credentials: { email: string; password?: string } = {
			email: user.email,
		};
		if (user.password)
			credentials = { ...credentials, password: user.password };

		try {
			const response = await http.post<string>("/auth/login", credentials);
			return response.data;
		} catch (error) {
			console.error("Error while logging in", error);
			throw error;
		}
	}

	// async register(user: User) {
	// 	try {
	// 		const response = await http.post("/auth/register", user);
	//         return response.data;
	// 	} catch (error) {
	// 		console.error("Error while registering a new user", error);
	// 		throw error;
	// 	}
	// }
}

const authService = new AuthService();
export default authService;
