// Color palette with semantic roles (60-30-10 rule)
export interface ColorPalette {
  primary: string;        // Main brand color (60% usage)
  accent: string;         // Highlight color (10% usage)
  background: string;     // Surface color (30% usage)
  text: string;           // Body text color
}

// Image treatment preset types
export type ImageTreatment =
  | 'original'
  | 'duotone'
  | 'bw'
  | 'hi-contrast'
  | 'soft'
  | 'grain';

// Imagery tile state
export interface ImageryTileState {
  treatment: ImageTreatment;
  colorOverlay: number;   // 0-60 (percentage)
}

export interface BrandAssets {
  // Colors
  colors: string[];
  colorsSource: 'extracted' | 'default';

  // NEW: Semantic color roles (derived from colors array)
  palette: ColorPalette;

  // Typography
  primaryFont: string;
  secondaryFont: string;
  fontsSource: 'extracted' | 'default';

  // Logo
  logo: string | null;  // URL or data URI
  logoSource: 'favicon-svg' | 'favicon-png' | 'apple-touch-icon' | 'favicon-default' | 'header-img' | 'default';

  // Imagery
  heroImage: string | null;  // URL or data URI
  imagesSource: 'extracted' | 'default';

  // NEW: Image treatment state
  imagery: ImageryTileState;
}

export interface CanvasState {
  version: number;
  sourceUrl: string | null;
  assets: BrandAssets;
  tileSettings: TileSettings;
  extractedAt: number | null;
  lastModified: number;
}

export type ExtractionStage = 'idle' | 'fetching' | 'colors' | 'fonts' | 'images' | 'logo' | 'complete' | 'error';

// Logo tile display settings
export interface LogoTileState {
  scale: number;           // 40-100
  variant: 'original' | 'dark' | 'light';
  background: 'white' | 'dark' | 'primary' | 'auto';
}

// Typography tile display settings
export interface TypographyTileState {
  weight: string;          // 'regular', '400', '700', etc.
  sizeScale: number;       // 0.8-1.4 multiplier
  lineHeight: number;      // 1.0-2.0
}

// Tile settings for logo and typography tiles
export interface TileSettings {
  logo: LogoTileState;
  primaryFont: TypographyTileState;
  secondaryFont: TypographyTileState;
  recentFonts: string[];   // Max 10, for font picker
}
