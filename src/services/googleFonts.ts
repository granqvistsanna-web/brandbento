/**
 * Google Fonts Loading Service
 *
 * Dynamically loads Google Fonts via CSS API v2. Implements caching,
 * timeout handling, and system font fallbacks for graceful degradation.
 *
 * ## Features
 *
 * - **Caching**: Tracks loaded fonts to avoid duplicate requests
 * - **Fallbacks**: Provides category-specific system font stacks
 * - **Timeout**: Prevents hanging on slow networks
 * - **font-display: swap**: Ensures text is visible during load
 *
 * @module services/googleFonts
 */

/**
 * Cache of loaded fonts to avoid duplicate network requests.
 * Key format: "FontFamily:400,700"
 */
const loadedFonts = new Set<string>();

/**
 * Builds a Google Fonts CSS API v2 URL.
 *
 * @param family - Font family name (e.g., "Inter", "Playfair Display")
 * @param weights - Array of font weights to load (default: ['400'])
 * @param display - font-display strategy (default: 'swap')
 * @returns Complete Google Fonts CSS URL
 *
 * @example
 * const url = buildFontURL('Inter', ['400', '700']);
 * // https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap
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
 * Loads a Google Font by injecting a <link> tag.
 *
 * Checks cache first, then existing DOM links, before creating new request.
 * Waits for document.fonts.ready to ensure font is actually usable.
 *
 * @param family - Font family name
 * @param weights - Array of weights to load (default: ['400'])
 * @returns Promise that resolves when font is loaded and ready
 * @throws Error if font fails to load
 *
 * @example
 * await loadFont('Inter', ['400', '500', '700']);
 * // Font is now ready to use in CSS
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
 * Loads a font with timeout handling and graceful failure.
 *
 * Unlike loadFont(), this never throws. Returns a result object
 * indicating success/failure, making it safe for non-critical font loading.
 *
 * @param family - Font family name
 * @param weights - Array of weights to load (default: ['400'])
 * @param timeout - Maximum wait time in ms (default: 3000)
 * @returns Object with loaded boolean and optional error message
 *
 * @example
 * const result = await loadFontWithFallback('Playfair Display');
 * if (!result.loaded) {
 *   console.warn('Using fallback font:', result.error);
 * }
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
 * Gets a system font stack for a given font category.
 *
 * Provides appropriate fallbacks when web fonts fail to load,
 * ensuring text remains readable with similar characteristics.
 *
 * @param category - Font category ('serif', 'sans-serif', 'monospace', 'display', 'handwriting')
 * @returns CSS font-family value with multiple fallbacks
 *
 * @example
 * const fallback = getSystemFallback('serif');
 * // 'Georgia, "Times New Roman", serif'
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
 * Checks if a font has already been loaded.
 *
 * Useful for avoiding redundant load calls or showing loading states.
 *
 * @param family - Font family name
 * @param weights - Weights to check (default: ['400'])
 * @returns true if font+weights combination is already loaded
 *
 * @example
 * if (!isFontLoaded('Inter', ['400', '700'])) {
 *   await loadFont('Inter', ['400', '700']);
 * }
 */
export function isFontLoaded(family: string, weights: string[] = ['400']): boolean {
  const cacheKey = `${family}:${weights.join(',')}`;
  return loadedFonts.has(cacheKey);
}
