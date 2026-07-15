/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";
const isStaticExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const backendApi =
	process.env.NEXT_PUBLIC_BACKEND_API ?? "http://localhost:8000/api/v1";
const backendOrigin = backendApi.replace(/\/api.*$/, "");

const scriptSrc = isDev
	? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
	: "script-src 'self' 'unsafe-inline'";

const connectSrc = `connect-src 'self' ${backendOrigin}`;

const csp = [
	"default-src 'self'",
	scriptSrc,
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: blob:",
	connectSrc,
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
	...(isStaticExport
		? {
				output: "export",
				images: { unoptimized: true },
				trailingSlash: true,
				...(basePath ? { basePath, assetPrefix: basePath } : {}),
			}
		: {
				output: "standalone",
				async headers() {
					return [
						{
							source: "/(.*)",
							headers: [
								{ key: "X-Frame-Options", value: "DENY" },
								{ key: "X-Content-Type-Options", value: "nosniff" },
								{ key: "Referrer-Policy", value: "no-referrer" },
								{ key: "Permissions-Policy", value: "geolocation=()" },
								...(!isDev
									? [
											{
												key: "Strict-Transport-Security",
												value: "max-age=63072000; includeSubDomains; preload",
											},
										]
									: []),
								{ key: "Content-Security-Policy", value: csp },
							],
						},
					];
				},
			}),
};

module.exports = nextConfig;
