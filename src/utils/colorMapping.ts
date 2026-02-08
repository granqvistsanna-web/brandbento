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
    .filter(hex => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) // Only valid hex colors
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
 *
 * Strategy for showcasing identity:
 * 1. Include tinted/colored surfaces (not just neutrals)
 * 2. Prioritize palette colors that create visual interest
 * 3. Mix neutral and colored surfaces for balance
 */
const extractSurfaceColors = (
  colors: ColorAnalysis[],
  bgColor: ColorAnalysis,
): string[] => {
  const isLightMode = bgColor.l > 50;
  const surfaces: string[] = [];
  const seen = new Set<string>();

  // Helper to add unique surface
  const addSurface = (hex: string) => {
    if (!seen.has(hex) && surfaces.length < 8) {
      surfaces.push(hex);
      seen.add(hex);
    }
  };

  // 1. TINTED SURFACES - colored surfaces that showcase palette identity
  const tintedCandidates = colors.filter(c => {
    if (c.hex === bgColor.hex) return false;

    if (isLightMode) {
      // Light mode: pastel/tinted surfaces (60-95% lightness, some saturation)
      return c.l >= 60 && c.l <= 95 && c.s >= 5;
    } else {
      // Dark mode: deep tinted surfaces (8-40% lightness, some saturation)
      return c.l >= 8 && c.l <= 40 && c.s >= 5;
    }
  });

  // Sort tinted by saturation (most colorful first) then by hue diversity
  const sortedTinted = tintedCandidates.sort((a, b) => {
    // Prefer moderate saturation (not too washed out, not too intense)
    const aSatScore = a.s > 50 ? 100 - a.s : a.s;
    const bSatScore = b.s > 50 ? 100 - b.s : b.s;
    return bSatScore - aSatScore;
  });

  // Add tinted surfaces with hue diversity
  const hueGroups = new Set<number>();
  for (const color of sortedTinted) {
    const hueGroup = Math.round(color.h / 60) * 60; // 6 hue groups
    if (!hueGroups.has(hueGroup)) {
      addSurface(color.hex);
      hueGroups.add(hueGroup);
    }
  }

  // 2. NEUTRAL SURFACES - for balance and contrast
  const neutralCandidates = colors.filter(c => {
    if (c.hex === bgColor.hex) return false;
    if (seen.has(c.hex)) return false;

    const isNeutralish = c.s < 15;
    if (isLightMode) {
      return isNeutralish && c.l >= 50 && c.l <= 98;
    } else {
      return isNeutralish && c.l >= 5 && c.l <= 50;
    }
  });

  // Sort neutrals by lightness variety
  const sortedNeutrals = neutralCandidates.sort((a, b) => {
    const aLightDiff = Math.abs(a.l - bgColor.l);
    const bLightDiff = Math.abs(b.l - bgColor.l);
    return bLightDiff - aLightDiff;
  });

  // Add 2-3 neutrals for balance
  for (let i = 0; i < Math.min(3, sortedNeutrals.length); i++) {
    addSurface(sortedNeutrals[i].hex);
  }

  // 3. ACCENT SURFACES - saturated colors for bold tiles
  const accentCandidates = colors.filter(c => {
    if (c.hex === bgColor.hex) return false;
    if (seen.has(c.hex)) return false;

    // Medium saturation, usable lightness
    if (isLightMode) {
      return c.s >= 30 && c.l >= 45 && c.l <= 85;
    } else {
      return c.s >= 30 && c.l >= 15 && c.l <= 55;
    }
  });

  // Add a couple accent surfaces
  for (let i = 0; i < Math.min(2, accentCandidates.length); i++) {
    addSurface(accentCandidates[i].hex);
  }

  // Fallback if nothing found
  if (surfaces.length === 0) {
    addSurface(bgColor.hex);
  }

  return surfaces;
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
