"use client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MailService from "@/app/api/mail/mail";
import userService from "@/app/api/services/user";
import toast from "react-hot-toast";

export default function ResetPassword() {
	const [email, setEmail] = useState("");
	const router = useRouter();

	const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
	}, []);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const user = await userService.getUserByEmail(email);
		const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL;
		const url = `${baseUrl}/auth/changePassword/${user.id}`;
		console.log("url: ", url);
		const message =
    		`<div>
    		<h1>Have you forgotten your password?</h1>
    		<p>Your request for password change is successful. Please <a href=${`${baseUrl}/auth/changePassword/${user.id}`} style="color: blue; text-decoration: underline;">click here</a> to reset your password.</p>
    		<p>This is a system generated mail, please do not respond. For any queries, please write to <a href="mailto:amulya.varshney@rms.com" style="color: blue;">amulya.varshney@rms.com</a>.</p>
    		<p>Regards,<br>Team RMS</p>
    		</div>`;
		console.log(message);
		// Call your mail service's send method
		MailService.send(
			`Forgot your password?`,
			message,
			"Normal",
			[email],
			[],
			[],
			[],
		);
		toast.success("Password reset mail sent successfully.");
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
					Forgot your Password?
				</h2>
			</div>
			<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
				<form className="dark:[color-scheme:dark] space-y-4" onSubmit={handleSubmit}>
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
								value={email}
								autoComplete="email"
								required
								className="block px-3 w-full rounded-md border-0 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
								placeholder="Email Address"
								onChange={handleChange}
							/>
						</div>
					</div>
					<div>
						<button
							type="submit"
							className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
						>
							Send Reset Link
						</button>
					</div>
				</form>

				<div className="mt-5 text-center text-sm text-gray-500">
					<button type="button"
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
