/**
 * Imagery filter utility.
 *
 * Converts `brand.imagery.style` and `brand.imagery.overlay`
 * into a CSS `filter` string that can be applied to any `<img>`.
 *
 * - "default" → no filter
 * - "grayscale" → full desaturation
 * - "tint" → desaturated + warm sepia tone
 * - overlay 0–100 → progressive darkening via brightness
 */

export function getImageFilter(
  style: 'default' | 'grayscale' | 'tint',
  overlay: number,
): string {
  const parts: string[] = [];

  if (style === 'grayscale') {
    parts.push('grayscale(1)');
  } else if (style === 'tint') {
    parts.push('grayscale(1) sepia(0.6)');
  }

  if (overlay > 0) {
    // Map 0–100 to brightness 1–0.4 (never fully black)
    const brightness = 1 - (overlay / 100) * 0.6;
    parts.push(`brightness(${brightness.toFixed(2)})`);
  }

  return parts.length > 0 ? parts.join(' ') : 'none';
}
