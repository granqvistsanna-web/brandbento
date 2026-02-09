/**
 * Google Fonts Metadata
 * Curated subset of popular fonts + designer-picked collection
 */

export interface GoogleFontMeta {
  family: string;
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';
  variants: string[];
  curated?: boolean;
}

// Full font list across categories
export const GOOGLE_FONTS: GoogleFontMeta[] = [
  // ── Sans-serif ──────────────────────────────────────────
  { family: 'Inter', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Roboto', category: 'sans-serif', variants: ['100', '300', '400', '500', '700', '900'] },
  { family: 'Open Sans', category: 'sans-serif', variants: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Lato', category: 'sans-serif', variants: ['100', '300', '400', '700', '900'], curated: true },
  { family: 'Montserrat', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Poppins', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Plus Jakarta Sans', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800'], curated: true },
  { family: 'Sora', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800'] },
  { family: 'Raleway', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Nunito', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Ubuntu', category: 'sans-serif', variants: ['300', '400', '500', '700'] },
  { family: 'Work Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Noto Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Rubik', category: 'sans-serif', variants: ['300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Oswald', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700'], curated: true },
  { family: 'Source Sans 3', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Mukta', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800'] },
  { family: 'PT Sans', category: 'sans-serif', variants: ['400', '700'] },
  { family: 'Quicksand', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'] },
  { family: 'Manrope', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800'], curated: true },
  { family: 'DM Sans', category: 'sans-serif', variants: ['400', '500', '700'] },
  { family: 'Outfit', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Bricolage Grotesque', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800'], curated: true },
  // Curated additions
  { family: 'Space Grotesk', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'], curated: true },
  { family: 'Figtree', category: 'sans-serif', variants: ['300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Urbanist', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Barlow', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Lexend', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Jost', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Darker Grotesque', category: 'sans-serif', variants: ['300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Hanken Grotesk', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Be Vietnam Pro', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Fira Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Public Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Onest', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Rethink Sans', category: 'sans-serif', variants: ['400', '500', '600', '700', '800'], curated: true },
  { family: 'Kanit', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Albert Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Varela Round', category: 'sans-serif', variants: ['400'], curated: true },

  // ── Serif ───────────────────────────────────────────────
  { family: 'Lora', category: 'serif', variants: ['400', '500', '600', '700'], curated: true },
  { family: 'Playfair Display', category: 'serif', variants: ['400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Merriweather', category: 'serif', variants: ['300', '400', '700', '900'], curated: true },
  { family: 'PT Serif', category: 'serif', variants: ['400', '700'] },
  { family: 'Libre Baskerville', category: 'serif', variants: ['400', '700'] },
  { family: 'Crimson Text', category: 'serif', variants: ['400', '600', '700'] },
  { family: 'EB Garamond', category: 'serif', variants: ['400', '500', '600', '700', '800'] },
  { family: 'Bitter', category: 'serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Source Serif 4', category: 'serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Noto Serif', category: 'serif', variants: ['400', '700'] },
  { family: 'Cormorant Garamond', category: 'serif', variants: ['300', '400', '500', '600', '700'], curated: true },
  { family: 'Spectral', category: 'serif', variants: ['200', '300', '400', '500', '600', '700', '800'] },
  { family: 'Vollkorn', category: 'serif', variants: ['400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'DM Serif Display', category: 'serif', variants: ['400'] },
  { family: 'Fraunces', category: 'serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  // Curated additions
  { family: 'Instrument Serif', category: 'serif', variants: ['400'], curated: true },
  { family: 'Crimson Pro', category: 'serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Newsreader', category: 'serif', variants: ['200', '300', '400', '500', '600', '700', '800'], curated: true },
  { family: 'Alegreya', category: 'serif', variants: ['400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Arvo', category: 'serif', variants: ['400', '700'], curated: true },
  { family: 'Prata', category: 'serif', variants: ['400'], curated: true },
  { family: 'Old Standard TT', category: 'serif', variants: ['400', '700'], curated: true },
  { family: 'Vidaloka', category: 'serif', variants: ['400'], curated: true },
  { family: 'Fenix', category: 'serif', variants: ['400'], curated: true },
  { family: 'Cantata One', category: 'serif', variants: ['400'], curated: true },
  { family: 'Young Serif', category: 'serif', variants: ['400'], curated: true },

  // ── Display ─────────────────────────────────────────────
  { family: 'Bebas Neue', category: 'display', variants: ['400'], curated: true },
  { family: 'Abril Fatface', category: 'display', variants: ['400'], curated: true },
  { family: 'Righteous', category: 'display', variants: ['400'] },
  { family: 'Lobster', category: 'display', variants: ['400'] },
  { family: 'Alfa Slab One', category: 'display', variants: ['400'] },
  { family: 'Fredoka', category: 'display', variants: ['300', '400', '500', '600', '700'] },
  { family: 'Archivo Black', category: 'display', variants: ['400'] },
  { family: 'Lilita One', category: 'display', variants: ['400'] },
  { family: 'Passion One', category: 'display', variants: ['400', '700', '900'] },
  { family: 'Permanent Marker', category: 'display', variants: ['400'] },
  // Curated additions
  { family: 'Anton', category: 'display', variants: ['400'], curated: true },
  { family: 'Syne', category: 'display', variants: ['400', '500', '600', '700', '800'], curated: true },
  { family: 'Unbounded', category: 'display', variants: ['200', '300', '400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Kalnia', category: 'display', variants: ['100', '200', '300', '400', '500', '600', '700'], curated: true },
  { family: 'Gasoek One', category: 'display', variants: ['400'], curated: true },
  { family: 'Bodoni Moda', category: 'display', variants: ['400', '500', '600', '700', '800', '900'], curated: true },
  { family: 'Krona One', category: 'display', variants: ['400'], curated: true },

  // ── Monospace ───────────────────────────────────────────
  { family: 'Roboto Mono', category: 'monospace', variants: ['100', '200', '300', '400', '500', '600', '700'] },
  { family: 'Fira Code', category: 'monospace', variants: ['300', '400', '500', '600', '700'] },
  { family: 'JetBrains Mono', category: 'monospace', variants: ['100', '200', '300', '400', '500', '600', '700', '800'], curated: true },
  { family: 'Source Code Pro', category: 'monospace', variants: ['200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'IBM Plex Mono', category: 'monospace', variants: ['100', '200', '300', '400', '500', '600', '700'] },
  { family: 'Space Mono', category: 'monospace', variants: ['400', '700'], curated: true },
  { family: 'Ubuntu Mono', category: 'monospace', variants: ['400', '700'] },
  { family: 'Inconsolata', category: 'monospace', variants: ['200', '300', '400', '500', '600', '700', '800', '900'] },

  // ── Handwriting ─────────────────────────────────────────
  { family: 'Dancing Script', category: 'handwriting', variants: ['400', '500', '600', '700'] },
  { family: 'Pacifico', category: 'handwriting', variants: ['400'] },
  { family: 'Caveat', category: 'handwriting', variants: ['400', '500', '600', '700'] },
  { family: 'Satisfy', category: 'handwriting', variants: ['400'] },
  { family: 'Great Vibes', category: 'handwriting', variants: ['400'] },
];

// O(1) lookup by family name
export const GOOGLE_FONTS_MAP = new Map<string, GoogleFontMeta>(
  GOOGLE_FONTS.map(f => [f.family, f])
);

// Curated font names (designer-picked from 256 Free Font Collection)
export const CURATED_FONTS = new Set(
  GOOGLE_FONTS.filter(f => f.curated).map(f => f.family)
);

// Top 20 most popular fonts for default display
export const POPULAR_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Poppins', 'Raleway', 'Nunito', 'Playfair Display', 'Merriweather',
  'PT Sans', 'Ubuntu', 'Work Sans', 'Noto Sans', 'Mukta',
  'Rubik', 'Oswald', 'Source Sans 3', 'Libre Baskerville', 'Crimson Text'
];
