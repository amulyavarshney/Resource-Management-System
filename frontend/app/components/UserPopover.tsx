import { useSession } from "next-auth/react";
import Image from "next/image";

export default function UserPopover() {
	const { data: session } = useSession();
	return (
		<div className="w-60 inline-block bg-white dark:bg-gray-800 rounded-xl shadow-md text-left">
			<div className="p-2 border-b border-gray-200 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Image src="/user.svg" alt="user" width={40} height={40} className="border border-gray-200 rounded-full"/>
					<div className="block">
						<h5 className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-0">
							{session?.user.name}
						</h5>
						<span className="text-sm text-gray-500 dark:text-gray-200 font-normal">
							{session?.user.role}
						</span>
					</div>
				</div>
			</div>
			<ul className="p-3 block space-y-2">
				<li className="flex items-center gap-3 text-sm text-gray-900 dark:text-gray-300">
					<svg
						className="transition-none"
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							className="transition-none"
							d="M15.2418 8.76873L10.8252 4.35207M4.34241 8.76873L8.75908 4.35207M6.45829 12.852C6.45829 12.852 7.39746 13.6854 8.12496 13.6854C8.85246 13.6854 9.79163 12.852 9.79163 12.852C9.79163 12.852 10.7308 13.6854 11.4583 13.6854C12.1858 13.6854 13.125 12.852 13.125 12.852M9.08336 4.67705L8.43336 4.02703C8.04169 3.63536 8.04169 3.00207 8.43336 2.6104L9.08336 1.96038C9.47502 1.56871 10.1084 1.56871 10.5 1.96038L11.15 2.6104C11.5417 3.00207 11.5417 3.63536 11.15 4.02703L10.5 4.67705C10.1084 5.06872 9.47502 5.06872 9.08336 4.67705ZM16 8.52708H16.9166C17.4666 8.52708 17.9166 8.97709 17.9166 9.52709V10.4437C17.9166 10.9937 17.4666 11.4438 16.9166 11.4438H16C15.45 11.4438 15 10.9937 15 10.4437V9.52709C15 8.97709 15.45 8.52708 16 8.52708ZM3.5833 8.52708H2.66662C2.11662 8.52708 1.66663 8.97709 1.66663 9.52709V10.4437C1.66663 10.9937 2.11662 11.4438 2.66662 11.4438H3.5833C4.1333 11.4438 4.58329 10.9937 4.58329 10.4437V9.52709C4.58329 8.97709 4.1333 8.52708 3.5833 8.52708ZM6.45829 12.7927C6.45829 12.7927 6.45829 14.4984 6.45829 16.1854C6.45829 16.971 6.45829 17.3639 6.70237 17.608C6.94645 17.852 7.33928 17.852 8.12496 17.852H11.4583C12.244 17.852 12.6368 17.852 12.8809 17.608C13.125 17.3639 13.125 16.971 13.125 16.1854C13.125 14.4984 13.125 12.7927 13.125 12.7927L9.79163 7.85203L6.45829 12.7927Z"
							stroke="#9CA3AF"
							stroke-width="1.2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>{" "}
					{session?.user.department}
				</li>
				<li className="flex items-center gap-3 text-sm text-gray-900 dark:text-gray-300">
					<svg
						className="transition-none"
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							className="transition-none"
							d="M16.6667 14.1667C15.7462 14.1667 15 13.4205 15 12.5V10C15 9.07953 15.7462 8.33333 16.6667 8.33333C17.5872 8.33333 18.3334 9.07953 18.3334 10V12.5C18.3334 13.4205 17.5872 14.1667 16.6667 14.1667ZM16.6667 14.1667V18.3333M8.33337 7.5H5.00004M8.33337 10.8333H5.00004M6.66671 18.3333L6.66671 15M0.833374 18.3333H19.1667M11.6667 18.3333V6.5C11.6667 4.61438 11.6667 3.67157 11.0809 3.08579C10.4951 2.5 9.55232 2.5 7.66671 2.5H5.66671C3.78109 2.5 2.83828 2.5 2.25249 3.08579C1.66671 3.67157 1.66671 4.61438 1.66671 6.5V18.3333H11.6667Z"
							stroke="#9CA3AF"
							stroke-width="1.2"
							stroke-miterlimit="10"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					{session?.user.region}
				</li>
			</ul>
		</div>
	);
}
