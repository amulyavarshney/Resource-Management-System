import {
	ChangeEvent,
	Dispatch,
	SetStateAction,
	useEffect,
	useState,
} from "react";
import toast from "react-hot-toast";
import { Department, Region, Role } from "@/nextauth.d";
import userService, {
	User,
	UserUpdateViewModel,
} from "@/app/api/services/user";
import ChangePassword from "./ChangePassword";
import RemovePassword from "./RemovePassword";
import { sortUsers } from "@/app/api/services/utils";
import { useSession } from "next-auth/react";

type CardSettingsProps = {
	user: User;
	setUser: Dispatch<SetStateAction<User | undefined>>;
};

export default function CardSettings({ user, setUser }: CardSettingsProps) {
	const { data: session } = useSession();
	const [userData, setUserData] = useState<UserUpdateViewModel>({});
	const [managers, setManagers] = useState<User[]>([]);

	const fetchManagers = async () => {
		try {
			const data = await userService.getManagers(session?.user.department);
			sortUsers(data);
			setManagers(data);
		} catch (error) {
			toast.error(`Error fetching users: ${error}`);
		}
	};

	useEffect(() => {
		fetchManagers();
	}, []);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		setUserData({ ...userData, [e.target.name]: e.target.value });
	};

	const handleUpdate = async () => {
		try {
			if (user) {
				const response = await userService.updateUser(user.id, userData);
				setUser(response);
			} else {
				toast.error("An error occurred while updating the user.");
			}
		} catch (error) {
			toast.error(`Error updating user: ${error}`);
		}
	};

	return (
		<div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
			<div className="bg-indigo-200 dark:bg-gray-700 p-6 flex justify-between shadow rounded-t-md">
				<h6 className="inline-flex items-center text-xl text-gray-900 dark:text-gray-100 font-bold gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						className="fill-gray-900 dark:fill-gray-100"
					>
						<path d="m2.344 15.271 2 3.46a1 1 0 0 0 1.366.365l1.396-.806c.58.457 1.221.832 1.895 1.112V21a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1.598a8 8 0 0 0 1.895-1.112l1.396.806c.477.275 1.091.11 1.366-.365l2-3.46a1.004 1.004 0 0 0-.365-1.366l-1.372-.793a7.7 7.7 0 0 0-.002-2.224l1.372-.793c.476-.275.641-.89.365-1.366l-2-3.46a1 1 0 0 0-1.366-.365l-1.396.806A8 8 0 0 0 15 4.598V3a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v1.598A8 8 0 0 0 7.105 5.71L5.71 4.904a1 1 0 0 0-1.366.365l-2 3.46a1.004 1.004 0 0 0 .365 1.366l1.372.793a7.7 7.7 0 0 0 0 2.224l-1.372.793c-.476.275-.641.89-.365 1.366M12 8c2.206 0 4 1.794 4 4s-1.794 4-4 4-4-1.794-4-4 1.794-4 4-4" />
					</svg>
					Settings
				</h6>
				<button
					className="px-4 py-2 text-white font-medium text-sm bg-indigo-600 dark:bg-gray-800 hover:bg-indigo-400 dark:hover:bg-gray-600 active:bg-indigo-700 dark:active:bg-gray-900 border border-indogo-800 dark:border-gray-600 rounded-md shadow-md hover:shadow-lg ease-linear transition-all duration-150"
					type="button"
					onClick={handleUpdate}
				>
					Save
				</button>
			</div>
			<div className="flex-auto px-4 lg:px-10 py-10 pt-0">
				<form className="space-y-4 dark:[color-scheme:dark]">
					<h6 className="text-gray-600 dark:text-gray-400 text-sm mt-3 mb-6 font-bold uppercase">
						User Information
					</h6>
					<div className="flex flex-wrap">
						<div className="w-full lg:w-6/12 px-4">
							<div className="relative w-full mb-3">
								<label className="block uppercase text-xs font-bold text-gray-700 dark:text-gray-300">
									User Name
								</label>
								<input
									type="text"
									name="user_name"
									placeholder="User Name"
									value={userData.user_name}
									onChange={handleChange}
									className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300 placeholder-gray-600 dark:placeholder-gray-300 transition-all duration-150"
									defaultValue={user?.user_name}
								/>
							</div>
						</div>
						<div className="w-full lg:w-6/12 px-4">
							<div className="relative w-full mb-3">
								<label className="block uppercase text-xs font-bold text-gray-700 dark:text-gray-300">
									Emp Id
								</label>
								<input
									type="text"
									name="emp_id"
									placeholder="Emp Id"
									value={userData.emp_id}
									onChange={handleChange}
									className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300 placeholder-gray-600 dark:placeholder-gray-300 transition-all duration-150"
									defaultValue={user?.emp_id}
								/>
							</div>
						</div>
						<div className="w-full lg:w-6/12 px-4">
							<div className="relative w-full mb-3">
								<label className="block uppercase text-xs font-bold text-gray-700 dark:text-gray-300">
									First Name
								</label>
								<input
									type="text"
									name="first_name"
									placeholder="First Name"
									value={userData.first_name}
									onChange={handleChange}
									className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300 placeholder-gray-600 dark:placeholder-gray-300 transition-all duration-150"
									defaultValue={user?.first_name}
								/>
							</div>
						</div>
						<div className="w-full lg:w-6/12 px-4">
							<div className="relative w-full mb-3">
								<label className="block uppercase text-xs font-bold text-gray-700 dark:text-gray-300">
									Last Name
								</label>
								<input
									type="text"
									name="last_name"
									placeholder="Last Name"
									value={userData.last_name}
									onChange={handleChange}
									className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300 placeholder-gray-600 dark:placeholder-gray-300 transition-all duration-150"
									defaultValue={user?.last_name}
								/>
							</div>
						</div>
						<div className="w-full lg:w-6/12 px-4">
							<div className="relative w-full mb-3">
								<label className="block uppercase text-xs font-bold text-gray-700 dark:text-gray-300">
									Email address
								</label>
								<input
									type="email"
									name="email"
									placeholder="Email"
									value={userData.email}
									onChange={handleChange}
									className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300 placeholder-gray-600 dark:placeholder-gray-300 transition-all duration-150"
									defaultValue={user?.email}
								/>
							</div>
						</div>
						<div className="w-full lg:w-6/12 px-4">
							<div className="relative w-full mb-3">
								<label className="block uppercase text-xs font-bold text-gray-700 dark:text-gray-300">
									Work Hours / Day
								</label>
								<input
									type="number"
									name="work_hours_per_day"
									placeholder="Name"
									value={userData.work_hours_per_day}
									onChange={handleChange}
									className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300 placeholder-gray-600 dark:placeholder-gray-300 transition-all duration-150"
									defaultValue={user?.work_hours_per_day}
								/>
							</div>
						</div>
						<div className="w-full lg:w-6/12 px-4">
							<div className="relative w-full mb-3">
								<label className="block uppercase text-xs font-bold text-gray-700 dark:text-gray-300">
									Role
								</label>
								<select
									value={user.role}
									onChange={(e) =>
										setUser({
											...user,
											role: Role[e.target.value as keyof typeof Role],
										})
									}
									className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300 placeholder-gray-600 dark:placeholder-gray-300 transition-all duration-150"
								>
									{Object.keys(Role).map((key) => (
										<option value={Role[key as keyof typeof Role]} key={key}>
											{key}
										</option>
									))}
								</select>
							</div>
						</div>
						<div className="w-full lg:w-6/12 px-4">
							<div className="relative w-full mb-3">
								<label className="block uppercase text-xs font-bold text-gray-700 dark:text-gray-300">
									Reporting Manager
								</label>
								<select
									value={user.parent_id}
									onChange={(e) =>
										setUser({
											...user,
											parent_id: Number(e.target.value),
										})
									}
									className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300 placeholder-gray-600 dark:placeholder-gray-300 transition-all duration-150"
								>
									<option value={0}>Select Reporting Manager</option>
									{managers.map((user) => (
										<option value={user.id} key={user.id}>
											{userService.getFullName(user)}
										</option>
									))}
								</select>
							</div>
						</div>
						<div className="w-full lg:w-6/12 px-4">
							<div className="relative w-full mb-3">
								<label className="block uppercase text-xs font-bold text-gray-700 dark:text-gray-300">
									Department
								</label>
								<select
									value={user.department}
									onChange={(e) =>
										setUser({
											...user,
											department:
												Department[e.target.value as keyof typeof Department],
										})
									}
									className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300 placeholder-gray-600 dark:placeholder-gray-300 transition-all duration-150"
								>
									{Object.entries(Department)
										.filter(([key]) => Number(key))
										.map(([key, value]) => (
											<option key={key} value={key}>
												{value}
											</option>
										))}
								</select>
							</div>
						</div>
						<div className="w-full lg:w-6/12 px-4">
							<div className="relative w-full mb-3">
								<label className="block uppercase text-xs font-bold text-gray-700 dark:text-gray-300">
									Region
								</label>
								<select
									value={user.region}
									onChange={(e) =>
										setUser({
											...user,
											region: Region[e.target.value as keyof typeof Region],
										})
									}
									className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300 placeholder-gray-600 dark:placeholder-gray-300 transition-all duration-150"
								>
									{Object.entries(Region)
										.filter(([key]) => Number(key))
										.map(([key, value]) => (
											<option key={key} value={key}>
												{value}
											</option>
										))}
								</select>
							</div>
						</div>
					</div>
				</form>
				<ChangePassword user={user} />
				<RemovePassword user={user} />
			</div>
		</div>
	);
}
