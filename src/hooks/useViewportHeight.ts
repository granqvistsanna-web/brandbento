/**
 * Viewport Height Hook
 *
 * Provides cross-browser viewport height handling, accounting for
 * mobile browser chrome (address bar, bottom nav) using dynamic viewport units.
 *
 * @module hooks/useViewportHeight
 */
import { useEffect, useState } from 'react';

/**
 * Hook for getting reliable viewport height across browsers.
 *
 * Handles the mobile browser viewport issue where 100vh doesn't account
 * for browser chrome (address bar, navigation). Uses dynamic viewport
 * units (dvh) when supported, with fallback for older browsers.
 *
 * For older browsers, sets a --vh CSS custom property that can be used as:
 * `height: calc(var(--vh, 1vh) * 100)`
 *
 * @returns CSS height value: "100dvh" if supported, "100vh" otherwise
 *
 * @example
 * function FullHeightContainer({ children }) {
 *   const vh = useViewportHeight();
 *
 *   return (
 *     <div style={{ height: vh }}>
 *       {children}
 *     </div>
 *   );
 * }
 */
export const useViewportHeight = (): string => {
  // Initialize state based on support check to avoid effect update
  const [vh] = useState(() => {
    if (typeof window !== 'undefined' && CSS.supports('height', '100dvh')) {
      return '100dvh';
    }
    return '100vh';
  });

  // Fallback for browsers without dvh support
  useEffect(() => {
    const supportsDvh = CSS.supports('height', '100dvh');

    if (!supportsDvh) {
      // Set CSS custom property for older browsers
      const updateVh = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };

      updateVh();
      window.addEventListener('resize', updateVh);
      return () => window.removeEventListener('resize', updateVh);
    }
  }, []);

  return vh;
};

/**
 * Gets Tailwind CSS classes for full viewport height.
 *
 * Uses feature detection to apply dvh when supported,
 * with fallback to standard vh.
 *
 * @returns Tailwind class string for full viewport height
 *
 * @example
 * <div className={getViewportHeightClass()}>Full height content</div>
 */
export const getViewportHeightClass = (): string => {
  return 'h-[100dvh] supports-[height:100dvh]:h-dvh';
};
