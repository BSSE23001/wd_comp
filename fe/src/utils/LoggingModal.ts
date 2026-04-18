import type { CSVRow, ManualFormData, PlatformOption } from "@/types/types";

export const PLATFORMS: PlatformOption[] = [
  "Uber",
  "Foodpanda",
  "Careem",
  "Bykea",
  "InDrive",
];

export const SAMPLE_CSV = `platform,date,hoursWorked,grossEarned,platformDeductions
Uber,2026-04-18,8,120.50,15.20
Foodpanda,2026-04-17,6,95.00,12.50
Uber,2026-04-16,7,140.00,18.00`;

export type ManualFormErrors = Partial<Record<keyof ManualFormData, string>>;

export function isPlatformOption(value: string): value is PlatformOption {
  return PLATFORMS.includes(value as PlatformOption);
}

function parseNumber(value: string | number): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function calculateNetReceived(
  grossEarned: string | number,
  platformDeductions: string | number
): number {
  const gross = parseNumber(grossEarned);
  const deductions = parseNumber(platformDeductions);

  return Math.max(0, gross - deductions);
}

export function validateManualShiftForm(
  formData: ManualFormData
): ManualFormErrors {
  const errors: ManualFormErrors = {};

  if (!formData.platform) errors.platform = "Platform is required";
  if (!formData.date) errors.date = "Date is required";
  if (!formData.hoursWorked || Number.parseFloat(formData.hoursWorked) <= 0) {
	errors.hoursWorked = "Hours must be greater than 0";
  }
  if (!formData.grossEarned || Number.parseFloat(formData.grossEarned) <= 0) {
	errors.grossEarned = "Gross earned must be greater than 0";
  }
  if (formData.platformDeductions === "") {
	errors.platformDeductions = "Deductions are required";
  }

  return errors;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
	const char = line[i];
	const next = line[i + 1];

	if (char === '"') {
	  if (inQuotes && next === '"') {
		current += '"';
		i += 1;
	  } else {
		inQuotes = !inQuotes;
	  }

	  continue;
	}

	if (char === "," && !inQuotes) {
	  values.push(current.trim());
	  current = "";
	  continue;
	}

	current += char;
  }

  values.push(current.trim());
  return values;
}

export function parseShiftCsv(text: string): CSVRow[] {
  const lines = text
	.replace(/\r\n/g, "\n")
	.split("\n")
	.map((line) => line.trim())
	.filter(Boolean);

  if (lines.length < 2) {
	throw new Error("CSV must have at least a header and one data row");
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());
  const platformIndex = headers.indexOf("platform");
  const dateIndex = headers.indexOf("date");
  const hoursIndex = headers.indexOf("hoursworked");
  const grossIndex = headers.indexOf("grossearned");
  const deductIndex = headers.indexOf("platformdeductions");

  if (
	platformIndex === -1 ||
	dateIndex === -1 ||
	hoursIndex === -1 ||
	grossIndex === -1 ||
	deductIndex === -1
  ) {
	throw new Error(
	  "CSV must have columns: platform, date, hoursWorked, grossEarned, platformDeductions"
	);
  }

  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
	const values = parseCsvLine(lines[i]);

	if (values.length < headers.length) {
	  throw new Error(`CSV row ${i + 1} is missing one or more values`);
	}

	const platformValue = values[platformIndex]?.trim() ?? "";
	const hoursWorked = Number.parseFloat(values[hoursIndex]);
	const grossEarned = Number.parseFloat(values[grossIndex]);
	const platformDeductions = Number.parseFloat(values[deductIndex]);

	if (!isPlatformOption(platformValue)) {
	  throw new Error(`Invalid platform: ${platformValue}`);
	}

	if (
	  !Number.isFinite(hoursWorked) ||
	  !Number.isFinite(grossEarned) ||
	  !Number.isFinite(platformDeductions)
	) {
	  throw new Error(`Currency and hour values must be numbers on row ${i + 1}`);
	}

	rows.push({
	  platform: platformValue,
	  date: values[dateIndex],
	  hoursWorked,
	  grossEarned,
	  platformDeductions,
	  netReceived: calculateNetReceived(grossEarned, platformDeductions),
	});
  }

  return rows;
}

