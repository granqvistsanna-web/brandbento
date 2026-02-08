/**
 * Color Extraction Service
 *
 * Extracts brand colors from a parsed HTML document using multiple strategies
 * in priority order. Filters out neutral colors (grays, black, white) to
 * focus on actual brand colors.
 *
 * ## Extraction Strategies (in priority order)
 *
 * 1. **CSS Variables** - Highest confidence. Looks for custom properties
 *    with color-related names (--color-*, --bg-*, --primary, --accent)
 *
 * 2. **Semantic Elements** - Extracts colors from buttons, links, headings,
 *    and other interactive elements that typically use brand colors
 *
 * 3. **Stylesheets** - Fallback. Scans all CSS rules for color values
 *
 * @module services/extractColors
 */

/**
 * Result of color extraction.
 */
interface ExtractedColors {
  /** Array of hex color strings (max 10) */
  colors: string[];
  /** Which extraction strategy succeeded */
  source: 'css-vars' | 'semantic' | 'stylesheet';
}

/**
 * Extracts brand colors from a parsed HTML document.
 *
 * Uses a multi-strategy approach, returning early when enough colors
 * are found (5+ colors). Neutral colors are filtered out automatically.
 *
 * @param doc - Parsed HTML document from DOMParser
 * @returns Object with colors array and source strategy
 *
 * @example
 * const html = await fetch(url);
 * const doc = new DOMParser().parseFromString(html, 'text/html');
 * const { colors, source } = await extractColors(doc);
 * // colors: ['#3B82F6', '#10B981', '#F59E0B', ...]
 */
export async function extractColors(doc: Document): Promise<ExtractedColors> {
  const colors = new Set<string>();

  // Strategy 1: CSS custom properties (highest confidence)
  const cssVarColors = extractFromCSSVariables(doc);
  cssVarColors.forEach(c => colors.add(c));

  if (colors.size >= 5) {
    return { colors: Array.from(colors).slice(0, 10), source: 'css-vars' };
  }

  // Strategy 2: Semantic elements (buttons, links, headings)
  const semanticColors = extractFromSemanticElements(doc);
  semanticColors.forEach(c => colors.add(c));

  if (colors.size >= 5) {
    return { colors: Array.from(colors).slice(0, 10), source: 'semantic' };
  }

  // Strategy 3: Stylesheets
  const stylesheetColors = extractFromStylesheets(doc);
  stylesheetColors.forEach(c => colors.add(c));

  if (colors.size >= 3) {
    return { colors: Array.from(colors).slice(0, 10), source: 'stylesheet' };
  }

  // Return default colors instead of throwing, consistent with other extractors
  return { colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'], source: 'stylesheet' };
}

/**
 * Extracts colors from CSS custom properties (variables).
 * Looks for properties containing 'color', 'bg', 'primary', or 'accent'.
 */
function extractFromCSSVariables(doc: Document): string[] {
  const colors: string[] = [];

  try {
    Array.from(doc.styleSheets).forEach(sheet => {
      try {
        Array.from(sheet.cssRules).forEach(rule => {
          if (rule instanceof CSSStyleRule) {
            const style = rule.style;
            for (let i = 0; i < style.length; i++) {
              const prop = style[i];
              if (prop.startsWith('--') &&
                  (prop.includes('color') || prop.includes('bg') || prop.includes('primary') || prop.includes('accent'))) {
                const value = style.getPropertyValue(prop).trim();
                const hex = cssValueToHex(value);
                if (hex && !isNearNeutral(hex)) {
                  colors.push(hex);
                }
              }
            }
          }
        });
      } catch {
        // Cross-origin stylesheet, skip
      }
    });
  } catch {
    // No stylesheets accessible
  }

  return colors;
}

/**
 * Extracts colors from semantic elements (buttons, links, headings).
 * These elements typically use the brand's primary/accent colors.
 */
function extractFromSemanticElements(doc: Document): string[] {
  const colors: string[] = [];
  const selectors = 'button, a, h1, h2, h3, .btn, .cta, [role="button"], .primary, .accent';

  doc.querySelectorAll(selectors).forEach(el => {
    try {
      const computed = window.getComputedStyle(el);
      [computed.color, computed.backgroundColor, computed.borderColor].forEach(color => {
        const hex = rgbToHex(color);
        if (hex && !isNearNeutral(hex)) {
          colors.push(hex);
        }
      });
    } catch {
      // Element not accessible
    }
  });

  return colors;
}

/**
 * Extracts colors from all CSS rules in stylesheets.
 * Fallback strategy when CSS vars and semantic extraction don't find enough.
 */
function extractFromStylesheets(doc: Document): string[] {
  const colors: string[] = [];
  const colorRegex = /#[0-9A-Fa-f]{3,8}\b|rgb\([^)]+\)|hsl\([^)]+\)/g;

  try {
    Array.from(doc.styleSheets).forEach(sheet => {
      try {
        Array.from(sheet.cssRules).forEach(rule => {
          if (rule instanceof CSSStyleRule) {
            const matches = rule.cssText.match(colorRegex) || [];
            matches.forEach(match => {
              const hex = cssValueToHex(match);
              if (hex && !isNearNeutral(hex)) {
                colors.push(hex);
              }
            });
          }
        });
      } catch {
        // Cross-origin
      }
    });
  } catch {
    // No access
  }

  return colors;
}

/**
 * Converts CSS color value to normalized hex format.
 * Handles hex (#RGB, #RRGGBB, #RRGGBBAA), rgb(), and rgba().
 * @returns 6-char hex string with # prefix, or null if invalid
 */
function cssValueToHex(value: string): string | null {
  value = value.trim().toLowerCase();

  // Already hex
  if (value.startsWith('#')) {
    if (value.length === 4) {
      // #RGB -> #RRGGBB
      return '#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
    }
    if (value.length === 7 || value.length === 9) {
      return value.slice(0, 7); // Drop alpha if present
    }
    return null;
  }

  // RGB/RGBA
  const rgbMatch = value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return rgbToHexValue(parseInt(r), parseInt(g), parseInt(b));
  }

  return null;
}

/** Wrapper for cssValueToHex that handles transparent/inherit values */
function rgbToHex(rgb: string): string | null {
  if (!rgb || rgb === 'transparent' || rgb === 'inherit') return null;
  return cssValueToHex(rgb);
}

/** Converts RGB channel values (0-255) to hex string */
function rgbToHexValue(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Checks if a color is neutral (grayscale, near-white, or near-black).
 * These colors are filtered out to focus on actual brand colors.
 *
 * Thresholds:
 * - Saturation < 20 (diff between max/min RGB channels)
 * - Brightness > 240 (near white) or < 15 (near black)
 */
function isNearNeutral(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  // Low saturation = neutral
  if (diff < 20) return true;

  // Near white or black
  const avg = (r + g + b) / 3;
  if (avg > 240 || avg < 15) return true;

  return false;
}
