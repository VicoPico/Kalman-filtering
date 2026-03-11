import * as Papa from 'papaparse';

function toNumberOrNull(value: unknown): number | null {
	if (value === null || value === undefined) return null;
	const s = String(value).trim();
	if (!s) return null;
	const n = Number(s);
	return Number.isFinite(n) ? n : null;
}

/**
 * Expected CSV schema:
 * - Header row: Date,<SYMBOL_1>,<SYMBOL_2>,...
 * - Each row: YYYY-MM-DD,<price>,<price>,...
 */
export function parsePriceTableCsv(csvText: string): {
	dates: string[];
	seriesBySymbol: Record<string, (number | null)[]>;
} {
	const parsed = Papa.parse<string[]>(csvText, {
		skipEmptyLines: true,
	});

	if (parsed.errors?.length) {
		throw new Error(
			`CSV parse error: ${parsed.errors[0]?.message ?? 'unknown'}`,
		);
	}

	const rows = parsed.data as unknown as string[][];
	if (!rows.length) throw new Error('CSV is empty');

	const header = rows[0]?.map((h) => String(h ?? '').trim());
	if (!header || header.length < 2) {
		throw new Error('CSV header must be: Date,<SYMBOL_1>,...');
	}

	const dateColIndex = header.findIndex((h) => h.toLowerCase() === 'date');
	if (dateColIndex === -1) {
		throw new Error("CSV must include a 'Date' column");
	}

	const symbolCols = header
		.map((h, idx) => ({ h, idx }))
		.filter(({ idx }) => idx !== dateColIndex)
		.filter(({ h }) => !!h);

	if (!symbolCols.length) {
		throw new Error('CSV must include at least one symbol column');
	}

	const dates: string[] = [];
	const seriesBySymbol: Record<string, (number | null)[]> = {};
	for (const { h } of symbolCols) seriesBySymbol[h] = [];

	for (let r = 1; r < rows.length; r++) {
		const row = rows[r] ?? [];
		const date = String(row[dateColIndex] ?? '').trim();
		if (!date) continue;
		dates.push(date);

		for (const { h, idx } of symbolCols) {
			seriesBySymbol[h].push(toNumberOrNull(row[idx]));
		}
	}

	if (!dates.length)
		throw new Error('No data rows found (need at least one Date)');

	return { dates, seriesBySymbol };
}
