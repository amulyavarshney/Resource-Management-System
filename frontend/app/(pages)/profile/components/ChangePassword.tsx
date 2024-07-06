import { useState } from "react";
import toast from "react-hot-toast";
import userService, { User } from "@/app/api/services/user";

type ChangePasswordProps = {
	user: User;
};

export default function ChangePassword({ user }: ChangePasswordProps) {
	const [isVisible, setVisible] = useState(false);
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showTooltip, setTooltip] = useState(false);

	const changePassword = async () => {
		setTooltip(false);
		try {
			if (user) {
				await userService.changePassword(
					user.id,
					oldPassword,
					newPassword,
					confirmPassword
				);
				setOldPassword("");
				setNewPassword("");
				setConfirmPassword("");
				toast.success("Password changed successfully.");
			} else {
				toast.error("An error occurred while changing the password.");
			}
		} catch (error) {
			toast.error(`Error updating Password: ${error}`);
		}
	};

	return isVisible ? (
		<form>
			<hr className="mt-6 border-b-1 border-gray-300" />

			<h6 className="text-gray-600 dark:text-gray-400 text-sm mt-3 mb-6 font-bold uppercase">
				Change Password
			</h6>
			<div className="flex flex-wrap">
				<div className="w-full lg:w-4/12 px-4">
					<div className="relative w-full mb-3">
						<label
							className="p-1 block uppercase text-xs font-bold text-gray-700 dark:text-gray-300"
							htmlFor="password"
						>
							Old Password
						</label>
						<input
							type="password"
							value={oldPassword}
							className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300 placeholder-gray-600 dark:placeholder-gray-300 transition-all duration-150"
							placeholder="Old Password"
							onChange={(e) => setOldPassword(e.target.value)}
							required
						/>
					</div>
				</div>
				<div className="w-full lg:w-4/12 px-4">
					<div className="relative w-full mb-3">
						<label
							className="block uppercase text-xs font-bold text-gray-700 dark:text-gray-300"
							htmlFor="password"
						>
							New Password
							<div className="relative inline-block text-blue-600 cursor-pointer">
								<button
									className="mx-5 bg-gray-300 active:bg-gray-500 text-black font-bold uppercase text-xs px-2 py-1 rounded-full shadow hover:shadow-md outline focus:outline-none mr-1 ease-linear transition-all duration-150"
									type="button"
									onClick={() => setTooltip(!showTooltip)}
								>
									?
								</button>
								{showTooltip && (
									<div className="absolute text-xs font-normal bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 p-2 bg-gray-300 text-black rounded">
										<ul className="list-disc list-inside">
											<li>Atleast 8 characters long</li>
											<li>Atleast 1 uppercase letter (A-Z)</li>
											<li>Atleast 1 lowercase letter (a-z)</li>
											<li>Atleast 1 number (0-9)</li>
											<li>Atleast 1 special character (@, $, !, %, *, ?, &)</li>
										</ul>
									</div>
								)}
							</div>
						</label>
						<input
							type="password"
							value={newPassword}
							className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300 placeholder-gray-600 dark:placeholder-gray-300 transition-all duration-150"
							placeholder="New Password"
							onChange={(e) => setNewPassword(e.target.value)}
							required
						/>
					</div>
				</div>
				<div className="w-full lg:w-4/12 px-4">
					<div className="relative w-full mb-3">
						<label
							className="p-1 block uppercase text-xs font-bold text-gray-700 dark:text-gray-300"
							htmlFor="password"
						>
							Confirm New Password
						</label>
						<input
							type="password"
							value={confirmPassword}
							className="mt-1 block w-full py-2 px-3 sm:text-sm border border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-gray-300 dark:focus:border-gray-300 placeholder-gray-600 dark:placeholder-gray-300 transition-all duration-150"
							placeholder="Confirm New Password"
							onChange={(e) => setConfirmPassword(e.target.value)}
							required
						/>
					</div>
				</div>
			</div>
			<div className="flex items-center justify-start gap-5">
				<button
					className="mx-3 bg-gray-700 active:bg-gray-600 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
					type="button"
					onClick={changePassword}
				>
					Update Password
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
			Change Password
		</button>
	);
}
