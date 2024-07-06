import { useState, useEffect, useRef, ChangeEvent } from "react";

interface MultiSelectDropdownProps {
	fieldName: string;
	options: string[];
}

export default function MultiSelectDropdown({
	fieldName,
	options,
}: MultiSelectDropdownProps) {
    const initialPrompt = `Select ${fieldName}`;
	const [isJsEnabled, setIsJsEnabled] = useState(false);
	const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
	const [prompt, setPrompt] = useState(initialPrompt);
	const optionsListRef = useRef<HTMLUListElement | null>(null);

	useEffect(() => {
		setIsJsEnabled(true);
	}, []);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const isChecked = e.target.checked;
		const option = e.target.value;

		const selectedOptionSet = new Set(selectedOptions);

		if (isChecked) {
			selectedOptionSet.add(option);
		} else {
			selectedOptionSet.delete(option);
		}

		const newSelectedOptions = Array.from(selectedOptionSet);

		setSelectedOptions(newSelectedOptions);
		if (newSelectedOptions.length == 0) {
			setPrompt(initialPrompt);
		} else {
			setPrompt(newSelectedOptions.join(", "));
		}
	};

	const isSelectAllEnabled = selectedOptions.length < options.length;

	const handleSelectAllClick = (
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		e.preventDefault();

		const optionsInputs = optionsListRef.current?.querySelectorAll("input");
		optionsInputs?.forEach((input) => {
			if (input instanceof HTMLInputElement) {
				input.checked = true;
			}
		});

		setSelectedOptions([...options]);
		setPrompt(options.join(", "));
	};

	const isClearSelectionEnabled = selectedOptions.length > 0;

	const handleClearSelectionClick = (
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		e.preventDefault();

		const optionsInputs = optionsListRef.current?.querySelectorAll("input");
		optionsInputs?.forEach((input) => {
			if (input instanceof HTMLInputElement) {
				input.checked = false;
			}
		});

		setSelectedOptions([]);
		setPrompt(initialPrompt);
	};

	return (
		<label className="mt-2 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
			<input type="checkbox" className="hidden peer" />

			<div className="cursor-pointer after:content-['⮟'] after:text-xs after:ml-1 after:inline-flex after:items-center peer-checked:after:-rotate-180 after:transition-transform inline-flex border rounded px-5 py-2">
				{prompt}
				{isJsEnabled && selectedOptions.length > 0 && (
					<span className="ml-1 text-blue-500">{`(${selectedOptions.length} selected)`}</span>
				)}
			</div>

			<div className="absolute bg-white border transition-opacity opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto w-full max-h-60 overflow-y-scroll">
				{isJsEnabled && (
					<ul>
						<li>
							<button
								onClick={handleSelectAllClick}
								disabled={!isSelectAllEnabled}
								className="w-full text-left px-2 py-1 text-blue-600 disabled:opacity-50"
							>
								{"Select All"}
							</button>
						</li>
						<li>
							<button
								onClick={handleClearSelectionClick}
								disabled={!isClearSelectionEnabled}
								className="w-full text-left px-2 py-1 text-blue-600 disabled:opacity-50"
							>
								{"Clear Selection"}
							</button>
						</li>
					</ul>
				)}
				<ul ref={optionsListRef}>
					{options.map((option) => (
						<li key={option}>
							<label
								className={`flex whitespace-nowrap cursor-pointer px-2 py-1 transition-colors hover:bg-blue-100 [&:has(input:checked)]:bg-blue-200`}
							>
								<input
									type="checkbox"
									name={fieldName}
									value={option}
									className="cursor-pointer"
									onChange={handleChange}
								/>
								<span className="ml-1">{option}</span>
							</label>
						</li>
					))}
				</ul>
			</div>
		</label>
	);
}
