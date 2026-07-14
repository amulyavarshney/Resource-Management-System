import { expect, test } from "@playwright/test";
import { DEMO, apiLogin, setTimesheetLock, uiLogin } from "./helpers";

test.describe("admin lock UI", () => {
	test.beforeAll(async ({ request }) => {
		const adminToken = await apiLogin(
			request,
			DEMO.admin.email,
			DEMO.admin.password
		);
		await setTimesheetLock(request, adminToken, false);
	});

	test.afterAll(async ({ request }) => {
		const adminToken = await apiLogin(
			request,
			DEMO.admin.email,
			DEMO.admin.password
		);
		await setTimesheetLock(request, adminToken, false);
	});

	test("admin can lock and unlock timesheet from /admin", async ({ page }) => {
		await uiLogin(page, DEMO.admin.email, DEMO.admin.password);
		await page.goto("/admin");
		await expect(page).toHaveURL(/\/admin/);
		await expect(page.getByText(/unauthorized/i)).toHaveCount(0);

		const lockBtn = page.getByRole("button", { name: "Lock Timesheet" });
		await expect(lockBtn).toBeVisible({ timeout: 15_000 });
		await lockBtn.click();
		await expect(
			page.getByRole("button", { name: "Unlock Timesheet" })
		).toBeVisible({ timeout: 10_000 });

		await page.getByRole("button", { name: "Unlock Timesheet" }).click();
		await expect(
			page.getByRole("button", { name: "Lock Timesheet" })
		).toBeVisible({ timeout: 10_000 });
	});
});
