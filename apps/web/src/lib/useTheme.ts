import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

/** Persisted light/dark theme that toggles the `dark` class on <html>. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('tv_theme') as Theme | null;
    // Default to light mode for first-time visitors; the user can switch to dark
    // with the toggle and their choice is remembered.
    return saved ?? 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('tv_theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return { theme, toggle };
}
