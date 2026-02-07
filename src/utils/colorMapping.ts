/**
 * Color Mapping Utility
 *
 * Automatically maps palette colors to brand roles (bg, text, primary, accent, surface)
 * based on color analysis (lightness, saturation, hue).
 */

export interface ColorAnalysis {
  hex: string;
  h: number; // Hue (0-360)
  s: number; // Saturation (0-100)
  l: number; // Lightness (0-100)
}

export interface BrandColorMapping {
  bg: string;
  text: string;
  primary: string;
  accent: string;
  surface: string;
}

/**
 * Parse hex color to RGB values
 */
const parseHex = (hex: string): { r: number; g: number; b: number } | null => {
  // Try 6-character hex
  let match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (match) {
    return {
      r: parseInt(match[1], 16),
      g: parseInt(match[2], 16),
      b: parseInt(match[3], 16),
    };
  }

  // Try 3-character shorthand
  match = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
  if (match) {
    return {
      r: parseInt(match[1] + match[1], 16),
      g: parseInt(match[2] + match[2], 16),
      b: parseInt(match[3] + match[3], 16),
    };
  }

  return null;
};

/**
 * Convert hex color to HSL values
 */
export const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
  const rgb = parseHex(hex);
  if (!rgb) {
    return { h: 0, s: 0, l: 0 };
  }

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

/**
 * Analyze all colors in a palette
 */
export const analyzeColors = (colors: string[]): ColorAnalysis[] => {
  return colors
    .filter(hex => /^#[0-9A-Fa-f]{3,6}$/.test(hex)) // Only valid hex colors
    .map(hex => ({
      hex: hex.toUpperCase(),
      ...hexToHSL(hex),
    }));
};

/**
 * Calculate "vibrancy" score - combination of saturation and how far from extremes
 * Colors that are too light or too dark make poor primary colors
 */
const getVibrancyScore = (color: ColorAnalysis): number => {
  // Penalize colors that are too light (>85%) or too dark (<15%)
  const lightnessScore = color.l > 85 || color.l < 15 ? 0 : 1;

  // Saturation is key for primary colors
  const saturationScore = color.s / 100;

  // Ideal lightness is around 40-60% for primary colors
  const idealLightnessProximity = 1 - Math.abs(color.l - 50) / 50;

  return saturationScore * lightnessScore * (0.5 + 0.5 * idealLightnessProximity);
};

/**
 * Smart map palette colors to brand roles
 *
 * Strategy:
 * 1. Background: Lightest color (high lightness, low saturation preferred)
 * 2. Text: Darkest color (low lightness)
 * 3. Primary: Most vibrant/saturated color with medium lightness
 * 4. Accent: Second most vibrant color, or contrasting hue
 * 5. Surface: Second lightest, slightly darker than bg
 */
export const mapPaletteToBrand = (colors: string[]): BrandColorMapping => {
  const analyzed = analyzeColors(colors);

  if (analyzed.length === 0) {
    // Fallback to defaults if no valid colors
    return {
      bg: '#FFFFFF',
      text: '#1A1A1A',
      primary: '#000000',
      accent: '#555555',
      surface: '#F8F8F8',
    };
  }

  // Sort by lightness (for bg/text selection)
  const byLightness = [...analyzed].sort((a, b) => b.l - a.l);

  // Sort by vibrancy (for primary/accent selection)
  const byVibrancy = [...analyzed].sort((a, b) => getVibrancyScore(b) - getVibrancyScore(a));

  // === BACKGROUND ===
  // Prefer the lightest color, but also low saturation
  const bgCandidates = byLightness.filter(c => c.l >= 85);
  const bg = bgCandidates.length > 0
    ? bgCandidates.sort((a, b) => a.s - b.s)[0] // Least saturated of the light colors
    : byLightness[0]; // Fallback to lightest

  // === TEXT ===
  // Prefer the darkest color
  const textCandidates = byLightness.filter(c => c.l <= 25);
  const text = textCandidates.length > 0
    ? textCandidates[textCandidates.length - 1] // Darkest
    : byLightness[byLightness.length - 1]; // Fallback to darkest

  // === PRIMARY ===
  // Most vibrant color, excluding bg and text
  const primaryCandidates = byVibrancy.filter(
    c => c.hex !== bg.hex && c.hex !== text.hex && getVibrancyScore(c) > 0.1
  );
  const primary = primaryCandidates.length > 0
    ? primaryCandidates[0]
    : byVibrancy.find(c => c.hex !== bg.hex && c.hex !== text.hex) || byVibrancy[0];

  // === ACCENT ===
  // Second most vibrant, or a contrasting hue to primary
  const accentCandidates = byVibrancy.filter(
    c => c.hex !== bg.hex && c.hex !== text.hex && c.hex !== primary.hex
  );

  let accent: ColorAnalysis;
  if (accentCandidates.length > 0) {
    // Try to find a color with different hue from primary
    const differentHue = accentCandidates.find(c => {
      const hueDiff = Math.abs(c.h - primary.h);
      return hueDiff > 30 && hueDiff < 330; // At least 30 degrees different
    });
    accent = differentHue || accentCandidates[0];
  } else {
    // Fallback: use a muted version of primary or text
    accent = primary;
  }

  // === SURFACE ===
  // Second lightest color, or slightly darker than bg
  const surfaceCandidates = byLightness.filter(
    c => c.hex !== bg.hex && c.l >= 70 && c.l < bg.l
  );
  const surface = surfaceCandidates.length > 0
    ? surfaceCandidates[0]
    : byLightness.find(c => c.hex !== bg.hex && c.l > 60) || bg;

  return {
    bg: bg.hex,
    text: text.hex,
    primary: primary.hex,
    accent: accent.hex,
    surface: surface.hex,
  };
};

/**
 * Get contrast ratio between two colors (WCAG formula)
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (hex: string): number => {
    const rgb = parseHex(hex);
    if (!rgb) return 0;

    const vals = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((val) =>
      val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * vals[0] + 0.7152 * vals[1] + 0.0722 * vals[2];
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if a mapping has good contrast (WCAG AA = 4.5:1)
 */
export const validateMapping = (mapping: BrandColorMapping): {
  textBgContrast: number;
  primaryBgContrast: number;
  passesAA: boolean;
} => {
  const textBgContrast = getContrastRatio(mapping.text, mapping.bg);
  const primaryBgContrast = getContrastRatio(mapping.primary, mapping.bg);

  return {
    textBgContrast,
    primaryBgContrast,
    passesAA: textBgContrast >= 4.5,
  };
};
