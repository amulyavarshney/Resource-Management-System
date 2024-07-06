import axios from "axios";
import https from "https";

const http = axios.create({
	baseURL:
		process.env.NEXT_PUBLIC_BACKEND_API,
	httpsAgent: new https.Agent({
		rejectUnauthorized: false, // Disable SSL certificate verification (used for dev env)
	}),
});

export default http;
