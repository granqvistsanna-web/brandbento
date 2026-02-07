// Layout system types for responsive bento grid

export type BreakpointName = 'mobile' | 'tablet' | 'desktop';

export type DensityMode = 'cozy' | 'dense';

export type LayoutPresetName = 'balanced' | 'heroLeft' | 'heroCenter' | 'stacked';

export type TileType =
  | 'hero'
  | 'logo'
  | 'colors'
  | 'primaryType'
  | 'secondaryType'
  | 'imagery'
  | 'uiPreview'
  | 'editorial'
  | 'product'
  | 'utility';

export interface TileSpan {
  colSpan: number;
  rowSpan: number;
}

export interface BreakpointSpans {
  mobile: TileSpan;
  tablet: TileSpan;
  desktop: TileSpan;
}

export interface LayoutPreset {
  name: LayoutPresetName;
  columns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  rows: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap: {
    cozy: number;
    dense: number;
  };
  rowHeight: {
    cozy: number;
    dense: number;
  };
  tileSpans: Record<TileType, BreakpointSpans>;
}

export interface LayoutState {
  breakpoint: BreakpointName;
  preset: LayoutPresetName;
  density: DensityMode;
  debugMode: boolean;
}
