import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { useLayoutStore } from '../store/useLayoutStore';
import { LAYOUT_PRESETS } from '../config/layoutPresets';
import type { TileType } from '../types/layout';

interface BentoTileProps {
  tileType: TileType | string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  // Pass through props for existing tile behavior
  onClick?: (e: React.MouseEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  tabIndex?: number;
  role?: string;
  'aria-pressed'?: boolean;
}

/**
 * BentoTile - Wrapper component that applies responsive grid spans based on tile type and breakpoint.
 *
 * Looks up tile spans from LAYOUT_PRESETS config based on:
 * - Current preset (balanced, heroLeft, heroCenter, stacked)
 * - Current breakpoint (mobile, tablet, desktop)
 * - Tile type (hero, logo, colors, etc.)
 *
 * Falls back to 1x1 span if tile type is not defined in the preset.
 */
export const BentoTile = ({
  tileType,
  children,
  className,
  style,
  ...props
}: BentoTileProps) => {
  const breakpoint = useLayoutStore((s) => s.breakpoint);
  const preset = useLayoutStore((s) => s.preset);

  const config = LAYOUT_PRESETS[preset];
  const tileSpans = config.tileSpans[tileType as keyof typeof config.tileSpans];

  // Default span if tile type not found in preset
  const defaultSpan = { colSpan: 1, rowSpan: 1 };
  const span = tileSpans?.[breakpoint] || defaultSpan;

  return (
    <div
      className={twMerge(
        // Base tile styles
        'rounded-2xl overflow-hidden relative',
        // Prevent text overflow from expanding grid
        'min-w-0',
        // Focus styles
        'focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10',
        className
      )}
      style={{
        gridColumn: `span ${span.colSpan}`,
        gridRow: `span ${span.rowSpan}`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default BentoTile;
