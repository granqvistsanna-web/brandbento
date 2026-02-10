/**
 * Shared color default constants.
 * Use these instead of hardcoded hex values for brand color fallbacks.
 * These are hex strings (not CSS variables) because they're used in
 * contrast calculations and color mapping logic.
 */
export const COLOR_DEFAULTS = {
  TEXT_DARK: '#171717',
  TEXT_LIGHT: '#FAFAFA',
  BG: '#FAFAFA',
  SURFACE: '#F5F5F5',
  PRIMARY: '#000000',
  ACCENT: '#555555',
  WHITE: '#FFFFFF',
} as const;

/** Light text color for use over dark image overlays/gradients */
export const IMAGE_OVERLAY_TEXT = COLOR_DEFAULTS.TEXT_LIGHT;

/** Semi-transparent light text for secondary copy over image overlays */
export const imageOverlayTextMuted = (opacity: number) =>
  `color-mix(in srgb, ${COLOR_DEFAULTS.TEXT_LIGHT} ${Math.round(opacity * 100)}%, transparent)`;

/** Lightness threshold (0-100) above which a color is considered "light" */
export const LIGHTNESS_THRESHOLD = 55;

/**
 * Regex matching valid CSS hex color strings (#RGB or #RRGGBB).
 * Used for input validation in color pickers and text fields.
 * Accepts 3-digit shorthand (#F0F) and 6-digit full form (#FF00FF).
 */
export const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

/** Check whether a string is a valid hex color (#RGB or #RRGGBB). */
export const isValidHex = (hex: string): boolean => HEX_COLOR_REGEX.test(hex);
