import { useCallback, useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import toast from "react-hot-toast";

type LoginProps = {
	updateIsLogin: () => void;
};

export default function Login({ updateIsLogin }: LoginProps) {
	const [credentials, setCredentials] = useState({ email: "", password: "" });

	const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setCredentials((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	}, []);

	const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		await signIn("credentials", { ...credentials, redirect: false }).then(
			(callback) => {
				if (callback?.error) {
					toast.error(callback.error);
				} else if (callback?.ok) {
					toast.success("Logged in successfully!");
					// if (rememberMe) { // rememberMe is the state of the "Remember Me" checkbox
					// 	Cookies.set('rememberMe', credentials, { expires: 7 }); // This cookie expires after 7 days
					// }
				}
			}
		);
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
					Sign in to your account
				</h2>
				<h3 className="text-center text-sm text-gray-900 dark:text-gray-100">
					To test, login using email address:{" "}
					<span className="font-bold">developer@rms.com</span>
				</h3>
				<h3 className="text-center text-sm text-gray-900 dark:text-gray-100">
					password: <span className="font-bold">Developer</span>
				</h3>
			</div>
			<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
				<form
					className="dark:[color-scheme:dark] space-y-4"
					onSubmit={handleSignIn}
				>
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
								value={credentials.email}
								autoComplete="email"
								required
								className="block px-3 w-full rounded-md border-0 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
								placeholder="Email Address"
								onChange={handleChange}
							/>
						</div>
						{/* <div className="mt-2 flex justify-between items-center shadow-sm sm:text-sm sm:leading-6">
							<input
								id="email"
								name="email"
								type="text"
								value={credentials.email}
								required
								className="flex-auto appearance-none w-full px-3 py-1.5 bg-transparent border-0 border-gray-300 rounded-l-md ring-1 ring-inset ring-gray-300 placeholder-gray-400 focus:outline-none focus:rounded-l-md focus:ring-2 focus:ring-inset focus:ring-indigo-600"
								placeholder="Email Address"
								onChange={handleChange}
							/>
							<span className="bg-gray-300 px-3 py-1.5 rounded-r-md font-medium">
								@rms.com
							</span>
						</div> */}
					</div>
					<div>
						<div className="flex items-center justify-between">
							<label
								htmlFor="password"
								className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100"
							>
								Password
							</label>
						</div>
						<div className="mt-2">
							<input
								id="password"
								name="password"
								type="password"
								value={credentials.password}
								autoComplete="current-password"
								required
								className="block px-3 w-full rounded-md border-0 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
								placeholder="Password"
								onChange={handleChange}
							/>
						</div>
					</div>
					<div className="flex items-center justify-between text-sm">
						<div className="flex items-center gap-1">
							<input
								type="checkbox"
								className=" border border-gray-900 dark:border-gray-100 leading-loose"
							/>
							<label
								htmlFor="remember"
								className="font-medium text-gray-900 dark:text-gray-100"
							>
								Remember Me
							</label>
						</div>
						<a
							href="/auth/resetPassword"
							className="font-semibold text-indigo-600 hover:text-indigo-500"
						>
							Forgot password?
						</a>
					</div>
					<div>
						<button
							type="submit"
							className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
						>
							Sign in
						</button>
					</div>
				</form>

				<div className="mt-10 text-center text-sm text-gray-500">
					<div className="h-0 my-2 border border-solid border-gray-300 dark:border-gray-600" />
					Not a member?
					<button
						type="button"
						className="px-3 font-semibold leading-6 text-indigo-600 hover:text-indigo-500 cursor-pointer"
						onClick={updateIsLogin}
					>
						Register Now
					</button>
				</div>
			</div>
		</div>
	);
}
