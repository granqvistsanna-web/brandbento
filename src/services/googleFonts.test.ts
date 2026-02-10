import { describe, expect, it } from 'vitest';
import { buildFontURL, getSystemFallback, isFontLoaded } from './googleFonts';

// ---------------------------------------------------------------------------
// buildFontURL — Google Fonts
// ---------------------------------------------------------------------------
describe('buildFontURL (Google)', () => {
  it('builds a valid Google Fonts CSS2 URL', () => {
    const url = buildFontURL('Inter', ['400', '700']);
    expect(url).toBe(
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap'
    );
  });

  it('defaults to weight 400 and display swap', () => {
    const url = buildFontURL('Inter');
    expect(url).toContain('wght@400');
    expect(url).toContain('display=swap');
  });

  it('sorts weights numerically', () => {
    const url = buildFontURL('Inter', ['700', '400', '300']);
    expect(url).toContain('wght@300;400;700');
  });

  it('encodes spaces in family name as +', () => {
    const url = buildFontURL('Playfair Display', ['400']);
    expect(url).toContain('family=Playfair+Display');
    expect(url).not.toContain('family=Playfair Display');
  });

  it('respects display parameter', () => {
    const url = buildFontURL('Inter', ['400'], 'block');
    expect(url).toContain('display=block');
  });

  it('uses google source by default', () => {
    const url = buildFontURL('Inter');
    expect(url).toContain('fonts.googleapis.com');
  });
});

// ---------------------------------------------------------------------------
// buildFontURL — Fontshare
// ---------------------------------------------------------------------------
describe('buildFontURL (Fontshare)', () => {
  it('builds a Fontshare CSS URL', () => {
    const url = buildFontURL('Satoshi', ['400', '700'], 'swap', 'fontshare');
    expect(url).toBe(
      'https://api.fontshare.com/v2/css?f[]=satoshi@400,700&display=swap'
    );
  });

  it('converts family name to lowercase slug', () => {
    const url = buildFontURL('General Sans', ['400'], 'swap', 'fontshare');
    expect(url).toContain('f[]=general-sans@');
  });

  it('sorts weights numerically', () => {
    const url = buildFontURL('Satoshi', ['700', '300', '400'], 'swap', 'fontshare');
    expect(url).toContain('@300,400,700');
  });

  it('defaults to weight 400', () => {
    const url = buildFontURL('Satoshi', undefined, 'swap', 'fontshare');
    expect(url).toContain('@400');
  });
});

// ---------------------------------------------------------------------------
// getSystemFallback
// ---------------------------------------------------------------------------
describe('getSystemFallback', () => {
  it('returns serif fallback', () => {
    const fallback = getSystemFallback('serif');
    expect(fallback).toContain('Georgia');
    expect(fallback).toContain('serif');
  });

  it('returns sans-serif fallback', () => {
    const fallback = getSystemFallback('sans-serif');
    expect(fallback).toContain('system-ui');
    expect(fallback).toContain('sans-serif');
  });

  it('returns monospace fallback', () => {
    const fallback = getSystemFallback('monospace');
    expect(fallback).toContain('Courier');
    expect(fallback).toContain('monospace');
  });

  it('returns sans-serif fallback for display category', () => {
    const fallback = getSystemFallback('display');
    expect(fallback).toContain('system-ui');
  });

  it('returns sans-serif fallback for handwriting category', () => {
    const fallback = getSystemFallback('handwriting');
    expect(fallback).toContain('system-ui');
  });

  it('returns sans-serif fallback for unknown category', () => {
    const fallback = getSystemFallback('unknown');
    expect(fallback).toContain('system-ui');
    expect(fallback).toContain('sans-serif');
  });
});

// ---------------------------------------------------------------------------
// isFontLoaded
// ---------------------------------------------------------------------------
describe('isFontLoaded', () => {
  it('returns false for fonts that have not been loaded', () => {
    expect(isFontLoaded('NeverLoadedFont12345')).toBe(false);
  });

  it('returns false for different weight combinations', () => {
    // Even if "Inter:400" was loaded, "Inter:400,700" should be separate
    expect(isFontLoaded('SomeFont', ['400'])).toBe(false);
    expect(isFontLoaded('SomeFont', ['400', '700'])).toBe(false);
  });
});
