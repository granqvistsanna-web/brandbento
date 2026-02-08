/**
 * Font Extraction Service
 *
 * Extracts web fonts from a parsed HTML document using multiple strategies.
 * Filters out system fonts to identify custom/branded typography.
 *
 * ## Extraction Strategies (in priority order)
 *
 * 1. **Google Fonts Link** - Highest confidence. Parses fonts.googleapis.com URLs
 * 2. **CSS Variables** - Looks for --font-family custom properties
 * 3. **Document.fonts API** - Checks loaded fonts after document.fonts.ready
 * 4. **@font-face Rules** - Parses font-face declarations in stylesheets
 *
 * @module services/extractFonts
 */

/**
 * Result of font extraction.
 */
interface ExtractedFonts {
  /** Primary/headline font family name */
  primaryFont: string;
  /** Secondary/body font family name */
  secondaryFont: string;
  /** Which extraction strategy succeeded */
  source: 'google-fonts' | 'css-vars' | 'document-fonts' | 'font-face';
}

/**
 * Common system fonts to filter out during extraction.
 * We only want custom/web fonts, not default system fonts.
 */
const SYSTEM_FONTS = [
  'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New', 'Courier',
  'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Comic Sans MS', 'Impact',
  'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
  'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'sans-serif',
  'serif', 'monospace', 'cursive', 'fantasy'
];

/**
 * Extracts web fonts from a parsed HTML document.
 *
 * Tries multiple strategies in priority order, returning when fonts are found.
 * Waits up to 3 seconds for document.fonts to load before checking.
 *
 * @param doc - Parsed HTML document from DOMParser
 * @returns Object with primaryFont, secondaryFont, and source
 * @throws Error if no web fonts are detected
 *
 * @example
 * const { primaryFont, secondaryFont } = await extractFonts(doc);
 * // primaryFont: 'Playfair Display', secondaryFont: 'Inter'
 */
export async function extractFonts(doc: Document): Promise<ExtractedFonts> {
  // Strategy 1: Google Fonts link tags (highest confidence)
  const googleFonts = extractFromGoogleFontsLink(doc);
  if (googleFonts) return googleFonts;

  // Strategy 2: CSS custom properties
  const cssVarFonts = extractFromCSSVariables(doc);
  if (cssVarFonts) return cssVarFonts;

  // Strategy 3: Wait for fonts to load, check document.fonts
  // Wait up to 3 seconds for fonts
  await Promise.race([
    document.fonts.ready,
    new Promise(resolve => setTimeout(resolve, 3000))
  ]);

  const loadedFonts = extractFromDocumentFonts();
  if (loadedFonts) return loadedFonts;

  // Strategy 4: Parse @font-face declarations
  const fontFaceFonts = extractFromFontFace(doc);
  if (fontFaceFonts) return fontFaceFonts;

  throw new Error('No web fonts detected');
}

/**
 * Extracts fonts from Google Fonts link tags.
 * Parses family=Font+Name:wght@400;700 URL format.
 */
function extractFromGoogleFontsLink(doc: Document): ExtractedFonts | null {
  const link = doc.querySelector('link[href*="fonts.googleapis.com"]');
  if (!link) return null;

  const href = link.getAttribute('href');
  if (!href) return null;

  // Parse family=Font+Name:wght@400;700 format
  const familyMatch = href.match(/family=([^&]+)/);
  if (!familyMatch) return null;

  const families = familyMatch[1]
    .split('|')
    .map(f => f.split(':')[0].replace(/\+/g, ' '))
    .filter(f => f.length > 0);

  if (families.length >= 2) {
    return {
      primaryFont: families[0],
      secondaryFont: families[1],
      source: 'google-fonts'
    };
  }

  if (families.length === 1) {
    return {
      primaryFont: families[0],
      secondaryFont: families[0], // Same font for both
      source: 'google-fonts'
    };
  }

  return null;
}

/**
 * Extracts fonts from CSS custom properties.
 * Looks for variables containing both 'font' and 'family'.
 */
function extractFromCSSVariables(doc: Document): ExtractedFonts | null {
  const fontVars: string[] = [];

  try {
    Array.from(doc.styleSheets).forEach(sheet => {
      try {
        Array.from(sheet.cssRules).forEach(rule => {
          if (rule instanceof CSSStyleRule) {
            const style = rule.style;
            for (let i = 0; i < style.length; i++) {
              const prop = style[i];
              if (prop.startsWith('--') && prop.includes('font') && prop.includes('family')) {
                const value = style.getPropertyValue(prop).trim();
                const family = cleanFontFamily(value);
                if (family && !isSystemFont(family)) {
                  fontVars.push(family);
                }
              }
            }
          }
        });
      } catch {
        // Cross-origin
      }
    });
  } catch {
    // No access
  }

  if (fontVars.length >= 2) {
    return {
      primaryFont: fontVars[0],
      secondaryFont: fontVars[1],
      source: 'css-vars'
    };
  }

  if (fontVars.length === 1) {
    return {
      primaryFont: fontVars[0],
      secondaryFont: fontVars[0],
      source: 'css-vars'
    };
  }

  return null;
}

/**
 * Extracts fonts from the document.fonts API.
 * Checks fonts that have actually been loaded and rendered.
 */
function extractFromDocumentFonts(): ExtractedFonts | null {
  const fonts = Array.from(document.fonts)
    .map(font => font.family.replace(/['"]/g, ''))
    .filter(family => !isSystemFont(family));

  // Dedupe
  const unique = [...new Set(fonts)];

  if (unique.length >= 2) {
    return {
      primaryFont: unique[0],
      secondaryFont: unique[1],
      source: 'document-fonts'
    };
  }

  if (unique.length === 1) {
    return {
      primaryFont: unique[0],
      secondaryFont: unique[0],
      source: 'document-fonts'
    };
  }

  return null;
}

/**
 * Extracts fonts from @font-face CSS rules.
 * Fallback when other methods don't find fonts.
 */
function extractFromFontFace(doc: Document): ExtractedFonts | null {
  const fontFamilies: string[] = [];

  try {
    Array.from(doc.styleSheets).forEach(sheet => {
      try {
        Array.from(sheet.cssRules).forEach(rule => {
          if (rule instanceof CSSFontFaceRule) {
            const family = rule.style.getPropertyValue('font-family');
            const cleaned = cleanFontFamily(family);
            if (cleaned && !isSystemFont(cleaned)) {
              fontFamilies.push(cleaned);
            }
          }
        });
      } catch {
        // Cross-origin
      }
    });
  } catch {
    // No access
  }

  const unique = [...new Set(fontFamilies)];

  if (unique.length >= 2) {
    return {
      primaryFont: unique[0],
      secondaryFont: unique[1],
      source: 'font-face'
    };
  }

  if (unique.length === 1) {
    return {
      primaryFont: unique[0],
      secondaryFont: unique[0],
      source: 'font-face'
    };
  }

  return null;
}

function cleanFontFamily(value: string): string {
  return value.split(',')[0].replace(/['"]/g, '').trim();
}

function isSystemFont(family: string): boolean {
  const normalized = family.toLowerCase();
  return SYSTEM_FONTS.some(sys => normalized.includes(sys.toLowerCase()));
}
