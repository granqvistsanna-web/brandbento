/**
 * Parses color palette input from various formats (Coolors CSS, URLs, hex lists)
 * and returns an array of validated 6-digit hex color strings.
 */

export interface ParseResult {
  colors: string[];
  error: string | null;
}

export function parsePaletteInput(input: string): ParseResult {
  const trimmed = input.trim();
  if (!trimmed) return { colors: [], error: 'Paste colors from Coolors or enter hex values' };

  let hexValues: string[] = [];

  // 1. Coolors URL: coolors.co/780000-c1121f-fdf0d5
  const urlMatch = trimmed.match(
    /coolors\.co\/(?:palette\/)?([0-9a-fA-F]{3,8}(?:-[0-9a-fA-F]{3,8})+)/
  );
  if (urlMatch) {
    hexValues = urlMatch[1].split('-').map((h) => `#${h.slice(0, 6)}`);
  }

  // 2. CSS custom properties: --name: #hex;
  if (hexValues.length === 0) {
    const cssMatches = [...trimmed.matchAll(/--[\w-]+:\s*#([0-9a-fA-F]{3,8})\s*;/g)];
    if (cssMatches.length > 0) {
      hexValues = cssMatches.map((m) => `#${m[1].slice(0, 6)}`);
    }
  }

  // 3. Comma or space-separated hex values
  if (hexValues.length === 0) {
    const tokens = trimmed.split(/[,\s]+/).filter(Boolean);
    const parsed = tokens
      .map((t) => t.replace(/^#/, ''))
      .filter((t) => /^[0-9a-fA-F]{3,8}$/.test(t))
      .map((t) => `#${t.slice(0, 6)}`);
    if (parsed.length >= 2) {
      hexValues = parsed;
    }
  }

  // Normalize: expand 3-digit hex, uppercase, validate
  const validated = hexValues
    .map((h) => {
      const clean = h.startsWith('#') ? h : `#${h}`;
      if (/^#[0-9a-fA-F]{3}$/i.test(clean)) {
        const [, r, g, b] = clean.match(/^#(.)(.)(.)$/)!;
        return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
      }
      return clean.toUpperCase();
    })
    .filter((h) => /^#[0-9A-F]{6}$/.test(h));

  // Deduplicate
  const unique = [...new Set(validated)];

  if (unique.length === 0) {
    return { colors: [], error: 'No valid colors found. Try pasting CSS from Coolors or hex values.' };
  }

  return { colors: unique, error: null };
}
