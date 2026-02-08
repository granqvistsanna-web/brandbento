/**
 * Logo Extraction Service
 *
 * Extracts brand logos from a parsed HTML document. Prioritizes
 * high-quality sources like SVG favicons over lower-quality alternatives.
 *
 * ## Extraction Strategies (in priority order)
 *
 * 1. **SVG Favicon** - Highest quality, scalable
 * 2. **PNG Favicon** - Prefers largest size available
 * 3. **Apple Touch Icon** - 180x180, good quality
 * 4. **Generic Favicon** - Standard favicon link
 * 5. **Header Image** - Logo in header/nav with logo class
 * 6. **Default Favicon** - /favicon.ico fallback
 *
 * @module services/extractLogo
 */

/**
 * Result of logo extraction.
 */
interface ExtractedLogo {
  /** URL of the logo (absolute URL or data URI) */
  logo: string;
  /** Which extraction strategy succeeded */
  source: 'favicon-svg' | 'favicon-png' | 'apple-touch-icon' | 'favicon-default' | 'header-img';
}

/**
 * Extracts brand logo from a parsed HTML document.
 *
 * Tries multiple sources in quality order, returning the first found.
 * All URLs are resolved to absolute using the base URL.
 *
 * @param doc - Parsed HTML document from DOMParser
 * @param baseUrl - Base URL for resolving relative URLs
 * @returns Object with logo URL and source
 *
 * @example
 * const { logo, source } = await extractLogo(doc, 'https://stripe.com');
 * // logo: 'https://stripe.com/favicon.svg', source: 'favicon-svg'
 */
export async function extractLogo(doc: Document, baseUrl: string): Promise<ExtractedLogo> {
  // Strategy 1: SVG favicon (highest quality)
  const svgIcon = doc.querySelector('link[rel*="icon"][type="image/svg+xml"]');
  if (svgIcon) {
    const href = svgIcon.getAttribute('href');
    if (href) {
      return { logo: resolveUrl(href, baseUrl), source: 'favicon-svg' };
    }
  }

  // Strategy 2: PNG favicon with size preference
  const pngIcons = Array.from(doc.querySelectorAll('link[rel*="icon"][type="image/png"]'));
  if (pngIcons.length > 0) {
    // Prefer largest icon
    let bestIcon: Element | null = null;
    let bestSize = 0;

    for (const icon of pngIcons) {
      const sizes = icon.getAttribute('sizes');
      if (sizes) {
        const size = parseInt(sizes.split('x')[0]) || 0;
        if (size > bestSize) {
          bestSize = size;
          bestIcon = icon;
        }
      } else if (!bestIcon) {
        bestIcon = icon;
      }
    }

    if (bestIcon) {
      const href = bestIcon.getAttribute('href');
      if (href) {
        return { logo: resolveUrl(href, baseUrl), source: 'favicon-png' };
      }
    }
  }

  // Strategy 3: Apple touch icon (180x180, good quality)
  const appleIcon = doc.querySelector('link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]');
  if (appleIcon) {
    const href = appleIcon.getAttribute('href');
    if (href) {
      return { logo: resolveUrl(href, baseUrl), source: 'apple-touch-icon' };
    }
  }

  // Strategy 4: Generic favicon link
  const genericIcon = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
  if (genericIcon) {
    const href = genericIcon.getAttribute('href');
    if (href) {
      return { logo: resolveUrl(href, baseUrl), source: 'favicon-default' };
    }
  }

  // Strategy 5: Check header/nav for logo image
  const logoSelectors = [
    'header img[class*="logo"]',
    'nav img[class*="logo"]',
    'header a img',
    '.logo img',
    '#logo img',
    'img.logo',
    '[aria-label*="logo"] img',
  ];

  for (const selector of logoSelectors) {
    const img = doc.querySelector(selector);
    if (img) {
      const src = img.getAttribute('src');
      if (src) {
        return { logo: resolveUrl(src, baseUrl), source: 'header-img' };
      }
    }
  }

  // Strategy 6: Default /favicon.ico (we'll verify it exists via fetch)
  const defaultFavicon = resolveUrl('/favicon.ico', baseUrl);

  // Note: We can't verify the favicon exists without a fetch,
  // but we'll return it as a candidate. The caller should handle 404s.
  return { logo: defaultFavicon, source: 'favicon-default' };
}

/**
 * Resolves a URL against a base URL.
 * Handles data URIs and already-absolute URLs.
 */
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
