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
