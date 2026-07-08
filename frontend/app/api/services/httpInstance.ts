import axios from "axios";

const http = axios.create({
	baseURL: process.env.NEXT_PUBLIC_BACKEND_API,
});

// Attach the backend JWT on every request.
// The token lives in the NextAuth session — we read it from the session
// object when available (client-side) or from the Authorization header
// forwarded by the Next.js server route (server-side).
http.interceptors.request.use(async (config) => {
	// Only run on the client side
	if (typeof window !== "undefined") {
		// Dynamically import to avoid pulling next-auth into the server bundle
		const { getSession } = await import("next-auth/react");
		const session = await getSession();
		const token = (session?.user as any)?.backendToken as string | undefined;
		if (token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}
	}
	return config;
});

export default http;
