export type ExportToExcelProps = {
	month: number;
	year: number;
}

export type Header = {
    [key: string]: string[];
}

export type Footer = {
    [key: string]: (string | number)[][];
}