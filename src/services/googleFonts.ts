/**
 * Google Fonts Service
 * Load fonts via CSS API v2 with caching and fallbacks
 */

// Cache of loaded fonts to avoid duplicate requests
const loadedFonts = new Set<string>();

/**
 * Build Google Fonts CSS API v2 URL
 */
export function buildFontURL(
  family: string,
  weights: string[] = ['400'],
  display: 'swap' | 'block' | 'auto' = 'swap'
): string {
  const encodedFamily = family.replace(/ /g, '+');
  const weightSpec = weights.sort((a, b) => parseInt(a) - parseInt(b)).join(';');
  return `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@${weightSpec}&display=${display}`;
}

/**
 * Load font by injecting <link> tag
 */
export function loadFont(family: string, weights: string[] = ['400']): Promise<void> {
  return new Promise((resolve, reject) => {
    // Build cache key
    const cacheKey = `${family}:${weights.join(',')}`;

    // Check cache
    if (loadedFonts.has(cacheKey)) {
      resolve();
      return;
    }

    const url = buildFontURL(family, weights);

    // Check if link already exists in DOM
    const existing = document.querySelector(`link[href="${url}"]`);
    if (existing) {
      loadedFonts.add(cacheKey);
      resolve();
      return;
    }

    // Create and inject link element
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;

    link.onload = () => {
      // Wait for document.fonts to be ready
      document.fonts.ready.then(() => {
        loadedFonts.add(cacheKey);
        resolve();
      });
    };

    link.onerror = () => {
      reject(new Error(`Failed to load font: ${family}`));
    };

    document.head.appendChild(link);
  });
}

/**
 * Load font with timeout and fallback
 * Returns success status instead of throwing
 */
export async function loadFontWithFallback(
  family: string,
  weights: string[] = ['400'],
  timeout = 3000
): Promise<{ loaded: boolean; error?: string }> {
  try {
    await Promise.race([
      loadFont(family, weights),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Font load timeout')), timeout)
      )
    ]);
    return { loaded: true };
  } catch (error) {
    console.warn(`Font load failed: ${family}`, error);
    return { loaded: false, error: (error as Error).message };
  }
}

/**
 * Get system fallback font stack for a given category
 */
export function getSystemFallback(category: string): string {
  switch (category) {
    case 'serif':
      return 'Georgia, "Times New Roman", serif';
    case 'monospace':
      return '"Courier New", Courier, monospace';
    case 'display':
    case 'handwriting':
      return 'system-ui, sans-serif';
    case 'sans-serif':
    default:
      return 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  }
}

/**
 * Check if a font is already loaded in cache
 */
export function isFontLoaded(family: string, weights: string[] = ['400']): boolean {
  const cacheKey = `${family}:${weights.join(',')}`;
  return loadedFonts.has(cacheKey);
}
