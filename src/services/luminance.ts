/**
 * Calculate relative luminance per WCAG/ITU-R BT.709
 * @param r Red channel (0-255)
 * @param g Green channel (0-255)
 * @param b Blue channel (0-255)
 * @returns Luminance value (0-1)
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
 * Get average luminance from image URL or data URI
 * Handles SVG data URIs by waiting for Image onload
 */
export async function getImageLuminance(
  imageUrl: string,
  sampleSize = 10  // Sample every Nth pixel
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
 * Determine background color based on logo luminance
 * High luminance (bright logo) -> dark background
 * Low luminance (dark logo) -> light background
 */
export function getAdaptiveBackground(luminance: number): 'light' | 'dark' {
  return luminance > 0.5 ? 'dark' : 'light';
}
