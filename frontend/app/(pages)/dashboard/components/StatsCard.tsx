import React from "react";
import HeaderLink from "@/app/components/HeaderLink";

interface StatItemProps {
	label: string;
	value: number;
	fteValue: number;
	extValue: number;
	icon: JSX.Element;
	href: string;
}

const StatItem: React.FC<StatItemProps> = ({
	label,
	value,
	fteValue,
	extValue,
	icon,
	href,
}) => (
	<div>
		<div
			className={`p-5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-400 dark:border-gray-500 shadow-md hover:shadow-xl ${
				fteValue >= 0 && extValue >= 0 ? "rounded-t-lg" : "rounded-lg"
			}`}
		>
			<div className="flex flex-col justify-center items-center">
				<div className="m-2 fill-gray-900 dark:fill-gray-100">{icon}</div>
				<dd className="text-5xl text-center font-semibold text-gray-900 dark:text-gray-100">
					{value}
				</dd>
				<dt className="text-2xl text-center font-medium text-gray-800 dark:text-gray-200">
					{label}
				</dt>
			</div>
			{href ? (
				<HeaderLink href={href} title="View More" className="text-sm" />
			) : (
				<div className="p-2.5"></div>
			)}
		</div>
		<div className="flex">
			{fteValue >= 0 && (
				<div className="p-5 w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-400 dark:border-gray-500 shadow-md hover:shadow-xl rounded-bl-lg">
					<dt className="text-sm font-medium text-gray-800 dark:text-gray-200">
						FTE
					</dt>
					<dd className="text-3xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
						{fteValue}
					</dd>
				</div>
			)}
			{extValue >= 0 && (
				<div className="p-5 w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-400 dark:border-gray-500 shadow-md hover:shadow-xl rounded-br-lg">
					<dt className="text-sm font-medium text-gray-800 dark:text-gray-200">
						EXT
					</dt>
					<dd className="text-3xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
						{extValue}
					</dd>
				</div>
			)}
		</div>
	</div>
);

export default StatItem;
