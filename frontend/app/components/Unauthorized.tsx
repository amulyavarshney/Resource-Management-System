export default function Unauthorized() {
	return (
		<>
			<div className="h-screen place-items-center bg-white dark:bg-gray-900 px-6 py-24 sm:py-32 lg:px-8">
				<div className="text-center">
					<p className="text-base font-semibold text-indigo-600 dark:text-indigo-400">401</p>
					<h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
						Unauthorized
					</h1>
					<p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-400">
						Sorry, you are not authorized to access this page.
					</p>
					<div className="mt-10 flex items-center justify-center gap-x-6">
						<a
							href="/"
							className="rounded-md bg-indigo-600 dark:bg-indigo-800 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-800"
						>
							Go back home
						</a>
						<a
							href={process.env.CONTACT_SUPPORT}
							className="text-sm font-semibold text-gray-900 dark:text-gray-100"
						>
							Contact support <span aria-hidden="true">&rarr;</span>
						</a>
					</div>
				</div>
			</div>
		</>
	);
}
