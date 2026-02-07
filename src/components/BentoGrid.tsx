import type { ReactNode } from 'react';
import { useLayoutStore } from '../store/useLayoutStore';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { LAYOUT_PRESETS } from '../config/layoutPresets';
import { twMerge } from 'tailwind-merge';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export const BentoGrid = ({ children, className }: BentoGridProps) => {
  const breakpoint = useBreakpoint();
  const preset = useLayoutStore((s) => s.preset);
  const density = useLayoutStore((s) => s.density);

  const config = LAYOUT_PRESETS[preset];
  const columns = config.columns[breakpoint];
  const rows = config.rows[breakpoint];
  const gap = config.gap[density];
  const rowHeight = config.rowHeight[density];

  return (
    <div
      className={twMerge(
        // Viewport height with dvh and safe area handling
        'h-[100dvh] max-h-[100dvh]',
        // Mobile safe area padding
        'pb-[env(safe-area-inset-bottom)]',
        // Grid setup
        'grid',
        // Padding
        density === 'cozy' ? 'p-4' : 'p-2',
        // Overflow hidden to prevent scrolling
        'overflow-hidden',
        // Optional custom class
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, ${rowHeight}px)`,
        gap: `${gap}px`,
        // Fallback for browsers without dvh
        height: '100vh',
      }}
    >
      {children}
    </div>
  );
};

export default BentoGrid;
