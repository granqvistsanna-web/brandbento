import { useEffect } from 'react';
import { useLayoutStore } from '../store/useLayoutStore';
import { BREAKPOINTS } from '../config/layoutPresets';
import type { BreakpointName } from '../types/layout';

export const useBreakpoint = (): BreakpointName => {
  const breakpoint = useLayoutStore((s) => s.breakpoint);
  const setBreakpoint = useLayoutStore((s) => s.setBreakpoint);

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
