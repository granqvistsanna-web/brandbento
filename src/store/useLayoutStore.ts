import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BreakpointName, DensityMode, LayoutPresetName } from '../types/layout';

interface LayoutStore {
  // State
  breakpoint: BreakpointName;
  preset: LayoutPresetName;
  density: DensityMode;
  debugMode: boolean;
  canvasBg: string | null;

  // Actions
  setBreakpoint: (bp: BreakpointName) => void;
  setPreset: (preset: LayoutPresetName) => void;
  setDensity: (density: DensityMode) => void;
  toggleDebug: () => void;
  setCanvasBg: (color: string | null) => void;
}

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set) => ({
      breakpoint: 'desktop',
      preset: 'geos',
      density: 'cozy',
      debugMode: false,
      canvasBg: null,

      setBreakpoint: (breakpoint) => set({ breakpoint }),
      setPreset: (preset) => set({ preset }),
      setDensity: (density) => set({ density }),
      toggleDebug: () => set((state) => ({ debugMode: !state.debugMode })),
      setCanvasBg: (color) => set({ canvasBg: color }),
    }),
    {
      name: 'layout-store',
      partialize: (state) => ({
        preset: state.preset,
        density: state.density,
        canvasBg: state.canvasBg,
      }),
    }
  )
);
