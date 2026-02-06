interface ExtractedLogo {
  logo: string;
  source: 'favicon-svg' | 'favicon-png' | 'apple-touch-icon' | 'favicon-default' | 'header-img';
}

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
