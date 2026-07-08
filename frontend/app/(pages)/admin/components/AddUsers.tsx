import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Department, Region, Role } from "@/nextauth.d";
import userService, {
	User,
	UserCreateViewModel,
} from "@/app/api/services/user";
import ImportFromExcel, { AddField } from "./ImportFromExcel";

export default function AddUsers() {
	const { data: session } = useSession();
	const department = session?.user.department
		.toString()
		.split(", ")
		// .map((value) => value.trim())
		.reduce(
			(acc, value) => acc | Department[value as keyof typeof Department],
			0
		);
	const region = session?.user.region
		.toString()
		.split(", ")
		// .map((value) => value.trim())
		.reduce((acc, value) => acc | Region[value as keyof typeof Region], 0);
	const [user, setUser] = useState<UserCreateViewModel>({
		emp_id: undefined,
		user_name: "",
		first_name: "",
		last_name: "",
		email: "",
		department: department ?? Department.None,
		region: region ?? Region.None,
		role: Role.Employee,
		work_hours_per_day: Number(process.env.NEXT_PUBLIC_MAX_HOURS),
		parent_id: 0,
	});
	const [users, setUsers] = useState<User[]>([]);

	useEffect(() => {
		fetchUsers();
	}, [user]);

	const fetchUsers = async () => {
		const data = await userService.getUsers(user.department);
		setUsers(data);
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		setUser({ ...user, [e.target.name]: e.target.value });
	};

	const handleAdd = async (e: FormEvent) => {
		e.preventDefault();
		await userService.addUser(user);
	};

	return (
		<>
			<ImportFromExcel field={AddField.Users} />
			<div className="m-1 flex flex-col items-center justify-center space-y-4 bg-white dark:bg-gray-900 rounded-xl shadow-xl">
				<nav className="p-2 w-full text-center text-md font-bold bg-gray-300 dark:bg-gray-700 rounded-t-md border-b border-gray-500 dark:border-gray-300">
					Add User
				</nav>
				<form
					onSubmit={handleAdd}
					className="px-5 pb-3 w-full space-y-2 dark:[color-scheme:dark]"
				>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						EmpId
						<input
							type="text"
							name="emp_id"
							placeholder="Emp Id"
							value={user.emp_id}
							onChange={handleChange}
							className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
						/>
					</label>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						First Name
						<input
							type="text"
							name="first_name"
							placeholder="First Name"
							value={user.first_name}
							onChange={handleChange}
							className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
						/>
					</label>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Last Name
						<input
							type="text"
							name="last_name"
							placeholder="Last Name"
							value={user.last_name}
							onChange={handleChange}
							className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
						/>
					</label>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Email
						<input
							type="email"
							placeholder="Email"
							value={user.email}
							onChange={(e) => setUser({ ...user, email: e.target.value })}
							className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
						/>
					</label>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Department
						<div className="flex flex-wrap">
							{Object.keys(Department)
								.filter((key) => isNaN(Number(key)))
								.map((key) => (
									<label key={key} className="flex items-center space-x-1 m-1">
										<input
											type="checkbox"
											value={key}
											checked={
												(user.department &
													Department[key as keyof typeof Department]) !=
												0
											}
											onChange={(e: ChangeEvent<HTMLInputElement>) =>
												setUser({
													...user,
													department:
														user.department ^
														Department[
															e.target.value as keyof typeof Department
														],
												})
											}
											className="form-checkbox h-5 w-5 text-indigo-600"
										/>
										<span>{key}</span>
									</label>
								))}
						</div>
					</label>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Region
						<div className="flex flex-wrap">
							{Object.keys(Region)
								.filter((key) => isNaN(Number(key)))
								.map((key) => (
									<label key={key} className="flex items-center space-x-1 m-1">
										<input
											type="checkbox"
											value={key}
											checked={
												(user.region & Region[key as keyof typeof Region]) != 0
											}
											onChange={(e: ChangeEvent<HTMLInputElement>) =>
												setUser({
													...user,
													region:
														user.region ^
														Region[e.target.value as keyof typeof Region],
												})
											}
											className="form-checkbox h-5 w-5 text-indigo-600"
										/>
										<span>{key}</span>
									</label>
								))}
						</div>
					</label>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Role
						<select
							value={user.role}
							onChange={(e) =>
								setUser({
									...user,
									role: Role[e.target.value as keyof typeof Role],
								})
							}
							className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
						>
							{Object.keys(Role).map((key) => (
								<option value={Role[key as keyof typeof Role]} key={key}>
									{key}
								</option>
							))}
						</select>
					</label>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Work Hours / Day
						<input
							type="number"
							name="work_hours_per_day"
							placeholder="Work Hours / Day"
							value={user.work_hours_per_day}
							min={0}
							max={16}
							onChange={handleChange}
							className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
						/>
					</label>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						Reporting Manager
						<select
							value={user.parent_id}
							onChange={(e) =>
								setUser({ ...user, parent_id: Number(e.target.value) })
							}
							className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
						>
							<option value={0}>Select Reporting Manager</option>
							{users
								.filter(
									(user) =>
										user.role != Role.Employee && user.role != Role.Developer
								)
								.map((user) => (
									<option value={user.id} key={user.id}>
										{userService.getFullName(user)}
									</option>
								))}
						</select>
					</label>
					<div className="flex justify-center">
						<button
							type="submit"
							className="py-2.5 px-5 text-xs bg-indigo-500 dark:bg-indigo-800 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-full cursor-pointer font-semibold text-center shadow-xs transition-all duration-500"
						>
							Add User
						</button>
					</div>
				</form>
			</div>
		</>
	);
}
