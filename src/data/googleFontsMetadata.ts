/**
 * Google Fonts Metadata
 * Curated subset of popular fonts for MVP - full list can be fetched from API later
 */

export interface GoogleFontMeta {
  family: string;
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';
  variants: string[];
}

// Top ~60 fonts across categories for MVP
export const GOOGLE_FONTS: GoogleFontMeta[] = [
  // Sans-serif (most popular)
  { family: 'Inter', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Roboto', category: 'sans-serif', variants: ['100', '300', '400', '500', '700', '900'] },
  { family: 'Open Sans', category: 'sans-serif', variants: ['300', '400', '500', '600', '700', '800'] },
  { family: 'Lato', category: 'sans-serif', variants: ['100', '300', '400', '700', '900'] },
  { family: 'Montserrat', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Poppins', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Plus Jakarta Sans', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800'] },
  { family: 'Sora', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800'] },
  { family: 'Raleway', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Nunito', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Ubuntu', category: 'sans-serif', variants: ['300', '400', '500', '700'] },
  { family: 'Work Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Noto Sans', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Rubik', category: 'sans-serif', variants: ['300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Oswald', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700'] },
  { family: 'Source Sans 3', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Mukta', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800'] },
  { family: 'PT Sans', category: 'sans-serif', variants: ['400', '700'] },
  { family: 'Quicksand', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'] },
  { family: 'Manrope', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800'] },
  { family: 'DM Sans', category: 'sans-serif', variants: ['400', '500', '700'] },
  { family: 'Outfit', category: 'sans-serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Bricolage Grotesque', category: 'sans-serif', variants: ['200', '300', '400', '500', '600', '700', '800'] },

  // Serif
  { family: 'Lora', category: 'serif', variants: ['400', '500', '600', '700'] },
  { family: 'Playfair Display', category: 'serif', variants: ['400', '500', '600', '700', '800', '900'] },
  { family: 'Merriweather', category: 'serif', variants: ['300', '400', '700', '900'] },
  { family: 'PT Serif', category: 'serif', variants: ['400', '700'] },
  { family: 'Libre Baskerville', category: 'serif', variants: ['400', '700'] },
  { family: 'Crimson Text', category: 'serif', variants: ['400', '600', '700'] },
  { family: 'EB Garamond', category: 'serif', variants: ['400', '500', '600', '700', '800'] },
  { family: 'Bitter', category: 'serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Source Serif 4', category: 'serif', variants: ['200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'Noto Serif', category: 'serif', variants: ['400', '700'] },
  { family: 'Cormorant Garamond', category: 'serif', variants: ['300', '400', '500', '600', '700'] },
  { family: 'Spectral', category: 'serif', variants: ['200', '300', '400', '500', '600', '700', '800'] },
  { family: 'Vollkorn', category: 'serif', variants: ['400', '500', '600', '700', '800', '900'] },
  { family: 'DM Serif Display', category: 'serif', variants: ['400'] },
  { family: 'Fraunces', category: 'serif', variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },

  // Display
  { family: 'Bebas Neue', category: 'display', variants: ['400'] },
  { family: 'Abril Fatface', category: 'display', variants: ['400'] },
  { family: 'Righteous', category: 'display', variants: ['400'] },
  { family: 'Lobster', category: 'display', variants: ['400'] },
  { family: 'Alfa Slab One', category: 'display', variants: ['400'] },
  { family: 'Fredoka', category: 'display', variants: ['300', '400', '500', '600', '700'] },
  { family: 'Archivo Black', category: 'display', variants: ['400'] },
  { family: 'Lilita One', category: 'display', variants: ['400'] },
  { family: 'Passion One', category: 'display', variants: ['400', '700', '900'] },
  { family: 'Permanent Marker', category: 'display', variants: ['400'] },

  // Monospace
  { family: 'Roboto Mono', category: 'monospace', variants: ['100', '200', '300', '400', '500', '600', '700'] },
  { family: 'Fira Code', category: 'monospace', variants: ['300', '400', '500', '600', '700'] },
  { family: 'JetBrains Mono', category: 'monospace', variants: ['100', '200', '300', '400', '500', '600', '700', '800'] },
  { family: 'Source Code Pro', category: 'monospace', variants: ['200', '300', '400', '500', '600', '700', '800', '900'] },
  { family: 'IBM Plex Mono', category: 'monospace', variants: ['100', '200', '300', '400', '500', '600', '700'] },
  { family: 'Space Mono', category: 'monospace', variants: ['400', '700'] },
  { family: 'Ubuntu Mono', category: 'monospace', variants: ['400', '700'] },
  { family: 'Inconsolata', category: 'monospace', variants: ['200', '300', '400', '500', '600', '700', '800', '900'] },

  // Handwriting
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

// Top 20 most popular fonts for default display
export const POPULAR_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Poppins', 'Raleway', 'Nunito', 'Playfair Display', 'Merriweather',
  'PT Sans', 'Ubuntu', 'Work Sans', 'Noto Sans', 'Mukta',
  'Rubik', 'Oswald', 'Source Sans 3', 'Libre Baskerville', 'Crimson Text'
];
