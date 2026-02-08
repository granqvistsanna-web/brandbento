/**
 * Image Extraction Service
 *
 * Extracts hero/brand imagery from a parsed HTML document.
 * Focuses on finding large, representative images suitable for moodboards.
 *
 * ## Extraction Strategies (in priority order)
 *
 * 1. **Open Graph Image** - Most reliable for brand imagery (og:image meta)
 * 2. **Twitter Card Image** - Alternative social media image
 * 3. **Hero Section Image** - Images in .hero, #hero, or first sections
 * 4. **Large Image** - First large (>100px) non-logo image on page
 *
 * @module services/extractImages
 */

/**
 * Result of image extraction.
 */
interface ExtractedImages {
  /** URL of hero image (null if none found) */
  heroImage: string | null;
  /** Which extraction strategy succeeded (null if none) */
  source: 'og-image' | 'hero-section' | 'large-image' | null;
}

/**
 * Extracts hero/brand imagery from a parsed HTML document.
 *
 * Tries multiple sources in priority order. Filters out small images,
 * icons, logos, and tracking pixels to find actual brand imagery.
 *
 * @param doc - Parsed HTML document from DOMParser
 * @param baseUrl - Base URL for resolving relative URLs
 * @returns Object with heroImage URL and source (or null if not found)
 *
 * @example
 * const { heroImage, source } = await extractImages(doc, 'https://stripe.com');
 * // heroImage: 'https://stripe.com/img/hero.jpg', source: 'og-image'
 */
export async function extractImages(doc: Document, baseUrl: string): Promise<ExtractedImages> {
  // Strategy 1: Open Graph image (most reliable for brand imagery)
  const ogImage = doc.querySelector('meta[property="og:image"]');
  if (ogImage) {
    const content = ogImage.getAttribute('content');
    if (content) {
      return { heroImage: resolveUrl(content, baseUrl), source: 'og-image' };
    }
  }

  // Strategy 2: Twitter card image
  const twitterImage = doc.querySelector('meta[name="twitter:image"]');
  if (twitterImage) {
    const content = twitterImage.getAttribute('content');
    if (content) {
      return { heroImage: resolveUrl(content, baseUrl), source: 'og-image' };
    }
  }

  // Strategy 3: Hero section image
  const heroSelectors = [
    '.hero img',
    '#hero img',
    '[class*="hero"] img',
    'section:first-of-type img',
    'header + section img',
    'main > section:first-child img',
  ];

  for (const selector of heroSelectors) {
    const img = doc.querySelector(selector);
    if (img) {
      const src = img.getAttribute('src') || img.getAttribute('data-src');
      if (src && !isSmallOrIcon(img)) {
        return { heroImage: resolveUrl(src, baseUrl), source: 'hero-section' };
      }
    }
  }

  // Strategy 4: First large image on page
  const allImages = doc.querySelectorAll('img');
  for (const img of allImages) {
    const src = img.getAttribute('src') || img.getAttribute('data-src');
    if (!src) continue;

    // Skip small images, icons, logos, tracking pixels
    if (isSmallOrIcon(img)) continue;

    // Skip images that look like logos
    const alt = (img.getAttribute('alt') || '').toLowerCase();
    const className = (img.className || '').toLowerCase();
    if (alt.includes('logo') || className.includes('logo') || className.includes('icon')) {
      continue;
    }

    return { heroImage: resolveUrl(src, baseUrl), source: 'large-image' };
  }

  // No suitable image found
  return { heroImage: null, source: null };
}

/**
 * Checks if an image is too small or appears to be an icon.
 * Filters out images < 100px and those with icon/logo patterns in src.
 */
function isSmallOrIcon(img: Element): boolean {
  const width = img.getAttribute('width');
  const height = img.getAttribute('height');

  if (width && parseInt(width) < 100) return true;
  if (height && parseInt(height) < 100) return true;

  // Check for common icon patterns in src
  const src = img.getAttribute('src') || '';
  if (src.includes('icon') || src.includes('favicon') || src.includes('logo')) {
    return true;
  }

  // Check for SVG icons
  if (src.endsWith('.svg') && !src.includes('hero') && !src.includes('banner')) {
    return true;
  }

  return false;
}

function resolveUrl(href: string, baseUrl: string): string {
  if (href.startsWith('data:') || href.startsWith('http://') || href.startsWith('https://')) {
    return href;
  }

  try {
    return new URL(href, baseUrl).href;
  } catch {
    return href;
  }
}
