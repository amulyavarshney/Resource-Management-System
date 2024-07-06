export type SortImageProps = {
	field: string;
	sortConfig: { column: string; isAscending: boolean };
};

export default function SortImg({ field, sortConfig }: SortImageProps) {
	return (
        <div className="fill-gray-900 dark:fill-gray-100">
            {sortConfig.column === field ?
                sortConfig.isAscending ?
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                    >
                        <path d="M11 8.414V18h2V8.414l4.293 4.293 1.414-1.414L12 4.586l-6.707 6.707 1.414 1.414z" />
                    </svg>
                :
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                    >
                        <path d="m18.707 12.707-1.414-1.414L13 15.586V6h-2v9.586l-4.293-4.293-1.414 1.414L12 19.414z" />
                    </svg>
            : null}
        </div>
    );
}
