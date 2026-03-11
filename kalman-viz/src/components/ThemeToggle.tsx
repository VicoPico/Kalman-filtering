import type { ThemeMode } from '../lib/theme';

export function ThemeToggle({
	theme,
	onChange,
}: {
	theme: ThemeMode;
	onChange: (theme: ThemeMode) => void;
}) {
	const isDark = theme === 'dark';
	return (
		<label className='flex items-center gap-3'>
			<span className='select-none text-sm opacity-80'>Light</span>
			<input
				type='checkbox'
				className='toggle toggle-sm'
				checked={isDark}
				onChange={(e) => onChange(e.target.checked ? 'dark' : 'light')}
				aria-label='Toggle dark mode'
			/>
			<span className='select-none text-sm opacity-80'>Dark</span>
		</label>
	);
}
