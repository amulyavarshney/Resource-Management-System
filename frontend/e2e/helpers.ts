import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const apiBase =
	process.env.NEXT_PUBLIC_BACKEND_API ?? "http://127.0.0.1:8000/api/v1";

export const DEMO = {
	employee: { email: "demo.employee@rms.example", password: "DemoPass1!" },
	manager: { email: "demo.manager@rms.example", password: "DemoPass1!" },
	admin: { email: "demo.admin@rms.example", password: "DemoPass1!" },
} as const;

export async function apiLogin(
	request: APIRequestContext,
	email: string,
	password: string
): Promise<string> {
	const resp = await request.post(`${apiBase}/auth/login`, {
		data: { email, password },
	});
	expect(resp.ok(), `login failed for ${email}: ${await resp.text()}`).toBeTruthy();
	const token = await resp.json();
	expect(typeof token).toBe("string");
	return token as string;
}

export async function ensureDemoProject(
	request: APIRequestContext,
	adminToken: string,
	number: string,
	title: string
): Promise<number> {
	const headers = { Authorization: `Bearer ${adminToken}` };
	const create = await request.post(`${apiBase}/project`, {
		headers,
		data: {
			number,
			title,
			department: 1,
			region: 1,
		},
	});
	if (create.status() === 409) {
		const list = await request.get(`${apiBase}/project`, { headers });
		expect(list.ok(), `project list failed: ${await list.text()}`).toBeTruthy();
		const found = (await list.json()).find(
			(p: { number: string; id: number }) => p.number === number
		);
		expect(found, `duplicate project ${number} not found in directory`).toBeTruthy();
		return found.id as number;
	}
	expect(
		create.ok(),
		`project create failed: ${create.status()} ${await create.text()}`
	).toBeTruthy();
	const body = await create.json();
	return body.id as number;
}

export async function setTimesheetLock(
	request: APIRequestContext,
	token: string,
	isLocked: boolean
): Promise<void> {
	const resp = await request.post(
		`${apiBase}/lock?is_locked=${isLocked}`,
		{ headers: { Authorization: `Bearer ${token}` } }
	);
	expect(resp.ok(), `lock set failed: ${await resp.text()}`).toBeTruthy();
}

export async function uiLogin(
	page: Page,
	email: string,
	password: string
): Promise<void> {
	await page.goto("/auth");
	await page.locator("#email").fill(email);
	await page.locator("#password").fill(password);
	await page.getByRole("button", { name: "Sign in", exact: true }).click();
	await expect(page).toHaveURL(/\/home/, { timeout: 30_000 });
}
