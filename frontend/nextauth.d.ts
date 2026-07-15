export enum Department {
	None = 0,
	D1 = 1 << 0,
	D2 = 1 << 1,
}

export enum Region {
	None = 0,
	India = 1 << 0,
	USA = 1 << 1,
}

/** Numeric values must match backend `app.models.enums.Role` / OpenAPI `Role`. */
export enum Role {
	Employee = 0,
	Management = 1,
	Executive = 2,
	Admin = 3,
	Developer = 4,
}

/** Name keys only — TypeScript numeric enums also reverse-map `0 → "Employee"`. */
export const ROLE_NAMES = Object.keys(Role).filter((key) =>
	Number.isNaN(Number(key))
) as Array<keyof typeof Role>;
