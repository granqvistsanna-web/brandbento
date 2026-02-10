/**
 * Layout System Types
 *
 * Type definitions for the responsive bento grid system.
 * Controls breakpoints, density, tile sizing, and preset configurations.
 */

/** Responsive breakpoint tiers — layout recalculates at each threshold. */
export type BreakpointName = 'mobile' | 'tablet' | 'desktop';

/** Grid density mode — affects gap size and row height. */
export type DensityMode = 'cozy' | 'dense';

/** Available layout preset names. Each defines unique tile arrangements. */
export type LayoutPresetName =
  | 'balanced'
  | 'heroLeft'
  | 'heroCenter'
  | 'stacked'
  | 'geos'
  | 'spread'
  | 'minimal'
  | 'duo'
  | 'mosaic';

/** All renderable tile component types in the bento grid. */
export type TileType =
  | 'hero'
  | 'logo'
  | 'menu'
  | 'colors'
  | 'primaryType'
  | 'secondaryType'
  | 'imagery'
  | 'uiPreview'
  | 'editorial'
  | 'product'
  | 'utility'
  | 'social'
  | 'ui-preview'
  | 'fullImage'
  | 'landscape'
  | 'swatch'
  | 'icons'
  | 'card'
  | 'logo-symbol'
  | 'pattern'
  | 'stats'
  | 'app-screen';

/** How many grid columns/rows a tile occupies at a single breakpoint. */
export interface TileSpan {
  colSpan: number;
  rowSpan: number;
}

/** Tile span overrides per responsive breakpoint. */
export interface BreakpointSpans {
  mobile: TileSpan;
  tablet: TileSpan;
  desktop: TileSpan;
}

/**
 * Full layout preset configuration.
 * Defines grid dimensions, spacing, and per-tile span overrides
 * for each breakpoint and density mode.
 */
export interface LayoutPreset {
  name: LayoutPresetName;
  /** Grid column count per breakpoint */
  columns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  /** Grid row count per breakpoint */
  rows: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  /** Grid gap in px per density mode */
  gap: {
    cozy: number;
    dense: number;
  };
  /** Row height in px per density mode */
  rowHeight: {
    cozy: number;
    dense: number;
  };
  /** Per-tile span overrides — tiles not listed use 1x1 default */
  tileSpans: Partial<Record<TileType, BreakpointSpans>>;
}

/** Current layout state managed by the layout store. */
export interface LayoutState {
  breakpoint: BreakpointName;
  preset: LayoutPresetName;
  density: DensityMode;
  debugMode: boolean;
}
