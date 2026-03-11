type Props = {
	value: string;
	options: { value: string; label: string }[];
	onChange: (value: string) => void;
	disabled?: boolean;
};

export function TickerSelect({ value, options, onChange, disabled }: Props) {
	return (
		<label className='form-control w-full max-w-xs'>
			<div className='label'>
				<span className='label-text font-medium'>Symbol</span>
			</div>
			<select
				className='select select-bordered'
				value={value}
				onChange={(e) => onChange(e.target.value)}
				disabled={disabled}>
				{options.length === 0 ? (
					<option value=''>(no symbols)</option>
				) : (
					options.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))
				)}
			</select>
		</label>
	);
}
