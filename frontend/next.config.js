/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";
const backendApi = process.env.NEXT_PUBLIC_BACKEND_API ?? "http://localhost:8000/api/v1";
// Extract origin from backend URL (e.g. "http://localhost:8000")
const backendOrigin = backendApi.replace(/\/api.*$/, "");

// In dev, allow unsafe-eval (needed by Next.js hot-reload / React refresh)
const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

// Allow XHR/fetch to the backend origin
const connectSrc = `connect-src 'self' ${backendOrigin}`;

const csp = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    connectSrc,
].join("; ");

const nextConfig = {
    output: "standalone",
    serverRuntimeConfig: {
        HOST: process.env.NEXTAUTH_URL,
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "Referrer-Policy", value: "no-referrer" },
                    { key: "Permissions-Policy", value: "geolocation=()" },
                    // Only set HSTS in production (not locally over HTTP)
                    ...(!isDev ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
                    { key: "Content-Security-Policy", value: csp },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
