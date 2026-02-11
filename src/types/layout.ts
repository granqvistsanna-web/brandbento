/**
 * Layout System Types
 *
 * Type definitions for the responsive bento grid system.
 * Controls breakpoints, density, and preset configurations.
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
  | 'editorial'
  | 'product'
  | 'utility'
  | 'social'
  | 'ui-preview'
  | 'landscape'
  | 'swatch'
  | 'icons'
  | 'card'
  | 'logo-symbol'
  | 'pattern'
  | 'stats';

/** Current layout state managed by the layout store. */
export interface LayoutState {
  breakpoint: BreakpointName;
  preset: LayoutPresetName;
  density: DensityMode;
  debugMode: boolean;
}
