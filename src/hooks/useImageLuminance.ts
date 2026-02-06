import { useState, useEffect } from 'react';
import { getImageLuminance, getAdaptiveBackground } from '@/services/luminance';

interface UseImageLuminanceResult {
  luminance: number | null;
  background: 'light' | 'dark';
  loading: boolean;
  error: string | null;
}

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
