import { NextAuthOptions } from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import userService from "@/app/api/services/user";
import authService from "@/app/api/services/auth";
import http from "@/app/api/services/httpInstance";

// Server-side only exchange: trade a NextAuth-verified Google identity for
// a backend app JWT. The internal secret proves to the backend that this
// request genuinely came from our own server, not a forged browser request.
async function exchangeGoogleIdentity(email: string, firstName: string, lastName: string) {
	const response = await http.post<string>(
		"/auth/google",
		{ email, first_name: firstName, last_name: lastName },
		{ headers: { "X-Internal-Secret": process.env.INTERNAL_AUTH_SECRET } }
	);
	return response.data;
}

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email", placeholder: "Email" },
				password: {
					label: "Password",
					type: "password",
					placeholder: "Password",
				},
			},
			async authorize(credentials) {
				if (!credentials) {
					throw new Error("Enter the fields");
				}

				// 1. Authenticate against the backend — receive a JWT string
				const backendToken = await authService.login(credentials);
				if (!backendToken) return null;

				// 2. Fetch the user profile using that token (passed via authService internally)
				const user = await userService.getUserByEmail(
					credentials.email,
					backendToken
				);
				return { ...user, name: userService.getFullName(user), backendToken } as any;
			},
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
		}),
	],
	callbacks: {
		async signIn({ account, profile }) {
			// Google sign-ins must have a verified email to proceed; Credentials
			// already resolves a full user in authorize() above and needs no
			// extra check here.
			if (account?.provider === "google") {
				return Boolean(profile?.email);
			}
			return true;
		},
		async jwt({ token, user, account, profile }) {
			if (account?.provider === "google" && profile?.email) {
				const backendToken = await exchangeGoogleIdentity(
					profile.email,
					(profile as any).given_name ?? profile.name ?? "Google",
					(profile as any).family_name ?? "User"
				);
				const backendUser = await userService.getUserByEmail(profile.email, backendToken);
				token.id = Number(backendUser.id);
				token.department = Number((backendUser as any).department);
				token.region = Number((backendUser as any).region);
				// Coerce to number — API returns role as int matching Role enum
				token.role = Number((backendUser as any).role);
				token.backendToken = backendToken;
				token.name = userService.getFullName(backendUser);
			} else if (user) {
				token.id = Number(user.id);
				token.department = Number((user as any).department);
				token.region = Number((user as any).region);
				token.role = Number((user as any).role);
				// Carry the backend JWT in the NextAuth JWT so the axios
				// interceptor can attach it to every API request.
				token.backendToken = (user as any).backendToken;
			}
			return token;
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id;
				session.user.department = token.department;
				session.user.region = token.region;
				session.user.role = token.role;
				(session.user as any).backendToken = token.backendToken;
			}
			return session;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: "jwt",
		maxAge: 60 * 60 * 2, // 2 hours — matches backend JWT expiry
	},
	debug: process.env.NODE_ENV === "development",
	theme: {
		colorScheme: "auto",
		brandColor: "#6265f0",
		logo: "/company_logo.svg",
	},
};
