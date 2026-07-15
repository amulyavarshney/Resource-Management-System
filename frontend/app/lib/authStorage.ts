import { Department, Region, Role } from "@/nextauth.d";

export const AUTH_STORAGE_KEY = "rms_auth";

export type AuthUser = {
	id: number;
	email: string;
	name: string;
	department: Department;
	region: Region;
	role: Role;
	backendToken: string;
};

export function readStoredAuth(): AuthUser | null {
	if (typeof window === "undefined") return null;
	const raw =
		window.localStorage.getItem(AUTH_STORAGE_KEY) ??
		window.sessionStorage.getItem(AUTH_STORAGE_KEY);
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as AuthUser;
		if (!parsed?.backendToken || parsed.id == null) return null;
		return {
			...parsed,
			id: Number(parsed.id),
			department: Number(parsed.department) as Department,
			region: Number(parsed.region) as Region,
			role: Number(parsed.role) as Role,
		};
	} catch {
		return null;
	}
}

export function getStoredToken(): string | undefined {
	return readStoredAuth()?.backendToken;
}

export function persistAuth(user: AuthUser, remember: boolean) {
	const payload = JSON.stringify(user);
	window.localStorage.removeItem(AUTH_STORAGE_KEY);
	window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
	if (remember) {
		window.localStorage.setItem(AUTH_STORAGE_KEY, payload);
	} else {
		window.sessionStorage.setItem(AUTH_STORAGE_KEY, payload);
	}
}

export function clearAuth() {
	window.localStorage.removeItem(AUTH_STORAGE_KEY);
	window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
}
