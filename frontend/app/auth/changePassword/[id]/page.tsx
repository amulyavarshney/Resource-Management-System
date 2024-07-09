"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import userService from "@/app/api/services/user";
import toast from "react-hot-toast";

export default function ResetPassword({ params }: { params: { id: number } }) {
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showTooltip, setTooltip] = useState(false);
	const router = useRouter();

	const changePassword = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setTooltip(false);
		try {
			await userService.changePassword(params.id, newPassword, confirmPassword);
			setNewPassword("");
			setConfirmPassword("");
			toast.success("Password changed successfully.");
			router.push("/auth");
		} catch (error) {
			toast.error(`Error updating Password: ${error}`);
		}
	};

	return (
		<div className="h-screen flex min-h-full flex-col justify-center p-6 bg-gray-100 dark:bg-gray-900">
			<div className="sm:mx-auto sm:w-full sm:max-w-sm">
				<Image
					className="mx-auto h-16 w-auto"
					src="/company_logo.svg"
					alt="Company Logo"
					width={25}
					height={25}
				/>
				<h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100">
					Change your Password?
				</h2>
			</div>
			<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
				<form
					className="dark:[color-scheme:dark] space-y-4"
					onSubmit={changePassword}
				>
					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
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
						<div className="mt-2">
							<input
								id="newPassword"
								name="newPassword"
								type="password"
								value={newPassword}
								required
								className="block px-3 w-full rounded-md border-0 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
								placeholder="New Password"
								onChange={(e) => setNewPassword(e.target.value)}
							/>
						</div>
					</div>
					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
						>
							Confirm Password
						</label>
						<div className="mt-2">
							<input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								value={confirmPassword}
								required
								className="block px-3 w-full rounded-md border-0 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
								placeholder="Retype New Password"
								onChange={(e) => setConfirmPassword(e.target.value)}
							/>
						</div>
					</div>
					<div>
						<button
							type="submit"
							className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
						>
							Change Password
						</button>
					</div>
				</form>

				<div className="mt-5 text-center text-sm text-gray-500">
					<button
						type="button"
						className="px-3 font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
						onClick={() => router.back()}
					>
						Remember Password?
					</button>
				</div>
			</div>
		</div>
	);
}
