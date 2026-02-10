import { describe, expect, it } from 'vitest';
import { hexToHsl, hslToHex, rgbToHex, hexToRgb } from './colorConversion';

describe('hexToHsl', () => {
  it('converts pure red', () => {
    const hsl = hexToHsl('#FF0000');
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  it('converts pure green', () => {
    const hsl = hexToHsl('#00FF00');
    expect(hsl.h).toBe(120);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  it('converts pure blue', () => {
    const hsl = hexToHsl('#0000FF');
    expect(hsl.h).toBe(240);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  it('converts black', () => {
    const hsl = hexToHsl('#000000');
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(0);
    expect(hsl.l).toBe(0);
  });

  it('converts white', () => {
    const hsl = hexToHsl('#FFFFFF');
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(0);
    expect(hsl.l).toBe(100);
  });

  it('converts mid-gray', () => {
    const hsl = hexToHsl('#808080');
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(0);
    expect(hsl.l).toBe(50);
  });

  it('handles 3-digit shorthand (#RGB)', () => {
    const hsl = hexToHsl('#F00');
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  it('handles hex without # prefix', () => {
    const hsl = hexToHsl('FF0000');
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  it('handles lowercase hex', () => {
    const hsl = hexToHsl('#ff6b35');
    expect(hsl.h).toBeGreaterThan(0);
    expect(hsl.s).toBeGreaterThan(0);
    expect(hsl.l).toBeGreaterThan(0);
  });

  it('converts a warm orange correctly', () => {
    // #FF6B35 ≈ hsl(18, 100%, 60%)
    const hsl = hexToHsl('#FF6B35');
    expect(hsl.h).toBeGreaterThanOrEqual(15);
    expect(hsl.h).toBeLessThanOrEqual(22);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBeGreaterThanOrEqual(58);
    expect(hsl.l).toBeLessThanOrEqual(62);
  });
});

describe('hslToHex', () => {
  it('converts pure red HSL to hex', () => {
    expect(hslToHex({ h: 0, s: 100, l: 50 })).toBe('#FF0000');
  });

  it('converts pure green HSL to hex', () => {
    expect(hslToHex({ h: 120, s: 100, l: 50 })).toBe('#00FF00');
  });

  it('converts pure blue HSL to hex', () => {
    expect(hslToHex({ h: 240, s: 100, l: 50 })).toBe('#0000FF');
  });

  it('converts black', () => {
    expect(hslToHex({ h: 0, s: 0, l: 0 })).toBe('#000000');
  });

  it('converts white', () => {
    expect(hslToHex({ h: 0, s: 0, l: 100 })).toBe('#FFFFFF');
  });

  it('converts achromatic gray (saturation 0)', () => {
    const hex = hslToHex({ h: 200, s: 0, l: 50 });
    expect(hex).toBe('#808080');
  });

  it('returns uppercase hex', () => {
    const hex = hslToHex({ h: 30, s: 50, l: 60 });
    expect(hex).toMatch(/^#[0-9A-F]{6}$/);
  });
});

describe('hexToHsl ↔ hslToHex roundtrip', () => {
  const testColors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000',
    '#FF6B35', '#4ECDC4', '#2C3E50', '#E74C3C', '#9B59B6',
  ];

  testColors.forEach((hex) => {
    it(`roundtrips ${hex}`, () => {
      const hsl = hexToHsl(hex);
      const result = hslToHex(hsl);
      // Allow ±2 per channel due to rounding through HSL (integer H/S/L)
      const [r1, g1, b1] = hexToRgb(hex);
      const [r2, g2, b2] = hexToRgb(result);
      expect(Math.abs(r1 - r2)).toBeLessThanOrEqual(2);
      expect(Math.abs(g1 - g2)).toBeLessThanOrEqual(2);
      expect(Math.abs(b1 - b2)).toBeLessThanOrEqual(2);
    });
  });
});

describe('rgbToHex', () => {
  it('converts RGB to uppercase hex', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#FF0000');
    expect(rgbToHex(0, 255, 0)).toBe('#00FF00');
    expect(rgbToHex(0, 0, 255)).toBe('#0000FF');
  });

  it('pads single-digit hex values with zero', () => {
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
    expect(rgbToHex(1, 2, 3)).toBe('#010203');
  });

  it('handles max values', () => {
    expect(rgbToHex(255, 255, 255)).toBe('#FFFFFF');
  });
});

describe('hexToRgb', () => {
  it('parses 6-digit hex', () => {
    expect(hexToRgb('#FF0000')).toEqual([255, 0, 0]);
    expect(hexToRgb('#00FF00')).toEqual([0, 255, 0]);
    expect(hexToRgb('#0000FF')).toEqual([0, 0, 255]);
  });

  it('parses 3-digit shorthand', () => {
    expect(hexToRgb('#F00')).toEqual([255, 0, 0]);
    expect(hexToRgb('#FFF')).toEqual([255, 255, 255]);
    expect(hexToRgb('#000')).toEqual([0, 0, 0]);
  });

  it('parses without # prefix', () => {
    expect(hexToRgb('FF6B35')).toEqual([255, 107, 53]);
  });

  it('parses lowercase hex', () => {
    expect(hexToRgb('#ff6b35')).toEqual([255, 107, 53]);
  });
});
