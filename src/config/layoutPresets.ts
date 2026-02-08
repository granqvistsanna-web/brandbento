import type { LayoutPreset, LayoutPresetName } from '../types/layout';

// Breakpoint definitions (px values)
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;

// Layout preset configurations
export const LAYOUT_PRESETS: Record<LayoutPresetName, LayoutPreset> = {
  balanced: {
    name: 'balanced',
    columns: {
      mobile: 2,
      tablet: 3,
      desktop: 3,
    },
    rows: {
      mobile: 5,
      tablet: 3,
      desktop: 3,
    },
    gap: {
      cozy: 16,
      dense: 8,
    },
    rowHeight: {
      cozy: 280,
      dense: 200,
    },
    // 3x3 = 9 cells on desktop/tablet
    // Tiles: hero(1x2=2) + image(2x1=2) + logo(1x1=1) + editorial(1x2=2) + ui-preview(1x2=2) = 9 ✓
    tileSpans: {
      hero: {
        mobile: { colSpan: 2, rowSpan: 2 },
        tablet: { colSpan: 1, rowSpan: 2 },
        desktop: { colSpan: 1, rowSpan: 2 },
      },
      logo: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      colors: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      primaryType: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      secondaryType: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      image: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 2, rowSpan: 1 },
        desktop: { colSpan: 2, rowSpan: 1 },
      },
      'ui-preview': {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 2 },
        desktop: { colSpan: 1, rowSpan: 2 },
      },
      editorial: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 2 },
        desktop: { colSpan: 1, rowSpan: 2 },
      },
      product: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      utility: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
    },
  },

  heroLeft: {
    name: 'heroLeft',
    columns: {
      mobile: 2,
      tablet: 3,
      desktop: 3,
    },
    rows: {
      mobile: 5,
      tablet: 3,
      desktop: 3,
    },
    gap: {
      cozy: 16,
      dense: 8,
    },
    rowHeight: {
      cozy: 280,
      dense: 200,
    },
    // 3x3 = 9 cells. Hero dominates left side (1x3=3), right side has supporting tiles
    tileSpans: {
      hero: {
        mobile: { colSpan: 2, rowSpan: 2 },
        tablet: { colSpan: 1, rowSpan: 3 },
        desktop: { colSpan: 1, rowSpan: 3 },
      },
      logo: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      colors: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      primaryType: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      secondaryType: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      image: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 2, rowSpan: 1 },
        desktop: { colSpan: 2, rowSpan: 1 },
      },
      'ui-preview': {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      editorial: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      product: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      utility: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
    },
  },

  heroCenter: {
    name: 'heroCenter',
    columns: {
      mobile: 2,
      tablet: 3,
      desktop: 3,
    },
    rows: {
      mobile: 5,
      tablet: 3,
      desktop: 3,
    },
    gap: {
      cozy: 16,
      dense: 8,
    },
    rowHeight: {
      cozy: 280,
      dense: 200,
    },
    // 3x3 = 9 cells. Hero in center, tiles around it
    tileSpans: {
      hero: {
        mobile: { colSpan: 2, rowSpan: 2 },
        tablet: { colSpan: 2, rowSpan: 2 },
        desktop: { colSpan: 2, rowSpan: 2 },
      },
      logo: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      colors: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      primaryType: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      secondaryType: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      image: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 2 },
        desktop: { colSpan: 1, rowSpan: 2 },
      },
      'ui-preview': {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      editorial: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 2, rowSpan: 1 },
        desktop: { colSpan: 2, rowSpan: 1 },
      },
      product: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      utility: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
    },
  },

  stacked: {
    name: 'stacked',
    columns: {
      mobile: 2,
      tablet: 3,
      desktop: 3,
    },
    rows: {
      mobile: 6,
      tablet: 4,
      desktop: 4,
    },
    gap: {
      cozy: 16,
      dense: 8,
    },
    rowHeight: {
      cozy: 280,
      dense: 200,
    },
    // 3x4 = 12 cells. Full-width hero at top, tiles stacked below
    tileSpans: {
      hero: {
        mobile: { colSpan: 2, rowSpan: 2 },
        tablet: { colSpan: 3, rowSpan: 1 },
        desktop: { colSpan: 3, rowSpan: 1 },
      },
      logo: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      colors: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      primaryType: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      secondaryType: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      image: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 3, rowSpan: 1 },
        desktop: { colSpan: 3, rowSpan: 1 },
      },
      'ui-preview': {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 2 },
        desktop: { colSpan: 1, rowSpan: 2 },
      },
      editorial: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 2, rowSpan: 2 },
        desktop: { colSpan: 2, rowSpan: 2 },
      },
      product: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      utility: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
    },
  },

  geos: {
    name: 'geos',
    columns: {
      mobile: 2,
      tablet: 3,
      desktop: 3,
    },
    rows: {
      mobile: 6,
      tablet: 3,
      desktop: 3,
    },
    gap: {
      cozy: 10,
      dense: 6,
    },
    rowHeight: {
      cozy: 280,
      dense: 200,
    },
    // Grid layout matching the Geos reference design exactly
    // Desktop: 3 cols x 3 rows = 9 cells
    // Layout:
    // | Hero (1×2) | Image (2×1)              |
    // | Buttons    | Landscape  | Editorial (1×2) |
    // | Logo       | Logo Light | (continues)     |
    tileSpans: {
      hero: {
        mobile: { colSpan: 2, rowSpan: 2 },
        tablet: { colSpan: 1, rowSpan: 2 },
        desktop: { colSpan: 1, rowSpan: 2 },
      },
      logo: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      colors: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      primaryType: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      secondaryType: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      image: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 2, rowSpan: 1 },
        desktop: { colSpan: 2, rowSpan: 1 },
      },
      'ui-preview': {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      editorial: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 2 },
        desktop: { colSpan: 1, rowSpan: 2 },
      },
      landscape: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      product: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      utility: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      fullImage: {
        mobile: { colSpan: 2, rowSpan: 2 },
        tablet: { colSpan: 1, rowSpan: 3 },
        desktop: { colSpan: 1, rowSpan: 3 },
      },
    },
  },

  foodDrink: {
    name: 'foodDrink',
    columns: {
      mobile: 2,
      tablet: 3,
      desktop: 4,
    },
    rows: {
      mobile: 6,
      tablet: 4,
      desktop: 3,
    },
    gap: {
      cozy: 14,
      dense: 10,
    },
    rowHeight: {
      cozy: 260,
      dense: 200,
    },
    tileSpans: {
      hero: {
        mobile: { colSpan: 2, rowSpan: 2 },
        tablet: { colSpan: 2, rowSpan: 2 },
        desktop: { colSpan: 2, rowSpan: 2 },
      },
      image: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 2 },
        desktop: { colSpan: 2, rowSpan: 1 },
      },
      editorial: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 2, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 2 },
      },
      'ui-preview': {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      colors: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 2, rowSpan: 1 },
        desktop: { colSpan: 2, rowSpan: 1 },
      },
      logo: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      product: {
        mobile: { colSpan: 1, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
      menu: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 1, rowSpan: 1 },
        desktop: { colSpan: 1, rowSpan: 1 },
      },
    },
  },
};
