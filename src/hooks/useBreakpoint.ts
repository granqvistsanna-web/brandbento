/**
 * Responsive Breakpoint Hook
 *
 * Tracks viewport width and provides the current breakpoint name
 * for responsive layout decisions.
 *
 * @module hooks/useBreakpoint
 */
import { useEffect } from 'react';
import { useLayoutStore } from '../store/useLayoutStore';
import { BREAKPOINTS } from '../config/layoutPresets';
import type { BreakpointName } from '../types/layout';

/**
 * Hook for tracking responsive breakpoints.
 *
 * Monitors window width and returns the current breakpoint name.
 * Uses debounced resize handler (100ms) to prevent excessive updates.
 *
 * Breakpoint thresholds (from layoutPresets):
 * - mobile: 0 - 767px
 * - tablet: 768px - 1023px
 * - desktop: 1024px+
 *
 * @returns Current breakpoint name: "mobile" | "tablet" | "desktop"
 *
 * @example
 * function ResponsiveComponent() {
 *   const breakpoint = useBreakpoint();
 *
 *   if (breakpoint === 'mobile') {
 *     return <MobileLayout />;
 *   }
 *   return <DesktopLayout />;
 * }
 */
export const useBreakpoint = (): BreakpointName => {
  const breakpoint = useLayoutStore((s) => s.breakpoint);
  const setBreakpoint = useLayoutStore((s) => s.setBreakpoint);

  // Track viewport width with debounced resize handler
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const updateBreakpoint = () => {
      const width = window.innerWidth;
      let newBreakpoint: BreakpointName = 'mobile';

      if (width >= BREAKPOINTS.desktop) {
        newBreakpoint = 'desktop';
      } else if (width >= BREAKPOINTS.tablet) {
        newBreakpoint = 'tablet';
      }

      setBreakpoint(newBreakpoint);
    };

    // Initial check
    updateBreakpoint();

    // Debounced resize handler (100ms)
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateBreakpoint, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [setBreakpoint]);

  return breakpoint;
};
