import React from "react";
import Image from "next/image";
import Link from "next/link";
// import { ReactComponent as BrandIcon } from './brand-icon.svg'; // replace this with the path of your brand icon

interface StatItemProps {
	label: string;
	value: number;
	icon: string; // Replace any with the specific type of your icon component
	href: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, icon, href }) => (
	<div className="p-6 transition-colors duration-200 transform bg-gradient-to-br from-indigo-200 to-indigo-50 border border-gray-200 shadow-md hover:shadow-xl rounded-lg hover:bg-gray-200">
		{/* <Image src="/favicon.ico" width={20} height={20} alt='brand logo' /> */}
		<dt className="text-xl font-medium text-black">{label}</dt>
		<dd className="text-2xl font-semibold mb-2 text-gray-700">{value}</dd>
		{/* <hr className="my-3 border-b-1 border-black" /> */}
		{href && (
			<Link href={href} className="text-blue-500 hover:text-blue-700 text-end">
				{"View All ->"}
			</Link>
		)}
	</div>
);

export default StatItem;
