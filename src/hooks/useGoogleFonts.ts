import { useState, useEffect, useCallback } from 'react';
import { loadFontWithFallback, getSystemFallback } from '@/services/googleFonts';
import { GOOGLE_FONTS, type GoogleFontMeta } from '@/data/googleFontsMetadata';

interface UseGoogleFontsResult {
  loading: boolean;
  error: string | null;
  fontFamily: string;
  loadFont: (family: string, weights?: string[]) => Promise<boolean>;
}

/**
 * Hook for loading Google Fonts with auto-load on family change
 */
export function useGoogleFonts(
  family: string,
  category: GoogleFontMeta['category'] = 'sans-serif'
): UseGoogleFontsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedFamily, setLoadedFamily] = useState<string | null>(null);

  // Get system fallback for the category
  const fallback = getSystemFallback(category);

  // Build font-family value with fallback
  const fontFamily = loadedFamily ? `"${loadedFamily}", ${fallback}` : fallback;

  const loadFontAsync = useCallback(async (fontFamily: string, weights?: string[]) => {
    setLoading(true);
    setError(null);

    // Find font metadata to get available weights
    const fontMeta = GOOGLE_FONTS.find(f => f.family === fontFamily);
    const weightsToLoad = weights || (fontMeta?.variants.filter(v => !v.includes('italic')) || ['400']);

    const result = await loadFontWithFallback(fontFamily, weightsToLoad);

    setLoading(false);

    if (result.loaded) {
      setLoadedFamily(fontFamily);
      return true;
    } else {
      setError(result.error || 'Failed to load font');
      return false;
    }
  }, []);

  // Auto-load on family change
  useEffect(() => {
    if (family) {
      loadFontAsync(family);
    }
  }, [family, loadFontAsync]);

  return { loading, error, fontFamily, loadFont: loadFontAsync };
}
