/**
 * Image Luminance Detection Hook
 *
 * Analyzes image brightness to determine optimal text/overlay colors
 * for accessibility and readability.
 *
 * @module hooks/useImageLuminance
 */
import { useState, useEffect } from 'react';
import { getImageLuminance, getAdaptiveBackground } from '@/services/luminance';

/**
 * Result object returned by useImageLuminance hook.
 */
interface UseImageLuminanceResult {
  /** Calculated luminance value (0-1, null if not calculated) */
  luminance: number | null;
  /** Recommended background type for overlays: "light" or "dark" */
  background: 'light' | 'dark';
  /** Whether luminance calculation is in progress */
  loading: boolean;
  /** Error message if calculation failed, null otherwise */
  error: string | null;
}

/**
 * Hook for detecting image luminance and recommending overlay colors.
 *
 * Analyzes the average brightness of an image to determine whether
 * light or dark text/overlays should be used for optimal contrast.
 * Uses WCAG luminance formula (ITU-R BT.709 coefficients).
 *
 * @param imageUrl - URL of image to analyze (null to reset)
 * @returns Object with luminance value, background recommendation, and loading state
 *
 * @example
 * function ImageWithOverlay({ src }: { src: string }) {
 *   const { background, loading } = useImageLuminance(src);
 *
 *   const textColor = background === 'dark' ? 'text-white' : 'text-black';
 *
 *   return (
 *     <div className="relative">
 *       <img src={src} />
 *       {!loading && <span className={textColor}>Overlay Text</span>}
 *     </div>
 *   );
 * }
 */
export function useImageLuminance(imageUrl: string | null): UseImageLuminanceResult {
  const [luminance, setLuminance] = useState<number | null>(null);
  const [background, setBackground] = useState<'light' | 'dark'>('light');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setLuminance(null);
      setBackground('light');
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    getImageLuminance(imageUrl)
      .then(l => {
        setLuminance(l);
        setBackground(getAdaptiveBackground(l));
      })
      .catch(err => {
        console.warn('Luminance detection failed:', err);
        setError(err.message);
        setLuminance(null);
        setBackground('light');  // Fallback to light
      })
      .finally(() => setLoading(false));
  }, [imageUrl]);

  return { luminance, background, loading, error };
}
