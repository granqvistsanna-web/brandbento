import type { BrandAssets, ExtractionStage } from '@/types/brand';
import { DEFAULT_ASSETS, generateMonogram } from '@/state/defaults';
import { fetchViaProxy } from './corsProxy';
import { extractColors } from './extractColors';
import { extractFonts } from './extractFonts';
import { extractLogo } from './extractLogo';
import { extractImages } from './extractImages';

export interface ExtractionProgress {
  stage: ExtractionStage;
  assets: Partial<BrandAssets>;
  error?: string;
}

export type ProgressCallback = (progress: ExtractionProgress) => void;

export async function extractBrand(
  url: string,
  onProgress?: ProgressCallback
): Promise<BrandAssets> {
  // Normalize URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  // Start with defaults immediately
  const assets: BrandAssets = {
    ...DEFAULT_ASSETS,
    logo: generateMonogram(url),
    logoSource: 'default',
  };

  onProgress?.({ stage: 'fetching', assets });

  let doc: Document;

  try {
    // Fetch HTML via CORS proxy
    const html = await fetchViaProxy(url);
    doc = new DOMParser().parseFromString(html, 'text/html');

    // Set base URL for relative URLs
    const base = doc.createElement('base');
    base.href = url;
    doc.head.prepend(base);

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch page';
    onProgress?.({ stage: 'error', assets, error: message });
    return assets; // Return defaults on fetch failure
  }

  // Extract colors
  onProgress?.({ stage: 'colors', assets });
  try {
    const colorResult = await extractColors(doc);
    assets.colors = colorResult.colors;
    assets.colorsSource = 'extracted';
    onProgress?.({ stage: 'colors', assets });
  } catch (error) {
    console.warn('Color extraction failed:', error);
    // Keep defaults
  }

  // Extract fonts
  onProgress?.({ stage: 'fonts', assets });
  try {
    const fontResult = await extractFonts(doc);
    assets.primaryFont = fontResult.primaryFont;
    assets.secondaryFont = fontResult.secondaryFont;
    assets.fontsSource = 'extracted';
    onProgress?.({ stage: 'fonts', assets });
  } catch (error) {
    console.warn('Font extraction failed:', error);
    // Keep defaults
  }

  // Extract images
  onProgress?.({ stage: 'images', assets });
  try {
    const imageResult = await extractImages(doc, url);
    if (imageResult.heroImage) {
      assets.heroImage = imageResult.heroImage;
      assets.imagesSource = 'extracted';
    }
    onProgress?.({ stage: 'images', assets });
  } catch (error) {
    console.warn('Image extraction failed:', error);
    // Keep defaults (null heroImage)
  }

  // Extract logo
  onProgress?.({ stage: 'logo', assets });
  try {
    const logoResult = await extractLogo(doc, url);
    assets.logo = logoResult.logo;
    assets.logoSource = logoResult.source;
    onProgress?.({ stage: 'logo', assets });
  } catch (error) {
    console.warn('Logo extraction failed:', error);
    // Keep monogram fallback
  }

  // Complete
  onProgress?.({ stage: 'complete', assets });

  return assets;
}

// Helper to check if an asset is using defaults
export function isDefaultAsset(assets: BrandAssets, assetType: keyof BrandAssets): boolean {
  switch (assetType) {
    case 'colors':
      return assets.colorsSource === 'default';
    case 'primaryFont':
    case 'secondaryFont':
      return assets.fontsSource === 'default';
    case 'logo':
      return assets.logoSource === 'default';
    case 'heroImage':
      return assets.imagesSource === 'default';
    default:
      return false;
  }
}
