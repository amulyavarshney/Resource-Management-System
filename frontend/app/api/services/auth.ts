import http from "./httpInstance";
import { UserCreateViewModel } from "./user";

class AuthService {
	async login(user: Record<"email" | "password", string> & { remember?: boolean }) {
		const credentials: { email: string; password?: string; remember?: boolean } = {
			email: user.email,
			remember: Boolean(user.remember),
		};
		if (user.password) credentials.password = user.password;

		try {
			const response = await http.post<string>("/auth/login", credentials);

			return response.data;
		} catch (error) {
			console.error("Error while logging in", error);
			throw error;
		}
	}

	async register(user: UserCreateViewModel) {
		try {
			const response = await http.post("/auth/register", user);
			return response.data;
		} catch (error) {
			console.error("Error while registering a new user", error);
			throw error;
		}
	}
}

const authService = new AuthService();
export default authService;
