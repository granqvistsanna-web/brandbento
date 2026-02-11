import type { Typography } from '@/store/useBrandStore';
import { GOOGLE_FONTS_MAP, type GoogleFontMeta } from '@/data/googleFontsMetadata';
import { getSystemFallback } from '@/services/googleFonts';

const LETTER_SPACING_MAP: Record<Typography['letterSpacing'], string> = {
  tight: '-0.02em',
  normal: '0',
  wide: '0.05em',
};

export const getLetterSpacing = (value?: Typography['letterSpacing']): string => {
  if (!value) return LETTER_SPACING_MAP.normal;
  return LETTER_SPACING_MAP[value] ?? LETTER_SPACING_MAP.normal;
};

export const getFontCategory = (family?: string): GoogleFontMeta['category'] => {
  if (!family) return 'sans-serif';
  return GOOGLE_FONTS_MAP.get(family)?.category ?? 'sans-serif';
};

export const buildFontStack = (family?: string): string => {
  const safeFamily = family?.trim() || 'Inter';
  const fallback = getSystemFallback(getFontCategory(safeFamily));
  const quoted = safeFamily.includes('"') ? safeFamily : `"${safeFamily}"`;
  return `${quoted}, ${fallback}`;
};

export const getTypeScale = (typography?: Typography) => {
  const base = typography?.baseSize ?? 16;
  const rawScale = typography?.scale ?? 1.25;
  // Balanced curve: soften the effect of extreme scale values.
  const scale = 1 + (rawScale - 1) * 0.8;
  const step1 = base * scale;
  const step2 = step1 * scale;
  const step3 = step2 * scale;
  const stepMinus1 = base / scale;
  const stepMinus2 = stepMinus1 / scale;

  return {
    base,
    scale,
    stepMinus2,
    stepMinus1,
    step1,
    step2,
    step3,
  };
};

export const clampFontSize = (value: number, min = 10, max?: number): number => {
  if (Number.isNaN(value)) return min;
  if (typeof max === 'number') {
    return Math.min(max, Math.max(min, value));
  }
  return Math.max(min, value);
};

/** Get headline letter-spacing: global baseline + per-role offset */
export const getHeadlineTracking = (typography?: Typography): string => {
  const base = getLetterSpacing(typography?.letterSpacing);
  const offset = typography?.trackingHeadline ?? 0;
  if (offset === 0) return base;
  const baseNum = parseFloat(base) || 0;
  const result = baseNum + offset;
  if (Math.abs(result) < 0.001) return '0';
  return `${result}em`;
};

/** Get body letter-spacing: global baseline + per-role offset */
export const getBodyTracking = (typography?: Typography): string => {
  const base = getLetterSpacing(typography?.letterSpacing);
  const offset = typography?.trackingBody ?? 0;
  if (offset === 0) return base;
  const baseNum = parseFloat(base) || 0;
  const result = baseNum + offset;
  if (Math.abs(result) < 0.001) return '0';
  return `${result}em`;
};

/** Get headline line-height */
export const getHeadlineLineHeight = (typography?: Typography): number => {
  return typography?.lineHeightHeadline ?? 1.1;
};

/** Get body line-height */
export const getBodyLineHeight = (typography?: Typography): number => {
  return typography?.lineHeightBody ?? 1.5;
};

/** Get headline text-transform */
export const getHeadlineTransform = (typography?: Typography): string => {
  return typography?.transformHeadline ?? 'none';
};
