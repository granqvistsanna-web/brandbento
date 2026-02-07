import type { BrandAssets, CanvasState, TileSettings, ColorPalette, ImageryTileState } from '@/types/brand';

export const DEFAULT_COLORS = ['#111111', '#555555', '#F5F5F5', '#2563EB', '#FFFFFF'];
export const DEFAULT_PRIMARY_FONT = 'Inter';
export const DEFAULT_SECONDARY_FONT = 'Lora';

export const defaultPalette: ColorPalette = {
  primary: '#2563EB',
  accent: '#7C3AED',
  background: '#F5F5F5',
  text: '#111111',
};

export const defaultImagery: ImageryTileState = {
  treatment: 'original',
  colorOverlay: 0,
};

export const DEFAULT_ASSETS: BrandAssets = {
  colors: DEFAULT_COLORS,
  colorsSource: 'default',
  palette: defaultPalette,
  primaryFont: DEFAULT_PRIMARY_FONT,
  secondaryFont: DEFAULT_SECONDARY_FONT,
  fontsSource: 'default',
  logo: null,
  logoSource: 'default',
  heroImage: null,
  imagesSource: 'default',
  imagery: defaultImagery,
};

export const defaultTileSettings: TileSettings = {
  logo: {
    scale: 70,
    variant: 'original',
    background: 'auto',
  },
  primaryFont: {
    weight: 'regular',
    sizeScale: 1.0,
    lineHeight: 1.2,
  },
  secondaryFont: {
    weight: 'regular',
    sizeScale: 1.0,
    lineHeight: 1.5,
  },
  recentFonts: [],
};

export function createDefaultState(): CanvasState {
  return {
    version: 1,
    sourceUrl: null,
    assets: { ...DEFAULT_ASSETS },
    tileSettings: { ...defaultTileSettings },
    extractedAt: null,
    lastModified: Date.now(),
  };
}

export function generateMonogram(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const initials = domain.split('.')[0].substring(0, 2).toUpperCase();

    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="#111"/>
        <text x="50" y="55" font-family="Inter, sans-serif"
              font-size="40" font-weight="700"
              fill="#FFF" text-anchor="middle" dominant-baseline="middle">
          ${initials}
        </text>
      </svg>
    `)}`;
  } catch {
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="#111"/>
        <text x="50" y="55" font-family="Inter, sans-serif"
              font-size="40" font-weight="700"
              fill="#FFF" text-anchor="middle" dominant-baseline="middle">
          BB
        </text>
      </svg>
    `)}`;
  }
}
