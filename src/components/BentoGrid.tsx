import type { ReactNode } from 'react';
import { useLayoutStore } from '../store/useLayoutStore';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { LAYOUT_PRESETS } from '../config/layoutPresets';
import { twMerge } from 'tailwind-merge';
import type { TileSpan } from '../types/layout';
import type { TileData, AdjustedTile } from '../utils/layoutFit';
import { fitTilesToGrid, getAdjustedSpan } from '../utils/layoutFit';
import { DebugGrid } from './DebugGrid';

/**
 * Props for children-based rendering (existing pattern)
 */
interface BentoGridChildrenProps {
  children: ReactNode;
  tiles?: never;
  renderTile?: never;
  className?: string;
}

/**
 * Props for tile-based rendering with fitting logic
 */
interface BentoGridTilesProps {
  tiles: TileData[];
  renderTile: (tile: TileData, adjustedSpan: TileSpan) => ReactNode;
  children?: never;
  className?: string;
}

type BentoGridProps = BentoGridChildrenProps | BentoGridTilesProps;

/**
 * Responsive bento grid component with optional tile fitting
 *
 * Supports two patterns:
 * 1. Children-based: <BentoGrid>{children}</BentoGrid>
 * 2. Tile-based with fitting: <BentoGrid tiles={tiles} renderTile={fn} />
 */
export const BentoGrid = (props: BentoGridProps) => {
  const { className } = props;

  const breakpoint = useBreakpoint();
  const preset = useLayoutStore((s) => s.preset);
  const density = useLayoutStore((s) => s.density);
  const debugMode = useLayoutStore((s) => s.debugMode);

  const config = LAYOUT_PRESETS[preset];
  const columns = config.columns[breakpoint];
  const rows = config.rows[breakpoint];
  const gap = config.gap[density];
  const rowHeight = config.rowHeight[density];

  // Determine render mode and content
  let content: ReactNode;
  let hiddenCount = 0;

  if ('tiles' in props && props.tiles && props.renderTile) {
    // Tile-based rendering with fitting logic
    const gridConfig = { columns, rows };
    const fitResult = fitTilesToGrid(props.tiles, gridConfig, breakpoint);

    hiddenCount = fitResult.hiddenTiles.length;

    content = fitResult.visibleTiles.map((tile: AdjustedTile) => {
      const adjustedSpan = getAdjustedSpan(tile);
      return (
        <div
          key={tile.id}
          style={{
            gridColumn: `span ${adjustedSpan.colSpan}`,
            gridRow: `span ${adjustedSpan.rowSpan}`,
          }}
        >
          {props.renderTile(tile, adjustedSpan)}
        </div>
      );
    });
  } else if ('children' in props) {
    // Children-based rendering (backward compatible)
    content = props.children;
  }

  return (
    <div className="relative h-[100dvh] max-h-[100dvh]" style={{ height: '100vh' }}>
      <div
        className={twMerge(
          // Full size within container
          'h-full w-full',
          // Mobile safe area padding
          'pb-[env(safe-area-inset-bottom)]',
          // Grid setup
          'grid',
          // Padding
          density === 'cozy' ? 'p-4' : 'p-2',
          // Overflow hidden to prevent scrolling
          'overflow-hidden',
          // Relative for hidden tile indicator positioning
          'relative',
          // Optional custom class
          className
        )}
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, ${rowHeight}px)`,
          gap: `${gap}px`,
        }}
      >
        {content}

        {/* Debug mode: show hidden tile count */}
        {debugMode && hiddenCount > 0 && (
          <div
            className={twMerge(
              'absolute bottom-2 right-2',
              'px-2 py-1 rounded',
              'bg-amber-500/90 text-white text-xs font-medium',
              'pointer-events-none'
            )}
          >
            {hiddenCount} tile{hiddenCount > 1 ? 's' : ''} hidden
          </div>
        )}
      </div>

      {/* Debug grid overlay */}
      <DebugGrid />
    </div>
  );
};

export default BentoGrid;
