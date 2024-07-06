import { signOut } from "next-auth/react";
import Image from "next/image";

export default function SignOut() {
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
				<h2 className="my-5 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100">
					Sign Out
				</h2>
				<div className="my-5 text-center sm:mx-auto sm:w-full sm:max-w-sm">
					Are you sure you want to sign out?
				</div>
				<button
					onClick={() => signOut()}
					className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
				>
					Sign Out
				</button>
			</div>
		</div>
	);
}
