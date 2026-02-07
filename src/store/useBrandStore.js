import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getPaletteById } from "../data/colorPalettes";
import { mapPaletteToBrand } from "../utils/colorMapping";

const DEFAULT_BRAND = {
  typography: {
    primary: "Inter",
    secondary: "Plus Jakarta Sans",
    ui: "Inter",
    scale: 1.25,
    baseSize: 16,
    weightHeadline: "700",
    weightBody: "400",
    letterSpacing: "normal", // tight, normal, wide
  },
  colors: {
    bg: "#FFFFFF",
    text: "#171717",
    primary: "#000000",
    accent: "#555555",
    surface: "#F5F5F5",
    // Multiple surface options for moodboard variety
    surfaces: ["#FFFFFF", "#F5F5F5", "#FAFAFA", "#F0F0F0"],
    // Original palette colors for reference
    paletteColors: [],
  },
  logo: {
    text: "BENTO",
    padding: 16,
    size: 24,
  },
};

// Brand Presets
const BRAND_PRESETS = {
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
  },
};

// Ready-made templates with complete brand + tile layouts
const STARTER_TEMPLATES = [
  {
    name: "Tech Startup",
    brand: {
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
        text: "#171717",
        primary: "#3B82F6",
        accent: "#64748B",
        surface: "#FFFFFF",
        surfaces: ["#FFFFFF", "#F1F5F9", "#E2E8F0", "#DBEAFE"],
        paletteColors: [],
      },
      logo: {
        text: "TECHCO",
        padding: 16,
        size: 24,
      },
    },
    tiles: [
      // Row 1: Logo small, Hero wide, Image tall
      {
        id: "logo-1",
        type: "logo",
        content: {
          label: "Since 2024",
        },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "hero-1",
        type: "hero",
        content: {
          headline: "Build the future with AI",
          subcopy: "Cutting-edge technology for modern businesses",
          cta: "Start Building",
          image:
            "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop",
        },
        colSpan: 2,
        rowSpan: 2,
      },
      {
        id: "image-1",
        type: "image",
        content: {
          image:
            "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop",
          overlayText: "Innovation",
        },
        colSpan: 1,
        rowSpan: 3,
      },
      // Row 2: Editorial under logo
      {
        id: "editorial-1",
        type: "editorial",
        content: {
          headline: "Innovation first",
          body: "We believe technology should empower everyone.",
        },
        colSpan: 1,
        rowSpan: 2,
      },
      // Row 3: UI Preview wide, Product
      {
        id: "ui-preview-1",
        type: "ui-preview",
        content: {
          headerTitle: "Dashboard",
          buttonLabel: "Deploy",
          inputPlaceholder: "Enter API key...",
        },
        colSpan: 2,
        rowSpan: 1,
      },
    ],
  },
  {
    name: "Luxury Retail",
    brand: {
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
        text: "MAISON",
        padding: 20,
        size: 22,
      },
    },
    tiles: [
      // Asymmetric luxury layout - 4 cols x 3 rows
      {
        id: "image-1",
        type: "image",
        content: {
          image:
            "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=1000&auto=format&fit=crop",
          overlayText: "Spring 2026",
        },
        colSpan: 2,
        rowSpan: 2,
      },
      {
        id: "logo-1",
        type: "logo",
        content: {
          label: "Est. 1923",
        },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "product-1",
        type: "product",
        content: {
          label: "Signature Piece",
          price: "$2,400",
          image:
            "https://images.unsplash.com/photo-1591561954555-607968c989ab?q=80&w=500&auto=format&fit=crop",
        },
        colSpan: 1,
        rowSpan: 2,
      },
      {
        id: "editorial-1",
        type: "editorial",
        content: {
          headline: "Heritage meets modernity",
          body: "Each piece tells a story of craftsmanship.",
        },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "hero-1",
        type: "hero",
        content: {
          headline: "Timeless Elegance",
          subcopy: "Handcrafted pieces for the modern connoisseur",
          cta: "Shop Collection",
          image:
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop",
        },
        colSpan: 2,
        rowSpan: 1,
      },
      {
        id: "utility-1",
        type: "utility",
        content: {
          headline: "Services",
          items: ["Personal Styling", "Custom Orders", "Lifetime Warranty"],
        },
        colSpan: 1,
        rowSpan: 1,
      },
    ],
  },
  {
    name: "Creative Studio",
    brand: {
      typography: {
        primary: "Bricolage Grotesque",
        secondary: "Inter",
        ui: "Inter",
        scale: 1.3,
        baseSize: 16,
        weightHeadline: "800",
        weightBody: "400",
        letterSpacing: "normal",
      },
      colors: {
        bg: "#0A0A0A",
        text: "#FAFAFA",
        primary: "#F97316",
        accent: "#D946EF",
        surface: "#1A1A1A",
        surfaces: ["#1A1A1A", "#262626", "#171717", "#2D2D2D"],
        paletteColors: [],
      },
      logo: {
        text: "PIXEL",
        padding: 18,
        size: 26,
      },
    },
    tiles: [
      {
        id: "hero-1",
        type: "hero",
        content: {
          headline: "We craft digital experiences",
          subcopy: "Bold ideas. Beautiful execution.",
          cta: "View Work",
          image:
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
        },
        colSpan: 3,
        rowSpan: 1,
      },
      {
        id: "logo-1",
        type: "logo",
        content: {
          label: "Studio",
        },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "image-1",
        type: "image",
        content: {
          image:
            "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1000&auto=format&fit=crop",
          overlayText: "Creative Direction",
        },
        colSpan: 2,
        rowSpan: 2,
      },
      {
        id: "utility-1",
        type: "utility",
        content: {
          headline: "What We Do",
          items: ["Brand Identity", "Web Design", "Motion Graphics"],
        },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "editorial-1",
        type: "editorial",
        content: {
          headline: "Design is thinking made visual",
          body: "We push pixels and break boundaries to create work that matters.",
        },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "ui-preview-1",
        type: "ui-preview",
        content: {
          headerTitle: "Interface",
          buttonLabel: "Launch",
          inputPlaceholder: "Type something...",
        },
        colSpan: 2,
        rowSpan: 1,
      },
    ],
  },
  {
    name: "Wellness Brand",
    brand: {
      typography: {
        primary: "Plus Jakarta Sans",
        secondary: "Inter",
        ui: "Inter",
        scale: 1.25,
        baseSize: 16,
        weightHeadline: "600",
        weightBody: "400",
        letterSpacing: "normal",
      },
      colors: {
        bg: "#F0FDF4",
        text: "#171717",
        primary: "#16A34A",
        accent: "#86EFAC",
        surface: "#FFFFFF",
        surfaces: ["#FFFFFF", "#DCFCE7", "#BBF7D0", "#F0FDF4"],
        paletteColors: [],
      },
      logo: {
        text: "VIDA",
        padding: 16,
        size: 24,
      },
    },
    tiles: [
      // Row 1: Image wide + Logo + Hero tall (starts)
      {
        id: "image-1",
        type: "image",
        content: {
          image:
            "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop",
          overlayText: "Mindfulness",
        },
        colSpan: 2,
        rowSpan: 2,
      },
      {
        id: "logo-1",
        type: "logo",
        content: {
          label: "Wellness",
        },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "hero-1",
        type: "hero",
        content: {
          headline: "Your wellness journey",
          subcopy: "Natural, sustainable, transformative",
          cta: "Begin Today",
          image:
            "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop",
        },
        colSpan: 1,
        rowSpan: 3,
      },
      // Row 2: Editorial
      {
        id: "editorial-1",
        type: "editorial",
        content: {
          headline: "Holistic healing",
          body: "Treating the whole person—mind, body, and spirit.",
        },
        colSpan: 1,
        rowSpan: 1,
      },
      // Row 3: Utility + Product + UI
      {
        id: "utility-1",
        type: "utility",
        content: {
          headline: "Benefits",
          items: ["100% Natural", "Certified Organic", "Carbon Neutral"],
        },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "product-1",
        type: "product",
        content: {
          label: "Wellness Kit",
          price: "$89",
          image:
            "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=500&auto=format&fit=crop",
        },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "ui-preview-1",
        type: "ui-preview",
        content: {
          headerTitle: "Your Plan",
          buttonLabel: "Start",
          inputPlaceholder: "Enter your goal...",
        },
        colSpan: 1,
        rowSpan: 1,
      },
    ],
  },
  {
    name: "Minimalist Portfolio",
    brand: {
      typography: {
        primary: "Inter",
        secondary: "JetBrains Mono",
        ui: "Inter",
        scale: 1.2,
        baseSize: 16,
        weightHeadline: "700",
        weightBody: "400",
        letterSpacing: "tight",
      },
      colors: {
        bg: "#FFFFFF",
        text: "#171717",
        primary: "#000000",
        accent: "#666666",
        surface: "#F5F5F5",
        surfaces: ["#F5F5F5", "#FAFAFA", "#E5E5E5", "#FFFFFF"],
        paletteColors: [],
      },
      logo: {
        text: "JD",
        padding: 12,
        size: 28,
      },
    },
    tiles: [
      {
        id: "hero-1",
        type: "hero",
        content: {
          headline: "Designer & Developer",
          subcopy: "Building digital products with precision",
          cta: "Contact",
          image:
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
        },
        colSpan: 2,
        rowSpan: 1,
      },
      {
        id: "image-1",
        type: "image",
        content: {
          image:
            "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop",
          overlayText: "Work",
        },
        colSpan: 1,
        rowSpan: 2,
      },
      {
        id: "logo-1",
        type: "logo",
        content: {
          label: "Portfolio",
        },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "editorial-1",
        type: "editorial",
        content: {
          headline: "About",
          body: "10+ years crafting interfaces that people love to use. Currently based in SF.",
        },
        colSpan: 2,
        rowSpan: 1,
      },
      {
        id: "utility-1",
        type: "utility",
        content: {
          headline: "Skills",
          items: ["React", "TypeScript", "Figma"],
        },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "product-1",
        type: "product",
        content: {
          label: "Latest",
          price: "2026",
          image:
            "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=500&auto=format&fit=crop",
        },
        colSpan: 2,
        rowSpan: 1,
      },
      {
        id: "ui-preview-1",
        type: "ui-preview",
        content: {
          headerTitle: "Projects",
          buttonLabel: "View",
          inputPlaceholder: "Search projects...",
        },
        colSpan: 1,
        rowSpan: 1,
      },
    ],
  },
];

// Color harmony helpers
const hexToHSL = (hex) => {
  // Support both 3-char (#FFF) and 6-char (#FFFFFF) hex codes
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    // Try 3-character shorthand
    const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
    if (shorthand) {
      result = [
        null,
        shorthand[1] + shorthand[1],
        shorthand[2] + shorthand[2],
        shorthand[3] + shorthand[3],
      ];
    } else {
      return { h: 0, s: 0, l: 0 };
    }
  }

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
      default:
        h = 0;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToHex = (h, s, l) => {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
};

export const getColorHarmony = (baseColor) => {
  const hsl = hexToHSL(baseColor);
  return {
    analogous: [
      hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
      hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
    ],
    complementary: hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
    triadic: [
      hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
      hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
    ],
  };
};

// Contrast calculation (WCAG)
export const getContrastRatio = (color1, color2) => {
  const getLuminance = (hex) => {
    // Support both 3-char (#FFF) and 6-char (#FFFFFF) hex codes
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      // Try 3-character shorthand
      const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
      if (shorthand) {
        result = [
          null,
          shorthand[1] + shorthand[1],
          shorthand[2] + shorthand[2],
          shorthand[3] + shorthand[3],
        ];
      } else {
        return 0;
      }
    }

    const rgb = [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255,
    ].map((val) => {
      return val <= 0.03928
        ? val / 12.92
        : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

// Export functions
export const exportAsCSS = (brand) => {
  const letterSpacingMap = {
    tight: "-0.02em",
    normal: "0",
    wide: "0.05em",
  };

  return `:root {
  /* Typography */
  --font-primary: ${brand.typography.primary};
  --font-secondary: ${brand.typography.secondary};
  --font-ui: ${brand.typography.ui};
  --type-scale: ${brand.typography.scale};
  --type-base-size: ${brand.typography.baseSize}px;
  --type-letter-spacing: ${letterSpacingMap[brand.typography.letterSpacing] || "0"};
  
  /* Colors */
  --color-bg: ${brand.colors.bg};
  --color-text: ${brand.colors.text};
  --color-primary: ${brand.colors.primary};
  --color-accent: ${brand.colors.accent};
  --color-surface: ${brand.colors.surface};
  
  /* Logo */
  --logo-text: "${brand.logo.text}";
  --logo-padding: ${brand.logo.padding}px;
  --logo-size: ${brand.logo.size}px;
}`;
};

export const exportAsJSON = (brand) => {
  return JSON.stringify(brand, null, 2);
};

const INITIAL_TILES = [
  {
    id: "hero-1",
    type: "hero",
    content: {
      headline: "The future of brand storytelling",
      subcopy: "Create cohesive brand worlds in minutes, not weeks.",
      cta: "Get Started",
      image:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
    },
    colSpan: 2,
    rowSpan: 2,
  },
  {
    id: "image-1",
    type: "image",
    content: {
      image:
        "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop",
      overlayText: "Atmosphere",
    },
    colSpan: 1,
    rowSpan: 2,
  },
  {
    id: "editorial-1",
    type: "editorial",
    content: {
      headline: "Design with intention",
      body: "Every element in our system is designed to work together, ensuring your brand stays consistent across all touchpoints.",
    },
    colSpan: 1,
    rowSpan: 1,
  },
  {
    id: "product-1",
    type: "product",
    content: {
      label: "Core Module",
      price: "$299",
      image:
        "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=500&auto=format&fit=crop",
    },
    colSpan: 2,
    rowSpan: 1,
  },
  {
    id: "ui-preview-1",
    type: "ui-preview",
    content: {
      headerTitle: "Dashboard",
      buttonLabel: "Submit",
      inputPlaceholder: "Search...",
    },
    colSpan: 1,
    rowSpan: 1,
  },
  {
    id: "utility-1",
    type: "utility",
    content: {
      headline: "Key Features",
      items: ["Responsive Grid", "Live Tokens", "Undo/Redo Support"],
    },
    colSpan: 1,
    rowSpan: 1,
  },
  {
    id: "logo-1",
    type: "logo",
    content: {
      label: "Brand Identity",
    },
    colSpan: 1,
    rowSpan: 1,
  },
];

export const useBrandStore = create(
  persist(
    (set, get) => ({
      brand: DEFAULT_BRAND,
      tiles: INITIAL_TILES,
      focusedTileId: null,
      darkModePreview: false,
      fontPreview: null, // { font: string, target: 'primary' | 'secondary' }

      // Theme state
      theme: 'system', // 'light' | 'dark' | 'system'
      resolvedTheme: 'light', // Computed theme based on system preference or explicit choice

      // History
      history: {
        past: [],
        future: [],
      },

  setFocusedTile: (id) => set({ focusedTileId: id }),

  toggleDarkMode: () =>
    set((state) => ({ darkModePreview: !state.darkModePreview })),

  setFontPreview: (font, target) =>
    set({ fontPreview: font ? { font, target } : null }),

  setTheme: (theme) => set({ theme }),

  setResolvedTheme: (resolved) => set({ resolvedTheme: resolved }),

  loadRandomTemplate: () => {
    const randomTemplate =
      STARTER_TEMPLATES[Math.floor(Math.random() * STARTER_TEMPLATES.length)];
    set({
      brand: randomTemplate.brand,
      tiles: randomTemplate.tiles,
      history: {
        past: [],
        future: [],
      },
    });
  },

  loadPreset: (presetName) => {
    const { brand, tiles, history } = get();
    const preset = BRAND_PRESETS[presetName];
    if (!preset) return;

    set({
      brand: preset,
      history: {
        past: [...history.past, { brand, tiles }],
        future: [],
      },
    });
  },

  applyPalette: (paletteId) => {
    const { brand, tiles, history } = get();
    const palette = getPaletteById(paletteId);
    if (!palette) return;

    const colorMapping = mapPaletteToBrand(palette.colors);

    set({
      brand: {
        ...brand,
        colors: colorMapping,
      },
      history: {
        past: [...history.past, { brand, tiles }],
        future: [],
      },
    });
  },

  swapTileType: (tileId, newType) => {
    const { brand, tiles, history } = get();
    const tile = tiles.find((t) => t.id === tileId);
    if (!tile) return;

    // Default content based on type
    const defaultContent = {
      hero: {
        headline: "New Hero",
        subcopy: "Hero subcopy",
        cta: "Click here",
      },
      editorial: { headline: "New Editorial", body: "Editorial body text" },
      product: {
        label: "Product",
        price: "$99",
        image:
          "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=500",
      },
      "ui-preview": {
        headerTitle: "UI",
        buttonLabel: "Submit",
        inputPlaceholder: "Search...",
      },
      image: {
        image:
          "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000",
        overlayText: "Image",
      },
      utility: { headline: "Features", items: ["Item 1", "Item 2", "Item 3"] },
      logo: { label: "Brand" },
    };

    const newTiles = tiles.map((t) =>
      t.id === tileId
        ? { ...t, type: newType, content: defaultContent[newType] || {} }
        : t,
    );

    set({
      tiles: newTiles,
      history: {
        past: [...history.past, { brand, tiles }],
        future: [],
      },
    });
  },

  // Actions with undo
  updateBrand: (newBrand, isCommit = true) => {
    const { brand, history } = get();

    if (isCommit) {
      set({
        brand: { ...brand, ...newBrand },
        history: {
          past: [...history.past, { brand, tiles: get().tiles }],
          future: [],
        },
      });
    } else {
      set({ brand: { ...brand, ...newBrand } });
    }
  },

  updateTile: (tileId, newContent, isCommit = true) => {
    const { brand, tiles, history } = get();
    const newTiles = tiles.map((t) =>
      t.id === tileId ? { ...t, content: { ...t.content, ...newContent } } : t,
    );

    if (isCommit) {
      set({
        tiles: newTiles,
        history: {
          past: [...history.past, { brand, tiles }],
          future: [],
        },
      });
    } else {
      set({ tiles: newTiles });
    }
  },

  undo: () => {
    const { history, brand, tiles } = get();
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, history.past.length - 1);

    set({
      brand: previous.brand,
      tiles: previous.tiles,
      history: {
        past: newPast,
        future: [{ brand, tiles }, ...history.future],
      },
    });
  },

  redo: () => {
    const { history, brand, tiles } = get();
    if (history.future.length === 0) return;

    const next = history.future[0];
    const newFuture = history.future.slice(1);

    set({
      brand: next.brand,
      tiles: next.tiles,
      history: {
        past: [...history.past, { brand, tiles }],
        future: newFuture,
      },
    });
  },
    }),
    {
      name: 'brand-store',
      partialize: (state) => ({
        brand: state.brand,
        tiles: state.tiles,
        theme: state.theme,
      }),
    }
  )
);
