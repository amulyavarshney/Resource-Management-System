import { useState } from "react";
import toast from "react-hot-toast";
import userService, { User } from "@/app/api/services/user";

type RemovePasswordProps = {
	user: User;
};

export default function RemovePassword({ user }: RemovePasswordProps) {
	const [isVisible, setVisible] = useState(false);
	const [password, setPassword] = useState("");

	const removePassword = async () => {
		try {
			if (user) {
				const response = await userService.removePassword(user.id, password);
				setPassword("");
				toast.success("Password removed successfully.");
			} else {
				toast.error("An error occurred while removing the password.");
			}
		} catch (error) {
			toast.error(`Error removing Password: ${error}`);
		}
	};

	return isVisible ? (
		<form>
			<hr className="mt-6 border-b-1 border-gray-300" />

			<h6 className="text-gray-600 dark:text-gray-400 text-sm mt-3 mb-6 font-bold uppercase">
				Remove Password
			</h6>
			<div className="flex flex-wrap">
				<div className="w-full lg:w-4/12 px-4">
					<div className="relative w-full mb-3">
						<label
							className="block uppercase text-xs font-bold text-gray-700 dark:text-gray-300"
							htmlFor="password"
						>
							Enter your Password
						</label>
						<input
							type="password"
							value={password}
							className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300 placeholder-gray-600 dark:placeholder-gray-300 transition-all duration-150"
							placeholder="Password"
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
				</div>
			</div>
			<div className="flex items-center justify-start gap-5">
				<button
					className="mx-3 bg-gray-700 active:bg-gray-600 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
					type="button"
					onClick={removePassword}
				>
					Remove Password
				</button>
				<div className="text-sm">
					<a
						href="/auth/resetPassword"
						className="font-semibold text-indigo-600 hover:text-indigo-500"
					>
						Forgot password?
					</a>
				</div>
			</div>
		</form>
	) : (
		<button
			className="m-3 bg-gray-700 active:bg-gray-600 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
			type="button"
			onClick={() => setVisible(!isVisible)}
		>
			Remove Password
		</button>
	);
}
