import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Breadcrumb() {
	const path = usePathname();
	const router = useRouter();
	const items = path.split("/").filter((item) => isNaN(Number(item)));

	return (
		<div
			className="inline-flex px-5 bg-gray-100 dark:bg-gray-700 border border-gray-400 rounded-md shadow-md"
			aria-label="Breadcrumb"
		>
			<ol role="list" className="flex space-x-4">
				<li className="flex items-center">
					<svg
						version="1.0"
						xmlns="http://www.w3.org/2000/svg"
						width="66.667"
						height="66.667"
						viewBox="0 0 50 50"
						className="h-6 w-6 fill-gray-600 dark:fill-gray-200"
						onClick={() => router.back()}
					>
						<path d="m10.5 9-6 6 6.2 6.2c3.4 3.4 6.6 5.9 7 5.5s-1.5-3-4.2-5.7l-4.9-5H18c11.5 0 15.7 1.1 19.4 4.9 3.9 4.1 4.5 10.5 1.8 18.6-2 5.8-2.1 8.4-.1 5.5 2.1-3.3 4.1-12.5 3.6-16.8-.6-5.6-3.2-9.1-8.7-12-3.8-1.9-6-2.2-14.9-2.2H8.6l4.7-4.8C15.9 6.6 18 4.1 18 3.7c0-1.7-1.9-.3-7.5 5.3" />
					</svg>
				</li>
				{items.map((item, index) => (
					<li className="flex items-center" key={item}>
						<div key={item} className="flex items-center space-x-3">
							<svg
								className="h-10 w-6 fill-gray-400"
								viewBox="0 0 24 44"
								preserveAspectRatio="none"
								fill="currentColor"
								aria-hidden="true"
							>
								<path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z"></path>
							</svg>
							<Link
								href={`/${items.slice(0, index + 1).join("/")}`}
								className="text-sm text-gray-600 dark:text-gray-200 capitalize"
							>
								{item}
							</Link>
						</div>
					</li>
				))}
			</ol>
		</div>
	);
}
