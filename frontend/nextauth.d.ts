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

export enum Role {
	Employee = "Employee",
	Management = "Management",
	Executive = "Executive",
	Admin = "Admin",
	Developer = "Developer",
}

declare module "next-auth" {
	interface User {
		id: number;
		department: Department;
		region: Region;
		role: Role;
	}

	interface Session extends DefaultSession {
		user: User;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id: number;
		department: Department;
		region: Region;
		role: Role;
	}
}
