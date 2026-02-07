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
      tablet: 4,
      desktop: 4,
    },
    rows: {
      mobile: 6,
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
    tileSpans: {
      hero: {
        mobile: { colSpan: 2, rowSpan: 2 },
        tablet: { colSpan: 2, rowSpan: 2 },
        desktop: { colSpan: 2, rowSpan: 2 },
      },
      logo: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 2, rowSpan: 1 },
        desktop: { colSpan: 2, rowSpan: 1 },
      },
      colors: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 2, rowSpan: 2 },
        desktop: { colSpan: 2, rowSpan: 2 },
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
      imagery: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 2, rowSpan: 1 },
        desktop: { colSpan: 2, rowSpan: 1 },
      },
      uiPreview: {
        mobile: { colSpan: 2, rowSpan: 2 },
        tablet: { colSpan: 2, rowSpan: 2 },
        desktop: { colSpan: 2, rowSpan: 2 },
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

  heroLeft: {
    name: 'heroLeft',
    columns: {
      mobile: 2,
      tablet: 4,
      desktop: 4,
    },
    rows: {
      mobile: 6,
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
    tileSpans: {
      hero: {
        mobile: { colSpan: 2, rowSpan: 3 },
        tablet: { colSpan: 2, rowSpan: 3 },
        desktop: { colSpan: 2, rowSpan: 3 },
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
      imagery: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 2, rowSpan: 1 },
        desktop: { colSpan: 2, rowSpan: 1 },
      },
      uiPreview: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 2, rowSpan: 2 },
        desktop: { colSpan: 2, rowSpan: 2 },
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

  heroCenter: {
    name: 'heroCenter',
    columns: {
      mobile: 2,
      tablet: 4,
      desktop: 4,
    },
    rows: {
      mobile: 6,
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
      imagery: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 2, rowSpan: 2 },
        desktop: { colSpan: 2, rowSpan: 2 },
      },
      uiPreview: {
        mobile: { colSpan: 2, rowSpan: 2 },
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

  stacked: {
    name: 'stacked',
    columns: {
      mobile: 2,
      tablet: 4,
      desktop: 4,
    },
    rows: {
      mobile: 8,
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
    tileSpans: {
      hero: {
        mobile: { colSpan: 2, rowSpan: 2 },
        tablet: { colSpan: 4, rowSpan: 1 },
        desktop: { colSpan: 4, rowSpan: 1 },
      },
      logo: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 2, rowSpan: 1 },
        desktop: { colSpan: 2, rowSpan: 1 },
      },
      colors: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 2, rowSpan: 1 },
        desktop: { colSpan: 2, rowSpan: 1 },
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
      imagery: {
        mobile: { colSpan: 2, rowSpan: 1 },
        tablet: { colSpan: 4, rowSpan: 1 },
        desktop: { colSpan: 4, rowSpan: 1 },
      },
      uiPreview: {
        mobile: { colSpan: 2, rowSpan: 2 },
        tablet: { colSpan: 2, rowSpan: 1 },
        desktop: { colSpan: 2, rowSpan: 1 },
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
};
