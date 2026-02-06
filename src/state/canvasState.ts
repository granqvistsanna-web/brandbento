import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { CanvasState, BrandAssets, ExtractionStage } from '@/types/brand';
import { persistState, loadState } from './persistence';
import { createDefaultState } from './defaults';

interface CanvasStore extends CanvasState {
  // Extraction state
  extractionStage: ExtractionStage;
  extractionError: string | null;

  // Actions
  setAssets: (assets: Partial<BrandAssets>) => void;
  setSourceUrl: (url: string | null) => void;
  setExtractionStage: (stage: ExtractionStage) => void;
  setExtractionError: (error: string | null) => void;
  reset: () => void;

  // Persistence
  hydrate: () => void;
}

export const useCanvasStore = create<CanvasStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state (will be hydrated)
    ...createDefaultState(),
    extractionStage: 'idle',
    extractionError: null,

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
      });
    },

    hydrate: () => {
      const loaded = loadState();
      set({
        ...loaded,
        extractionStage: 'idle',
        extractionError: null,
      });
    },
  }))
);

// Subscribe to state changes and persist
useCanvasStore.subscribe(
  (state) => ({
    version: state.version,
    sourceUrl: state.sourceUrl,
    assets: state.assets,
    extractedAt: state.extractedAt,
    lastModified: state.lastModified,
  }),
  (state) => {
    persistState(state as CanvasState);
  },
  { equalityFn: (a, b) => a.lastModified === b.lastModified }
);
