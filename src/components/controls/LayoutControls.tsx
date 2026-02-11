/**
 * Layout-related controls: LayoutSelector, CanvasBgPicker, CanvasRatioPicker.
 * Extracted from ControlPanel.jsx.
 */
import { useShallow } from "zustand/react/shallow";
import { useLayoutStore, CANVAS_RATIOS } from "../../store/useLayoutStore";
import { BENTO_LAYOUTS, type LayoutPresetName } from "../../config/bentoLayouts";
import { ColorRoleSlot } from "../color/ColorRoleSlot";
import { motion } from "motion/react";

// Layout preset config
const LAYOUT_PRESETS_CONFIG = [
  { key: "minimal", label: "Focus" },
  { key: "duo", label: "Trio" },
  { key: "balanced", label: "Grid" },
  { key: "heroLeft", label: "Panel" },
  { key: "heroCenter", label: "Feature" },
  { key: "stacked", label: "Banner" },
  { key: "spread", label: "Spread" },
  { key: "mosaic", label: "Mosaic" },
];

const LayoutPreview = ({ preset, isActive, displaySize = 32 }: { preset: LayoutPresetName; isActive: boolean; displaySize?: number }) => {
  const config = BENTO_LAYOUTS[preset]?.desktop;
  if (!config) return null;

  const { columns, rows, placements } = config;
  const padding = 3;
  const gap = 2;

  const availableWidth = displaySize - padding * 2;
  const availableHeight = displaySize - padding * 2;
  const cellWidth = (availableWidth - (columns - 1) * gap) / columns;
  const cellHeight = (availableHeight - (rows - 1) * gap) / rows;

  const heroId = placements.reduce((largest: typeof placements[0] | null, p: typeof placements[0]) => {
    const area = p.colSpan * p.rowSpan;
    const largestArea = largest ? largest.colSpan * largest.rowSpan : 0;
    return area > largestArea ? p : largest;
  }, null)?.id;

  return (
    <svg
      width={displaySize}
      height={displaySize}
      viewBox={`0 0 ${displaySize} ${displaySize}`}
      className="transition-transform duration-150"
      style={{ filter: isActive ? 'none' : 'saturate(0)' }}
    >
      <rect
        x={0}
        y={0}
        width={displaySize}
        height={displaySize}
        rx={4}
        fill={isActive ? 'var(--accent-muted)' : 'var(--sidebar-bg-active)'}
        opacity={0.4}
      />
      {placements.map((p: typeof placements[0]) => {
        const x = padding + (p.colStart - 1) * (cellWidth + gap);
        const y = padding + (p.rowStart - 1) * (cellHeight + gap);
        const w = p.colSpan * cellWidth + (p.colSpan - 1) * gap;
        const h = p.rowSpan * cellHeight + (p.rowSpan - 1) * gap;
        const isHero = p.id === heroId;

        return (
          <g key={p.id}>
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx={2}
              fill={isActive
                ? 'var(--accent)'
                : (isHero ? 'var(--sidebar-text-secondary)' : 'var(--sidebar-text-muted)')}
              opacity={isHero ? (isActive ? 0.85 : 0.45) : (isActive ? 0.45 : 0.25)}
            />
            <rect
              x={x + 0.5}
              y={y + 0.5}
              width={w - 1}
              height={h - 1}
              rx={1.5}
              fill="none"
              stroke="white"
              strokeWidth={0.5}
              opacity={isActive ? 0.15 : 0.08}
            />
          </g>
        );
      })}
    </svg>
  );
};

export const LayoutSelector = () => {
  const { preset } = useLayoutStore(
    useShallow((s) => ({ preset: s.preset }))
  );
  const setPreset = useLayoutStore((s) => s.setPreset);

  return (
    <div className="grid grid-cols-4 gap-2">
      {LAYOUT_PRESETS_CONFIG.map((p) => {
        const isActive = preset === p.key;
        return (
          <motion.button
            key={p.key}
            onClick={() => setPreset(p.key as LayoutPresetName)}
            className="flex flex-col items-center gap-2 py-2.5 px-1 rounded-lg transition-fast"
            style={{
              background: isActive
                ? "var(--accent-subtle)"
                : "transparent",
              border: `1px solid ${isActive ? "var(--accent)" : "var(--sidebar-border-subtle)"}`,
            }}
            whileHover={{
              background: isActive ? "var(--accent-subtle)" : "var(--sidebar-bg-hover)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            <LayoutPreview preset={p.key as LayoutPresetName} isActive={isActive} displaySize={28} />
            <span
              className="text-11"
              style={{
                color: isActive ? "var(--accent)" : "var(--sidebar-text-muted)",
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {p.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export const CanvasBgPicker = () => {
  const canvasBg = useLayoutStore((s) => s.canvasBg);
  const setCanvasBg = useLayoutStore((s) => s.setCanvasBg);

  return (
    <div className="pt-2 border-t" style={{ borderColor: "var(--sidebar-border-subtle)" }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-12 font-medium" style={{ color: "var(--sidebar-text-secondary)" }}>Canvas Background</span>
        {canvasBg && (
          <button
            type="button"
            className="text-11 font-medium px-1.5 py-0.5 rounded hover:opacity-80 transition-fast"
            style={{ color: "var(--sidebar-text-muted)" }}
            onClick={() => setCanvasBg(null)}
          >
            Reset
          </button>
        )}
      </div>
      <ColorRoleSlot
        label={canvasBg ? "Custom" : "Default"}
        color={canvasBg || (document.documentElement.classList.contains("dark") ? "#0D0D0D" : "#F5F5F5")}
        onChange={(hex) => setCanvasBg(hex)}
      />
    </div>
  );
};

export const CanvasRatioPicker = () => {
  const canvasRatio = useLayoutStore((s) => s.canvasRatio);
  const setCanvasRatio = useLayoutStore((s) => s.setCanvasRatio);

  return (
    <div className="pt-2 border-t" style={{ borderColor: "var(--sidebar-border-subtle)" }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-12 font-medium" style={{ color: "var(--sidebar-text-secondary)" }}>Canvas Ratio</span>
        {canvasRatio !== 'auto' && (
          <button
            type="button"
            className="text-11 font-medium px-1.5 py-0.5 rounded hover:opacity-80 transition-fast"
            style={{ color: "var(--sidebar-text-muted)" }}
            onClick={() => setCanvasRatio('auto')}
          >
            Reset
          </button>
        )}
      </div>
      <div
        className="flex rounded-lg overflow-hidden"
        style={{ background: "var(--sidebar-bg-hover)", padding: 3, gap: 2 }}
      >
        {CANVAS_RATIOS.map((r) => (
          <button
            key={r.key}
            type="button"
            className="flex-1 rounded-md text-11 font-medium transition-fast text-center"
            style={{
              padding: "5px 0",
              backgroundColor: canvasRatio === r.key ? "var(--sidebar-bg)" : "transparent",
              color: canvasRatio === r.key ? "var(--sidebar-text)" : "var(--sidebar-text-muted)",
              boxShadow: canvasRatio === r.key ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            }}
            onClick={() => setCanvasRatio(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
};
