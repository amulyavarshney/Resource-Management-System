import { expect, test } from "@playwright/test";
import {
	DEMO,
	apiLogin,
	ensureDemoProject,
	setTimesheetLock,
	uiLogin,
} from "./helpers";

const projectNumber = `E2E-${Date.now()}`;
const projectTitle = `E2E Timesheet Project ${Date.now()}`;

test.describe("timesheet save + lock", () => {
	let adminToken: string;
	let projectId: number;

	test.beforeAll(async ({ request }) => {
		adminToken = await apiLogin(
			request,
			DEMO.admin.email,
			DEMO.admin.password
		);
		// Ensure unlocked before the suite so Save is available.
		await setTimesheetLock(request, adminToken, false);
		projectId = await ensureDemoProject(
			request,
			adminToken,
			projectNumber,
			projectTitle
		);
	});

	test.afterAll(async ({ request }) => {
		if (adminToken) {
			await setTimesheetLock(request, adminToken, false);
		}
	});

	test("employee can enter hours and save", async ({ page }) => {
		await uiLogin(page, DEMO.employee.email, DEMO.employee.password);
		await page.goto("/timesheet");
		await expect(page).toHaveURL(/\/timesheet/);
		await expect(page.getByText(projectTitle)).toBeVisible({ timeout: 20_000 });

		const week1 = page.locator(`#project${projectId}week1`);
		await expect(week1).toBeEnabled();
		await week1.fill("4");

		await page.getByRole("button", { name: "Save" }).click();
		await expect(page.getByText("Saved Successfully!")).toBeVisible({
			timeout: 15_000,
		});
	});

	test("locked timesheet hides Save and disables inputs", async ({
		page,
		request,
	}) => {
		await setTimesheetLock(request, adminToken, true);

		await uiLogin(page, DEMO.employee.email, DEMO.employee.password);
		await page.goto("/timesheet");
		await expect(page.getByText(projectTitle)).toBeVisible({ timeout: 20_000 });

		await expect(page.getByText("Locked", { exact: true })).toBeVisible({
			timeout: 15_000,
		});
		await expect(page.getByRole("button", { name: "Save" })).toHaveCount(0);
		await expect(page.locator(`#project${projectId}week1`)).toBeDisabled();
	});
});
