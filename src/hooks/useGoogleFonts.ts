/**
 * Google Fonts Loading Hook
 *
 * Dynamically loads Google Fonts with automatic fallback handling
 * and loading state management.
 *
 * @module hooks/useGoogleFonts
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { loadFontWithFallback, getSystemFallback } from '@/services/googleFonts';
import { GOOGLE_FONTS_MAP, type GoogleFontMeta } from '@/data/googleFontsMetadata';

/**
 * Result object returned by useGoogleFonts hook.
 */
interface UseGoogleFontsResult {
  /** Whether font is currently loading */
  loading: boolean;
  /** Error message if loading failed, null otherwise */
  error: string | null;
  /** CSS font-family value with fallbacks (e.g., '"Inter", system-ui, sans-serif') */
  fontFamily: string;
  /** Manual font loader for imperative loading */
  loadFont: (family: string, weights?: string[]) => Promise<boolean>;
}

/**
 * Hook for loading Google Fonts with automatic fallback handling.
 *
 * Features:
 * - Auto-loads font when family prop changes
 * - Provides CSS-ready font-family string with system fallbacks
 * - Tracks loading/error states
 * - Supports custom weight selection
 *
 * @param family - Google Font family name (e.g., "Inter", "Playfair Display")
 * @param category - Font category for fallback selection (default: "sans-serif")
 * @returns Object with loading state, fontFamily CSS value, and loadFont function
 *
 * @example
 * function TypographyPreview({ fontName }: { fontName: string }) {
 *   const { fontFamily, loading, error } = useGoogleFonts(fontName);
 *
 *   if (loading) return <Skeleton />;
 *   if (error) return <span>Font unavailable</span>;
 *
 *   return <h1 style={{ fontFamily }}>Preview Text</h1>;
 * }
 */
export function useGoogleFonts(
  family: string,
  category: GoogleFontMeta['category'] = 'sans-serif'
): UseGoogleFontsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedFamily, setLoadedFamily] = useState<string | null>(null);
  const requestRef = useRef(0);

  // Get system fallback for the category
  const fallback = getSystemFallback(category);

  // Build font-family value with fallback
  const fontFamily = loadedFamily ? `"${loadedFamily}", ${fallback}` : fallback;

  const loadFontAsync = useCallback(async (fontFamily: string, weights?: string[]) => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);

    // Find font metadata to get available weights and source
    const fontMeta = GOOGLE_FONTS_MAP.get(fontFamily);
    const weightsToLoad = weights || (fontMeta?.variants.filter(v => !v.includes('italic')) || ['400']);
    const source = fontMeta?.source || 'google';

    const result = await loadFontWithFallback(fontFamily, weightsToLoad, 3000, source);

    if (requestId !== requestRef.current) {
      return false;
    }
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
    let mounted = true;
    if (family) {
      // Use microtask to avoid synchronous setState warning
      Promise.resolve().then(() => {
        if (!mounted) return;
        loadFontAsync(family);
      });
    }
    return () => { mounted = false; };
  }, [family, loadFontAsync]);

  return { loading, error, fontFamily, loadFont: loadFontAsync };
}
