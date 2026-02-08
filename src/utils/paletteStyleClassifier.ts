/**
 * Palette Style Classifier
 *
 * Auto-classifies palettes into 8 visual style categories
 * based on color analysis (hue, saturation, lightness).
 *
 * Styles: pastel, vintage, neon, warm, cold, light, dark, minimal
 */

import { type Palette, PALETTE_SECTIONS } from '../data/colorPalettes';
import { hexToHSL } from './colorMapping';

export type PaletteStyle = 'pastel' | 'vintage' | 'neon' | 'warm' | 'cold' | 'light' | 'dark' | 'minimal';

export const STYLE_LABELS: Record<PaletteStyle, string> = {
  pastel: 'Pastel',
  vintage: 'Vintage',
  neon: 'Neon',
  warm: 'Warm',
  cold: 'Cold',
  light: 'Light',
  dark: 'Dark',
  minimal: 'Minimal',
};

export const STYLE_ORDER: PaletteStyle[] = ['pastel', 'vintage', 'neon', 'warm', 'cold', 'light', 'dark', 'minimal'];

interface ColorStats {
  avgHue: number;
  avgSat: number;
  avgLight: number;
  maxSat: number;
  minLight: number;
  maxLight: number;
  warmRatio: number; // % of colors with warm hue (0-60, 300-360)
  neutralRatio: number; // % of colors with sat < 15
  lightRatio: number; // % of colors with lightness > 70
  darkRatio: number; // % of colors with lightness < 30
  colorCount: number;
}

const analyzeStats = (colors: string[]): ColorStats => {
  const valid = colors
    .filter(hex => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex))
    .map(hex => hexToHSL(hex));

  if (valid.length === 0) {
    return { avgHue: 0, avgSat: 0, avgLight: 50, maxSat: 0, minLight: 50, maxLight: 50, warmRatio: 0, neutralRatio: 1, lightRatio: 0, darkRatio: 0, colorCount: 0 };
  }

  const chromatic = valid.filter(c => c.s >= 10);
  const avgHue = chromatic.length > 0
    ? chromatic.reduce((s, c) => s + c.h, 0) / chromatic.length
    : 0;
  const avgSat = valid.reduce((s, c) => s + c.s, 0) / valid.length;
  const avgLight = valid.reduce((s, c) => s + c.l, 0) / valid.length;
  const maxSat = Math.max(...valid.map(c => c.s));
  const minLight = Math.min(...valid.map(c => c.l));
  const maxLight = Math.max(...valid.map(c => c.l));

  const warmCount = chromatic.filter(c => c.h < 60 || c.h > 300).length;
  const warmRatio = chromatic.length > 0 ? warmCount / chromatic.length : 0;
  const neutralRatio = valid.filter(c => c.s < 15).length / valid.length;
  const lightRatio = valid.filter(c => c.l > 70).length / valid.length;
  const darkRatio = valid.filter(c => c.l < 30).length / valid.length;

  return { avgHue, avgSat, avgLight, maxSat, minLight, maxLight, warmRatio, neutralRatio, lightRatio, darkRatio, colorCount: valid.length };
};

// Section-based hints (used as tiebreaker)
const SECTION_HINTS: Record<string, PaletteStyle> = {
  neutrals: 'minimal',
  fresh: 'neon',
  vibrant: 'neon',
  bold: 'dark',
  muted: 'pastel',
  earthy: 'warm',
  elegant: 'light',
  playful: 'pastel',
  heritage: 'vintage',
  retro: 'vintage',
  clash: 'neon',
  corporate: 'cold',
};

const classifyPalette = (palette: Palette, sectionId: string): PaletteStyle => {
  const stats = analyzeStats(palette.colors);
  const hint = SECTION_HINTS[sectionId] || 'light';

  if (stats.colorCount === 0) return hint;

  // Minimal: very low saturation across the board
  if (stats.neutralRatio > 0.7 || (stats.avgSat < 12 && stats.colorCount <= 11)) {
    return 'minimal';
  }

  // Dark: predominantly dark colors
  if (stats.darkRatio > 0.5 || (stats.avgLight < 30 && stats.maxLight < 60)) {
    return 'dark';
  }

  // Neon: truly electric palettes — restrict to vibrant/clash/fresh sections
  // with very high saturation, or extremely high sat from any section
  if (stats.avgSat > 80 && stats.maxSat > 95) {
    return 'neon';
  }
  if (stats.avgSat > 65 && stats.maxSat > 90 &&
      (sectionId === 'vibrant' || sectionId === 'clash' || sectionId === 'fresh')) {
    return 'neon';
  }

  // Light: predominantly light + desaturated (airy, clean palettes)
  if (stats.lightRatio > 0.3 && stats.avgSat < 30) {
    return 'light';
  }

  // Pastel: light + moderate saturation (soft tints with color)
  if (stats.avgLight > 55 && stats.avgSat > 10 && stats.avgSat < 55 && stats.lightRatio > 0.2) {
    return 'pastel';
  }

  // Light fallback: high lightness with moderate saturation
  if (stats.lightRatio > 0.45 && stats.avgSat < 50) {
    return 'light';
  }

  // Vintage: heritage/retro sections, or muted mid-range
  if (sectionId === 'heritage' || sectionId === 'retro') {
    return 'vintage';
  }
  if (stats.avgSat > 20 && stats.avgSat < 50 && stats.avgLight > 35 && stats.avgLight < 55) {
    return 'vintage';
  }

  // Warm: warm hue dominance
  if (stats.warmRatio > 0.5) {
    return 'warm';
  }

  // Cold: cool hue dominance
  if (stats.warmRatio < 0.35 && stats.avgSat > 15) {
    return 'cold';
  }

  // Remaining saturated palettes: use section hints + temperature
  if (stats.avgSat > 50) {
    // Bold/playful with warmth → warm
    if ((sectionId === 'bold' || sectionId === 'playful' || sectionId === 'earthy') && stats.warmRatio > 0.35) {
      return 'warm';
    }
    // Corporate/muted → cold
    if (sectionId === 'corporate' || sectionId === 'muted') {
      return 'cold';
    }
    // Default by temperature
    if (stats.warmRatio > 0.45) return 'warm';
    return 'cold';
  }

  // Moderate saturation remainder
  if (stats.warmRatio > 0.45) return 'warm';

  // Fallback to section hint
  return hint;
};

// Pre-computed cache
let _styleCache: Map<string, PaletteStyle> | null = null;

const buildCache = (): Map<string, PaletteStyle> => {
  const cache = new Map<string, PaletteStyle>();
  for (const section of PALETTE_SECTIONS) {
    for (const palette of section.palettes) {
      cache.set(palette.id, classifyPalette(palette, section.id));
    }
  }
  return cache;
};

export const getStyleForPalette = (paletteId: string): PaletteStyle => {
  if (!_styleCache) {
    _styleCache = buildCache();
  }
  return _styleCache.get(paletteId) || 'light';
};

export interface StyledPalette extends Palette {
  style: PaletteStyle;
  sectionName: string;
}

export const getStyledPalettes = (): StyledPalette[] => {
  if (!_styleCache) {
    _styleCache = buildCache();
  }

  const result: StyledPalette[] = [];
  for (const section of PALETTE_SECTIONS) {
    for (const palette of section.palettes) {
      result.push({
        ...palette,
        style: _styleCache.get(palette.id) || 'light',
        sectionName: section.name,
      });
    }
  }
  return result;
};

export const getPalettesByStyle = (style: PaletteStyle): StyledPalette[] => {
  return getStyledPalettes().filter(p => p.style === style);
};

export const getStyleGroups = (): Record<PaletteStyle, StyledPalette[]> => {
  const all = getStyledPalettes();
  const groups: Record<PaletteStyle, StyledPalette[]> = {
    pastel: [], vintage: [], neon: [], warm: [],
    cold: [], light: [], dark: [], minimal: [],
  };
  for (const p of all) {
    groups[p.style].push(p);
  }
  return groups;
};
