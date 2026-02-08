/**
 * Luminance Detection Service
 *
 * Calculates image brightness using WCAG luminance formulas.
 * Used for adaptive UI (e.g., choosing light/dark text on images).
 *
 * Uses ITU-R BT.709 coefficients for relative luminance:
 * L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 *
 * @module services/luminance
 */

/**
 * Calculates relative luminance per WCAG 2.1 / ITU-R BT.709.
 *
 * Applies gamma correction and weighted sum of RGB channels.
 * Human eyes are most sensitive to green, least to blue.
 *
 * @param r - Red channel (0-255)
 * @param g - Green channel (0-255)
 * @param b - Blue channel (0-255)
 * @returns Luminance value (0-1, where 0 = black, 1 = white)
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(val => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates average luminance of an image.
 *
 * Loads the image, renders to a small canvas (max 100px), and samples
 * pixels to calculate average brightness. Transparent pixels are skipped.
 *
 * Performance optimizations:
 * - Downscales to max 100x100 for faster processing
 * - Samples every Nth pixel (default: 10) instead of all pixels
 *
 * @param imageUrl - Image URL or data URI
 * @param sampleSize - Sample every Nth pixel (default: 10)
 * @returns Promise resolving to luminance (0-1)
 * @throws Error if image fails to load or canvas unavailable
 *
 * @example
 * const luminance = await getImageLuminance(logoUrl);
 * const textColor = luminance > 0.5 ? 'black' : 'white';
 */
export async function getImageLuminance(
  imageUrl: string,
  sampleSize = 10
): Promise<number> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Resize to small canvas for performance
        const maxSize = 100;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = Math.max(1, Math.floor(img.width * scale));
        canvas.height = Math.max(1, Math.floor(img.height * scale));

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let totalLuminance = 0;
        let count = 0;

        // Sample pixels
        for (let i = 0; i < data.length; i += 4 * sampleSize) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Skip transparent pixels
          if (a < 128) continue;

          totalLuminance += getLuminance(r, g, b);
          count++;
        }

        resolve(count > 0 ? totalLuminance / count : 0.5);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for luminance detection'));
    };

    img.src = imageUrl;
  });
}

/**
 * Determines optimal background type based on image luminance.
 *
 * Logic:
 * - Bright image (luminance > 0.5) → dark background for contrast
 * - Dark image (luminance ≤ 0.5) → light background for contrast
 *
 * @param luminance - Luminance value from getImageLuminance (0-1)
 * @returns 'light' or 'dark' indicating recommended background
 *
 * @example
 * const luminance = await getImageLuminance(logoUrl);
 * const bg = getAdaptiveBackground(luminance);
 * // bg === 'dark' if logo is bright, 'light' if logo is dark
 */
export function getAdaptiveBackground(luminance: number): 'light' | 'dark' {
  return luminance > 0.5 ? 'dark' : 'light';
}
