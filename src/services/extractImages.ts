interface ExtractedImages {
  heroImage: string | null;
  source: 'og-image' | 'hero-section' | 'large-image' | null;
}

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
