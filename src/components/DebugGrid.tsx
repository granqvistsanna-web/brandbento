import { useLayoutStore } from '../store/useLayoutStore';
import { LAYOUT_PRESETS } from '../config/layoutPresets';

/**
 * Debug overlay that visualizes the grid cell boundaries
 * Shows numbered cells with column/row positions and debug info panel
 * Only renders when debugMode is true
 */
export const DebugGrid = () => {
  const debugMode = useLayoutStore((s) => s.debugMode);
  const preset = useLayoutStore((s) => s.preset);
  const breakpoint = useLayoutStore((s) => s.breakpoint);
  const density = useLayoutStore((s) => s.density);

  if (!debugMode) return null;

  const config = LAYOUT_PRESETS[preset];
  const columns = config.columns[breakpoint];
  const rows = config.rows[breakpoint];
  const gap = config.gap[density];
  const rowHeight = config.rowHeight[density];

  const totalCells = columns * rows;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-50"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, ${rowHeight}px)`,
        gap: `${gap}px`,
        padding: density === 'cozy' ? '16px' : '8px',
      }}
    >
      {Array.from({ length: totalCells }).map((_, i) => {
        const col = (i % columns) + 1;
        const row = Math.floor(i / columns) + 1;
        return (
          <div
            key={i}
            className="border-2 border-dashed border-pink-500/40 bg-pink-500/5 rounded-lg flex flex-col items-center justify-center"
          >
            <span className="text-[10px] font-mono text-pink-600 font-bold">
              {i + 1}
            </span>
            <span className="text-[8px] font-mono text-pink-500/80">
              c{col} r{row}
            </span>
          </div>
        );
      })}

      {/* Debug info panel */}
      <div className="absolute top-2 right-2 bg-pink-600 text-white text-[10px] font-mono px-2 py-1 rounded shadow-lg">
        <div>{preset} | {breakpoint}</div>
        <div>{columns}x{rows} | {density}</div>
      </div>
    </div>
  );
};

export default DebugGrid;
