import { useEffect } from 'react';
// @ts-expect-error - useBrandStore is JS, will be migrated to TS later
import { useBrandStore } from '../store/useBrandStore';

export function useTheme() {
  const theme = useBrandStore((state: any) => state.theme);
  const setTheme = useBrandStore((state: any) => state.setTheme);
  const resolvedTheme = useBrandStore((state: any) => state.resolvedTheme);
  const setResolvedTheme = useBrandStore((state: any) => state.setResolvedTheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolvedTheme = () => {
      const systemPrefersDark = mediaQuery.matches;
      const resolved = theme === 'system'
        ? (systemPrefersDark ? 'dark' : 'light')
        : theme;

      setResolvedTheme(resolved);

      // Update DOM
      if (resolved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Initial update
    updateResolvedTheme();

    // Listen for system preference changes
    mediaQuery.addEventListener('change', updateResolvedTheme);

    return () => {
      mediaQuery.removeEventListener('change', updateResolvedTheme);
    };
  }, [theme, setResolvedTheme]);

  return {
    theme,
    setTheme,
    resolvedTheme,
  };
}
