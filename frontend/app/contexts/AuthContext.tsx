"use client";
import {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { Department, Region, Role } from "@/nextauth.d";
import authService from "@/app/api/services/auth";
import userService from "@/app/api/services/user";
import {
	AuthUser,
	clearAuth,
	persistAuth,
	readStoredAuth,
} from "@/app/lib/authStorage";

export type { AuthUser } from "@/app/lib/authStorage";
export { getStoredToken } from "@/app/lib/authStorage";

export type Session = {
	user: AuthUser;
};

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
	data: Session | null;
	status: SessionStatus;
	signIn: typeof signIn;
	signOut: typeof signOut;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type SignInResult = {
	ok?: boolean;
	error?: string | null;
	status?: number;
	url?: string | null;
};

/**
 * Credentials sign-in compatible with the previous NextAuth `signIn` call shape.
 * Google provider is not supported on the static GitHub Pages build.
 */
export async function signIn(
	provider: string,
	options?: {
		email?: string;
		password?: string;
		rememberMe?: string;
		redirect?: boolean;
		callbackUrl?: string;
	}
): Promise<SignInResult> {
	if (provider !== "credentials") {
		return {
			ok: false,
			error: "Google sign-in is not available. Use email and password.",
			status: 400,
		};
	}
	if (!options?.email || !options?.password) {
		return { ok: false, error: "Email and password are required", status: 400 };
	}

	const remember = options.rememberMe === "true";
	try {
		const backendToken = await authService.login({
			email: options.email,
			password: options.password,
			remember,
		});
		const user = await userService.getMe(backendToken);
		const authUser: AuthUser = {
			id: Number(user.id),
			email: user.email,
			name: userService.getFullName(user),
			department: Number(user.department) as Department,
			region: Number(user.region) as Region,
			role: Number(user.role) as Role,
			backendToken,
		};
		persistAuth(authUser, remember);
		window.dispatchEvent(new Event("rms-auth-changed"));
		return { ok: true, error: null, status: 200 };
	} catch (error: unknown) {
		const message =
			(error as { response?: { data?: { detail?: string } }; message?: string })
				?.response?.data?.detail ??
			(error as { message?: string })?.message ??
			"Invalid email or password";
		return { ok: false, error: String(message), status: 401 };
	}
}

export async function signOut(options?: {
	callbackUrl?: string;
	redirect?: boolean;
}): Promise<void> {
	clearAuth();
	window.dispatchEvent(new Event("rms-auth-changed"));
	if (options?.redirect !== false) {
		const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
		const target = options?.callbackUrl ?? "/auth";
		const path = target.startsWith("/") ? target : `/${target}`;
		window.location.href = `${base}${path}`;
	}
}

/** Drop-in replacement for next-auth `getSession` (token from storage). */
export async function getSession(): Promise<Session | null> {
	const user = readStoredAuth();
	return user ? { user } : null;
}

type AuthProviderProps = {
	children: ReactNode;
};

export default function AuthProvider({ children }: AuthProviderProps) {
	const [data, setData] = useState<Session | null>(null);
	const [status, setStatus] = useState<SessionStatus>("loading");

	const refresh = useCallback(() => {
		const user = readStoredAuth();
		if (user) {
			setData({ user });
			setStatus("authenticated");
		} else {
			setData(null);
			setStatus("unauthenticated");
		}
	}, []);

	useEffect(() => {
		refresh();
		const onChange = () => refresh();
		window.addEventListener("storage", onChange);
		window.addEventListener("rms-auth-changed", onChange);
		return () => {
			window.removeEventListener("storage", onChange);
			window.removeEventListener("rms-auth-changed", onChange);
		};
	}, [refresh]);

	const value = useMemo(
		() => ({ data, status, signIn, signOut }),
		[data, status]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Drop-in replacement for next-auth `useSession`. */
export function useSession() {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error("useSession must be used within AuthProvider");
	}
	return { data: ctx.data, status: ctx.status };
}
