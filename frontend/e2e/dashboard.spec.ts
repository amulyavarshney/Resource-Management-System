import { expect, test } from "@playwright/test";
import { DEMO, uiLogin } from "./helpers";

test.describe("management dashboard", () => {
	test("manager can view dashboard overview", async ({ page }) => {
		await uiLogin(page, DEMO.manager.email, DEMO.manager.password);
		await page.goto("/dashboard");
		await expect(page).toHaveURL(/\/dashboard/);
		await expect(page.getByText(/unauthorized/i)).toHaveCount(0);

		// Stat cards render labels in <dt>; a hidden table also lists the same names.
		await expect(page.locator("dt", { hasText: "Projects" })).toBeVisible({
			timeout: 15_000,
		});
		await expect(page.locator("dt", { hasText: "Users" })).toBeVisible();
		await expect(page.locator("dt", { hasText: "Working Hours" })).toBeVisible();
	});
});
