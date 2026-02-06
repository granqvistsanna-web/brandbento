export interface BrandAssets {
  // Colors
  colors: string[];
  colorsSource: 'extracted' | 'default';

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
