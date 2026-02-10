/**
 * Layout Store
 *
 * Zustand store for bento grid layout state: breakpoint, preset,
 * density, canvas background, and aspect ratio. Persists user
 * preferences (preset, density, canvasBg, canvasRatio) to localStorage.
 * Breakpoint and debugMode are session-only.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BreakpointName, DensityMode, LayoutPresetName } from '../types/layout';

/** Canvas aspect ratio options. `auto` fills available space; others enforce fixed ratio. */
export type CanvasRatio = 'auto' | '16:9' | '4:3' | '1:1' | '3:4' | '9:16';

/** Available canvas ratios with display labels and numeric values (null = auto). */
export const CANVAS_RATIOS: { key: CanvasRatio; label: string; value: number | null }[] = [
  { key: 'auto', label: 'Auto', value: null },
  { key: '16:9', label: '16:9', value: 16 / 9 },
  { key: '4:3', label: '4:3', value: 4 / 3 },
  { key: '1:1', label: '1:1', value: 1 },
  { key: '3:4', label: '3:4', value: 3 / 4 },
  { key: '9:16', label: '9:16', value: 9 / 16 },
];

interface LayoutStore {
  // ── State ──

  /** Current responsive breakpoint — set by BentoGridNew's ResizeObserver.
   *  Values: 'mobile' (< 640px), 'tablet' (640–1023px), 'desktop' (>= 1024px).
   *  Session-only (not persisted) since it depends on viewport size. */
  breakpoint: BreakpointName;
  /** Active layout arrangement (e.g. 'balanced', 'geos', 'spread', 'mosaic').
   *  Determines tile placement grid via bentoLayouts.ts. Persisted. */
  preset: LayoutPresetName;
  /** Grid density mode — controls gap size and row height.
   *  Values: 'compact' (tight), 'cozy' (default), 'spacious' (generous). Persisted. */
  density: DensityMode;
  /** When true, shows grid cell borders and placement IDs for debugging.
   *  Session-only (not persisted). */
  debugMode: boolean;
  /** Custom canvas background color, or null for theme default. Persisted. */
  canvasBg: string | null;
  /** Canvas aspect ratio constraint. 'auto' fills available space; fixed ratios
   *  (16:9, 4:3, etc.) center the grid in a fixed-ratio box. Persisted. */
  canvasRatio: CanvasRatio;

  // ── Actions ──

  /** Update responsive breakpoint (called by BentoGridNew on resize) */
  setBreakpoint: (bp: BreakpointName) => void;
  /** Switch layout arrangement — triggers full grid reflow */
  setPreset: (preset: LayoutPresetName) => void;
  /** Change grid density (affects gap and row height) */
  setDensity: (density: DensityMode) => void;
  /** Toggle debug overlay on/off */
  toggleDebug: () => void;
  /** Set or clear custom canvas background (null = theme default) */
  setCanvasBg: (color: string | null) => void;
  /** Set canvas aspect ratio constraint */
  setCanvasRatio: (ratio: CanvasRatio) => void;
}

/** Layout store hook — provides grid layout state and actions.
 *  Persists user preferences (preset, density, canvasBg, canvasRatio) to localStorage.
 *  Excludes `breakpoint` and `debugMode` from persistence since they're session-specific. */
export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set) => ({
      breakpoint: 'desktop',
      preset: 'geos',
      density: 'cozy',
      debugMode: false,
      canvasBg: null,
      canvasRatio: 'auto',

      setBreakpoint: (breakpoint) => set({ breakpoint }),
      setPreset: (preset) => set({ preset }),
      setDensity: (density) => set({ density }),
      toggleDebug: () => set((state) => ({ debugMode: !state.debugMode })),
      setCanvasBg: (color) => set({ canvasBg: color }),
      setCanvasRatio: (ratio) => set({ canvasRatio: ratio }),
    }),
    {
      name: 'layout-store',
      // Only persist user preferences. Exclude breakpoint (viewport-dependent)
      // and debugMode (developer tool, not a user preference).
      partialize: (state) => ({
        preset: state.preset,
        density: state.density,
        canvasBg: state.canvasBg,
        canvasRatio: state.canvasRatio,
      }),
    }
  )
);
