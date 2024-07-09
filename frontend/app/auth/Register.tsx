import { useCallback, useState } from "react";
import { Department, Region, Role } from "@/nextauth.d";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { UserCreateViewModel } from "@/app/api/services/user";
import authService from "../api/services/auth";

type RegisterProps = {
	updateIsLogin: () => void;
};

export default function Register({ updateIsLogin }: RegisterProps) {
	const router = useRouter();
	const [showTooltip, setTooltip] = useState(false);
	const [user, setUser] = useState<
		UserCreateViewModel & { password: string; confirmPassword: string }
	>({
		empId: undefined,
		userName: "",
		firstName: "",
		lastName: "",
		email: "",
		department: Department.D1,
		region: Region.India,
		role: Role.Developer,
		workHoursPerDay: 8,
		password: "",
		confirmPassword: "",
		parentId: 1,
	});

	const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	}, []);

	const registerUser = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (user.password !== user.confirmPassword) {
			toast.error("Password not matched!");
			return;
		}
		try {
			await authService.register(user);
			// router.push("/profile");
		} catch (error) {
			toast.error(`Failed to registered: ${error}`);
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
					Register your Account
				</h2>
			</div>
			<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
				<form className="dark:[color-scheme:dark] space-y-4" onSubmit={registerUser}>
					{/* <div>
						<label
							htmlFor="userName"
							className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
						>
							User Name
						</label>
						<div className="mt-2">
							<input
								id="userName"
								name="userName"
								type="text"
								value={user.userName}
								autoComplete="name"
								required
								className="block px-3 w-full rounded-md border-0 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
								placeholder="Enter your User Name"
								onChange={handleChange}
							/>
						</div>
					</div> */}
					<div>
						<label
							htmlFor="firstName"
							className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
						>
							First Name
						</label>
						<div className="mt-2">
							<input
								id="firstName"
								name="firstName"
								type="text"
								value={user.firstName}
								autoComplete="name"
								required
								className="block px-3 w-full rounded-md border-0 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
								placeholder="Enter your First Name"
								onChange={handleChange}
							/>
						</div>
					</div>
					<div>
						<label
							htmlFor="lastName"
							className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
						>
							Last Name
						</label>
						<div className="mt-2">
							<input
								id="lastName"
								name="lastName"
								type="text"
								value={user.lastName}
								autoComplete="name"
								required
								className="block px-3 w-full rounded-md border-0 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
								placeholder="Enter your Last Name"
								onChange={handleChange}
							/>
						</div>
					</div>
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
						>
							Email Address
						</label>
						<div className="mt-2">
							<input
								id="email"
								name="email"
								type="email"
								value={user.email}
								autoComplete="email"
								required
								className="block px-3 w-full rounded-md border-0 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
								placeholder="Enter your Email Address"
								onChange={handleChange}
							/>
						</div>
					</div>
					<div>
						<div className="flex items-center justify-between">
							<label
								htmlFor="password"
								className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
							>
								Password
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
						</div>
						<div className="mt-2">
							<input
								id="password"
								name="password"
								type="password"
								value={user.password}
								autoComplete="current-password"
								className="block px-3 w-full rounded-md border-0 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
								placeholder="Enter a Password"
								onChange={handleChange}
							/>
						</div>
					</div>
					<div>
						<div className="flex items-center justify-between">
							<label
								htmlFor="password"
								className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
							>
								Confirm Password
							</label>
						</div>
						<div className="mt-2">
							<input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								value={user.confirmPassword}
								autoComplete="current-password"
								className="block px-3 w-full rounded-md border-0 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
								placeholder="Enter a Password"
								onChange={handleChange}
							/>
						</div>
					</div>
					<div>
						<button
							type="submit"
							className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
						>
							Register
						</button>
					</div>
				</form>

				<p className="mt-10 text-center text-sm text-gray-500">
					<div className="h-0 my-2 border border-solid border-gray-300 dark:border-gray-600" />
					Already have an account?
					<button
						type="button"
						className="px-3 font-semibold leading-6 text-indigo-600 hover:text-indigo-500 cursor-pointer"
						onClick={updateIsLogin}
					>
						Login Now
					</button>
				</p>
			</div>
		</div>
	);
}
