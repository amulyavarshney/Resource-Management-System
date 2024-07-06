import Link from "next/link";
type HeaderLinkProps = {
	href: string;
	title: string;
	className?: string;
	isButton?: boolean;
};
export default function HeaderLink({
	href,
	title,
	className,
	isButton,
}: HeaderLinkProps) {
	return (
		<div className={className}>
			<div
				className={`${
					isButton
						? "w-fit p-2 bg-indigo-500 dark:bg-indigo-800 text-white border border-indigo-700 rounded-md shadow-md"
						: "text-indigo-600 dark:text-white"
				}`}
			>
				<Link
					href={href}
					className={`group flex items-center gap-2 font-semibold transition-all duration-500 stroke-indigo-600 dark:stroke-white ${
						isButton ? "stroke-white" : "stroke-indigo-600"
					}`}
				>
					{title}
					<svg
						className="transition-all duration-500 group-hover:translate-x-1"
						width="18"
						height="18"
						viewBox="0 0 18 18"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M2.25 9L14.25 9M10.5 13.5L14.4697 9.53033C14.7197 9.28033 14.8447 9.15533 14.8447 9C14.8447 8.84467 14.7197 8.71967 14.4697 8.46967L10.5 4.5"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
						></path>
					</svg>
				</Link>
			</div>
		</div>
	);
}
