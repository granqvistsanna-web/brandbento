import ColorContrastChecker from 'color-contrast-checker';
import { hexToRgb } from './colorConversion';

const checker = new ColorContrastChecker();

export interface ContrastResult {
  ratio: number;
  AA: boolean;      // 4.5:1 for normal text, 3:1 for large
  AAA: boolean;     // 7:1 for normal text, 4.5:1 for large
  level: 'AAA' | 'AA' | 'fail';
}

/**
 * Calculate relative luminance per WCAG/ITU-R BT.709
 */
function getLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map(val => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function calculateContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check WCAG contrast compliance between text and background colors
 * @param textColor Hex color of text (#RRGGBB)
 * @param bgColor Hex color of background (#RRGGBB)
 * @param fontSize Font size in pixels (affects AA/AAA thresholds)
 */
export function checkContrast(
  textColor: string,
  bgColor: string,
  fontSize: number = 16
): ContrastResult {
  // Normalize hex (remove # if present for BBC library)
  const text = textColor.replace(/^#/, '');
  const bg = bgColor.replace(/^#/, '');

  const AA = checker.isLevelAA(`#${text}`, `#${bg}`, fontSize);
  const AAA = checker.isLevelAAA(`#${text}`, `#${bg}`, fontSize);
  const ratio = calculateContrastRatio(`#${text}`, `#${bg}`);

  return {
    ratio: Math.round(ratio * 100) / 100,
    AA,
    AAA,
    level: AAA ? 'AAA' : AA ? 'AA' : 'fail',
  };
}

/**
 * Get appropriate text color (black or white) for a background
 */
export function getContrastTextColor(bgColor: string): string {
  const luminance = getLuminance(bgColor);
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
