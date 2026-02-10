import { describe, expect, it } from 'vitest';
import {
  getStyleForPalette,
  getStyledPalettes,
  getPalettesByStyle,
  getStyleGroups,
  STYLE_LABELS,
  STYLE_ORDER,
  type PaletteStyle,
} from './paletteStyleClassifier';

// ---------------------------------------------------------------------------
// STYLE_LABELS & STYLE_ORDER
// ---------------------------------------------------------------------------
describe('style constants', () => {
  it('has a label for every style in STYLE_ORDER', () => {
    for (const style of STYLE_ORDER) {
      expect(STYLE_LABELS[style]).toBeDefined();
      expect(typeof STYLE_LABELS[style]).toBe('string');
    }
  });

  it('STYLE_ORDER contains exactly 8 styles', () => {
    expect(STYLE_ORDER).toHaveLength(8);
  });

  it('STYLE_ORDER has no duplicates', () => {
    const unique = new Set(STYLE_ORDER);
    expect(unique.size).toBe(STYLE_ORDER.length);
  });
});

// ---------------------------------------------------------------------------
// getStyleForPalette
// ---------------------------------------------------------------------------
describe('getStyleForPalette', () => {
  it('returns "light" for unknown palette id', () => {
    expect(getStyleForPalette('nonexistent-palette-id')).toBe('light');
  });

  it('returns a valid PaletteStyle for known palettes', () => {
    const palettes = getStyledPalettes();
    if (palettes.length === 0) return; // skip if no palettes
    const style = getStyleForPalette(palettes[0].id);
    expect(STYLE_ORDER).toContain(style);
  });
});

// ---------------------------------------------------------------------------
// getStyledPalettes
// ---------------------------------------------------------------------------
describe('getStyledPalettes', () => {
  it('returns an array of palettes with style and sectionName', () => {
    const palettes = getStyledPalettes();
    expect(Array.isArray(palettes)).toBe(true);

    if (palettes.length > 0) {
      const first = palettes[0];
      expect(first).toHaveProperty('style');
      expect(first).toHaveProperty('sectionName');
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('colors');
      expect(STYLE_ORDER).toContain(first.style);
    }
  });

  it('every palette has a valid style', () => {
    const palettes = getStyledPalettes();
    for (const p of palettes) {
      expect(STYLE_ORDER).toContain(p.style);
    }
  });

  it('every palette has a non-empty colors array', () => {
    const palettes = getStyledPalettes();
    for (const p of palettes) {
      expect(p.colors.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// getPalettesByStyle
// ---------------------------------------------------------------------------
describe('getPalettesByStyle', () => {
  it('returns only palettes matching the requested style', () => {
    const darks = getPalettesByStyle('dark');
    for (const p of darks) {
      expect(p.style).toBe('dark');
    }
  });

  it('returns a subset of getStyledPalettes', () => {
    const all = getStyledPalettes();
    const neons = getPalettesByStyle('neon');
    expect(neons.length).toBeLessThanOrEqual(all.length);
  });
});

// ---------------------------------------------------------------------------
// getStyleGroups
// ---------------------------------------------------------------------------
describe('getStyleGroups', () => {
  it('returns an object with all 8 style keys', () => {
    const groups = getStyleGroups();
    for (const style of STYLE_ORDER) {
      expect(groups).toHaveProperty(style);
      expect(Array.isArray(groups[style])).toBe(true);
    }
  });

  it('total palettes across groups equals getStyledPalettes length', () => {
    const groups = getStyleGroups();
    const totalInGroups = STYLE_ORDER.reduce(
      (sum, style) => sum + groups[style].length,
      0
    );
    const allPalettes = getStyledPalettes();
    expect(totalInGroups).toBe(allPalettes.length);
  });

  it('each palette in a group has the correct style', () => {
    const groups = getStyleGroups();
    for (const style of STYLE_ORDER) {
      for (const p of groups[style]) {
        expect(p.style).toBe(style);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Classification sanity checks (known palette patterns)
// ---------------------------------------------------------------------------
describe('classification sanity', () => {
  it('classifies all palettes into one of 8 valid styles', () => {
    const palettes = getStyledPalettes();
    const validStyles = new Set<PaletteStyle>(STYLE_ORDER);
    for (const p of palettes) {
      expect(validStyles.has(p.style)).toBe(true);
    }
  });

  it('at least one palette exists in each style category', () => {
    const groups = getStyleGroups();
    for (const style of STYLE_ORDER) {
      expect(groups[style].length).toBeGreaterThan(0);
    }
  });
});
