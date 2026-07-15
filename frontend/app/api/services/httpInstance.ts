import axios from "axios";
import { getStoredToken } from "@/app/lib/authStorage";

const http = axios.create({
	baseURL: process.env.NEXT_PUBLIC_BACKEND_API,
});

http.interceptors.request.use((config) => {
	if (typeof window !== "undefined") {
		const token = getStoredToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	}
	return config;
});

export default http;
