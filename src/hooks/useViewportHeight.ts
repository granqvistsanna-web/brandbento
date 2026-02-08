import { useEffect, useState } from 'react';

export const useViewportHeight = (): string => {
  // Initialize state based on support check to avoid effect update
  const [vh] = useState(() => {
    if (typeof window !== 'undefined' && CSS.supports('height', '100dvh')) {
      return '100dvh';
    }
    return '100vh';
  });

  useEffect(() => {
    // Check if dvh is supported
    const supportsDvh = CSS.supports('height', '100dvh');

    if (!supportsDvh) {
      // Fallback: set CSS custom property for older browsers
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

// Also export a CSS class string for use in Tailwind
export const getViewportHeightClass = (): string => {
  return 'h-[100dvh] supports-[height:100dvh]:h-dvh';
};
