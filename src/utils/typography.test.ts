import { describe, expect, it } from 'vitest';
import type { Typography } from '@/store/useBrandStore';
import {
  getLetterSpacing,
  getFontCategory,
  buildFontStack,
  getTypeScale,
  clampFontSize,
} from './typography';

/** Helper to create a partial Typography with only scale-relevant fields */
const typo = (overrides: Partial<Typography>): Typography =>
  ({
    primary: 'Inter',
    secondary: 'Inter',
    ui: 'Inter',
    weightHeadline: 700,
    weightBody: 400,
    baseSize: 16,
    scale: 1.25,
    letterSpacing: 'normal',
    ...overrides,
  }) as Typography;

// ---------------------------------------------------------------------------
// getLetterSpacing
// ---------------------------------------------------------------------------
describe('getLetterSpacing', () => {
  it('returns "-0.02em" for tight', () => {
    expect(getLetterSpacing('tight')).toBe('-0.02em');
  });

  it('returns "0" for normal', () => {
    expect(getLetterSpacing('normal')).toBe('0');
  });

  it('returns "0.05em" for wide', () => {
    expect(getLetterSpacing('wide')).toBe('0.05em');
  });

  it('returns normal for undefined', () => {
    expect(getLetterSpacing(undefined)).toBe('0');
  });
});

// ---------------------------------------------------------------------------
// getFontCategory
// ---------------------------------------------------------------------------
describe('getFontCategory', () => {
  it('returns "sans-serif" for undefined family', () => {
    expect(getFontCategory(undefined)).toBe('sans-serif');
  });

  it('returns "sans-serif" for unknown font', () => {
    expect(getFontCategory('NonExistentFont123')).toBe('sans-serif');
  });

  it('returns correct category for known fonts', () => {
    // Inter is a well-known sans-serif in Google Fonts
    const category = getFontCategory('Inter');
    expect(['sans-serif', 'serif', 'monospace', 'display', 'handwriting']).toContain(category);
  });
});

// ---------------------------------------------------------------------------
// buildFontStack
// ---------------------------------------------------------------------------
describe('buildFontStack', () => {
  it('defaults to "Inter" when no family provided', () => {
    const stack = buildFontStack(undefined);
    expect(stack).toContain('"Inter"');
  });

  it('quotes the font family name', () => {
    const stack = buildFontStack('Playfair Display');
    expect(stack).toContain('"Playfair Display"');
  });

  it('does not double-quote already-quoted family', () => {
    const stack = buildFontStack('"Custom Font"');
    // Should not produce triple quotes
    expect(stack).not.toContain('"""');
  });

  it('includes system fallback fonts', () => {
    const stack = buildFontStack('Inter');
    // Should include some system font keywords
    expect(stack).toMatch(/sans-serif|serif|monospace|system-ui/);
  });

  it('trims whitespace from family name', () => {
    const stack = buildFontStack('  Inter  ');
    expect(stack).toContain('"Inter"');
  });
});

// ---------------------------------------------------------------------------
// getTypeScale
// ---------------------------------------------------------------------------
describe('getTypeScale', () => {
  it('returns default values when no typography provided', () => {
    const scale = getTypeScale(undefined);
    expect(scale.base).toBe(16);
    expect(scale.step1).toBeGreaterThan(scale.base);
    expect(scale.step2).toBeGreaterThan(scale.step1);
    expect(scale.step3).toBeGreaterThan(scale.step2);
    expect(scale.stepMinus1).toBeLessThan(scale.base);
    expect(scale.stepMinus2).toBeLessThan(scale.stepMinus1);
  });

  it('uses provided base size', () => {
    const scale = getTypeScale(typo({ baseSize: 20 }));
    expect(scale.base).toBe(20);
  });

  it('uses provided scale ratio', () => {
    const scale = getTypeScale(typo({ baseSize: 16, scale: 1.5 }));
    // With balanced curve: effective scale = 1 + (1.5 - 1) * 0.8 = 1.4
    expect(scale.scale).toBeCloseTo(1.4, 5);
    expect(scale.step1).toBeCloseTo(16 * 1.4, 5);
  });

  it('softens the scale with 0.8 dampening', () => {
    const scale = getTypeScale(typo({ baseSize: 16, scale: 2.0 }));
    // Effective scale = 1 + (2.0 - 1) * 0.8 = 1.8
    expect(scale.scale).toBeCloseTo(1.8, 5);
  });

  it('produces monotonically increasing steps', () => {
    const scale = getTypeScale(typo({ baseSize: 16, scale: 1.333 }));
    expect(scale.stepMinus2).toBeLessThan(scale.stepMinus1);
    expect(scale.stepMinus1).toBeLessThan(scale.base);
    expect(scale.base).toBeLessThan(scale.step1);
    expect(scale.step1).toBeLessThan(scale.step2);
    expect(scale.step2).toBeLessThan(scale.step3);
  });

  it('handles scale of 1.0 (no scaling)', () => {
    const scale = getTypeScale(typo({ baseSize: 16, scale: 1.0 }));
    expect(scale.step1).toBe(16);
    expect(scale.stepMinus1).toBe(16);
  });
});

// ---------------------------------------------------------------------------
// clampFontSize
// ---------------------------------------------------------------------------
describe('clampFontSize', () => {
  it('returns the value when within range', () => {
    expect(clampFontSize(16, 10, 24)).toBe(16);
  });

  it('clamps to min when value is below', () => {
    expect(clampFontSize(5, 10, 24)).toBe(10);
  });

  it('clamps to max when value is above', () => {
    expect(clampFontSize(30, 10, 24)).toBe(24);
  });

  it('uses default min of 10 when not specified', () => {
    expect(clampFontSize(5)).toBe(10);
  });

  it('allows values above min when no max specified', () => {
    expect(clampFontSize(1000)).toBe(1000);
  });

  it('returns min for NaN', () => {
    expect(clampFontSize(NaN, 12)).toBe(12);
  });

  it('returns default min (10) for NaN with no min specified', () => {
    expect(clampFontSize(NaN)).toBe(10);
  });

  it('handles negative values', () => {
    expect(clampFontSize(-5, 10, 24)).toBe(10);
  });

  it('handles zero', () => {
    expect(clampFontSize(0, 10, 24)).toBe(10);
  });

  it('handles equal min and max', () => {
    expect(clampFontSize(15, 10, 10)).toBe(10);
  });
});
