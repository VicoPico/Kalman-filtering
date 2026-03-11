import ReactECharts from 'echarts-for-react';
import type { ThemeMode } from '../lib/theme';

export type PricePoint = {
	date: string;
	raw: number | null;
	filtered: number | null;
};

function formatNumber(n: number) {
	return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
		n,
	);
}

export function PriceChart({
	data,
	themeMode,
}: {
	data: PricePoint[];
	themeMode: ThemeMode;
}) {
	const dates = data.map((d) => d.date);
	const raw = data.map((d) => d.raw);
	const filtered = data.map((d) => d.filtered);

	const option = {
		backgroundColor: 'transparent',
		grid: { left: 56, right: 18, top: 22, bottom: 40 },
		tooltip: {
			trigger: 'axis',
			valueFormatter: (v: unknown) =>
				typeof v === 'number' ? formatNumber(v) : String(v),
		},
		legend: { top: 4, left: 'center' },
		xAxis: {
			type: 'category' as const,
			data: dates,
			axisLabel: { hideOverlap: true },
		},
		yAxis: {
			type: 'value' as const,
			scale: true,
			axisLabel: { formatter: (v: number) => formatNumber(v) },
			splitLine: { lineStyle: { opacity: 0.15 } },
		},
		series: [
			{
				name: 'Raw price',
				type: 'line' as const,
				data: raw,
				showSymbol: false,
				connectNulls: false,
				lineStyle: { width: 2, opacity: 0.85 },
			},
			{
				name: 'Kalman filtered',
				type: 'line' as const,
				data: filtered,
				showSymbol: false,
				connectNulls: false,
				lineStyle: { width: 2 },
			},
		],
	};

	return (
		<div className='card border border-base-300 bg-base-100'>
			<div className='card-body p-4'>
				<div className='text-sm opacity-70'>Raw vs Kalman-filtered</div>
				<div className='h-[420px] w-full'>
					<ReactECharts
						option={option}
						theme={themeMode === 'dark' ? 'dark' : undefined}
						style={{ height: '100%', width: '100%' }}
						notMerge={true}
						lazyUpdate={true}
					/>
				</div>
			</div>
		</div>
	);
}
