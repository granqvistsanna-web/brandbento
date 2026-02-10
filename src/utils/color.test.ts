import { describe, expect, it } from 'vitest';
import { getAdaptiveTextColor } from './color';

/**
 * getAdaptiveTextColor(bg, lightColor, darkColor, threshold)
 *
 * Returns `lightColor` when the background is light (l > threshold),
 * and `darkColor` when the background is dark (l ≤ threshold).
 *
 * In practice, callers pass:
 *   lightColor = dark text (readable on light bg)
 *   darkColor  = light text (readable on dark bg)
 */
describe('getAdaptiveTextColor', () => {
  // Typical usage: lightColor=#171717 (dark text for light bg),
  //                darkColor=#FAFAFA (light text for dark bg)
  const forLightBg = '#171717';
  const forDarkBg = '#FAFAFA';

  it('returns lightColor for light backgrounds', () => {
    expect(getAdaptiveTextColor('#FFFFFF', forLightBg, forDarkBg)).toBe(forLightBg);
  });

  it('returns darkColor for dark backgrounds', () => {
    expect(getAdaptiveTextColor('#000000', forLightBg, forDarkBg)).toBe(forDarkBg);
  });

  it('uses default threshold of 55', () => {
    // HSL lightness of #808080 ≈ 50, which is ≤ 55 → returns darkColor
    expect(getAdaptiveTextColor('#808080', forLightBg, forDarkBg)).toBe(forDarkBg);
  });

  it('respects custom threshold', () => {
    // #808080 has lightness ~50, with threshold 40 it's "light" → returns lightColor
    expect(getAdaptiveTextColor('#808080', forLightBg, forDarkBg, 40)).toBe(forLightBg);
  });

  it('handles hex without # prefix gracefully', () => {
    // hexToHSL handles bare hex — FFFFFF has l=100 > 55 → lightColor
    expect(getAdaptiveTextColor('FFFFFF', forLightBg, forDarkBg)).toBe(forLightBg);
  });

  it('returns darkColor for near-black', () => {
    // #1A1A2E has l ≈ 13, well below threshold → darkColor
    expect(getAdaptiveTextColor('#1A1A2E', forLightBg, forDarkBg)).toBe(forDarkBg);
  });

  it('returns lightColor for near-white', () => {
    // #F5F5F5 has l ≈ 96, well above threshold → lightColor
    expect(getAdaptiveTextColor('#F5F5F5', forLightBg, forDarkBg)).toBe(forLightBg);
  });
});
