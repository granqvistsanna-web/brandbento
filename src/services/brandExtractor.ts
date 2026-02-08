/**
 * Brand Extraction Orchestrator
 *
 * Coordinates extraction of brand assets (colors, fonts, logo, images) from
 * any URL. Uses a multi-strategy approach with graceful fallbacks to defaults.
 *
 * ## Extraction Pipeline
 *
 * 1. Fetch HTML via CORS proxy
 * 2. Extract colors (CSS vars → semantic elements → stylesheets)
 * 3. Extract fonts (Google Fonts → CSS vars → document.fonts → @font-face)
 * 4. Extract images (og:image → hero section → large images)
 * 5. Extract logo (SVG favicon → PNG favicon → apple-touch-icon → header img)
 *
 * Each step is independent and fails gracefully, keeping defaults for any
 * failed extraction. Progress callbacks enable real-time UI updates.
 *
 * @module services/brandExtractor
 */
import type { BrandAssets, ExtractionStage } from '@/types/brand';
import { DEFAULT_ASSETS, generateMonogram } from '@/state/defaults';
import { fetchViaProxy } from './corsProxy';
import { extractColors } from './extractColors';
import { extractFonts } from './extractFonts';
import { extractLogo } from './extractLogo';
import { extractImages } from './extractImages';

/**
 * Progress update during brand extraction.
 */
export interface ExtractionProgress {
  /** Current extraction stage */
  stage: ExtractionStage;
  /** Partially extracted assets so far */
  assets: Partial<BrandAssets>;
  /** Error message if extraction failed at this stage */
  error?: string;
}

/**
 * Callback for receiving extraction progress updates.
 */
export type ProgressCallback = (progress: ExtractionProgress) => void;

/**
 * Extracts brand assets from a URL.
 *
 * Orchestrates the full extraction pipeline, calling individual extractors
 * for colors, fonts, images, and logo. Each extractor can fail independently
 * without affecting others - defaults are used for any failed extraction.
 *
 * @param url - Website URL to extract from (with or without protocol)
 * @param onProgress - Optional callback for progress updates
 * @returns Complete BrandAssets object (extracted values + defaults for failures)
 *
 * @example
 * const assets = await extractBrand('stripe.com', (progress) => {
 *   console.log(`Stage: ${progress.stage}`);
 *   if (progress.error) console.error(progress.error);
 * });
 */
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

/**
 * Checks if a specific asset is using default values (not extracted).
 *
 * Useful for showing indicators in the UI that an asset couldn't be
 * extracted and is using fallback values.
 *
 * @param assets - The BrandAssets object to check
 * @param assetType - Which asset type to check
 * @returns true if the asset is using defaults, false if extracted
 *
 * @example
 * if (isDefaultAsset(assets, 'colors')) {
 *   showWarning('Colors could not be extracted, using defaults');
 * }
 */
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
