type SelectMenuProps = {
	name: string;
	values: number[] | string[];
	defaultValue?: number | string;
	onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
	option?: (value: number | string) => string;
};

export default function SelectMenu({
	name,
	values,
	defaultValue,
	onChange,
	option,
}: SelectMenuProps) {
	return (
		<select
			name={name}
			value={defaultValue}
			onChange={onChange}
			className="m-2 p-2 dark:bg-gray-600 border border-gray-300 dark:border-gray-700 rounded-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
		>
			{values.map((value, index) => (
				<option key={index} value={value}>
					{option ? option(value) : value}
				</option>
			))}
		</select>
	);
}
