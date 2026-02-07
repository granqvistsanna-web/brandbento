interface ExtractedColors {
  colors: string[];
  source: 'css-vars' | 'semantic' | 'stylesheet';
}

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

function rgbToHex(rgb: string): string | null {
  if (!rgb || rgb === 'transparent' || rgb === 'inherit') return null;
  return cssValueToHex(rgb);
}

function rgbToHexValue(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function isNearNeutral(hex: string): boolean {
  // Check if color is grayscale or near-white/near-black
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
