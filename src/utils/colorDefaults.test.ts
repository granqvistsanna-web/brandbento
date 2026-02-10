import { describe, expect, it } from 'vitest';
import {
  COLOR_DEFAULTS,
  IMAGE_OVERLAY_TEXT,
  imageOverlayTextMuted,
  LIGHTNESS_THRESHOLD,
  HEX_COLOR_REGEX,
  isValidHex,
} from './colorDefaults';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
describe('COLOR_DEFAULTS', () => {
  it('has expected keys', () => {
    expect(COLOR_DEFAULTS.TEXT_DARK).toBe('#171717');
    expect(COLOR_DEFAULTS.TEXT_LIGHT).toBe('#FAFAFA');
    expect(COLOR_DEFAULTS.BG).toBe('#FAFAFA');
    expect(COLOR_DEFAULTS.SURFACE).toBe('#F5F5F5');
    expect(COLOR_DEFAULTS.PRIMARY).toBe('#000000');
    expect(COLOR_DEFAULTS.ACCENT).toBe('#555555');
    expect(COLOR_DEFAULTS.WHITE).toBe('#FFFFFF');
  });

  it('IMAGE_OVERLAY_TEXT equals TEXT_LIGHT', () => {
    expect(IMAGE_OVERLAY_TEXT).toBe(COLOR_DEFAULTS.TEXT_LIGHT);
  });

  it('LIGHTNESS_THRESHOLD is 55', () => {
    expect(LIGHTNESS_THRESHOLD).toBe(55);
  });
});

// ---------------------------------------------------------------------------
// imageOverlayTextMuted
// ---------------------------------------------------------------------------
describe('imageOverlayTextMuted', () => {
  it('returns color-mix string at full opacity', () => {
    const result = imageOverlayTextMuted(1);
    expect(result).toContain('100%');
    expect(result).toContain(COLOR_DEFAULTS.TEXT_LIGHT);
    expect(result).toContain('transparent');
  });

  it('returns color-mix string at half opacity', () => {
    const result = imageOverlayTextMuted(0.5);
    expect(result).toContain('50%');
  });

  it('rounds fractional percentages', () => {
    const result = imageOverlayTextMuted(0.333);
    expect(result).toContain('33%');
  });

  it('returns 0% for opacity 0', () => {
    const result = imageOverlayTextMuted(0);
    expect(result).toContain('0%');
  });
});

// ---------------------------------------------------------------------------
// isValidHex / HEX_COLOR_REGEX
// ---------------------------------------------------------------------------
describe('isValidHex', () => {
  it('accepts 6-digit hex with #', () => {
    expect(isValidHex('#FF0000')).toBe(true);
    expect(isValidHex('#000000')).toBe(true);
    expect(isValidHex('#FFFFFF')).toBe(true);
  });

  it('accepts 3-digit hex with #', () => {
    expect(isValidHex('#F00')).toBe(true);
    expect(isValidHex('#FFF')).toBe(true);
    expect(isValidHex('#000')).toBe(true);
  });

  it('accepts lowercase hex', () => {
    expect(isValidHex('#ff6b35')).toBe(true);
    expect(isValidHex('#abc')).toBe(true);
  });

  it('accepts mixed case', () => {
    expect(isValidHex('#fF6B35')).toBe(true);
  });

  it('rejects hex without # prefix', () => {
    expect(isValidHex('FF0000')).toBe(false);
  });

  it('rejects 4-digit hex', () => {
    expect(isValidHex('#FF00')).toBe(false);
  });

  it('rejects 5-digit hex', () => {
    expect(isValidHex('#FF000')).toBe(false);
  });

  it('rejects 8-digit hex (with alpha)', () => {
    expect(isValidHex('#FF000080')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidHex('')).toBe(false);
  });

  it('rejects non-hex characters', () => {
    expect(isValidHex('#GGGGGG')).toBe(false);
    expect(isValidHex('#ZZZZZZ')).toBe(false);
  });

  it('rejects plain color names', () => {
    expect(isValidHex('red')).toBe(false);
    expect(isValidHex('blue')).toBe(false);
  });

  it('rejects rgb() syntax', () => {
    expect(isValidHex('rgb(255,0,0)')).toBe(false);
  });
});

describe('HEX_COLOR_REGEX', () => {
  it('matches valid 6-digit hex', () => {
    expect(HEX_COLOR_REGEX.test('#AABBCC')).toBe(true);
  });

  it('matches valid 3-digit hex', () => {
    expect(HEX_COLOR_REGEX.test('#ABC')).toBe(true);
  });

  it('does not match without #', () => {
    expect(HEX_COLOR_REGEX.test('AABBCC')).toBe(false);
  });
});
