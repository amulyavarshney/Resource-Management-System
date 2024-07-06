import Image from "next/image";
import { usePathname } from "next/navigation";

type SearchBoxProps = {
	field?: string;
	search: string;
	setSearch: (value: string) => void;
};

export default function SearchBox({
	field,
	search,
	setSearch,
}: SearchBoxProps) {
	const endpoint = usePathname().split("/").pop();
	field = field ?? endpoint;
	return (
		<>
			{isNaN(Number(field)) && (
				<label
					htmlFor="search"
					className="p-2 inline-flex justify-between items-center bg-white dark:bg-gray-700 border border-gray-400 dark:border-gray-400 rounded-md drop-shadow-2xl"
				>
					<input
						type="text"
						placeholder={`Search ${field}...`}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="capitalize bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 text-sm py-2 focus:outline-none"
					/>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						className="fill-gray-400 dark:fill-gray-400"
					>
						<path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"></path>
						<path d="M11.412 8.586c.379.38.588.882.588 1.414h2a3.977 3.977 0 0 0-1.174-2.828c-1.514-1.512-4.139-1.512-5.652 0l1.412 1.416c.76-.758 2.07-.756 2.826-.002z"></path>
					</svg>
				</label>
			)}
		</>
	);
}
