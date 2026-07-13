import { useState, useEffect, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { Department, Region, Role, ROLE_NAMES } from "@/nextauth.d";
import toast from "react-hot-toast";
import userService, {
	User,
	UserUpdateViewModel,
} from "@/app/api/services/user";
import { sortUsers } from "@/app/api/services/utils";

export default function UpdateUsers() {
	const { data: session } = useSession();
	const [users, setUsers] = useState<User[]>([]);
	const [userId, setUserId] = useState<number>();
	const [user, setUser] = useState<UserUpdateViewModel>();

	const fetchUsers = async () => {
		try {
			const data = await userService.getUsers(session?.user.department);
			sortUsers(data);
			setUsers(data);
		} catch (error) {
			toast.error(`Error fetching users: ${error}`);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const handleUserSelect = (e: ChangeEvent<HTMLSelectElement>) => {
		const selectedUserId = parseInt(e.target.value);
		const selectedUser = users.find((user) => user.id === selectedUserId);

		if (selectedUser) {
			const department = selectedUser.department
				.toString()
				.split(", ")
				.reduce(
					(acc, value) => acc | Department[value as keyof typeof Department],
					0
				);
			selectedUser.department = department;
			const region = selectedUser.region
				.toString()
				.split(", ")
				.reduce((acc, value) => acc | Region[value as keyof typeof Region], 0);
			selectedUser.region = region;
			setUserId(selectedUserId);
			setUser(selectedUser);
		}
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		setUser({ ...user, [e.target.name]: e.target.value });
	};

	const handleUpdate = async () => {
		if (user) {
			const userUpdateViewModel: UserUpdateViewModel =
				user as UserUpdateViewModel;
			await userService.updateUser(userId ?? 0, userUpdateViewModel);
			fetchUsers();
		} else {
			toast.error("User not found.");
		}
	};

	return (
		<div className="p-2">
			<div className="flex w-full items-center rounded-full h-14">
				<div className="flex-1 border-b border-gray-300 dark:border-gray-600"></div>
				<div className="px-3 py-2 text-gray-700 dark:text-gray-300 text-sm font-semibold leading-7 rounded-full border border-gray-300 dark:border-gray-600">
					Select User
				</div>
				<div className="flex-1 border-b border-gray-300 dark:border-gray-600"></div>
			</div>
			<select
				className="m-1 p-2 bg-gray-300 dark:bg-gray-600 border border-gray-500 dark:border-gray-400 rounded-md shadow-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
				onChange={handleUserSelect}
			>
				<option value="">Select a User</option>
				{users.map((user) => (
					<option value={user.id} key={user.id}>
						{userService.getFullName(user)}
					</option>
				))}
			</select>
			{user && (
				<div className="m-1 flex flex-col items-center justify-center space-y-4 bg-white dark:bg-gray-900 rounded-xl shadow-xl">
					<nav className="p-2 w-full text-center text-md font-bold bg-gray-300 dark:bg-gray-700 rounded-t-md border-b border-gray-500 dark:border-gray-300">
						Update User
					</nav>
					<form
						onSubmit={handleUpdate}
						className="px-5 pb-3 w-full space-y-2 dark:[color-scheme:dark]"
					>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Emp Id
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
							User Name
							<input
								type="text"
								name="user_name"
								placeholder="User Name"
								value={user.user_name}
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
								name="email"
								placeholder="Email"
								value={user.email}
								onChange={handleChange}
								className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
							/>
						</label>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Department
							<div className="flex flex-wrap">
								{Object.keys(Department)
									.filter((key) => isNaN(Number(key)))
									.map((key) => (
										<label
											key={key}
											className="flex items-center space-x-1 m-1"
										>
											<input
												type="checkbox"
												value={key}
												checked={
													((user.department ?? 0) &
														Department[key as keyof typeof Department]) !=
													0
												}
												onChange={(e: ChangeEvent<HTMLInputElement>) =>
													setUser({
														...user,
														department:
															(user.department ?? 0) ^
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
										<label
											key={key}
											className="flex items-center space-x-1 m-1"
										>
											<input
												type="checkbox"
												value={key}
												checked={
													((user.region ?? 0) &
														Region[key as keyof typeof Region]) !=
													0
												}
												onChange={(e: ChangeEvent<HTMLInputElement>) =>
													setUser({
														...user,
														region:
															(user.region ?? 0) ^
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
										role: Number(e.target.value) as Role,
									})
								}
								className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300"
							>
								{ROLE_NAMES.map((key) => (
									<option value={Role[key]} key={key}>
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
								Update User
							</button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
}
