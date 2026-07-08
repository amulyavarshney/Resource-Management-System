import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";
import userService from "@/app/api/services/user";
import authService from "@/app/api/services/auth";

const authOptions: NextAuthOptions = {
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
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = Number(user.id);
				token.department = (user as any).department;
				token.region = (user as any).region;
				token.role = (user as any).role;
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
