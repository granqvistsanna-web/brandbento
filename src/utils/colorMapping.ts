/**
 * Color Mapping Utility
 *
 * Automatically maps palette colors to brand roles (bg, text, primary, accent, surface)
 * based on color analysis (lightness, saturation, hue).
 *
 * Enhanced for moodboard variety:
 * - Multiple surface colors for tile backgrounds
 * - Neutral text colors for readability
 * - Full palette access for creative flexibility
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
  // Enhanced: multiple surface options for moodboard variety
  surfaces: string[];
  // The full palette colors for advanced usage
  paletteColors: string[];
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
 * Neutral color scales for text - true neutrals ensure readability
 */
const NEUTRAL_SCALES = {
  light: {
    100: '#FAFAFA',
    200: '#F5F5F5',
    300: '#E5E5E5',
  },
  dark: {
    900: '#0A0A0A',
    800: '#171717',
    700: '#262626',
  },
};

/**
 * Check if a color is truly neutral (low saturation)
 */
const isNeutral = (color: ColorAnalysis): boolean => {
  return color.s < 10;
};

/**
 * Get best neutral text color based on background lightness
 */
const getNeutralText = (bgLightness: number, paletteColors: ColorAnalysis[]): string => {
  if (bgLightness > 50) {
    // Light background needs dark text
    const neutralDark = paletteColors.find(c => isNeutral(c) && c.l < 25);
    if (neutralDark) return neutralDark.hex;
    return NEUTRAL_SCALES.dark[800];
  } else {
    // Dark background needs light text
    const neutralLight = paletteColors.find(c => isNeutral(c) && c.l > 85);
    if (neutralLight) return neutralLight.hex;
    return NEUTRAL_SCALES.light[100];
  }
};

/**
 * Extract multiple surface colors from palette for moodboard variety
 */
const extractSurfaceColors = (
  colors: ColorAnalysis[],
  bgColor: ColorAnalysis,
): string[] => {
  const isLightMode = bgColor.l > 50;

  // Filter for surface-suitable colors
  const surfaceCandidates = colors.filter(c => {
    if (c.hex === bgColor.hex) return false;

    if (isLightMode) {
      // Light mode: surfaces between 55-96% lightness
      return c.l >= 55 && c.l <= 96;
    } else {
      // Dark mode: surfaces between 5-45% lightness
      return c.l >= 5 && c.l <= 45;
    }
  });

  // Sort by lightness difference from bg for depth variety
  const sorted = surfaceCandidates.sort((a, b) => {
    const aLightDiff = Math.abs(a.l - bgColor.l);
    const bLightDiff = Math.abs(b.l - bgColor.l);
    return bLightDiff - aLightDiff;
  });

  // Collect unique surfaces by hue/lightness groups
  const uniqueSurfaces: string[] = [];
  const seen = new Set<string>();

  for (const color of sorted) {
    const hueGroup = Math.round(color.h / 30) * 30;
    const lightGroup = Math.round(color.l / 10) * 10;
    const key = `${hueGroup}-${lightGroup}`;

    if (!seen.has(key)) {
      uniqueSurfaces.push(color.hex);
      seen.add(key);
    }

    if (uniqueSurfaces.length >= 6) break;
  }

  // Fallback if no surfaces found
  if (uniqueSurfaces.length === 0) {
    uniqueSurfaces.push(bgColor.hex);
  }

  return uniqueSurfaces;
};

/**
 * Calculate "vibrancy" score for primary/accent selection
 */
const getVibrancyScore = (color: ColorAnalysis): number => {
  const lightnessScore = color.l > 85 || color.l < 15 ? 0 : 1;
  const saturationScore = color.s / 100;
  const idealLightnessProximity = 1 - Math.abs(color.l - 50) / 50;

  return saturationScore * lightnessScore * (0.5 + 0.5 * idealLightnessProximity);
};

/**
 * Smart map palette colors to brand roles
 *
 * Strategy:
 * 1. Background: Lightest color (high lightness, low saturation preferred)
 * 2. Text: NEUTRAL color (ensures readability - no colored text for body copy)
 * 3. Primary: Most vibrant/saturated color with medium lightness
 * 4. Accent: Second most vibrant color, or contrasting hue
 * 5. Surface: Default surface slightly different from bg
 * 6. Surfaces: MULTIPLE options for moodboard variety
 */
export const mapPaletteToBrand = (colors: string[]): BrandColorMapping => {
  const analyzed = analyzeColors(colors);

  if (analyzed.length === 0) {
    return {
      bg: '#FFFFFF',
      text: '#171717',
      primary: '#000000',
      accent: '#555555',
      surface: '#F5F5F5',
      surfaces: ['#FFFFFF', '#F5F5F5', '#FAFAFA'],
      paletteColors: [],
    };
  }

  const byLightness = [...analyzed].sort((a, b) => b.l - a.l);
  const byVibrancy = [...analyzed].sort((a, b) => getVibrancyScore(b) - getVibrancyScore(a));

  // === BACKGROUND ===
  const bgCandidates = byLightness.filter(c => c.l >= 85);
  const bg = bgCandidates.length > 0
    ? bgCandidates.sort((a, b) => a.s - b.s)[0]
    : byLightness[0];

  // === TEXT (Neutral) ===
  const textHex = getNeutralText(bg.l, analyzed);

  // === PRIMARY ===
  const primaryCandidates = byVibrancy.filter(
    c => c.hex !== bg.hex && getVibrancyScore(c) > 0.1
  );
  const primary = primaryCandidates.length > 0
    ? primaryCandidates[0]
    : byVibrancy.find(c => c.hex !== bg.hex) || byVibrancy[0];

  // === ACCENT ===
  const accentCandidates = byVibrancy.filter(
    c => c.hex !== bg.hex && c.hex !== primary.hex
  );

  let accent: ColorAnalysis;
  if (accentCandidates.length > 0) {
    const differentHue = accentCandidates.find(c => {
      const hueDiff = Math.abs(c.h - primary.h);
      return hueDiff > 30 && hueDiff < 330;
    });
    accent = differentHue || accentCandidates[0];
  } else {
    accent = primary;
  }

  // === SURFACES (Multiple for moodboard) ===
  const surfaces = extractSurfaceColors(analyzed, bg);
  const surface = surfaces[0] || bg.hex;

  return {
    bg: bg.hex,
    text: textHex,
    primary: primary.hex,
    accent: accent.hex,
    surface,
    surfaces,
    paletteColors: colors,
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
