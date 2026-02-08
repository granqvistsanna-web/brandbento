/**
 * Debug Grid Overlay Component
 *
 * Development tool that visualizes grid cell boundaries and layout info.
 * Helps debug tile placement and responsive behavior.
 *
 * ## Features
 *
 * - Shows tile boundaries with pink dashed borders
 * - Displays tile ID and span dimensions (e.g., "2×1")
 * - Info panel shows preset, breakpoint, grid size, density
 * - Only renders when debugMode is enabled in layout store
 * - Excluded from exports (data-export-exclude attribute)
 *
 * ## Usage
 *
 * Enable via layout store: `useLayoutStore.setState({ debugMode: true })`
 *
 * @component
 * @example
 * // In canvas component
 * <BentoGridNew ... />
 * <DebugGrid />
 */
import { useLayoutStore } from '../store/useLayoutStore';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { BENTO_LAYOUTS, type LayoutPresetName } from '../config/bentoLayouts';

/**
 * Debug overlay that visualizes the grid cell boundaries.
 * Shows numbered cells with column/row positions and debug info panel.
 * Only renders when debugMode is true.
 */
export const DebugGrid = () => {
  const debugMode = useLayoutStore((s) => s.debugMode);
  const preset = useLayoutStore((s) => s.preset) as LayoutPresetName;
  const density = useLayoutStore((s) => s.density);
  const breakpoint = useBreakpoint();

  if (!debugMode) return null;

  const config = BENTO_LAYOUTS[preset]?.[breakpoint] ?? BENTO_LAYOUTS.balanced.desktop;
  const { columns, rows, gap, placements } = config;
  const padding = density === 'cozy' ? 16 : 12;

  return (
    <div
      data-export-exclude="true"
      className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center"
      style={{ padding: `${padding}px` }}
    >
      <div
        className="h-full w-full max-w-6xl relative"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: `${gap}px`,
        }}
      >
        {/* Show actual tile placements */}
        {placements.map((p) => (
          <div
            key={p.id}
            className="border-2 border-dashed border-pink-500/50 bg-pink-500/10 rounded-lg flex flex-col items-center justify-center"
            style={{
              gridColumn: `${p.colStart} / span ${p.colSpan}`,
              gridRow: `${p.rowStart} / span ${p.rowSpan}`,
            }}
          >
            <span className="text-xs font-mono text-pink-600 font-bold">
              {p.id}
            </span>
            <span className="text-[9px] font-mono text-pink-500/80">
              {p.colSpan}×{p.rowSpan}
            </span>
          </div>
        ))}

        {/* Debug info panel */}
        <div className="absolute top-2 right-2 bg-pink-600 text-white text-[10px] font-mono px-3 py-2 rounded-lg shadow-lg space-y-0.5">
          <div className="font-bold">{preset}</div>
          <div>{breakpoint} · {columns}×{rows}</div>
          <div>{density} · {gap}px gap</div>
          <div>{placements.length} tiles</div>
        </div>
      </div>
    </div>
  );
};

export default DebugGrid;
