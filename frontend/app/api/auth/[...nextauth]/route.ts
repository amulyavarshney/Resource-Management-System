import NextAuth, { NextAuthOptions } from "next-auth";
import { Department, Region, Role } from "@/nextauth.d";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { PrismaClient } from "@prisma/client";
// import EmailProvider from "next-auth/providers/email";
import CredentialProvider from "next-auth/providers/credentials";
// import authService from "@/app/api/services/auth";
import userService from "@/app/api/services/user";
import authService from "@/app/api/services/auth";

// const prisma = new PrismaClient();

const authOptions: NextAuthOptions = {
	// adapter: PrismaAdapter(prisma),
	providers: [
		// EmailProvider({
		//     server: {
		//         host: process.env.EMAIL_SERVER_HOST,
		//         port: process.env.EMAIL_SERVER_PORT,
		//         auth: {
		//             user: process.env.EMAIL_SERVER_USER,
		//             pass: process.env.EMAIL_SERVER_PASSWORD
		//         }
		//     },
		//     from: process.env.EMAIL_FROM
		// }),
		CredentialProvider({
			name: "Credentials",
			credentials: {
				// username: { label: "Username", type: "text", placeholder: "User name"},
				email: { label: "Email", type: "email", placeholder: "Email" },
				password: {
					label: "Password",
					type: "password",
					placeholder: "Password",
				},
			},
            async authorize(credentials) {
				// if (Cookies.get('rememberMe')) {
				// 	credentials = JSON.parse(Cookies.get('rememberMe'));
				// }
				if (!credentials) {
					throw new Error("Enter the fields");
				}
				// else if (!credentials.email.endsWith("@rms.com")) {
				// 	credentials.email += "@rms.com";
				// }
                
				// const user = await userService.getUserByEmail(credentials.email);
				// sessionStorage[user.id] = user;

				// if (!user || credentials.password !== "Amulya@123") {
				// 	throw new Error(`Either Email or Password is incorrect.`);
				// }

				// return { ...user, name: userService.getFullName(user) };

                const token = await authService.login(credentials);
                if (token && typeof document !== "undefined") {
                    // Persist backend token for axios interceptor
                    document.cookie = `backendToken=${token}; path=/; max-age=${60 * 60 * 2}; SameSite=Lax`;
                }
                if (token) {
                    const user = await userService.getUserByEmail(credentials.email);
                    return { ...user, name: userService.getFullName(user) } as any;
                }
				return null;
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			// if(trigger === "update") {
			// 	token.name = session.name ?? token.name;
			// 	token.email = session.email ?? token.email;
			// 	token.department = session.department ?? token.department;
			// 	token.region = session.region ?? token.region;
			// 	token.role = session.role ?? token.role;
			// }

			/* Step 1: update the token based on the user object */
			if (user) {
				token.id = Number(user.id);
				token.department = user.department;
				token.region = user.region;
				token.role = user.role;
			}
			// update the user in database
			// const updatedUser = await userService.updateUser(token.id, user);
			return token;
		},
		async session({ session, token }) {
			/* Step 2: update the session.user based on the token object */
			if (token && session.user) {
				session.user.id = token.id;
				session.user.department = token.department;
				session.user.region = token.region;
				session.user.role = token.role;
			}
			return session;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: "jwt",
		maxAge: Number(process.env.MAX_AGE),
	},
	debug: process.env.NODE_ENV === "development",
	theme: {
		colorScheme: "auto", // "auto" | "dark" | "light"
		brandColor: "#6265f0", // Hex color code
		logo: "/company_logo.svg", // Absolute URL to image
		buttonText: "", // Hex color code
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
