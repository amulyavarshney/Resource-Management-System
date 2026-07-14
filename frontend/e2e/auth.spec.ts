import { expect, test } from "@playwright/test";

const apiBase =
	process.env.NEXT_PUBLIC_BACKEND_API ?? "http://127.0.0.1:8000/api/v1";

const e2eUser = {
	email: `e2e.${Date.now()}@rms.example`,
	password: "E2ePass1!",
	first_name: "E2E",
	last_name: "Tester",
	department: 1,
	region: 1,
	role: 0,
	work_hours_per_day: 8,
	parent_id: 0,
};

async function loginAsE2E(page: import("@playwright/test").Page) {
	await page.goto("/auth");
	await page.locator("#email").fill(e2eUser.email);
	await page.locator("#password").fill(e2eUser.password);
	await page.getByRole("button", { name: "Sign in", exact: true }).click();
	await expect(page).toHaveURL(/\/home/, { timeout: 30_000 });
}

test.describe("auth + timesheet smoke", () => {
	test.beforeAll(async ({ request }) => {
		const register = await request.post(`${apiBase}/auth/register`, {
			data: e2eUser,
		});
		expect(
			register.ok(),
			`register failed: ${register.status()} ${await register.text()}`
		).toBeTruthy();
	});

	test("login form renders and rejects bad credentials", async ({ page }) => {
		await page.goto("/auth");
		await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();

		await page.locator("#email").fill("nobody@rms.example");
		await page.locator("#password").fill("WrongPass1!");
		await page.getByRole("button", { name: "Sign in", exact: true }).click();

		// Stay on auth after failed login
		await expect(page).toHaveURL(/\/auth/);
	});

	test("unauthenticated protected routes redirect to auth", async ({ page }) => {
		await page.goto("/timesheet");
		await expect(page).toHaveURL(/\/auth/, { timeout: 15_000 });
	});

	test("credentials login reaches home and timesheet", async ({ page }) => {
		await loginAsE2E(page);

		await page.goto("/timesheet");
		await expect(page).toHaveURL(/\/timesheet/);
		// Page should not show Unauthorized for Employee
		await expect(page.getByText(/unauthorized/i)).toHaveCount(0);
	});

	test("employee is denied dashboard UI", async ({ page }) => {
		await loginAsE2E(page);
		await page.goto("/dashboard");
		await expect(page.getByText(/unauthorized/i)).toBeVisible({ timeout: 15_000 });
	});
});
