import type { ReactNode } from 'react';
import { useLayoutStore } from '../store/useLayoutStore';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  BENTO_LAYOUTS,
  type LayoutPresetName,
  type CellPlacement,
} from '../config/bentoLayouts';
import { twMerge } from 'tailwind-merge';

export interface BentoGridNewProps {
  renderSlot?: (placement: CellPlacement) => ReactNode;
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
  const breakpoint = useBreakpoint();

  const config = BENTO_LAYOUTS[preset]?.[breakpoint] ?? BENTO_LAYOUTS.balanced.desktop;
  const gap = config.gap;
  const padding = density === 'cozy' ? 16 : 12;

  return (
    <div
      className={twMerge(
        'h-full w-full',
        'flex items-center justify-center',
        'transition-colors duration-200',
        className
      )}
      style={{
        backgroundColor: 'var(--canvas-bg)',
      }}
    >
      <div
        className="h-full w-full max-w-6xl overflow-hidden"
        style={{
          padding: `${padding}px`,
          paddingBottom: 'max(var(--safe-area-inset-bottom, 0px), 16px)',
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
