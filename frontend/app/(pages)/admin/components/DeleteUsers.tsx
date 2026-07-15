import { useState, useEffect } from "react";
import { useSession } from "@/app/contexts/AuthContext";
import toast from "react-hot-toast";
import userService, { User } from "@/app/api/services/user";
import { sortUsers } from "@/app/api/services/utils";

export default function DeleteUsers() {
	const { data: session } = useSession();
	const [users, setUsers] = useState<User[]>([]);
	const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
	const [isOpen, setIsOpen] = useState(false);

	const toggleDropdown = () => setIsOpen(!isOpen);

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

	const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedUserId = parseInt(event.target.value);
		event.target.value = "";
		const selectedUser = users.find((user) => user.id === selectedUserId);

		if (selectedUser) {
			setSelectedUsers((prevState) => {
				// Check if the user is already in the state
				if (!prevState.find((user) => user.id === selectedUserId)) {
					// If not, add it
					return [...prevState, selectedUser];
				} else {
					// If it is, return the previous state
					return prevState;
				}
			});
		}
	};

	const handleUnselect = (userId: number) => {
		setSelectedUsers((prevState) =>
			prevState.filter((user) => user.id !== userId)
		);
	};

	const handleResetClick = () => {
		setSelectedUsers([]);
	};

	const handleDelete = async (deleteNow?: boolean) => {
		if (selectedUsers.length == 0) {
			toast.error("No User selected.");
			return;
		}
		try {
			for (const user of selectedUsers) {
				await userService.removeUser(user.id, deleteNow);
			}
			handleResetClick();
			toast.success("Selected Users removed successfully.");
			fetchUsers();
		} catch (error) {
			toast.error(`Error deleting users: ${error}`);
		}
	};

	return (
		<div className="p-2">
			<div className="flex w-full items-center rounded-full h-14">
				<div className="flex-1 border-b border-gray-300 dark:border-gray-600"></div>
				<div className="px-3 py-2 text-gray-700 dark:text-gray-300 text-sm font-semibold leading-7 rounded-full border border-gray-300 dark:border-gray-600">
					Select Users
				</div>
				<div className="flex-1 border-b border-gray-300 dark:border-gray-600"></div>
			</div>
			<select
				multiple
				className="m-1 p-2 bg-gray-300 dark:bg-gray-600 border border-gray-500 dark:border-gray-400 rounded-md shadow-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
				onChange={handleSelect}
			>
				{users.map((user) => (
					<option value={user.id} key={user.id}>
						{userService.getFullName(user)}
					</option>
				))}
			</select>
			<div className="flex flex-wrap mb-4">
				{selectedUsers.map((user, index) => (
					<button
						key={index}
						className="text-green-600 dark:text-green-500 border border-green-600 dark:border-green-500 px-2 py-1 rounded-2xl m-1 flex items-center"
						onClick={() => handleUnselect(user.id)}
					>
						<div key={user.id}>{userService.getFullName(user)}</div>
					</button>
				))}
			</div>
			<div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
				<button
					className="py-2.5 px-5 text-xs bg-indigo-200 dark:bg-gray-700 hover:bg-indigo-300 dark:hover:bg-gray-600 border border-indigo-500 dark:border-gray-300 text-indigo-500 dark:text-gray-300 rounded-full cursor-pointer font-semibold text-center shadow-xs transition-all duration-500"
					onClick={handleResetClick}
				>
					Reset
				</button>
				<div className="inline-flex">
					<button
						className="justify-center w-full p-3 text-sm font-medium text-white bg-red-600 rounded-l-sm hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
						onClick={() => handleDelete(true)}
					>
						Delete Now
					</button>
					<span className="relative block">
						<button
							type="button"
							className="items-center p-3 text-sm font-medium text-white bg-red-600 rounded-r-sm hover:bg-red-500 focus:outline-none focus:z-10 focus:ring-2 focus:ring-white"
							onClick={toggleDropdown}
						>
							<svg
								className="w-5 h-5"
								aria-hidden="true"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414z" />
							</svg>
						</button>
						{isOpen && (
							<div className="absolute right-0 w-36 mt-1 origin-top-right bg-red-600 hover:bg-red-500 divide-y divide-gray-100 rounded-sm shadow-lg ring-1 ring-black ring-opacity-5">
								<button
									className="group flex items-center w-full px-2 py-3 text-sm font-medium text-white"
									onClick={() => handleDelete(false)}
									role="menuitem"
								>
									Delete Next Month
								</button>
							</div>
						)}
					</span>
				</div>
			</div>
		</div>
	);
}
