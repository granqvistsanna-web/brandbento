/**
 * Brand Presets - Pre-configured brand styles for quick start
 *
 * These presets provide complete brand configurations that users can
 * apply with one click to quickly establish a visual direction.
 */

// Local type definitions to avoid circular dependency with useBrandStore
interface Typography {
  primary: string;
  secondary: string;
  ui: string;
  scale: number;
  baseSize: number;
  weightHeadline: string;
  weightBody: string;
  letterSpacing: "tight" | "normal" | "wide";
}

interface Colors {
  bg: string;
  text: string;
  primary: string;
  accent: string;
  surface: string;
  surfaces: string[];
  paletteColors: string[];
}

interface Logo {
  text: string;
  image?: string | null;
  padding: number;
  size: number;
}

interface Imagery {
  url: string;
  style: "default" | "grayscale" | "tint";
  overlay: number;
}

interface Brand {
  typography: Typography;
  colors: Colors;
  logo: Logo;
  imagery: Imagery;
}

/**
 * Default brand configuration - clean minimal aesthetic
 */
export const DEFAULT_BRAND: Brand = {
  typography: {
    primary: "Inter",
    secondary: "Plus Jakarta Sans",
    ui: "Inter",
    scale: 1.25,
    baseSize: 16,
    weightHeadline: "700",
    weightBody: "400",
    letterSpacing: "normal",
  },
  colors: {
    bg: "#FFFFFF",
    text: "#171717",
    primary: "#000000",
    accent: "#555555",
    surface: "#F5F5F5",
    surfaces: ["#FFFFFF", "#F5F5F5", "#FAFAFA", "#F0F0F0"],
    paletteColors: [],
  },
  logo: {
    text: "BENTO",
    image: null,
    padding: 16,
    size: 24,
  },
  imagery: {
    url: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000&auto=format&fit=crop",
    style: "default",
    overlay: 0,
  },
  ui: {
    buttonRadius: 10,
    buttonStyle: 'filled',
    buttonColor: null,
  },
};

/**
 * Named brand presets for different industry verticals
 */
export const BRAND_PRESETS: Record<string, Brand> = {
  default: DEFAULT_BRAND,

  techStartup: {
    typography: {
      primary: "Sora",
      secondary: "Inter",
      ui: "Inter",
      scale: 1.2,
      baseSize: 16,
      weightHeadline: "700",
      weightBody: "400",
      letterSpacing: "normal",
    },
    colors: {
      bg: "#F5F7FA",
      text: "#0F172A",
      primary: "#3B82F6",
      accent: "#64748B",
      surface: "#FFFFFF",
      surfaces: ["#FFFFFF", "#F1F5F9", "#E2E8F0", "#CBD5E1"],
      paletteColors: [],
    },
    logo: {
      text: "TECH",
      padding: 16,
      size: 24,
    },
    imagery: DEFAULT_BRAND.imagery,
    ui: DEFAULT_BRAND.ui,
  },

  luxuryRetail: {
    typography: {
      primary: "Playfair Display",
      secondary: "Montserrat",
      ui: "Montserrat",
      scale: 1.33,
      baseSize: 16,
      weightHeadline: "700",
      weightBody: "400",
      letterSpacing: "wide",
    },
    colors: {
      bg: "#FDFCFA",
      text: "#1C1917",
      primary: "#78716C",
      accent: "#A8A29E",
      surface: "#F5F5F4",
      surfaces: ["#F5F5F4", "#FAFAF9", "#E7E5E4", "#D6D3D1"],
      paletteColors: [],
    },
    logo: {
      text: "LUXE",
      padding: 20,
      size: 22,
    },
    imagery: DEFAULT_BRAND.imagery,
    ui: DEFAULT_BRAND.ui,
  },

  communityNonprofit: {
    typography: {
      primary: "Plus Jakarta Sans",
      secondary: "Plus Jakarta Sans",
      ui: "Plus Jakarta Sans",
      scale: 1.25,
      baseSize: 16,
      weightHeadline: "700",
      weightBody: "400",
      letterSpacing: "normal",
    },
    colors: {
      bg: "#FFFFFF",
      text: "#171717",
      primary: "#0EA5E9",
      accent: "#7DD3FC",
      surface: "#F0F9FF",
      surfaces: ["#F0F9FF", "#E0F2FE", "#BAE6FD", "#FFFFFF"],
      paletteColors: [],
    },
    logo: {
      text: "UNITE",
      padding: 16,
      size: 24,
    },
    imagery: DEFAULT_BRAND.imagery,
    ui: DEFAULT_BRAND.ui,
  },

  creativeStudio: {
    typography: {
      primary: "Bricolage Grotesque",
      secondary: "Inter",
      ui: "Inter",
      scale: 1.3,
      baseSize: 16,
      weightHeadline: "700",
      weightBody: "400",
      letterSpacing: "normal",
    },
    colors: {
      bg: "#FAFAFA",
      text: "#171717",
      primary: "#F97316",
      accent: "#D946EF",
      surface: "#FFFFFF",
      surfaces: ["#FFFFFF", "#FFF7ED", "#FEFCE8", "#FAF5FF"],
      paletteColors: [],
    },
    logo: {
      text: "STUDIO",
      padding: 18,
      size: 26,
    },
    imagery: DEFAULT_BRAND.imagery,
    ui: DEFAULT_BRAND.ui,
  },

  foodDrink: {
    typography: {
      primary: "Oswald",
      secondary: "Montserrat",
      ui: "Montserrat",
      scale: 1.25,
      baseSize: 16,
      weightHeadline: "700",
      weightBody: "400",
      letterSpacing: "wide",
    },
    colors: {
      bg: "#F7F2EA",
      text: "#1E1C2E",
      primary: "#2D2A57",
      accent: "#9A79E8",
      surface: "#E3DBC8",
      surfaces: ["#E3DBC8", "#9A79E8", "#2D2A57", "#F2EDE4"],
      paletteColors: [],
    },
    logo: {
      text: "SAVOR SPIRE",
      padding: 18,
      size: 22,
    },
    imagery: {
      url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop",
      style: "default",
      overlay: 0,
    },
    ui: DEFAULT_BRAND.ui,
  },
};

/**
 * Get a preset by name
 */
export const getPresetByName = (name: string): Brand | undefined =>
  BRAND_PRESETS[name];

/**
 * List of available preset names
 */
export const PRESET_NAMES = Object.keys(BRAND_PRESETS);
