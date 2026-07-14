import { expect, test } from "@playwright/test";
import { DEMO, setTimesheetLock, apiLogin, uiLogin } from "./helpers";

test.describe("leave form", () => {
	test.beforeAll(async ({ request }) => {
		const adminToken = await apiLogin(
			request,
			DEMO.admin.email,
			DEMO.admin.password
		);
		await setTimesheetLock(request, adminToken, false);
	});

	test("employee can open leave form and add a leave", async ({ page }) => {
		await uiLogin(page, DEMO.employee.email, DEMO.employee.password);
		await page.goto("/timesheet");
		await expect(page).toHaveURL(/\/timesheet/);

		await page.getByRole("button", { name: "Update here" }).click();
		await expect(page.getByText("Add Leaves")).toBeVisible({ timeout: 10_000 });

		await page.locator("#type").selectOption("Casual");
		await page.locator("#session").selectOption("FullDay");
		await page.getByRole("button", { name: "Add", exact: true }).click();

		await expect(page.getByText("Leave added successfully.")).toBeVisible({
			timeout: 15_000,
		});
	});
});
