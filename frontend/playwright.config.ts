import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: 1,
	timeout: 60_000,
	reporter: process.env.CI ? [["github"], ["list"]] : "list",
	use: {
		baseURL,
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	// Expect the stack to already be running (or started by CI). Locally:
	//   backend: uvicorn … ; frontend: npm run dev
	webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
		? undefined
		: {
				command: "npm run start",
				url: baseURL,
				reuseExistingServer: !process.env.CI,
				timeout: 120_000,
				env: {
					NEXT_PUBLIC_FRONTEND_URL: baseURL,
					NEXT_PUBLIC_BACKEND_API:
						process.env.NEXT_PUBLIC_BACKEND_API ?? "http://127.0.0.1:8000/api/v1",
				},
		  },
});
