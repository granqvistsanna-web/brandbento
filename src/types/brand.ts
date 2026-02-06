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
  extractedAt: number | null;
  lastModified: number;
}

export type ExtractionStage = 'idle' | 'fetching' | 'colors' | 'fonts' | 'images' | 'logo' | 'complete' | 'error';
