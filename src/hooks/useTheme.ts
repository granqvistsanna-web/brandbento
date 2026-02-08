/**
 * Theme Management Hook
 *
 * Manages dark/light/system theme preferences with automatic system
 * preference detection and DOM synchronization.
 *
 * @module hooks/useTheme
 */
import { useEffect } from 'react';
import { useBrandStore, type BrandStore } from '../store/useBrandStore';

/**
 * Hook for managing application theme (light/dark/system).
 *
 * Features:
 * - Syncs with system preference when theme is set to "system"
 * - Automatically updates DOM (adds/removes 'dark' class on <html>)
 * - Persists preference in brand store (localStorage)
 * - Listens for system preference changes in real-time
 *
 * @returns Object with theme controls
 * @returns theme - Current preference: "light" | "dark" | "system"
 * @returns setTheme - Function to update preference
 * @returns resolvedTheme - Computed value: "light" | "dark" (resolves "system")
 *
 * @example
 * function ThemeToggle() {
 *   const { theme, setTheme, resolvedTheme } = useTheme();
 *
 *   return (
 *     <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
 *       Current: {resolvedTheme}
 *     </button>
 *   );
 * }
 */
export function useTheme() {
  const theme = useBrandStore((state: BrandStore) => state.theme);
  const setTheme = useBrandStore((state: BrandStore) => state.setTheme);
  const resolvedTheme = useBrandStore((state: BrandStore) => state.resolvedTheme);
  const setResolvedTheme = useBrandStore((state: BrandStore) => state.setResolvedTheme);

  // Sync resolved theme with system preference and update DOM
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
