import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { temporal } from 'zundo';
import type { CanvasState, BrandAssets, ExtractionStage, TypographyTileState, ColorPalette, ImageTreatment } from '@/types/brand';
import { persistState, loadState } from './persistence';
import { createDefaultState } from './defaults';

interface CanvasStore extends CanvasState {
  // Extraction state
  extractionStage: ExtractionStage;
  extractionError: string | null;

  // Editing state (not persisted)
  editingTileId: string | null;

  // Actions
  setAssets: (assets: Partial<BrandAssets>) => void;
  setSourceUrl: (url: string | null) => void;
  setExtractionStage: (stage: ExtractionStage) => void;
  setExtractionError: (error: string | null) => void;
  reset: () => void;

  // Editing action
  setEditingTile: (tileId: string | null) => void;

  // Tile settings actions
  setLogoScale: (scale: number) => void;
  setLogoVariant: (variant: 'original' | 'dark' | 'light') => void;
  setLogoBackground: (background: 'white' | 'dark' | 'primary' | 'auto') => void;
  setFontSettings: (role: 'primaryFont' | 'secondaryFont', settings: Partial<TypographyTileState>) => void;
  addRecentFont: (family: string) => void;

  // Palette actions
  setPalette: (palette: ColorPalette) => void;
  setColorByRole: (role: keyof ColorPalette, color: string) => void;

  // Imagery actions
  setImageTreatment: (treatment: ImageTreatment) => void;
  setColorOverlay: (overlay: number) => void;

  // Persistence
  hydrate: () => void;
}

export const useCanvasStore = create<CanvasStore>()(
  temporal(
    subscribeWithSelector((set, get) => ({
      // Initial state (will be hydrated)
      ...createDefaultState(),
      extractionStage: 'idle',
      extractionError: null,
      editingTileId: null,

      setAssets: (newAssets) => set((state) => ({
        assets: { ...state.assets, ...newAssets },
        lastModified: Date.now(),
      })),

      setSourceUrl: (url) => set({
        sourceUrl: url,
        lastModified: Date.now(),
      }),

      setExtractionStage: (stage) => set({ extractionStage: stage }),

      setExtractionError: (error) => set({
        extractionError: error,
        extractionStage: error ? 'error' : 'idle',
      }),

      reset: () => {
        const current = get();
        set({
          ...createDefaultState(),
          sourceUrl: current.sourceUrl, // Keep URL
          extractionStage: 'idle',
          extractionError: null,
          editingTileId: null,
        });
      },

      setEditingTile: (tileId) => set({ editingTileId: tileId }),

      // Tile settings actions
      setLogoScale: (scale: number) => set((state) => ({
        tileSettings: {
          ...state.tileSettings,
          logo: { ...state.tileSettings.logo, scale }
        },
        lastModified: Date.now(),
      })),

      setLogoVariant: (variant: 'original' | 'dark' | 'light') => set((state) => ({
        tileSettings: {
          ...state.tileSettings,
          logo: { ...state.tileSettings.logo, variant }
        },
        lastModified: Date.now(),
      })),

      setLogoBackground: (background: 'white' | 'dark' | 'primary' | 'auto') => set((state) => ({
        tileSettings: {
          ...state.tileSettings,
          logo: { ...state.tileSettings.logo, background }
        },
        lastModified: Date.now(),
      })),

      setFontSettings: (role: 'primaryFont' | 'secondaryFont', settings: Partial<TypographyTileState>) => set((state) => ({
        tileSettings: {
          ...state.tileSettings,
          [role]: { ...state.tileSettings[role], ...settings }
        },
        lastModified: Date.now(),
      })),

      addRecentFont: (family: string) => set((state) => {
        const recent = state.tileSettings.recentFonts;
        const updated = [family, ...recent.filter(f => f !== family)].slice(0, 10);
        return {
          tileSettings: {
            ...state.tileSettings,
            recentFonts: updated
          },
          lastModified: Date.now(),
        };
      }),

      // Palette actions
      setPalette: (palette) => set((state) => ({
        assets: { ...state.assets, palette },
        lastModified: Date.now(),
      })),

      setColorByRole: (role, color) => set((state) => ({
        assets: {
          ...state.assets,
          palette: { ...state.assets.palette, [role]: color },
        },
        lastModified: Date.now(),
      })),

      // Imagery actions
      setImageTreatment: (treatment) => set((state) => ({
        assets: {
          ...state.assets,
          imagery: { ...state.assets.imagery, treatment },
        },
        lastModified: Date.now(),
      })),

      setColorOverlay: (colorOverlay) => set((state) => ({
        assets: {
          ...state.assets,
          imagery: { ...state.assets.imagery, colorOverlay },
        },
        lastModified: Date.now(),
      })),

      hydrate: () => {
        const loaded = loadState();
        set({
          ...loaded,
          extractionStage: 'idle',
          extractionError: null,
        });
      },
    })),
    {
      // Zundo configuration
      partialize: (state) => ({
        // Only track these fields for undo/redo
        assets: state.assets,
        tileSettings: state.tileSettings,
      }),
      limit: 30,  // TOOL-05: 30-step undo stack
      equality: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    }
  )
);

// Export temporal hook for undo/redo access
export const useTemporalStore = () => useCanvasStore.temporal.getState();

// Subscribe to state changes and persist
useCanvasStore.subscribe(
  (state) => ({
    version: state.version,
    sourceUrl: state.sourceUrl,
    assets: state.assets,
    tileSettings: state.tileSettings,
    extractedAt: state.extractedAt,
    lastModified: state.lastModified,
  }),
  (state) => {
    persistState(state as CanvasState);
  },
  { equalityFn: (a, b) => a.lastModified === b.lastModified }
);
