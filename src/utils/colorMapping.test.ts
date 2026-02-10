import { describe, expect, it } from 'vitest';
import {
  hexToHSL,
  hslToHex,
  analyzeColors,
  mapPaletteToBrand,
  getContrastRatio,
  validateMapping,
  enforceContrast,
  type BrandColorMapping,
} from './colorMapping';

// ---------------------------------------------------------------------------
// hexToHSL
// ---------------------------------------------------------------------------
describe('hexToHSL', () => {
  it('converts pure red', () => {
    const hsl = hexToHSL('#FF0000');
    expect(hsl.h).toBeCloseTo(0, 0);
    expect(hsl.s).toBeCloseTo(100, 0);
    expect(hsl.l).toBeCloseTo(50, 0);
  });

  it('converts pure green', () => {
    const hsl = hexToHSL('#00FF00');
    expect(hsl.h).toBeCloseTo(120, 0);
    expect(hsl.s).toBeCloseTo(100, 0);
    expect(hsl.l).toBeCloseTo(50, 0);
  });

  it('converts black', () => {
    const hsl = hexToHSL('#000000');
    expect(hsl.l).toBeCloseTo(0, 0);
    expect(hsl.s).toBeCloseTo(0, 0);
  });

  it('converts white', () => {
    const hsl = hexToHSL('#FFFFFF');
    expect(hsl.l).toBeCloseTo(100, 0);
    expect(hsl.s).toBeCloseTo(0, 0);
  });

  it('handles 3-digit hex shorthand', () => {
    const hsl = hexToHSL('#F00');
    expect(hsl.h).toBeCloseTo(0, 0);
    expect(hsl.s).toBeCloseTo(100, 0);
    expect(hsl.l).toBeCloseTo(50, 0);
  });

  it('handles hex without # prefix', () => {
    const hsl = hexToHSL('FF0000');
    expect(hsl.h).toBeCloseTo(0, 0);
    expect(hsl.s).toBeCloseTo(100, 0);
  });

  it('returns {0,0,0} for invalid hex', () => {
    const hsl = hexToHSL('notacolor');
    expect(hsl).toEqual({ h: 0, s: 0, l: 0 });
  });

  it('returns {0,0,0} for empty string', () => {
    const hsl = hexToHSL('');
    expect(hsl).toEqual({ h: 0, s: 0, l: 0 });
  });
});

// ---------------------------------------------------------------------------
// hslToHex
// ---------------------------------------------------------------------------
describe('hslToHex', () => {
  it('converts red HSL to hex', () => {
    expect(hslToHex(0, 100, 50)).toBe('#FF0000');
  });

  it('converts green HSL to hex', () => {
    expect(hslToHex(120, 100, 50)).toBe('#00FF00');
  });

  it('converts black', () => {
    expect(hslToHex(0, 0, 0)).toBe('#000000');
  });

  it('converts white', () => {
    expect(hslToHex(0, 0, 100)).toBe('#FFFFFF');
  });

  it('returns uppercase hex with # prefix', () => {
    const hex = hslToHex(210, 50, 60);
    expect(hex).toMatch(/^#[0-9A-F]{6}$/);
  });
});

// ---------------------------------------------------------------------------
// analyzeColors
// ---------------------------------------------------------------------------
describe('analyzeColors', () => {
  it('filters out invalid hex values', () => {
    const result = analyzeColors(['#FF0000', 'invalid', '#00FF00', 'rgb(0,0,0)']);
    expect(result).toHaveLength(2);
  });

  it('returns empty array for empty input', () => {
    expect(analyzeColors([])).toEqual([]);
  });

  it('normalizes hex to uppercase', () => {
    const result = analyzeColors(['#ff0000']);
    expect(result[0].hex).toBe('#FF0000');
  });

  it('includes h, s, l properties', () => {
    const result = analyzeColors(['#FF0000']);
    expect(result[0]).toHaveProperty('h');
    expect(result[0]).toHaveProperty('s');
    expect(result[0]).toHaveProperty('l');
  });

  it('rejects hex colors without # prefix', () => {
    const result = analyzeColors(['FF0000']);
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getContrastRatio
// ---------------------------------------------------------------------------
describe('getContrastRatio', () => {
  it('returns 21 for black on white', () => {
    const ratio = getContrastRatio('#000000', '#FFFFFF');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('returns 1 for identical colors', () => {
    const ratio = getContrastRatio('#FF0000', '#FF0000');
    expect(ratio).toBeCloseTo(1, 1);
  });

  it('is symmetric (color order does not matter)', () => {
    const ratio1 = getContrastRatio('#FF0000', '#FFFFFF');
    const ratio2 = getContrastRatio('#FFFFFF', '#FF0000');
    expect(ratio1).toBeCloseTo(ratio2, 5);
  });

  it('returns ≥ 4.5 for dark text on white bg (WCAG AA)', () => {
    const ratio = getContrastRatio('#171717', '#FFFFFF');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('returns low contrast for similar colors', () => {
    const ratio = getContrastRatio('#F0F0F0', '#FFFFFF');
    expect(ratio).toBeLessThan(2);
  });

  it('handles 3-digit hex', () => {
    const ratio = getContrastRatio('#000', '#FFF');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('returns ratio >= 1 always', () => {
    const ratio = getContrastRatio('#808080', '#808080');
    expect(ratio).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// validateMapping
// ---------------------------------------------------------------------------
describe('validateMapping', () => {
  it('passes AA for dark text on light bg', () => {
    const mapping: BrandColorMapping = {
      bg: '#FFFFFF',
      text: '#171717',
      primary: '#0000FF',
      accent: '#FF0000',
      surface: '#F5F5F5',
      surfaces: ['#F5F5F5'],
      paletteColors: [],
    };
    const result = validateMapping(mapping);
    expect(result.passesAA).toBe(true);
    expect(result.textBgContrast).toBeGreaterThanOrEqual(4.5);
  });

  it('fails AA for low-contrast text', () => {
    const mapping: BrandColorMapping = {
      bg: '#FFFFFF',
      text: '#F0F0F0',
      primary: '#0000FF',
      accent: '#FF0000',
      surface: '#F5F5F5',
      surfaces: ['#F5F5F5'],
      paletteColors: [],
    };
    const result = validateMapping(mapping);
    expect(result.passesAA).toBe(false);
    expect(result.textBgContrast).toBeLessThan(4.5);
  });
});

// ---------------------------------------------------------------------------
// mapPaletteToBrand
// ---------------------------------------------------------------------------
describe('mapPaletteToBrand', () => {
  it('returns defaults for empty palette', () => {
    const mapping = mapPaletteToBrand([]);
    expect(mapping.bg).toBe('#FFFFFF');
    expect(mapping.text).toBe('#171717');
    expect(mapping.surfaces).toHaveLength(3);
    expect(mapping.paletteColors).toEqual([]);
  });

  it('selects lightest color as bg for default style', () => {
    const colors = ['#1A1A2E', '#16213E', '#0F3460', '#E94560', '#F5F5F5'];
    const mapping = mapPaletteToBrand(colors);
    expect(mapping.bg).toBe('#F5F5F5');
  });

  it('selects darkest color as bg for dark style', () => {
    const colors = ['#1A1A2E', '#16213E', '#0F3460', '#E94560', '#F5F5F5'];
    const mapping = mapPaletteToBrand(colors, { style: 'dark' });
    // bg should be one of the dark colors
    const bgHsl = hexToHSL(mapping.bg);
    expect(bgHsl.l).toBeLessThan(30);
  });

  it('selects dark bg for neon style', () => {
    const colors = ['#0D0D0D', '#FF00FF', '#00FF00', '#FFFF00', '#00FFFF'];
    const mapping = mapPaletteToBrand(colors, { style: 'neon' });
    const bgHsl = hexToHSL(mapping.bg);
    expect(bgHsl.l).toBeLessThan(25);
  });

  it('chooses neutral text for readability', () => {
    const colors = ['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF'];
    const mapping = mapPaletteToBrand(colors);
    // Text should have good contrast against bg
    const contrast = getContrastRatio(mapping.text, mapping.bg);
    expect(contrast).toBeGreaterThan(3);
  });

  it('selects vibrant color as primary', () => {
    const colors = ['#FAFAFA', '#E0E0E0', '#FF6B35', '#333333', '#666666'];
    const mapping = mapPaletteToBrand(colors);
    // Primary should be the most vibrant (the orange)
    expect(mapping.primary).toBe('#FF6B35');
  });

  it('selects a different color for accent than primary', () => {
    const colors = ['#FAFAFA', '#FF6B35', '#4ECDC4', '#333333', '#E0E0E0'];
    const mapping = mapPaletteToBrand(colors);
    expect(mapping.accent).not.toBe(mapping.primary);
  });

  it('provides surfaces array', () => {
    const colors = ['#FAFAFA', '#F0F0F0', '#E0E0E0', '#FF6B35', '#333333'];
    const mapping = mapPaletteToBrand(colors);
    expect(mapping.surfaces.length).toBeGreaterThan(0);
    expect(mapping.surfaces.length).toBeLessThanOrEqual(10);
  });

  it('preserves original palette colors', () => {
    const colors = ['#FF0000', '#00FF00', '#0000FF'];
    const mapping = mapPaletteToBrand(colors);
    expect(mapping.paletteColors).toEqual(colors);
  });

  it('returns defaults when all colors are invalid', () => {
    const mapping = mapPaletteToBrand(['invalid', 'notacolor']);
    expect(mapping.bg).toBe('#FFFFFF');
    expect(mapping.text).toBe('#171717');
    // Empty-palette path returns empty paletteColors
    expect(mapping.paletteColors).toEqual([]);
  });

  it('handles single-color palette', () => {
    const mapping = mapPaletteToBrand(['#FF6B35']);
    expect(mapping.bg).toBeDefined();
    expect(mapping.text).toBeDefined();
    expect(mapping.primary).toBeDefined();
  });

  it('handles monochrome palette', () => {
    const grays = ['#FAFAFA', '#E0E0E0', '#BDBDBD', '#757575', '#212121'];
    const mapping = mapPaletteToBrand(grays);
    expect(mapping.bg).toBeDefined();
    expect(mapping.text).toBeDefined();
    expect(mapping.primary).toBeDefined();
  });

  it('includes primary and accent in surfaces list', () => {
    const colors = ['#FAFAFA', '#FF6B35', '#4ECDC4', '#2C3E50', '#E0E0E0'];
    const mapping = mapPaletteToBrand(colors);
    // Primary and/or accent should appear in surfaces when different from bg
    const hasBrandColorInSurfaces =
      mapping.surfaces.includes(mapping.primary) ||
      mapping.surfaces.includes(mapping.accent);
    expect(hasBrandColorInSurfaces).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// enforceContrast
// ---------------------------------------------------------------------------
describe('enforceContrast', () => {
  it('does not change already-compliant mapping', () => {
    const mapping: BrandColorMapping = {
      bg: '#FFFFFF',
      text: '#171717',
      primary: '#0000CC',
      accent: '#CC0000',
      surface: '#F5F5F5',
      surfaces: ['#F5F5F5'],
      paletteColors: [],
    };
    const result = enforceContrast(mapping);
    expect(result.text).toBe(mapping.text);
    expect(result.primary).toBe(mapping.primary);
    expect(result.accent).toBe(mapping.accent);
  });

  it('adjusts text color for 4.5:1 contrast against bg', () => {
    const mapping: BrandColorMapping = {
      bg: '#FFFFFF',
      text: '#CCCCCC', // Low contrast against white
      primary: '#0000CC',
      accent: '#CC0000',
      surface: '#F5F5F5',
      surfaces: ['#F5F5F5'],
      paletteColors: [],
    };
    const result = enforceContrast(mapping);
    const ratio = getContrastRatio(result.text, result.bg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('adjusts primary color for 3:1 contrast against bg', () => {
    const mapping: BrandColorMapping = {
      bg: '#FFFFFF',
      text: '#171717',
      primary: '#DDDDDD', // Low contrast against white
      accent: '#CC0000',
      surface: '#F5F5F5',
      surfaces: ['#F5F5F5'],
      paletteColors: [],
    };
    const result = enforceContrast(mapping);
    const ratio = getContrastRatio(result.primary, result.bg);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  it('adjusts accent color for 2.5:1 contrast against bg', () => {
    const mapping: BrandColorMapping = {
      bg: '#FFFFFF',
      text: '#171717',
      primary: '#0000CC',
      accent: '#E0E0E0', // Low contrast against white
      surface: '#F5F5F5',
      surfaces: ['#F5F5F5'],
      paletteColors: [],
    };
    const result = enforceContrast(mapping);
    const ratio = getContrastRatio(result.accent, result.bg);
    expect(ratio).toBeGreaterThanOrEqual(2.5);
  });

  it('works with dark backgrounds', () => {
    const mapping: BrandColorMapping = {
      bg: '#1A1A2E',
      text: '#333333', // Low contrast against dark bg
      primary: '#222222', // Low contrast against dark bg
      accent: '#1A1A1A', // Low contrast against dark bg
      surface: '#16213E',
      surfaces: ['#16213E'],
      paletteColors: [],
    };
    const result = enforceContrast(mapping);
    expect(getContrastRatio(result.text, result.bg)).toBeGreaterThanOrEqual(4.5);
    expect(getContrastRatio(result.primary, result.bg)).toBeGreaterThanOrEqual(3);
    expect(getContrastRatio(result.accent, result.bg)).toBeGreaterThanOrEqual(2.5);
  });

  it('preserves surfaces array', () => {
    const mapping: BrandColorMapping = {
      bg: '#FFFFFF',
      text: '#CCCCCC',
      primary: '#DDDDDD',
      accent: '#EEEEEE',
      surface: '#F0F0F0',
      surfaces: ['#F0F0F0', '#E5E5E5', '#D0D0D0'],
      paletteColors: [],
    };
    const result = enforceContrast(mapping);
    expect(result.surfaces).toHaveLength(3);
  });

  it('sets surface to first element of surfaces', () => {
    const mapping: BrandColorMapping = {
      bg: '#FFFFFF',
      text: '#171717',
      primary: '#0000CC',
      accent: '#CC0000',
      surface: '#AAAAAA',
      surfaces: ['#F5F5F5', '#E0E0E0'],
      paletteColors: [],
    };
    const result = enforceContrast(mapping);
    expect(result.surface).toBe(result.surfaces[0]);
  });
});

// ---------------------------------------------------------------------------
// hexToHSL ↔ hslToHex roundtrip
// ---------------------------------------------------------------------------
describe('colorMapping hexToHSL ↔ hslToHex roundtrip', () => {
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FF6B35', '#4ECDC4'];

  colors.forEach((hex) => {
    it(`roundtrips ${hex}`, () => {
      const hsl = hexToHSL(hex);
      const result = hslToHex(hsl.h, hsl.s, hsl.l);
      // Compare via contrast ratio — roundtripped color should be nearly identical
      const ratio = getContrastRatio(hex, result);
      expect(ratio).toBeLessThan(1.1);
    });
  });
});
