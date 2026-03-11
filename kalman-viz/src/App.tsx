import { useEffect, useMemo, useState } from 'react';
import { PriceChart, type PricePoint } from './components/PriceChart';
import { ThemeToggle } from './components/ThemeToggle';
import { TickerSelect } from './components/TickerSelect';
import { kalmanFilter1D } from './lib/kalman';
import { parsePriceTableCsv } from './lib/sheets';
import { applyTheme, getInitialTheme, type ThemeMode } from './lib/theme';

const DEFAULT_CSV_URL =
	'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4KeVPsmbrOyU8fcAywq8A-T-NCuHQDP2Gso3poNpad1AFNqJsUuUsB4x6gd7dhBUaP_0wcknJmmuB/pub?output=csv';

function getCsvUrl() {
	return import.meta.env.VITE_SHEETS_CSV_URL || DEFAULT_CSV_URL;
}

export default function App() {
	const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
	const [csvUrl, setCsvUrl] = useState(() => getCsvUrl());
	const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
		'idle',
	);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const [symbols, setSymbols] = useState<{ value: string; label: string }[]>(
		[],
	);
	const [selectedSymbol, setSelectedSymbol] = useState<string>('');
	const [table, setTable] = useState<{
		dates: string[];
		seriesBySymbol: Record<string, (number | null)[]>;
	} | null>(null);

	useEffect(() => {
		applyTheme(theme);
	}, [theme]);

	useEffect(() => {
		let isCanceled = false;
		async function load() {
			setStatus('loading');
			setErrorMessage(null);
			try {
				const res = await fetch(csvUrl, { cache: 'no-store' });
				if (!res.ok) {
					throw new Error(`CSV fetch failed: ${res.status} ${res.statusText}`);
				}
				const text = await res.text();
				const parsed = parsePriceTableCsv(text);

				if (isCanceled) return;

				setTable(parsed);
				const nextSymbols = Object.keys(parsed.seriesBySymbol)
					.sort()
					.map((s) => ({ value: s, label: s }));
				setSymbols(nextSymbols);
				setSelectedSymbol((prev) => prev || nextSymbols[0]?.value || '');
				setStatus('ready');
			} catch (err) {
				if (isCanceled) return;
				setStatus('error');
				setErrorMessage(err instanceof Error ? err.message : String(err));
			}
		}

		void load();
		return () => {
			isCanceled = true;
		};
	}, [csvUrl]);

	const chartData: PricePoint[] = useMemo(() => {
		if (!table || !selectedSymbol) return [];

		const raw = table.seriesBySymbol[selectedSymbol] ?? [];
		const filtered = kalmanFilter1D(raw, { R: 1, Q: 0.01 });

		return table.dates.map((date, i) => ({
			date,
			raw: raw[i],
			filtered: filtered[i],
		}));
	}, [table, selectedSymbol]);

	return (
		<div className='min-h-screen bg-base-200 text-base-content'>
			<div className='mx-auto max-w-6xl px-4 py-6'>
				<header className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
					<div>
						<h1 className='text-2xl font-semibold tracking-tight'>
							Kalman Market Filter
						</h1>
						<p className='mt-1 text-sm opacity-80'>
							Raw prices vs a 1D Kalman-filtered estimate (from your published
							Google Sheet).
						</p>
					</div>

					<div className='flex items-center gap-4'>
						<ThemeToggle theme={theme} onChange={setTheme} />
					</div>
				</header>

				<section className='mt-6 grid gap-4'>
					<div className='card border border-base-300 bg-base-100'>
						<div className='card-body gap-4 p-4 md:p-6'>
							<div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
								<div className='flex flex-col gap-4 md:flex-row md:items-end'>
									<TickerSelect
										value={selectedSymbol}
										options={symbols}
										onChange={setSelectedSymbol}
										disabled={status !== 'ready'}
									/>

									<label className='form-control w-full max-w-xl'>
										<div className='label'>
											<span className='label-text font-medium'>CSV URL</span>
											<span className='label-text-alt opacity-70'>
												Published Google Sheet → CSV
											</span>
										</div>
										<input
											className='input input-bordered'
											value={csvUrl}
											onChange={(e) => setCsvUrl(e.target.value)}
											spellCheck={false}
										/>
									</label>
								</div>

								<div className='text-sm opacity-70'>
									{status === 'loading' && 'Loading data…'}
									{status === 'ready' &&
										`Rows: ${table?.dates.length ?? 0} • Symbols: ${symbols.length}`}
									{status === 'error' && 'Failed to load CSV'}
								</div>
							</div>

							{status === 'error' && errorMessage && (
								<div className='alert alert-error'>
									<span className='font-medium'>Error:</span>
									<span className='break-all'>{errorMessage}</span>
								</div>
							)}

							<div className='text-xs opacity-60'>
								Sheet schema expected: first column named{' '}
								<span className='font-mono'>Date</span>, remaining columns are
								symbols (e.g. <span className='font-mono'>SPY</span>,{' '}
								<span className='font-mono'>QQQ</span>) with numeric prices.
							</div>
						</div>
					</div>

					<PriceChart data={chartData} themeMode={theme} />
				</section>

				<footer className='mt-6 text-xs opacity-60'>
					Next: add a “data tab” in the Sheet and populate it; we’ll keep Kalman
					parameters configurable once the core workflow feels good.
				</footer>
			</div>
		</div>
	);
}
