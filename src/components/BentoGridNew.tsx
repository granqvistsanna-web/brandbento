/**
 * Bento Grid Component
 *
 * Responsive CSS Grid layout for the brand moodboard. Renders tiles
 * in a deterministic pattern that forms a filled rectangle with no gaps.
 *
 * ## Features
 *
 * - Preset-based layouts (balanced, hero-left, hero-center, stacked)
 * - Responsive breakpoints (mobile < 768 < tablet < 1024 < desktop)
 * - Density settings affect padding (cozy: 16px, compact: 12px)
 * - Render prop pattern for flexible tile content
 *
 * ## Layout System
 *
 * Uses CSS Grid with:
 * - Configurable columns/rows per breakpoint
 * - Gap from layout config
 * - Safe area inset support for mobile
 *
 * @component
 * @example
 * <BentoGridNew
 *   renderSlot={(placement) => <Tile id={placement.id} />}
 * />
 */
import type { ReactNode } from 'react';
import { useLayoutStore, CANVAS_RATIOS } from '../store/useLayoutStore';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  BENTO_LAYOUTS,
  type LayoutPresetName,
  type CellPlacement,
} from '../config/bentoLayouts';
import { twMerge } from 'tailwind-merge';

/**
 * Props for BentoGridNew component.
 */
export interface BentoGridNewProps {
  /** Render function for each grid slot, receives placement info */
  renderSlot?: (placement: CellPlacement) => ReactNode;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Deterministic bento grid – always forms a filled rectangle, no holes.
 * Layout changes only at breakpoint thresholds (768px, 1024px) for stability.
 * Uses CSS variables for theme-aware background (light/dark).
 */
export function BentoGridNew({
  renderSlot,
  className,
}: BentoGridNewProps) {
  const preset = useLayoutStore((s) => s.preset) as LayoutPresetName;
  const density = useLayoutStore((s) => s.density);
  const canvasRatio = useLayoutStore((s) => s.canvasRatio);
  const breakpoint = useBreakpoint();

  const config = BENTO_LAYOUTS[preset]?.[breakpoint] ?? BENTO_LAYOUTS.balanced.desktop;
  const gap = config.gap;
  const padding = density === 'cozy' ? 16 : 12;

  const ratioEntry = CANVAS_RATIOS.find((r) => r.key === canvasRatio);
  const aspectValue = ratioEntry?.value ?? null;

  return (
    <div
      className={twMerge(
        'h-full w-full',
        'flex items-center justify-center',
        'transition-fast',
        className
      )}
      style={{
        backgroundColor: 'var(--canvas-bg)',
      }}
    >
      <div
        className="w-full overflow-hidden"
        style={{
          padding: `${padding}px`,
          paddingBottom: 'max(var(--safe-area-inset-bottom, 0px), 16px)',
          maxWidth: '72rem',
          maxHeight: aspectValue ? undefined : '54rem',
          height: aspectValue ? undefined : '100%',
          ...(aspectValue ? { aspectRatio: `${aspectValue}`, maxHeight: '100%' } : {}),
        }}
      >
        <div
          className="h-full w-full grid overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
            gridTemplateRows: `repeat(${config.rows}, 1fr)`,
            gap: `${gap}px`,
          }}
        >
          {config.placements.map((placement) => (
            <div
              key={placement.id}
              className="min-h-0 min-w-0 overflow-hidden"
              style={{
                gridColumn: `${placement.colStart} / span ${placement.colSpan}`,
                gridRow: `${placement.rowStart} / span ${placement.rowSpan}`,
              }}
            >
              {renderSlot ? renderSlot(placement) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BentoGridNew;
