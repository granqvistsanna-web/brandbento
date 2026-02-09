/**
 * Bento grid layouts – explicit cell placements for filled rectangles.
 * Each preset defines exact grid positions per breakpoint. No holes, no overlaps.
 * Layout is deterministic: same preset + breakpoint = same output.
 */

import type { BreakpointName } from '../types/layout';

export interface CellPlacement {
  id: string;
  colStart: number;
  rowStart: number;
  colSpan: number;
  rowSpan: number;
}

export interface BentoLayoutConfig {
  columns: number;
  rows: number;
  gap: number;
  /** Explicit placements – must exactly cover all cells, no gaps */
  placements: CellPlacement[];
}

export type LayoutPresetName =
  | 'balanced'
  | 'geos'
  | 'heroLeft'
  | 'heroCenter'
  | 'stacked'
  | 'minimal'
  | 'duo'
  | 'foodDrink';

/** Breakpoints (px) – layout only changes at these thresholds for stability */
export const BENTO_BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;

export type BentoBreakpoint = keyof typeof BENTO_BREAKPOINTS;

/** All presets with explicit placements per breakpoint */
export const BENTO_LAYOUTS: Record<
  LayoutPresetName,
  Record<BreakpointName, BentoLayoutConfig>
> = {
  balanced: {
    mobile: {
      columns: 2,
      rows: 6,
      gap: 12,
      placements: [
        { id: 'hero', colStart: 1, rowStart: 1, colSpan: 2, rowSpan: 2 },
        { id: 'b', colStart: 1, rowStart: 3, colSpan: 1, rowSpan: 2 },
        { id: 'c', colStart: 2, rowStart: 3, colSpan: 1, rowSpan: 2 },
        { id: 'd', colStart: 1, rowStart: 5, colSpan: 2, rowSpan: 1 },
        { id: 'e', colStart: 1, rowStart: 6, colSpan: 1, rowSpan: 1 },
        { id: 'f', colStart: 2, rowStart: 6, colSpan: 1, rowSpan: 1 },
      ],
    },
    tablet: {
      columns: 3,
      rows: 3,
      gap: 14,
      placements: [
        { id: 'hero', colStart: 1, rowStart: 1, colSpan: 1, rowSpan: 2 },
        { id: 'b', colStart: 2, rowStart: 1, colSpan: 2, rowSpan: 1 },
        { id: 'c', colStart: 2, rowStart: 2, colSpan: 1, rowSpan: 1 },
        { id: 'd', colStart: 3, rowStart: 2, colSpan: 1, rowSpan: 2 },
        { id: 'e', colStart: 1, rowStart: 3, colSpan: 1, rowSpan: 1 },
        { id: 'f', colStart: 2, rowStart: 3, colSpan: 1, rowSpan: 1 },
      ],
    },
    desktop: {
      columns: 3,
      rows: 3,
      gap: 16,
      placements: [
        { id: 'hero', colStart: 1, rowStart: 1, colSpan: 1, rowSpan: 2 },
        { id: 'b', colStart: 2, rowStart: 1, colSpan: 2, rowSpan: 1 },
        { id: 'c', colStart: 2, rowStart: 2, colSpan: 1, rowSpan: 1 },
        { id: 'd', colStart: 3, rowStart: 2, colSpan: 1, rowSpan: 2 },
        { id: 'e', colStart: 1, rowStart: 3, colSpan: 1, rowSpan: 1 },
        { id: 'f', colStart: 2, rowStart: 3, colSpan: 1, rowSpan: 1 },
      ],
    },
  },

  geos: {
    mobile: {
      columns: 2,
      rows: 6,
      gap: 10,
      placements: [
        { id: 'hero', colStart: 1, rowStart: 1, colSpan: 2, rowSpan: 2 },
        { id: 'image', colStart: 1, rowStart: 3, colSpan: 2, rowSpan: 1 },
        { id: 'buttons', colStart: 1, rowStart: 4, colSpan: 2, rowSpan: 1 },
        { id: 'editorial', colStart: 1, rowStart: 5, colSpan: 2, rowSpan: 1 },
        { id: 'logo', colStart: 1, rowStart: 6, colSpan: 1, rowSpan: 1 },
        { id: 'colors', colStart: 2, rowStart: 6, colSpan: 1, rowSpan: 1 },
      ],
    },
    tablet: {
      columns: 3,
      rows: 3,
      gap: 10,
      placements: [
        { id: 'hero', colStart: 1, rowStart: 1, colSpan: 1, rowSpan: 2 },
        { id: 'image', colStart: 2, rowStart: 1, colSpan: 2, rowSpan: 1 },
        { id: 'buttons', colStart: 1, rowStart: 3, colSpan: 1, rowSpan: 1 },
        { id: 'editorial', colStart: 2, rowStart: 2, colSpan: 1, rowSpan: 2 },
        { id: 'logo', colStart: 3, rowStart: 2, colSpan: 1, rowSpan: 1 },
        { id: 'colors', colStart: 3, rowStart: 3, colSpan: 1, rowSpan: 1 },
      ],
    },
    desktop: {
      columns: 3,
      rows: 3,
      gap: 12,
      placements: [
        { id: 'hero', colStart: 1, rowStart: 1, colSpan: 1, rowSpan: 2 },
        { id: 'image', colStart: 2, rowStart: 1, colSpan: 2, rowSpan: 1 },
        { id: 'buttons', colStart: 1, rowStart: 3, colSpan: 1, rowSpan: 1 },
        { id: 'editorial', colStart: 2, rowStart: 2, colSpan: 1, rowSpan: 2 },
        { id: 'logo', colStart: 3, rowStart: 2, colSpan: 1, rowSpan: 1 },
        { id: 'colors', colStart: 3, rowStart: 3, colSpan: 1, rowSpan: 1 },
      ],
    },
  },

  foodDrink: {
    mobile: {
      columns: 2,
      rows: 6,
      gap: 10,
      placements: [
        { id: 'image', colStart: 1, rowStart: 1, colSpan: 2, rowSpan: 1 },
        { id: 'logo', colStart: 1, rowStart: 2, colSpan: 2, rowSpan: 1 },
        { id: 'hero', colStart: 1, rowStart: 3, colSpan: 2, rowSpan: 2 },
        { id: 'buttons', colStart: 1, rowStart: 5, colSpan: 2, rowSpan: 1 },
        { id: 'editorial', colStart: 1, rowStart: 6, colSpan: 1, rowSpan: 1 },
        { id: 'colors', colStart: 2, rowStart: 6, colSpan: 1, rowSpan: 1 },
      ],
    },
    tablet: {
      columns: 3,
      rows: 4,
      gap: 12,
      placements: [
        { id: 'image', colStart: 1, rowStart: 1, colSpan: 2, rowSpan: 1 },
        { id: 'logo', colStart: 3, rowStart: 1, colSpan: 1, rowSpan: 1 },
        { id: 'hero', colStart: 1, rowStart: 2, colSpan: 2, rowSpan: 2 },
        { id: 'buttons', colStart: 3, rowStart: 2, colSpan: 1, rowSpan: 2 },
        { id: 'editorial', colStart: 1, rowStart: 4, colSpan: 1, rowSpan: 1 },
        { id: 'colors', colStart: 2, rowStart: 4, colSpan: 2, rowSpan: 1 },
      ],
    },
    desktop: {
      columns: 4,
      rows: 3,
      gap: 14,
      placements: [
        { id: 'image', colStart: 1, rowStart: 1, colSpan: 2, rowSpan: 1 },
        { id: 'logo', colStart: 3, rowStart: 1, colSpan: 2, rowSpan: 1 },
        { id: 'hero', colStart: 1, rowStart: 2, colSpan: 2, rowSpan: 2 },
        { id: 'buttons', colStart: 3, rowStart: 2, colSpan: 1, rowSpan: 2 },
        { id: 'editorial', colStart: 4, rowStart: 2, colSpan: 1, rowSpan: 1 },
        { id: 'colors', colStart: 4, rowStart: 3, colSpan: 1, rowSpan: 1 },
      ],
    },
  },

  heroCenter: {
    mobile: {
      columns: 2,
      rows: 6,
      gap: 12,
      placements: [
        { id: 'hero', colStart: 1, rowStart: 1, colSpan: 2, rowSpan: 2 },
        { id: 'a', colStart: 1, rowStart: 3, colSpan: 1, rowSpan: 1 },
        { id: 'b', colStart: 2, rowStart: 3, colSpan: 1, rowSpan: 1 },
        { id: 'c', colStart: 1, rowStart: 4, colSpan: 2, rowSpan: 1 },
        { id: 'd', colStart: 1, rowStart: 5, colSpan: 1, rowSpan: 1 },
        { id: 'e', colStart: 2, rowStart: 5, colSpan: 1, rowSpan: 1 },
        { id: 'f', colStart: 1, rowStart: 6, colSpan: 2, rowSpan: 1 },
      ],
    },
    tablet: {
      columns: 3,
      rows: 3,
      gap: 14,
      placements: [
        { id: 'a', colStart: 1, rowStart: 1, colSpan: 1, rowSpan: 1 },
        { id: 'hero', colStart: 2, rowStart: 1, colSpan: 2, rowSpan: 2 },
        { id: 'b', colStart: 1, rowStart: 2, colSpan: 1, rowSpan: 2 },
        { id: 'c', colStart: 2, rowStart: 3, colSpan: 1, rowSpan: 1 },
        { id: 'd', colStart: 3, rowStart: 3, colSpan: 1, rowSpan: 1 },
      ],
    },
    desktop: {
      columns: 3,
      rows: 3,
      gap: 16,
      placements: [
        { id: 'a', colStart: 1, rowStart: 1, colSpan: 1, rowSpan: 1 },
        { id: 'hero', colStart: 2, rowStart: 1, colSpan: 2, rowSpan: 2 },
        { id: 'b', colStart: 1, rowStart: 2, colSpan: 1, rowSpan: 2 },
        { id: 'c', colStart: 2, rowStart: 3, colSpan: 1, rowSpan: 1 },
        { id: 'd', colStart: 3, rowStart: 3, colSpan: 1, rowSpan: 1 },
      ],
    },
  },

  heroLeft: {
    mobile: {
      columns: 2,
      rows: 6,
      gap: 12,
      placements: [
        { id: 'hero', colStart: 1, rowStart: 1, colSpan: 2, rowSpan: 3 },
        { id: 'd', colStart: 1, rowStart: 4, colSpan: 1, rowSpan: 2 },
        { id: 'a', colStart: 2, rowStart: 4, colSpan: 1, rowSpan: 1 },
        { id: 'b', colStart: 2, rowStart: 5, colSpan: 1, rowSpan: 1 },
        { id: 'c', colStart: 1, rowStart: 6, colSpan: 1, rowSpan: 1 },
        { id: 'e', colStart: 2, rowStart: 6, colSpan: 1, rowSpan: 1 },
      ],
    },
    tablet: {
      columns: 3,
      rows: 3,
      gap: 14,
      placements: [
        { id: 'hero', colStart: 1, rowStart: 1, colSpan: 1, rowSpan: 3 },
        { id: 'd', colStart: 2, rowStart: 1, colSpan: 1, rowSpan: 2 },
        { id: 'a', colStart: 3, rowStart: 1, colSpan: 1, rowSpan: 1 },
        { id: 'b', colStart: 3, rowStart: 2, colSpan: 1, rowSpan: 1 },
        { id: 'c', colStart: 2, rowStart: 3, colSpan: 1, rowSpan: 1 },
        { id: 'e', colStart: 3, rowStart: 3, colSpan: 1, rowSpan: 1 },
      ],
    },
    desktop: {
      columns: 3,
      rows: 3,
      gap: 16,
      placements: [
        { id: 'hero', colStart: 1, rowStart: 1, colSpan: 1, rowSpan: 3 },
        { id: 'd', colStart: 2, rowStart: 1, colSpan: 1, rowSpan: 2 },
        { id: 'a', colStart: 3, rowStart: 1, colSpan: 1, rowSpan: 1 },
        { id: 'b', colStart: 3, rowStart: 2, colSpan: 1, rowSpan: 1 },
        { id: 'c', colStart: 2, rowStart: 3, colSpan: 1, rowSpan: 1 },
        { id: 'e', colStart: 3, rowStart: 3, colSpan: 1, rowSpan: 1 },
      ],
    },
  },

  stacked: {
    mobile: {
      columns: 2,
      rows: 6,
      gap: 12,
      placements: [
        { id: 'hero', colStart: 1, rowStart: 1, colSpan: 2, rowSpan: 2 },
        { id: 'a', colStart: 1, rowStart: 3, colSpan: 1, rowSpan: 1 },
        { id: 'b', colStart: 2, rowStart: 3, colSpan: 1, rowSpan: 1 },
        { id: 'c', colStart: 1, rowStart: 4, colSpan: 2, rowSpan: 1 },
        { id: 'd', colStart: 1, rowStart: 5, colSpan: 1, rowSpan: 1 },
        { id: 'e', colStart: 2, rowStart: 5, colSpan: 1, rowSpan: 1 },
        { id: 'f', colStart: 1, rowStart: 6, colSpan: 2, rowSpan: 1 },
      ],
    },
    tablet: {
      columns: 3,
      rows: 4,
      gap: 14,
      placements: [
        { id: 'hero', colStart: 1, rowStart: 1, colSpan: 3, rowSpan: 1 },
        { id: 'a', colStart: 1, rowStart: 2, colSpan: 1, rowSpan: 2 },
        { id: 'b', colStart: 2, rowStart: 2, colSpan: 2, rowSpan: 1 },
        { id: 'c', colStart: 2, rowStart: 3, colSpan: 1, rowSpan: 1 },
        { id: 'd', colStart: 3, rowStart: 3, colSpan: 1, rowSpan: 2 },
        { id: 'e', colStart: 1, rowStart: 4, colSpan: 1, rowSpan: 1 },
        { id: 'f', colStart: 2, rowStart: 4, colSpan: 1, rowSpan: 1 },
      ],
    },
    desktop: {
      columns: 3,
      rows: 4,
      gap: 16,
      placements: [
        { id: 'hero', colStart: 1, rowStart: 1, colSpan: 3, rowSpan: 1 },
        { id: 'a', colStart: 1, rowStart: 2, colSpan: 1, rowSpan: 2 },
        { id: 'b', colStart: 2, rowStart: 2, colSpan: 2, rowSpan: 1 },
        { id: 'c', colStart: 2, rowStart: 3, colSpan: 1, rowSpan: 1 },
        { id: 'd', colStart: 3, rowStart: 3, colSpan: 1, rowSpan: 2 },
        { id: 'e', colStart: 1, rowStart: 4, colSpan: 1, rowSpan: 1 },
        { id: 'f', colStart: 2, rowStart: 4, colSpan: 1, rowSpan: 1 },
      ],
    },
  },

  // Minimal: 3 tiles - large hero with 2 supporting
  minimal: {
    mobile: {
      columns: 2,
      rows: 3,
      gap: 12,
      placements: [
        { id: 'hero', colStart: 1, rowStart: 1, colSpan: 2, rowSpan: 2 },
        { id: 'c', colStart: 1, rowStart: 3, colSpan: 1, rowSpan: 1 },
        { id: 'b', colStart: 2, rowStart: 3, colSpan: 1, rowSpan: 1 },
      ],
    },
    tablet: {
      columns: 3,
      rows: 2,
      gap: 14,
      placements: [
        { id: 'hero', colStart: 1, rowStart: 1, colSpan: 2, rowSpan: 2 },
        { id: 'c', colStart: 3, rowStart: 1, colSpan: 1, rowSpan: 1 },
        { id: 'b', colStart: 3, rowStart: 2, colSpan: 1, rowSpan: 1 },
      ],
    },
    desktop: {
      columns: 3,
      rows: 2,
      gap: 16,
      placements: [
        { id: 'hero', colStart: 1, rowStart: 1, colSpan: 2, rowSpan: 2 },
        { id: 'c', colStart: 3, rowStart: 1, colSpan: 1, rowSpan: 1 },
        { id: 'b', colStart: 3, rowStart: 2, colSpan: 1, rowSpan: 1 },
      ],
    },
  },

  // Duo: 4 tiles - hero with 3 supporting tiles
  duo: {
    mobile: {
      columns: 2,
      rows: 3,
      gap: 12,
      placements: [
        { id: 'hero', colStart: 1, rowStart: 1, colSpan: 2, rowSpan: 2 },
        { id: 'a', colStart: 1, rowStart: 3, colSpan: 1, rowSpan: 1 },
        { id: 'b', colStart: 2, rowStart: 3, colSpan: 1, rowSpan: 1 },
      ],
    },
    tablet: {
      columns: 3,
      rows: 2,
      gap: 14,
      placements: [
        { id: 'hero', colStart: 1, rowStart: 1, colSpan: 1, rowSpan: 2 },
        { id: 'a', colStart: 2, rowStart: 1, colSpan: 2, rowSpan: 1 },
        { id: 'b', colStart: 2, rowStart: 2, colSpan: 1, rowSpan: 1 },
        { id: 'c', colStart: 3, rowStart: 2, colSpan: 1, rowSpan: 1 },
      ],
    },
    desktop: {
      columns: 3,
      rows: 2,
      gap: 16,
      placements: [
        { id: 'hero', colStart: 1, rowStart: 1, colSpan: 1, rowSpan: 2 },
        { id: 'a', colStart: 2, rowStart: 1, colSpan: 2, rowSpan: 1 },
        { id: 'b', colStart: 2, rowStart: 2, colSpan: 1, rowSpan: 1 },
        { id: 'c', colStart: 3, rowStart: 2, colSpan: 1, rowSpan: 1 },
      ],
    },
  },
};
