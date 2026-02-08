/**
 * Brand Store - Central State Management for Brand Bento
 *
 * This Zustand store manages all brand-related state for the application,
 * including typography, colors, logo, imagery, and tile content. It provides
 * a single source of truth that all components subscribe to for reactive updates.
 *
 * ## Architecture
 *
 * The store uses Zustand with the `persist` middleware for localStorage
 * persistence, ensuring brand state survives page refreshes. State is
 * partitioned so only essential data (brand, tiles, theme) is persisted.
 *
 * ## History Management (Undo/Redo)
 *
 * Implements a manual history stack pattern:
 * - `past`: Array of previous states (for undo)
 * - `future`: Array of undone states (for redo)
 *
 * Actions that modify brand/tiles can optionally push to history via
 * the `isCommit` parameter (default: true). Use `isCommit: false` for
 * live previews that shouldn't create undo points.
 *
 * ## Usage
 *
 * @example
 * // Subscribe to specific state slices (recommended for performance)
 * const colors = useBrandStore((state) => state.brand.colors);
 * const updateBrand = useBrandStore((state) => state.updateBrand);
 *
 * // Update with history tracking (creates undo point)
 * updateBrand({ typography: { ...typography, primary: 'Roboto' } });
 *
 * // Update without history (for live previews)
 * updateBrand({ typography: { ...typography, primary: 'Roboto' } }, false);
 *
 * @module store/useBrandStore
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getPaletteById } from "../data/colorPalettes";
import { mapPaletteToBrand } from "../utils/colorMapping";
import { DEFAULT_BRAND, BRAND_PRESETS } from "../data/brandPresets";
import { INITIAL_TILES } from "../data/tileDefaults";
import { getPlacementTileId, getPlacementTileType } from "../config/placements";

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Typography configuration for the brand.
 * Defines font families, sizing scale, and text styling preferences.
 */
export interface Typography {
  /** Primary font family for headlines and emphasis (e.g., "Playfair Display") */
  primary: string;
  /** Secondary font family for body text (e.g., "Inter") */
  secondary: string;
  /** UI font family for buttons, labels, inputs (e.g., "Inter") */
  ui: string;
  /** Type scale ratio for heading sizes (e.g., 1.25 = Major Third) */
  scale: number;
  /** Base font size in pixels (typically 16) */
  baseSize: number;
  /** Font weight for headlines (e.g., "700", "bold") */
  weightHeadline: string;
  /** Font weight for body text (e.g., "400", "normal") */
  weightBody: string;
  /** Letter spacing preference for overall brand feel */
  letterSpacing: "tight" | "normal" | "wide";
}

/**
 * Semantic color roles for the brand.
 * Maps extracted palette colors to functional design roles following
 * the 60-30-10 color rule for balanced visual hierarchy.
 */
export interface Colors {
  /** Background color (60% usage) - page/canvas background */
  bg: string;
  /** Text color - primary body text, ensures WCAG contrast with bg */
  text: string;
  /** Primary brand color (10% usage) - CTAs, links, key accents */
  primary: string;
  /** Accent color - secondary emphasis, complementary to primary */
  accent: string;
  /** Default surface color (30% usage) - cards, tiles, containers */
  surface: string;
  /** Array of surface color variations for moodboard variety */
  surfaces: string[];
  /** Original extracted palette colors before semantic mapping */
  paletteColors: string[];
}

/**
 * Logo display configuration.
 * Controls how the brand mark/wordmark appears in the identity tile.
 */
export interface Logo {
  /** Logo text/wordmark (e.g., "BENTO", "LUXE") */
  text: string;
  /** Padding around logo in pixels */
  padding: number;
  /** Font size for text-based logos in pixels */
  size: number;
}

/**
 * Hero imagery configuration.
 * Defines the featured image and any treatments applied to it.
 */
export interface Imagery {
  /** Image URL (can be external URL or data URI) */
  url: string;
  /** Visual treatment applied to the image */
  style: "default" | "grayscale" | "tint";
  /** Overlay opacity percentage (0-100) */
  overlay: number;
}

/**
 * Complete brand configuration.
 * Aggregates all brand elements that define the visual identity.
 */
export interface Brand {
  /** Typography settings (fonts, scale, weights) */
  typography: Typography;
  /** Color palette with semantic roles */
  colors: Colors;
  /** Logo/wordmark configuration */
  logo: Logo;
  /** Hero imagery settings */
  imagery: Imagery;
}

/**
 * Content fields available for tiles.
 * Different tile types use different subsets of these fields.
 * All fields are optional to support flexible tile configurations.
 */
export interface TileContent {
  /** Main headline text (hero, editorial tiles) */
  headline?: string;
  /** Supporting text below headline (hero tiles) */
  subcopy?: string;
  /** Body copy text (editorial tiles) */
  body?: string;
  /** Call-to-action button text (hero tiles) */
  cta?: string;
  /** Short label text (product, logo tiles) */
  label?: string;
  /** Price display (product tiles) */
  price?: string;
  /** Image URL for tile background/content */
  image?: string;
  /** Text overlay on images (image tiles) */
  overlayText?: string;
  /** List items (utility tiles with bullet points) */
  items?: string[];
  /** Header/title for UI preview tiles */
  headerTitle?: string;
  /** Button label in UI preview tiles */
  buttonLabel?: string;
  /** Placeholder text for input fields in UI preview */
  inputPlaceholder?: string;
  /** Social post handle/username */
  socialHandle?: string;
  /** Social post caption text */
  socialCaption?: string;
  /** Social post likes label */
  socialLikes?: string;
  /** Social post sponsored label */
  socialSponsored?: string;
  /** Social post aspect ratio */
  socialAspect?: string;
}

/**
 * Individual tile configuration within the bento grid.
 * Tiles are the building blocks of the brand moodboard.
 */
export interface Tile {
  /** Unique identifier for the tile */
  id: string;
  /** Tile type determining render component (hero, editorial, product, etc.) */
  type: string;
  /** Content fields specific to this tile */
  content: TileContent;
  /** Number of grid columns this tile spans */
  colSpan: number;
  /** Number of grid rows this tile spans */
  rowSpan: number;
  /** Index into brand.colors.surfaces array for tile background */
  surfaceIndex?: number;
}

/**
 * Snapshot of state for history tracking.
 * Captures both brand and tiles for complete undo/redo.
 */
export interface HistoryState {
  /** Brand configuration at this point in history */
  brand: Brand;
  /** Tile configurations at this point in history */
  tiles: Tile[];
  /** Surface overrides at this point in history */
  tileSurfaces: Record<string, number | undefined>;
  /** Placement-specific content overrides */
  placementContent: Record<string, TileContent>;
}

/**
 * History stack for undo/redo functionality.
 * Uses a dual-stack pattern for bidirectional navigation.
 */
export interface History {
  /** Stack of previous states (most recent at end) */
  past: HistoryState[];
  /** Stack of undone states (for redo, most recent at start) */
  future: HistoryState[];
}

const createDefaultBrand = (): Brand => ({
  typography: { ...DEFAULT_BRAND.typography },
  colors: {
    ...DEFAULT_BRAND.colors,
    surfaces: [...DEFAULT_BRAND.colors.surfaces],
    paletteColors: [...DEFAULT_BRAND.colors.paletteColors],
  },
  logo: { ...DEFAULT_BRAND.logo },
  imagery: { ...DEFAULT_BRAND.imagery },
});

const mergeBrand = (source?: Partial<Brand> | null): Brand => {
  const base = createDefaultBrand();

  if (!source) return base;

  return {
    typography: { ...base.typography, ...(source.typography ?? {}) },
    colors: {
      ...base.colors,
      ...(source.colors ?? {}),
      surfaces: source.colors?.surfaces ?? base.colors.surfaces,
      paletteColors: source.colors?.paletteColors ?? base.colors.paletteColors,
    },
    logo: { ...base.logo, ...(source.logo ?? {}) },
    imagery: { ...base.imagery, ...(source.imagery ?? {}) },
  };
};

/**
 * Maximum number of history entries to keep.
 * Prevents unbounded memory growth from undo/redo operations.
 */
const MAX_HISTORY = 50;

/**
 * Helper to push a new state to history while respecting MAX_HISTORY limit.
 */
const pushToHistory = (
  currentPast: HistoryState[],
  newEntry: HistoryState
): HistoryState[] => [...currentPast, newEntry].slice(-MAX_HISTORY);

const shallowEqualArray = (a?: unknown[], b?: unknown[]): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const hasBrandChanges = (brand: Brand, newBrand: Partial<Brand>): boolean => {
  if (!newBrand || Object.keys(newBrand).length === 0) return false;

  if (newBrand.typography) {
    const current = brand.typography;
    for (const key of Object.keys(newBrand.typography) as (keyof Typography)[]) {
      if (newBrand.typography[key] !== current[key]) return true;
    }
  }

  if (newBrand.logo) {
    const current = brand.logo;
    for (const key of Object.keys(newBrand.logo) as (keyof Logo)[]) {
      if (newBrand.logo[key] !== current[key]) return true;
    }
  }

  if (newBrand.imagery) {
    const current = brand.imagery;
    for (const key of Object.keys(newBrand.imagery) as (keyof Imagery)[]) {
      if (newBrand.imagery[key] !== current[key]) return true;
    }
  }

  if (newBrand.colors) {
    const current = brand.colors;
    for (const key of Object.keys(newBrand.colors) as (keyof Colors)[]) {
      if (key === 'surfaces') {
        if (!shallowEqualArray(newBrand.colors.surfaces, current.surfaces)) return true;
        continue;
      }
      if (key === 'paletteColors') {
        if (!shallowEqualArray(newBrand.colors.paletteColors, current.paletteColors)) return true;
        continue;
      }
      if (newBrand.colors[key] !== current[key]) return true;
    }
  }

  // Top-level direct updates (rare in this codebase)
  const topLevelKeys = Object.keys(newBrand) as (keyof Brand)[];
  return topLevelKeys.some((key) => {
    if (key === 'typography' || key === 'colors' || key === 'logo' || key === 'imagery') {
      return false;
    }
    return (newBrand[key] as unknown) !== (brand[key] as unknown);
  });
};

const hasTileContentChanges = (
  content: TileContent,
  newContent: Partial<TileContent>
): boolean => {
  return Object.keys(newContent).some((key) => {
    const typedKey = key as keyof TileContent;
    return newContent[typedKey] !== content[typedKey];
  });
};

/**
 * Temporary font preview state.
 * Used for hover-preview of fonts before committing selection.
 */
export interface FontPreview {
  /** Font family name being previewed */
  font: string;
  /** Which typography slot to preview in (primary or secondary) */
  target: "primary" | "secondary";
}

/**
 * Complete store interface with state and actions.
 *
 * ## State Properties
 * - `brand`: Current brand configuration (typography, colors, logo, imagery)
 * - `tiles`: Array of tile configurations for the bento grid
 * - `focusedTileId`: Currently selected tile for editing (null if none)
 * - `fontPreview`: Temporary font being previewed on hover
 * - `theme`: User's theme preference (light/dark/system)
 * - `resolvedTheme`: Computed theme after applying system preference
 * - `history`: Undo/redo state stacks
 * - `tileSurfaces`: Per-tile surface color overrides
 *
 * ## Actions
 * Actions are methods that modify state. Most accept an optional `isCommit`
 * parameter to control whether the change creates an undo point.
 */
export interface BrandStore {
  // ─────────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────────

  /** Current brand configuration */
  brand: Brand;
  /** Array of tile configurations in the bento grid */
  tiles: Tile[];
  /** ID of the currently focused/selected tile (null if none) */
  focusedTileId: string | null;
  /** @deprecated Legacy dark mode preview toggle - use theme instead */
  darkModePreview: boolean;
  /** Temporary font preview state for hover effects */
  fontPreview: FontPreview | null;
  /** User's theme preference */
  theme: "light" | "dark" | "system";
  /** Computed theme after resolving "system" preference */
  resolvedTheme: "light" | "dark";
  /** Undo/redo history stacks */
  history: History;
  /** Surface index overrides by placement ID (e.g., 'a', 'b', 'hero') */
  tileSurfaces: Record<string, number | undefined>;
  /** Placement-specific content overrides (e.g., social post content) */
  placementContent: Record<string, TileContent>;

  // ─────────────────────────────────────────────────────────────────
  // UI State Actions
  // ─────────────────────────────────────────────────────────────────

  /** Sets the currently focused tile for editing */
  setFocusedTile: (id: string | null) => void;
  /** @deprecated Use setTheme instead */
  toggleDarkMode: () => void;
  /** Sets temporary font preview for hover effects */
  setFontPreview: (font: string | null, target?: "primary" | "secondary") => void;
  /** Sets the user's theme preference */
  setTheme: (theme: "light" | "dark" | "system") => void;
  /** Sets resolved theme (called by useTheme when system preference changes) */
  setResolvedTheme: (resolved: "light" | "dark") => void;

  // ─────────────────────────────────────────────────────────────────
  // Template & Preset Actions
  // ─────────────────────────────────────────────────────────────────

  /** Loads a random starter template (clears history) */
  loadRandomTemplate: () => void;
  /** Loads a named brand preset (typography + colors only) */
  loadPreset: (presetName: string) => void;
  /** Applies a color palette, mapping to semantic roles */
  applyPalette: (paletteId: string, complexity?: 'simple' | 'curated' | 'full') => void;

  // ─────────────────────────────────────────────────────────────────
  // Tile Actions
  // ─────────────────────────────────────────────────────────────────

  /** Changes a tile's type and resets its content to defaults */
  swapTileType: (tileId: string, newType: string) => void;
  /** Updates tile content (isCommit=true creates undo point) */
  updateTile: (tileId: string, newContent: Partial<TileContent>, isCommit?: boolean) => void;
  /** Sets the surface color index for a specific tile placement */
  setTileSurface: (placementId: string, surfaceIndex: number | undefined, isCommit?: boolean) => void;
  /** Updates placement-specific content (isCommit=true creates undo point) */
  setPlacementContent: (placementId: string, newContent: Partial<TileContent>, isCommit?: boolean) => void;

  // ─────────────────────────────────────────────────────────────────
  // Brand Actions
  // ─────────────────────────────────────────────────────────────────

  /** Updates brand configuration (isCommit=true creates undo point) */
  updateBrand: (newBrand: Partial<Brand>, isCommit?: boolean) => void;
  /** Resets brand and tiles to default values */
  resetToDefaults: () => void;

  // ─────────────────────────────────────────────────────────────────
  // History Actions
  // ─────────────────────────────────────────────────────────────────

  /** Restores previous state from history (no-op if past is empty) */
  undo: () => void;
  /** Restores next state from future stack (no-op if future is empty) */
  redo: () => void;
}

// ============================================
// LOCAL PRESETS (extends imported BRAND_PRESETS)
// ============================================

// Additional preset configurations (empty for now)


/*
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
*/


// Ready-made templates with complete brand + tile layouts
interface StarterTemplate {
  name: string;
  brand: Brand;
  tiles: Tile[];
}

const STARTER_TEMPLATES: StarterTemplate[] = [
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
      imagery: DEFAULT_BRAND.imagery,
    },
    tiles: [
      {
        id: "logo-1",
        type: "logo",
        content: { label: "Since 2024" },
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
          image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop",
        },
        colSpan: 2,
        rowSpan: 2,
      },
      {
        id: "image-1",
        type: "image",
        content: {
          image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop",
          overlayText: "Innovation",
        },
        colSpan: 1,
        rowSpan: 3,
      },
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
      imagery: DEFAULT_BRAND.imagery,
    },
    tiles: [
      {
        id: "image-1",
        type: "image",
        content: {
          image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=1000&auto=format&fit=crop",
          overlayText: "Spring 2026",
        },
        colSpan: 2,
        rowSpan: 2,
      },
      {
        id: "logo-1",
        type: "logo",
        content: { label: "Est. 1923" },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "product-1",
        type: "product",
        content: {
          label: "Signature Piece",
          price: "$2,400",
          image: "https://images.unsplash.com/photo-1591561954555-607968c989ab?q=80&w=500&auto=format&fit=crop",
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
          image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop",
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
      imagery: DEFAULT_BRAND.imagery,
    },
    tiles: [
      {
        id: "hero-1",
        type: "hero",
        content: {
          headline: "We craft digital experiences",
          subcopy: "Bold ideas. Beautiful execution.",
          cta: "View Work",
          image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
        },
        colSpan: 3,
        rowSpan: 1,
      },
      {
        id: "logo-1",
        type: "logo",
        content: { label: "Studio" },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "image-1",
        type: "image",
        content: {
          image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1000&auto=format&fit=crop",
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
      imagery: DEFAULT_BRAND.imagery,
    },
    tiles: [
      {
        id: "image-1",
        type: "image",
        content: {
          image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop",
          overlayText: "Mindfulness",
        },
        colSpan: 2,
        rowSpan: 2,
      },
      {
        id: "logo-1",
        type: "logo",
        content: { label: "Wellness" },
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
          image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop",
        },
        colSpan: 1,
        rowSpan: 3,
      },
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
          image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=500&auto=format&fit=crop",
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
      imagery: DEFAULT_BRAND.imagery,
    },
    tiles: [
      {
        id: "hero-1",
        type: "hero",
        content: {
          headline: "Designer & Developer",
          subcopy: "Building digital products with precision",
          cta: "Contact",
          image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
        },
        colSpan: 2,
        rowSpan: 1,
      },
      {
        id: "image-1",
        type: "image",
        content: {
          image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop",
          overlayText: "Work",
        },
        colSpan: 1,
        rowSpan: 2,
      },
      {
        id: "logo-1",
        type: "logo",
        content: { label: "Portfolio" },
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
          image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=500&auto=format&fit=crop",
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

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * HSL color representation.
 * Used internally for color harmony calculations.
 */
interface HSL {
  /** Hue (0-360 degrees) */
  h: number;
  /** Saturation (0-100 percent) */
  s: number;
  /** Lightness (0-100 percent) */
  l: number;
}

/**
 * Converts a hex color string to HSL values.
 * Supports both 3-char (#RGB) and 6-char (#RRGGBB) hex formats.
 * @param hex - Hex color string (with or without # prefix)
 * @returns HSL object with h (0-360), s (0-100), l (0-100)
 */
const hexToHSL = (hex: string): HSL => {
  let rHex: string, gHex: string, bHex: string;

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    rHex = result[1];
    gHex = result[2];
    bHex = result[3];
  } else {
    const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
    if (shorthand) {
      rHex = shorthand[1] + shorthand[1];
      gHex = shorthand[2] + shorthand[2];
      bHex = shorthand[3] + shorthand[3];
    } else {
      return { h: 0, s: 0, l: 0 };
    }
  }

  const r = parseInt(rHex, 16) / 255;
  const g = parseInt(gHex, 16) / 255;
  const b = parseInt(bHex, 16) / 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
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
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

/**
 * Converts HSL values to a hex color string.
 * @param h - Hue (0-360 degrees)
 * @param s - Saturation (0-100 percent)
 * @param l - Lightness (0-100 percent)
 * @returns Hex color string with # prefix
 */
const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
};

/**
 * Generates color harmony variations from a base color.
 * Useful for creating cohesive color palettes.
 *
 * @param baseColor - Starting hex color
 * @returns Object with analogous (±30°), complementary (+180°), and triadic (+120°, +240°) colors
 *
 * @example
 * const harmony = getColorHarmony('#3B82F6');
 * // harmony.analogous = ['#823BF6', '#3BF6F6']
 * // harmony.complementary = '#F6823B'
 * // harmony.triadic = ['#82F63B', '#F63B82']
 */
export const getColorHarmony = (baseColor: string) => {
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

/**
 * Calculates WCAG contrast ratio between two colors.
 * Uses relative luminance formula per WCAG 2.1 specification.
 *
 * @param color1 - First hex color
 * @param color2 - Second hex color
 * @returns Contrast ratio (1-21). AA requires 4.5:1 for text, 3:1 for large text.
 *
 * @example
 * const ratio = getContrastRatio('#FFFFFF', '#000000'); // 21
 * const isAACompliant = ratio >= 4.5;
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (hex: string): number => {
    let rHex: string, gHex: string, bHex: string;

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      rHex = result[1];
      gHex = result[2];
      bHex = result[3];
    } else {
      const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
      if (shorthand) {
        rHex = shorthand[1] + shorthand[1];
        gHex = shorthand[2] + shorthand[2];
        bHex = shorthand[3] + shorthand[3];
      } else {
        return 0;
      }
    }

    const rgb = [
      parseInt(rHex, 16) / 255,
      parseInt(gHex, 16) / 255,
      parseInt(bHex, 16) / 255,
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

// ============================================
// EXPORT FUNCTIONS
// ============================================

/**
 * Exports brand configuration as CSS custom properties.
 * Generates a :root block with design tokens for typography, colors, and logo.
 *
 * @param brand - Brand configuration to export (null returns empty placeholder)
 * @returns CSS string with custom properties
 *
 * @example
 * const css = exportAsCSS(brand);
 * // :root {
 * //   --font-primary: Inter;
 * //   --color-primary: #3B82F6;
 * //   ...
 * // }
 */
export const exportAsCSS = (brand: Brand | null): string => {
  if (!brand) return ":root { /* No brand data */ }";

  const letterSpacingMap: Record<string, string> = {
    tight: "-0.02em",
    normal: "0",
    wide: "0.05em",
  };

  const typography = brand.typography || {};
  const colors = brand.colors || {};
  const logo = brand.logo || {};

  return `:root {
  /* Typography */
  --font-primary: ${typography.primary ?? "Inter"};
  --font-secondary: ${typography.secondary ?? "Inter"};
  --font-ui: ${typography.ui ?? "Inter"};
  --type-scale: ${typography.scale ?? 1.25};
  --type-base-size: ${typography.baseSize ?? 16}px;
  --type-letter-spacing: ${letterSpacingMap[typography.letterSpacing] ?? "0"};

  /* Colors */
  --color-bg: ${colors.bg ?? "#FFFFFF"};
  --color-text: ${colors.text ?? "#171717"};
  --color-primary: ${colors.primary ?? "#000000"};
  --color-accent: ${colors.accent ?? "#555555"};
  --color-surface: ${colors.surface ?? "#F5F5F5"};

  /* Logo */
  --logo-text: "${logo.text ?? "BRAND"}";
  --logo-padding: ${logo.padding ?? 16}px;
  --logo-size: ${logo.size ?? 24}px;
}`;
};

/**
 * Exports brand configuration as formatted JSON.
 * Useful for saving brand settings or importing into other tools.
 *
 * @param brand - Brand configuration to export (null returns empty object)
 * @returns Pretty-printed JSON string (2-space indent)
 */
export const exportAsJSON = (brand: Brand | null): string => {
  return JSON.stringify(brand ?? {}, null, 2);
};

// ============================================
// LOCAL INITIAL TILES (fallback if not imported)
// ============================================




// ============================================
// DEFAULT TILE CONTENT
// ============================================

const defaultTileContent: Record<string, TileContent> = {
  hero: {
    headline: "New Hero",
    subcopy: "Hero subcopy",
    cta: "Click here",
  },
  editorial: { headline: "New Editorial", body: "Editorial body text" },
  product: {
    label: "Product",
    price: "$99",
    image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=500",
  },
  "ui-preview": {
    headerTitle: "UI",
    buttonLabel: "Submit",
    inputPlaceholder: "Search...",
  },
  image: {
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000",
    overlayText: "Image",
  },
  utility: { headline: "Features", items: ["Item 1", "Item 2", "Item 3"] },
  logo: { label: "Brand" },
};

const defaultSocialContent: TileContent = {
  socialHandle: "bento",
  socialCaption: "Defining the new standard for calm, focused brand systems.",
  socialLikes: "1,204 likes",
  socialSponsored: "Sponsored",
  socialAspect: "4:5",
};

const defaultPlacementContent: Record<string, TileContent> = {
  image: { ...defaultSocialContent },
  d: { ...defaultSocialContent },
};

// ============================================
// STORE
// ============================================

/**
 * Main brand store hook.
 *
 * Uses Zustand with persist middleware for localStorage persistence.
 * Only persists essential state (brand, tiles, theme, tileSurfaces) to avoid
 * storing transient UI state like focusedTileId or fontPreview.
 *
 * @example
 * // Subscribe to specific slices (recommended for performance)
 * const brand = useBrandStore((s) => s.brand);
 * const updateBrand = useBrandStore((s) => s.updateBrand);
 *
 * // Or destructure multiple values (causes re-render on any change)
 * const { brand, updateBrand, undo, redo } = useBrandStore();
 */
export const useBrandStore = create<BrandStore>()(
  persist(
    (set, get) => ({
      brand: DEFAULT_BRAND,
      tiles: INITIAL_TILES,
      focusedTileId: null,
      darkModePreview: false,
      fontPreview: null,
      theme: "system",
      resolvedTheme: "light",
      history: {
        past: [],
        future: [],
      },
      tileSurfaces: {},
      placementContent: defaultPlacementContent,

      setFocusedTile: (id) => set({ focusedTileId: id }),

      toggleDarkMode: () =>
        set((state) => ({ darkModePreview: !state.darkModePreview })),

      setFontPreview: (font, target) =>
        set({ fontPreview: font ? { font, target: target || "primary" } : null }),

      setTheme: (theme) => set({ theme }),

      setResolvedTheme: (resolved) => set({ resolvedTheme: resolved }),

      loadRandomTemplate: () => {
        const randomTemplate =
          STARTER_TEMPLATES[Math.floor(Math.random() * STARTER_TEMPLATES.length)];
        set({
          brand: randomTemplate.brand,
          tiles: randomTemplate.tiles,
          tileSurfaces: {},
          placementContent: defaultPlacementContent,
          history: {
            past: [],
            future: [],
          },
        });
      },

      loadPreset: (presetName) => {
        const { brand, tiles, tileSurfaces, placementContent, history } = get();
        const preset = BRAND_PRESETS[presetName];
        if (!preset) return;

        set({
          brand: preset,
          history: {
            past: pushToHistory(history.past, { brand, tiles, tileSurfaces, placementContent }),
            future: [],
          },
        });
      },

      applyPalette: (paletteId, complexity = 'full') => {
        const { brand, tiles, tileSurfaces, placementContent, history } = get();
        const palette = getPaletteById(paletteId);
        if (!palette) return;

        const fullMapping = mapPaletteToBrand(palette.colors);
        let colorMapping: typeof fullMapping;

        switch (complexity) {
          case 'simple': {
            // Simple: Just core color + neutral foundation
            // Use neutral grays for bg/text/surface, only primary from palette
            colorMapping = {
              bg: '#FAFAFA',
              text: '#171717',
              primary: fullMapping.primary,
              accent: fullMapping.primary, // Same as primary for minimal palette
              surface: '#F5F5F5',
              surfaces: ['#FFFFFF', '#F5F5F5', '#FAFAFA'],
              paletteColors: [fullMapping.primary],
            };
            break;
          }
          case 'curated': {
            // Curated: Core + accent, limit surfaces to 3
            colorMapping = {
              ...fullMapping,
              surfaces: fullMapping.surfaces.slice(0, 3),
            };
            break;
          }
          case 'full':
          default: {
            // Full: Complete palette mapping
            colorMapping = fullMapping;
            break;
          }
        }

        set({
          brand: {
            ...brand,
            colors: colorMapping as Colors,
          },
          history: {
            past: pushToHistory(history.past, { brand, tiles, tileSurfaces, placementContent }),
            future: [],
          },
        });
      },

      swapTileType: (tileId, newType) => {
        const { brand, tiles, tileSurfaces, placementContent, history } = get();
        const tile = tiles.find((t) => t.id === tileId);
        if (!tile) return;

        const newTiles = tiles.map((t) =>
          t.id === tileId
            ? { ...t, type: newType, content: defaultTileContent[newType] || {} }
            : t
        );

        set({
          tiles: newTiles,
          history: {
            past: pushToHistory(history.past, { brand, tiles, tileSurfaces, placementContent }),
            future: [],
          },
        });
      },

      updateBrand: (newBrand, isCommit = true) => {
        const { brand, history, tiles, tileSurfaces, placementContent } = get();
        if (!newBrand || Object.keys(newBrand).length === 0) return;
        if (!hasBrandChanges(brand, newBrand)) return;

        if (isCommit) {
          set({
            brand: { ...brand, ...newBrand } as Brand,
            history: {
              past: pushToHistory(history.past, { brand, tiles, tileSurfaces, placementContent }),
              future: [],
            },
          });
        } else {
          set({ brand: { ...brand, ...newBrand } as Brand });
        }
      },

      updateTile: (tileId, newContent, isCommit = true) => {
        const { brand, tiles, tileSurfaces, placementContent, history } = get();
        const currentTile = tiles.find((t) => t.id === tileId);
        if (!currentTile) return;
        if (!hasTileContentChanges(currentTile.content, newContent)) return;
        const newTiles = tiles.map((t) =>
          t.id === tileId ? { ...t, content: { ...t.content, ...newContent } } : t
        );

        if (isCommit) {
          set({
            tiles: newTiles,
            history: {
              past: pushToHistory(history.past, { brand, tiles, tileSurfaces, placementContent }),
              future: [],
            },
          });
        } else {
          set({ tiles: newTiles });
        }
      },

      setTileSurface: (placementId, surfaceIndex, isCommit = true) => {
        const { tileSurfaces, history, brand, tiles, placementContent } = get();
        if (tileSurfaces[placementId] === surfaceIndex) return;
        const nextSurfaces = {
          ...tileSurfaces,
          [placementId]: surfaceIndex,
        };

        if (isCommit) {
          set({
            tileSurfaces: nextSurfaces,
            history: {
              past: pushToHistory(history.past, { brand, tiles, tileSurfaces, placementContent }),
              future: [],
            },
          });
        } else {
          set({ tileSurfaces: nextSurfaces });
        }
      },

      setPlacementContent: (placementId, newContent, isCommit = true) => {
        const { placementContent, history, brand, tiles, tileSurfaces } = get();
        const currentContent = placementContent[placementId] || {};
        if (!hasTileContentChanges(currentContent, newContent)) return;
        const nextContent = {
          ...placementContent,
          [placementId]: { ...currentContent, ...newContent },
        };

        if (isCommit) {
          set({
            placementContent: nextContent,
            history: {
              past: pushToHistory(history.past, { brand, tiles, tileSurfaces, placementContent }),
              future: [],
            },
          });
        } else {
          set({ placementContent: nextContent });
        }
      },

      resetToDefaults: () => {
        const { history, brand, tiles, tileSurfaces, placementContent } = get();

        set({
          brand: DEFAULT_BRAND,
          tiles: INITIAL_TILES,
          tileSurfaces: {},
          placementContent: defaultPlacementContent,
          history: {
            past: pushToHistory(history.past, { brand, tiles, tileSurfaces, placementContent }),
            future: [],
          },
        });
      },

      undo: () => {
        const { history, brand, tiles, tileSurfaces, placementContent } = get();
        if (history.past.length === 0) return;

        const previous = history.past[history.past.length - 1];
        const newPast = history.past.slice(0, history.past.length - 1);

        set({
          brand: previous.brand,
          tiles: previous.tiles,
          tileSurfaces: previous.tileSurfaces,
          placementContent: previous.placementContent ?? defaultPlacementContent,
          history: {
            past: newPast,
            future: [{ brand, tiles, tileSurfaces, placementContent }, ...history.future],
          },
        });
      },

      redo: () => {
        const { history, brand, tiles, tileSurfaces, placementContent } = get();
        if (history.future.length === 0) return;

        const next = history.future[0];
        const newFuture = history.future.slice(1);

        set({
          brand: next.brand,
          tiles: next.tiles,
          tileSurfaces: next.tileSurfaces,
          placementContent: next.placementContent ?? defaultPlacementContent,
          history: {
            past: pushToHistory(history.past, { brand, tiles, tileSurfaces, placementContent }),
            future: newFuture,
          },
        });
      },
    }),
    {
      name: "brand-store",
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<BrandStore> | undefined;
        if (!persistedState) return current;

        return {
          ...current,
          ...persistedState,
          brand: mergeBrand(persistedState.brand),
          tiles: Array.isArray(persistedState.tiles) && persistedState.tiles.length > 0
            ? persistedState.tiles
            : current.tiles,
          theme: persistedState.theme ?? current.theme,
          tileSurfaces: persistedState.tileSurfaces ?? current.tileSurfaces,
          placementContent: {
            ...defaultPlacementContent,
            ...(persistedState.placementContent ?? current.placementContent),
          },
        } as BrandStore;
      },
      partialize: (state) => ({
        brand: state.brand,
        tiles: state.tiles,
        theme: state.theme,
        tileSurfaces: state.tileSurfaces,
        placementContent: state.placementContent,
      }),
    }
  )
);

// ============================================
// SELECTORS
// ============================================

/**
 * Selector to get the currently focused tile.
 * Use with: const focusedTile = useBrandStore(selectFocusedTile);
 */
export const selectFocusedTile = (state: BrandStore): Tile | undefined =>
  state.focusedTileId
    ? state.tiles.find((t) => t.id === getPlacementTileId(state.focusedTileId))
      ?? state.tiles.find((t) => t.type === getPlacementTileType(state.focusedTileId))
      ?? state.tiles.find((t) => t.id === state.focusedTileId)
    : undefined;

/**
 * Selector to check if undo is available.
 */
export const selectCanUndo = (state: BrandStore): boolean =>
  state.history.past.length > 0;

/**
 * Selector to check if redo is available.
 */
export const selectCanRedo = (state: BrandStore): boolean =>
  state.history.future.length > 0;
