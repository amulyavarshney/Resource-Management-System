import { WorkSheet, utils } from "xlsx-js-style";

export type Header = {
	[key: string]: string[][];
};

export type Heading = {
	[key: string]: string[];
};

export type Footer = {
	[key: string]: (string | number)[][];
};

export type ExportFileProps = {
	year: number;
	month: number;
};

export const applyStylesToExcel = (
	worksheet: WorkSheet,
	headerLength: number,
	footerLength: number,
	hasSubHeading?: boolean
) => {
	if (worksheet["!ref"]) {
		const range = utils.decode_range(worksheet["!ref"]);
		let colWidths = Array(range.e.c - range.s.c + 1).fill(0);
		for (let R = range.s.r; R <= range.e.r; ++R) {
			for (let C = range.s.c; C <= range.e.c; ++C) {
				const cellAddress = { c: C, r: R };
				const cellRef = utils.encode_cell(cellAddress);
				const cell = worksheet[cellRef];
				const cellLength = cell.v.toString().length;
				if (cellLength > colWidths[C - range.s.c]) {
					colWidths[C - range.s.c] = cellLength;
				}
			}
		}
		worksheet["!cols"] = colWidths.map((w) => ({ wch: w }));
		worksheet["!rows"] = [...Array(headerLength).fill({ hpt: 20 })];

		for (let R = range.s.r; R <= range.e.r; ++R) {
			for (let C = range.s.c; C <= range.e.c; ++C) {
				const cellAddress = { c: C, r: R };
				const cellRef = utils.encode_cell(cellAddress);
				const cell = worksheet[cellRef];

				// Add styling to the header rows
				if (R < range.s.r + headerLength) {
					cell.s = {
						fill: { fgColor: { rgb: "4F81BD" } },
						font: { bold: true, sz: "14", color: { rgb: "000000" } },
						alignment: {
							horizontal: "center",
							vertical: "center",
							wrapText: true,
						},
					};
				}

				// Add styling to the headings row
				else if (R === range.s.r + headerLength) {
					cell.s = {
						fill: { fgColor: { rgb: "95b3d7" } },
						font: { bold: true, color: { rgb: "000000" } },
						border: {
							top: { style: "thin", color: { rgb: "4f81bd" } },
							bottom: { style: "thin", color: { rgb: "4f81bd" } },
							left: { style: "thin", color: { rgb: "4f81bd" } },
							right: { style: "thin", color: { rgb: "4f81bd" } },
						},
					};
				}

				// Add styling to the sub-headings row
				else if (hasSubHeading && R === range.s.r + headerLength + 1) {
					cell.s = {
						fill: { fgColor: { rgb: "95b3d7" } },
						font: { bold: true, color: { rgb: "000000" } },
						border: {
							top: { style: "thin", color: { rgb: "4f81bd" } },
							bottom: { style: "thin", color: { rgb: "4f81bd" } },
							left: { style: "thin", color: { rgb: "4f81bd" } },
							right: { style: "thin", color: { rgb: "4f81bd" } },
						},
					};
				}

				// Add styling to the footer rows
				else if (R > range.e.r - footerLength) {
					cell.s = {
						fill: { fgColor: { rgb: "4f81bd" } },
						font: { bold: true, color: { rgb: "FFFFFF" } },
						border: {
							top: { style: "thin", color: { rgb: "4f81bd" } },
							bottom: { style: "thin", color: { rgb: "4f81bd" } },
							left: { style: "thin", color: { rgb: "4f81bd" } },
							right: { style: "thin", color: { rgb: "4f81bd" } },
						},
					};
				}

				// Add styling to the odd rows
				else if (R & 1) {
					cell.s = {
						fill: { fgColor: { rgb: "dce6f1" } },
						border: {
							top: { style: "thin", color: { rgb: "4f81bd" } },
							bottom: { style: "thin", color: { rgb: "4f81bd" } },
							left: { style: "thin", color: { rgb: "4f81bd" } },
							right: { style: "thin", color: { rgb: "4f81bd" } },
						},
					};
				}

				// Add styling to the even rows
				else {
					cell.s = {
						fill: { fgColor: { rgb: "FFFFFF" } },
						border: {
							top: { style: "thin", color: { rgb: "4f81bd" } },
							bottom: { style: "thin", color: { rgb: "4f81bd" } },
							left: { style: "thin", color: { rgb: "4f81bd" } },
							right: { style: "thin", color: { rgb: "4f81bd" } },
						},
					};
				}
			}
		}

		worksheet["!merges"] = Array.from({ length: headerLength }, (_, i) => ({
			s: { c: 0, r: i },
			e: { c: range.e.c, r: i },
		}));
	}
};
