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

import { COLOR_DEFAULTS, LIGHTNESS_THRESHOLD } from './colorDefaults';

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
 * Convert a hex color string to HSL values.
 * @param hex - CSS hex color (3 or 6 digit, with or without `#`)
 * @returns `h` (0-360), `s` (0-100), `l` (0-100). Returns `{0,0,0}` for invalid input.
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
 * Parse and analyze an array of hex color strings into HSL objects.
 * Filters out invalid hex values.
 * @param colors - Array of CSS hex color strings
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
  if (bgLightness > LIGHTNESS_THRESHOLD) {
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
 * Derive a neutral surface from a reference color.
 *
 * Keeps a hint of the palette's hue warmth while dropping saturation
 * to near-neutral (s <= 6). This creates a surface that feels cohesive
 * with the palette without adding visual weight.
 *
 * @param ref - Reference color (usually the bg) whose hue provides warmth
 * @param isLightMode - Whether the brand is in light mode (bg lightness > threshold)
 * @returns Hex string for a near-neutral surface shifted slightly from bg lightness
 */
const deriveNeutralSurface = (
  ref: ColorAnalysis,
  isLightMode: boolean,
): string => {
  // Cap saturation at 6% — just enough hue warmth to feel intentional,
  // not enough to read as "colored"
  const s = Math.min(ref.s, 6);
  const l = isLightMode
    ? Math.min(ref.l + 3, 95) // Slightly lighter than bg in light mode
    : Math.max(ref.l - 5, 12); // Slightly darker shade in dark mode
  return hslToHex(ref.h, s, l);
};

/**
 * Check if two colors are visually too similar to coexist as
 * surface + accent (would look like the same color at a glance).
 *
 * Uses three criteria (all must be true):
 * - Hue difference < 40° (accounts for hue wheel wrapping via min of both arcs)
 * - Lightness difference < 20 points
 * - Both colors have saturation > 15% (neutrals are never "too similar" to chromatic)
 *
 * Used by `mapPaletteToBrand` to swap out duplicate-feeling surfaces.
 */
const areTooSimilar = (a: ColorAnalysis, b: ColorAnalysis): boolean => {
  // Shortest arc on the 360° hue wheel
  const hueDiff = Math.min(Math.abs(a.h - b.h), 360 - Math.abs(a.h - b.h));
  const lightDiff = Math.abs(a.l - b.l);
  return hueDiff < 40 && lightDiff < 20 && a.s > 15 && b.s > 15;
};

/**
 * Extract multiple surface colors from palette for moodboard variety.
 *
 * Returns up to 8 surfaces ordered by visual intensity:
 * 1. **Neutral** (default) — low saturation, close to bg lightness → visual rest
 * 2. **Muted** — very lightly tinted, feels neutral but with a hint of palette hue
 * 3. **Tinted** — colored but not dominant, one per hue group (60° buckets)
 * 4. **Accent** — saturated color for one bold/featured tile
 * 5. **Contrast** — opposite lightness (dark on light bg, light on dark bg)
 *
 * Most surfaces (indices 0–3) are neutral or muted so the default board
 * feels restrained. Strong colors live at higher indices for intentional use.
 * Each tile picks a surface by index via `tileSurfaces[placementId]`.
 *
 * @param colors - All palette colors as HSL analysis objects
 * @param bgColor - The chosen background color (excluded from surface candidates)
 * @returns Array of hex strings, ordered neutral → muted → tinted → accent → contrast
 */
const extractSurfaceColors = (
  colors: ColorAnalysis[],
  bgColor: ColorAnalysis,
): string[] => {
  const isLightMode = bgColor.l > LIGHTNESS_THRESHOLD;
  const surfaces: string[] = [];
  const seen = new Set<string>();

  // Helper to add unique surface
  const addSurface = (hex: string) => {
    if (!seen.has(hex) && surfaces.length < 8) {
      surfaces.push(hex);
      seen.add(hex);
    }
  };

  // ── 1. NEUTRALS (target: 2–3 slots) ──────────────────────────────
  // Low saturation, close to bg. These are the default for most tiles
  // and provide the breathing room that makes a moodboard feel curated.
  const neutralCandidates = colors.filter(c => {
    if (c.hex === bgColor.hex) return false;

    const isNeutralish = c.s < 15;
    if (isLightMode) {
      return isNeutralish && c.l >= 50 && c.l <= 98;
    } else {
      return isNeutralish && c.l >= 5 && c.l <= 50;
    }
  });

  // Sort neutrals by "ideal distance" from bg: 5–20% lightness difference
  // is the sweet spot — enough to distinguish the surface, not so much it
  // looks like a different section.
  const sortedNeutrals = [...neutralCandidates].sort((a, b) => {
    const aDiff = Math.abs(a.l - bgColor.l);
    const bDiff = Math.abs(b.l - bgColor.l);
    const aScore = aDiff >= 5 && aDiff <= 20 ? 0 : Math.abs(aDiff - 12);
    const bScore = bDiff >= 5 && bDiff <= 20 ? 0 : Math.abs(bDiff - 12);
    return aScore - bScore;
  });

  // Add up to 2 natural neutrals from the palette
  for (let i = 0; i < Math.min(2, sortedNeutrals.length); i++) {
    addSurface(sortedNeutrals[i].hex);
  }

  // Always ensure at least 2 neutrals — derive from bg when palette lacks them.
  // This guarantees the first few surface indices are always restrained.
  for (let attempt = 0; surfaces.length < 2 && attempt < 4; attempt++) {
    const offset = surfaces.length === 0 ? 0 : 1;
    const s = Math.min(bgColor.s, 6);
    const shift = 4 + offset * 5 + attempt * 3; // widen gap on retries
    const l = isLightMode
      ? Math.min(bgColor.l - shift, 95)
      : Math.max(bgColor.l + shift, 12);
    addSurface(hslToHex(bgColor.h, s, Math.max(5, Math.min(95, l))));
  }

  // ── 2. MUTED TINTS (target: 1–2 slots) ───────────────────────────
  // Very low saturation (5–25%) — feels neutral but with a whisper of
  // palette hue. These fill slots 2–3 so most tiles stay calm.
  const mutedCandidates = colors.filter(c => {
    if (c.hex === bgColor.hex) return false;
    if (seen.has(c.hex)) return false;

    if (isLightMode) {
      return c.s >= 5 && c.s <= 25 && c.l >= 65 && c.l <= 95;
    } else {
      return c.s >= 5 && c.s <= 25 && c.l >= 8 && c.l <= 35;
    }
  });

  const sortedMuted = [...mutedCandidates].sort((a, b) => a.s - b.s); // least saturated first
  for (let i = 0; i < Math.min(2, sortedMuted.length); i++) {
    addSurface(sortedMuted[i].hex);
  }

  // If no natural muted tints exist, derive one from bg with a hint of
  // the primary hue so the board still has subtle variety.
  if (mutedCandidates.length === 0 && surfaces.length < 4) {
    const primaryHue = colors.find(c =>
      c.hex !== bgColor.hex && c.s >= 30
    )?.h ?? bgColor.h;
    const s = 12; // Just enough to notice
    const l = isLightMode
      ? Math.max(bgColor.l - 8, 70)
      : Math.min(bgColor.l + 8, 30);
    addSurface(hslToHex(primaryHue, s, l));
  }

  // ── 3. TINTED SURFACES (target: 1–2 slots) ───────────────────────
  // Moderate saturation — colored but not dominant. One per hue bucket.
  const tintedCandidates = colors.filter(c => {
    if (c.hex === bgColor.hex) return false;
    if (seen.has(c.hex)) return false;

    if (isLightMode) {
      return c.l >= 60 && c.l <= 95 && c.s > 25;
    } else {
      return c.l >= 8 && c.l <= 40 && c.s > 25;
    }
  });

  // Prefer moderate saturation (25–50%). Penalize very high saturation.
  const sortedTinted = [...tintedCandidates].sort((a, b) => {
    const aSatScore = a.s > 50 ? 100 - a.s : a.s;
    const bSatScore = b.s > 50 ? 100 - b.s : b.s;
    return bSatScore - aSatScore;
  });

  // Limited to one per 60° hue bucket, max 2 total (down from unlimited)
  const hueGroups = new Set<number>();
  let tintedAdded = 0;
  for (const color of sortedTinted) {
    if (tintedAdded >= 2) break;
    const hueGroup = Math.round(color.h / 60) * 60;
    if (!hueGroups.has(hueGroup)) {
      addSurface(color.hex);
      hueGroups.add(hueGroup);
      tintedAdded++;
    }
  }

  // ── 4. ACCENT SURFACE (target: 1 slot) ───────────────────────────
  // One saturated color for a bold, intentional pop. Not multiple.
  const accentCandidates = colors.filter(c => {
    if (c.hex === bgColor.hex) return false;
    if (seen.has(c.hex)) return false;

    if (isLightMode) {
      return c.s >= 30 && c.l >= 45 && c.l <= 85;
    } else {
      return c.s >= 30 && c.l >= 15 && c.l <= 55;
    }
  });

  // Pick the most saturated candidate — with only 1 slot, make it count.
  const sortedAccent = [...accentCandidates].sort((a, b) => b.s - a.s);
  if (sortedAccent.length > 0) {
    addSurface(sortedAccent[0].hex);
  }

  // ── 5. CONTRAST SURFACE (target: 1 slot) ─────────────────────────
  // Dark in light mode, light in dark mode. One is enough.
  const contrastCandidates = colors.filter(c => {
    if (c.hex === bgColor.hex) return false;
    if (seen.has(c.hex)) return false;

    if (isLightMode) {
      return c.l >= 10 && c.l <= 40;
    } else {
      return c.l >= 70 && c.l <= 95;
    }
  });

  const sortedContrast = [...contrastCandidates].sort((a, b) => b.s - a.s);
  if (sortedContrast.length > 0) {
    addSurface(sortedContrast[0].hex);
  }

  // Fallback
  if (surfaces.length === 0) {
    addSurface(bgColor.hex);
  }

  return surfaces;
};

/**
 * Calculate "vibrancy" score for primary/accent color selection.
 *
 * Combines three factors into a 0–1 score:
 * - **Saturation** (0–1): higher saturation = more vibrant.
 * - **Lightness gate**: near-white (> 85) or near-black (< 15) score 0
 *   because they can't carry brand identity.
 * - **Ideal lightness proximity**: colors near L=50 score highest
 *   (most visually prominent). The `0.5 + 0.5 * proximity` term
 *   ensures even off-center colors still contribute (floor at 0.5).
 *
 * @param color - HSL color analysis
 * @returns Score from 0 (unusable) to ~1 (ideal brand color)
 */
const getVibrancyScore = (color: ColorAnalysis): number => {
  const lightnessScore = color.l > 85 || color.l < 15 ? 0 : 1;
  const saturationScore = color.s / 100;
  const idealLightnessProximity = 1 - Math.abs(color.l - 50) / 50;

  return saturationScore * lightnessScore * (0.5 + 0.5 * idealLightnessProximity);
};

/**
 * Map an array of palette hex colors to brand roles using HSL analysis.
 *
 * Strategy:
 * 1. Background: Style-aware (dark/neon use darkest; others use lightest)
 * 2. Text: NEUTRAL color (ensures readability - no colored text for body copy)
 * 3. Primary: Most vibrant/saturated color with medium lightness
 * 4. Accent: Second most vibrant color, or contrasting hue
 * 5. Surface: Default surface slightly different from bg
 * 6. Surfaces: MULTIPLE options for moodboard variety
 *
 * @param colors - Raw hex color strings from a palette
 * @param options - Optional config: `style` adjusts bg selection for dark/neon palettes
 * @returns Unmapped roles — run through `enforceContrast()` before use
 */
export const mapPaletteToBrand = (colors: string[], options?: { style?: string }): BrandColorMapping => {
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
  const style = options?.style;
  let bg: ColorAnalysis;

  if (style === 'dark') {
    // Dark palettes: pick darkest color with low saturation as bg
    const darkCandidates = [...analyzed].sort((a, b) => a.l - b.l);
    const darkNeutral = darkCandidates.find(c => c.l <= 25 && c.s < 20);
    bg = darkNeutral || darkCandidates[0];
  } else if (style === 'neon') {
    // Neon palettes: use a very dark bg to let neon colors pop
    const darkCandidates = [...analyzed].sort((a, b) => a.l - b.l);
    const darkest = darkCandidates.find(c => c.l <= 20);
    bg = darkest || darkCandidates[0];
  } else {
    // Default (light, pastel, warm, cold, minimal, vintage): lightest color
    const bgCandidates = byLightness.filter(c => c.l >= 85);
    bg = bgCandidates.length > 0
      ? bgCandidates.sort((a, b) => a.s - b.s)[0]
      : byLightness[0];
  }

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
  let surface = surfaces[0] || bg.hex;

  // === DIVERSITY CHECK ===
  // If surface and accent ended up too similar, replace surface with a neutral
  const surfaceAnalysis: ColorAnalysis = { hex: surface, ...hexToHSL(surface) };
  if (areTooSimilar(surfaceAnalysis, accent)) {
    const isLightMode = bg.l > LIGHTNESS_THRESHOLD;
    const neutral = deriveNeutralSurface(bg, isLightMode);
    surface = neutral;
    // Put the neutral first, keep the old surface later in the list
    if (!surfaces.includes(neutral)) {
      surfaces.unshift(neutral);
    }
  }

  // === ENSURE PRIMARY & ACCENT ARE AVAILABLE AS SURFACES ===
  // Designers should be able to use their brand colors as tile backgrounds.
  for (const brandColor of [primary.hex, accent.hex]) {
    if (!surfaces.includes(brandColor) && brandColor !== bg.hex) {
      surfaces.push(brandColor);
    }
  }

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
 * WCAG 2.1 contrast ratio between two hex colors.
 * Result ranges from 1 (identical) to 21 (black/white).
 * @returns Ratio value (>= 4.5 passes AA normal text, >= 3 passes AA large text)
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  // sRGB → linear luminance per WCAG 2.1 §1.4.3.
  // The 0.03928 threshold and 2.4 gamma are from the sRGB transfer function.
  // Weights 0.2126/0.7152/0.0722 are the ITU-R BT.709 luminance coefficients
  // (human eyes are most sensitive to green, least to blue).
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
 * Validate a color mapping against WCAG AA contrast requirements.
 * @param mapping - The brand color mapping to validate
 * @returns Contrast ratios for text/bg and primary/bg, plus overall AA pass/fail
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

/**
 * Adjust a hex color's lightness to meet a minimum contrast ratio against a reference color.
 *
 * Strategy: shift lightness in 5-point increments (up to ±40) in the
 * "natural" direction first (darker for light bg, lighter for dark bg),
 * then try the opposite direction at each step. This preserves the
 * original hue and saturation as much as possible.
 *
 * Falls back to pure black or white if 40 steps aren't enough.
 *
 * @param hex - Color to adjust
 * @param againstHex - Background color to measure contrast against
 * @param minRatio - Target WCAG contrast ratio (e.g. 4.5 for AA normal text)
 */
const adjustForContrast = (hex: string, againstHex: string, minRatio: number): string => {
  const hsl = hexToHSL(hex);
  const againstHsl = hexToHSL(againstHex);
  const isLightBg = againstHsl.l > LIGHTNESS_THRESHOLD;

  // Walk lightness in 5-point steps; 9 iterations covers the full usable range
  for (let step = 0; step <= 40; step += 5) {
    const darkerL = Math.max(0, hsl.l - step);
    const lighterL = Math.min(100, hsl.l + step);

    // For light backgrounds, try darker first; for dark backgrounds, try lighter first
    const candidateL = isLightBg ? darkerL : lighterL;
    const candidateHex = hslToHex(hsl.h, hsl.s, candidateL);

    if (getContrastRatio(candidateHex, againstHex) >= minRatio) {
      return candidateHex;
    }

    // Try the other direction
    const altL = isLightBg ? lighterL : darkerL;
    const altHex = hslToHex(hsl.h, hsl.s, altL);

    if (getContrastRatio(altHex, againstHex) >= minRatio) {
      return altHex;
    }
  }

  // Fallback: use black or white
  return isLightBg ? COLOR_DEFAULTS.TEXT_DARK : COLOR_DEFAULTS.TEXT_LIGHT;
};

/**
 * Convert HSL values to a 6-digit uppercase hex string.
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns Hex color string, e.g. `#FF6B35`
 */
export const hslToHex = (h: number, s: number, l: number): string => {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

/**
 * Enforce WCAG AA contrast on a color mapping.
 * Adjusts text (4.5:1), primary (3:1), accent (2.5:1) against bg.
 * Surfaces are kept as-is — tiles use getAdaptiveTextColor() for contrast safety.
 *
 * @param mapping - Raw mapping from `mapPaletteToBrand()`
 * @returns New mapping with contrast-safe colors
 */
export const enforceContrast = (mapping: BrandColorMapping): BrandColorMapping => {
  const result = { ...mapping };

  // 1. Ensure text vs bg meets AA (4.5:1)
  const textBgRatio = getContrastRatio(result.text, result.bg);
  if (textBgRatio < 4.5) {
    result.text = adjustForContrast(result.text, result.bg, 4.5);
  }

  // 2. Ensure primary vs bg meets large-text AA (3:1)
  const primaryBgRatio = getContrastRatio(result.primary, result.bg);
  if (primaryBgRatio < 3) {
    result.primary = adjustForContrast(result.primary, result.bg, 3);
  }

  // 3. Ensure accent vs bg meets at least 2.5:1 (used for badges/highlights)
  const accentBgRatio = getContrastRatio(result.accent, result.bg);
  if (accentBgRatio < 2.5) {
    result.accent = adjustForContrast(result.accent, result.bg, 2.5);
  }

  // Keep all surfaces (tiles use getAdaptiveTextColor for contrast safety).
  // Just ensure the first surface is set.
  if (result.surfaces.length > 0) {
    result.surface = result.surfaces[0];
  }

  return result;
};
