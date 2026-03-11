export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'themeMode';

export function getInitialTheme(): ThemeMode {
	const saved = localStorage.getItem(STORAGE_KEY);
	if (saved === 'light' || saved === 'dark') return saved;

	const prefersDark = window.matchMedia?.(
		'(prefers-color-scheme: dark)',
	)?.matches;
	return prefersDark ? 'dark' : 'light';
}

export function applyTheme(theme: ThemeMode) {
	document.documentElement.setAttribute('data-theme', theme);
	localStorage.setItem(STORAGE_KEY, theme);
}
