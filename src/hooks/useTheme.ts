import { useEffect } from 'react';
import { useBrandStore } from '../store/useBrandStore';

export function useTheme() {
  const theme = useBrandStore((state) => state.theme);
  const setTheme = useBrandStore((state) => state.setTheme);
  const resolvedTheme = useBrandStore((state) => state.resolvedTheme);
  const setResolvedTheme = useBrandStore((state) => state.setResolvedTheme);

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
