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
import { getPaletteById, getAllPalettes } from "../data/colorPalettes";
import { mapPaletteToBrand, enforceContrast, hexToHSL, hslToHex } from "../utils/colorMapping";
import { DEFAULT_BRAND, BRAND_PRESETS } from "../data/brandPresets";
import { INITIAL_TILES } from "../data/tileDefaults";
import { getPlacementTileId, getPlacementTileType, INITIAL_TILE_SURFACES } from "../config/placements";

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
  /** Logo image data URL or URL (svg/png) */
  image?: string | null;
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
 * UI component styling.
 * Controls button appearance in the interface tile.
 */
export interface UISettings {
  buttonRadius: number;
  buttonStyle: 'filled' | 'outline' | 'soft';
  buttonColor: string | null;
  buttonSize: 'compact' | 'default' | 'large';
  buttonWeight: 400 | 500 | 600 | 700;
  buttonUppercase: boolean;
  buttonLetterSpacing: number;
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
  /** UI component styling */
  ui: UISettings;
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
  /** Number of social posts to display (1-3) */
  socialPostCount?: number;
  /** Per-post content for multi-post social tiles */
  socialPosts?: Array<{ caption?: string; likes?: string; image?: string }>;
  /** Social card visual style: full (all chrome), clean (no icons), minimal (image + caption only) */
  socialStyle?: 'full' | 'clean' | 'minimal';
  /** Social card background mode: white (default) or surface (matches tile surface) */
  socialCardBg?: 'white' | 'surface';
  /** When true, shuffle will not change this tile's image */
  imageLocked?: boolean;
  /** Pattern variant for pattern tiles */
  patternVariant?: string;
  /** Pattern zoom level (multiplier, default 1) */
  patternScale?: number;
  /** Custom uploaded image used as repeating pattern */
  patternImage?: string;
  /** Whether the custom pattern image is locked from shuffle */
  patternImageLocked?: boolean;
  /** Whether the CTA button is hidden (split-hero tiles) */
  ctaHidden?: boolean;
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
  ui: { ...DEFAULT_BRAND.ui },
});

/** Guard: checks if a value is a valid image source (data URI, blob, or HTTP URL).
 *  Filters out stale or corrupt image paths during persistence merges. */
const isValidImageSrc = (src: unknown): src is string => {
  if (typeof src !== 'string' || !src) return false;
  return src.startsWith('data:image/') || src.startsWith('blob:') ||
    src.startsWith('https://') || src.startsWith('http://');
};

/**
 * Merge a partial brand from localStorage (or a preset) onto a fresh default.
 *
 * Handles missing/partial data gracefully:
 * - Each top-level section (typography, colors, logo, imagery, ui) is shallow-merged
 *   independently, so a persisted state missing e.g. `ui` still gets defaults.
 * - Arrays (`surfaces`, `paletteColors`) are replaced wholesale (not merged) since
 *   array positions are meaningful.
 * - Logo images are validated via `isValidImageSrc` to discard stale blob/data URIs
 *   from previous sessions.
 *
 * @param source - Partial brand from persistence or preset (null/undefined = use defaults)
 * @returns Complete Brand object with all fields guaranteed
 */
const mergeBrand = (source?: Partial<Brand> | null): Brand => {
  const base = createDefaultBrand();

  if (!source) return base;

  const mergedLogo = { ...base.logo, ...(source.logo ?? {}) };
  if (mergedLogo.image && !isValidImageSrc(mergedLogo.image)) {
    mergedLogo.image = null;
  }

  return {
    typography: { ...base.typography, ...(source.typography ?? {}) },
    colors: {
      ...base.colors,
      ...(source.colors ?? {}),
      surfaces: source.colors?.surfaces ?? base.colors.surfaces,
      paletteColors: source.colors?.paletteColors ?? base.colors.paletteColors,
    },
    logo: mergedLogo,
    imagery: { ...base.imagery, ...(source.imagery ?? {}) },
    ui: { ...base.ui, ...(source.ui ?? {}) },
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

/**
 * Detect whether a partial brand update actually changes any values.
 *
 * Performance optimization: prevents pushing no-op entries to the undo
 * history when `updateBrand` is called with values identical to current state.
 * Compares each nested section (typography, logo, imagery, colors) key-by-key.
 * Arrays (surfaces, paletteColors) use shallow element comparison.
 *
 * @param brand - Current full brand state
 * @param newBrand - Incoming partial update
 * @returns true if at least one value differs
 */
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

/** Same as `hasBrandChanges` but for tile content — prevents no-op history entries
 *  when `updateTile` is called with identical values. */
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
  /** Currently selected brand preset (used for contextual copy) */
  activePreset: string;
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
  /** Shuffles color palette + typography randomly (keeps layout) */
  shuffleBrand: () => void;
  /** Shuffles only color palette (keeps typography + layout) */
  shuffleColors: () => void;
  /** Shuffles only typography (keeps colors + layout) */
  shuffleTypography: () => void;
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
      ui: DEFAULT_BRAND.ui,
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
          headline: "Software that gets out of your way",
          subcopy: "Less setup. More shipping. You know the drill.",
          cta: "Try It Free",
          image: "/images/visualelectric-1740659731603.png",
        },
        colSpan: 2,
        rowSpan: 2,
      },
      {
        id: "social-1",
        type: "social",
        content: {
          image: "/images/20250622_2054_Candid Office Problem-Solving_simple_compose_01jycfrc6pfhrttzd3xpgeb5d2.png",
          overlayText: "Building",
        },
        colSpan: 1,
        rowSpan: 3,
      },
      {
        id: "editorial-1",
        type: "editorial",
        content: {
          headline: "Tools, not slideware",
          body: "We build things people actually use. Then we iterate.",
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
          inputPlaceholder: "Paste your key...",
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
      ui: DEFAULT_BRAND.ui,
    },
    tiles: [
      {
        id: "social-1",
        type: "social",
        content: {
          image: "/images/visualelectric-1751979354132.png",
          overlayText: "New Season",
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
          label: "The Signature",
          price: "$2,400",
          image: "/images/visualelectric-1751999916329.png",
        },
        colSpan: 1,
        rowSpan: 2,
      },
      {
        id: "editorial-1",
        type: "editorial",
        content: {
          headline: "Less is the whole point",
          body: "The best pieces don\u2019t announce themselves.",
        },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "hero-1",
        type: "split-hero",
        content: {
          headline: "Made to Last",
          body: "Not trend-proof. Trend-irrelevant. For people who choose.",
          cta: "Explore",
          image: "/images/visualelectric-1751915506477.png",
        },
        colSpan: 2,
        rowSpan: 1,
      },
      {
        id: "utility-1",
        type: "split-list",
        content: {
          headline: "Craft\n& Care",
          overlayText: "How It\u2019s Made",
          items: ["Small-Batch Production", "Natural Dyes Only", "Transparent Sourcing"],
          image: "/images/visualelectric-1751999926710.png",
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
      ui: DEFAULT_BRAND.ui,
    },
    tiles: [
      {
        id: "hero-1",
        type: "hero",
        content: {
          headline: "We make things people actually remember",
          subcopy: "Big ideas. Small egos. Zero synergy decks.",
          cta: "See Work",
          image: "/images/20250622_2048_Candid Office Consultation_simple_compose_01jycfdk73fj1az74wv8n0rgwt.png",
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
        id: "social-1",
        type: "overlay",
        content: {
          headline: "The Messy Middle",
          body: "Every portfolio shows the finish line. We\u2019re here for the all-nighter.",
          label: "Case Study",
          image: "/images/visualelectric-1750703676698.png",
        },
        colSpan: 2,
        rowSpan: 2,
      },
      {
        id: "utility-1",
        type: "split-list",
        content: {
          headline: "How We\nWork",
          overlayText: "Disciplines",
          items: ["Brand Strategy", "Motion & Film", "Art Direction"],
          image: "/images/20250622_2058_Candid Office Moment_simple_compose_01jycg0pyvf54ar73h2bxc7yh1.png",
        },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "editorial-1",
        type: "editorial",
        content: {
          headline: "Good work won\u2019t shut up",
          body: "We make the kind of projects that keep you up at night\u2014in a good way.",
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
    name: "Food & Drink",
    brand: {
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
        url: "/images/visualelectric-1751999916329.png",
        style: "default",
        overlay: 0,
      },
      ui: DEFAULT_BRAND.ui,
    },
    tiles: [
      {
        id: "hero-1",
        type: "hero",
        content: {
          headline: "Food worth sitting down for",
          subcopy: "Seasonal plates, honest ingredients, and absolutely zero foam.",
          image: "/images/visualelectric-1751999916329.png",
        },
        colSpan: 2,
        rowSpan: 2,
      },
      {
        id: "social-1",
        type: "social",
        content: {
          image: "/images/visualelectric-1751999926710.png",
          overlayText: "In Season",
        },
        colSpan: 1,
        rowSpan: 2,
      },
      {
        id: "editorial-1",
        type: "product",
        content: {
          label: "Acai Bowl",
          subcopy: "Breakfast",
          body: "Plant-based",
          price: "$12.99",
          image: "/images/visualelectric-1751979354132.png",
        },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "ui-preview-1",
        type: "menu",
        content: {
          headline: "Menu",
          subcopy: "What\u2019s on the table right now",
          items: ["Breakfast", "Small Plates", "Brunch"],
          buttonLabel: "Full Menu",
        },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "logo-1",
        type: "logo",
        content: { label: "Kitchen & Bar" },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "utility-1",
        type: "utility",
        content: {
          headline: "On Right Now",
          items: ["Breakfast", "Plant-Based", "Seasonal Specials"],
        },
        colSpan: 1,
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
      ui: DEFAULT_BRAND.ui,
    },
    tiles: [
      {
        id: "social-1",
        type: "social",
        content: {
          image: "/images/visualelectric-1760212068804.png",
          overlayText: "Breathe",
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
          headline: "Feel like yourself again",
          subcopy: "Simple routines, real ingredients, no guru required.",
          cta: "Start Here",
          image: "/images/visualelectric-1753860123700.png",
        },
        colSpan: 1,
        rowSpan: 3,
      },
      {
        id: "editorial-1",
        type: "editorial",
        content: {
          headline: "Wellness, minus the woo",
          body: "Science-backed, plant-powered, easy to stick with.",
        },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "utility-1",
        type: "utility",
        content: {
          headline: "The Good Stuff",
          items: ["100% Natural", "Certified Organic", "Carbon Neutral"],
        },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "product-1",
        type: "split-hero",
        content: {
          headline: "Back to Basics",
          body: "Ancient practices, modern research. Your body already knows.",
          cta: "Learn More",
          image: "/images/visualelectric-1753860116187.png",
        },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "ui-preview-1",
        type: "overlay",
        content: {
          headline: "Start Where You Are",
          body: "You don\u2019t need a retreat. Just five minutes.",
          label: "Philosophy",
          image: "/images/visualelectric-1753860134138.png",
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
      ui: DEFAULT_BRAND.ui,
    },
    tiles: [
      {
        id: "hero-1",
        type: "hero",
        content: {
          headline: "I design things people use",
          subcopy: "Clean interfaces. Clear thinking. No fluff.",
          cta: "Say Hello",
          image: "/images/visualelectric-1740667024491.png",
        },
        colSpan: 2,
        rowSpan: 1,
      },
      {
        id: "social-1",
        type: "social",
        content: {
          image: "/images/visualelectric-1740667020762.png",
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
          headline: "The Short Version",
          body: "10+ years making interfaces people enjoy. Based in SF.",
        },
        colSpan: 2,
        rowSpan: 1,
      },
      {
        id: "utility-1",
        type: "utility",
        content: {
          headline: "Fluent In",
          items: ["React", "TypeScript", "Figma"],
        },
        colSpan: 1,
        rowSpan: 1,
      },
      {
        id: "product-1",
        type: "product",
        content: {
          label: "Latest Work",
          price: "2026",
          image: "/images/_sagr_tight_macro_still_life_tortoiseshell_glasses_blank_conf_fd90e9cb-0e01-43ed-9b69-4cc88f03a4df_0.png",
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
    image: "/images/_sagr_tight_macro_still_life_tortoiseshell_glasses_blank_conf_fd90e9cb-0e01-43ed-9b69-4cc88f03a4df_0.png",
  },
  "ui-preview": {
    headerTitle: "UI",
    buttonLabel: "Submit",
    inputPlaceholder: "Search...",
  },
  image: {
    image: "/images/visualelectric-1740667020762.png",
    overlayText: "Image",
  },
  utility: { headline: "Features", items: ["Item 1", "Item 2", "Item 3"] },
  menu: { headline: "Menu", items: ["Breakfast", "Brunch", "Seasonal"] },
  logo: { label: "Brand" },
  overlay: {
    headline: "The Winter Collection",
    body: "Garments and products so essential that they merge into the wholeness of our lives.",
    label: "About Us",
    image: "/images/visualelectric-1751915506477.png",
  },
  social: {
    image: "/images/visualelectric-1750703676698.png",
    overlayText: "Atmosphere",
  },
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

/** Curated font pairings for shuffle (headline / body) */
const FONT_PAIRINGS: { primary: string; secondary: string; weight: string; spacing: Typography['letterSpacing'] }[] = [
  { primary: "Sora", secondary: "Inter", weight: "700", spacing: "normal" },
  { primary: "Playfair Display", secondary: "Montserrat", weight: "700", spacing: "wide" },
  { primary: "Bricolage Grotesque", secondary: "Inter", weight: "800", spacing: "normal" },
  { primary: "Oswald", secondary: "Montserrat", weight: "700", spacing: "wide" },
  { primary: "Plus Jakarta Sans", secondary: "Inter", weight: "600", spacing: "normal" },
  { primary: "Inter", secondary: "JetBrains Mono", weight: "700", spacing: "tight" },
  { primary: "DM Serif Display", secondary: "DM Sans", weight: "400", spacing: "normal" },
  { primary: "Space Grotesk", secondary: "Inter", weight: "700", spacing: "normal" },
  { primary: "Fraunces", secondary: "Work Sans", weight: "700", spacing: "normal" },
  { primary: "Outfit", secondary: "Inter", weight: "700", spacing: "normal" },
];

/** Tracks last template index to avoid consecutive duplicates on shuffle */
let _lastTemplateIdx = -1;

/** Tracks last shuffle indices to avoid repeats */
let _lastShufflePaletteIdx = -1;
let _lastShuffleFontIdx = -1;

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
      activePreset: "default",
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
      tileSurfaces: { ...INITIAL_TILE_SURFACES },
      placementContent: defaultPlacementContent,

      setFocusedTile: (id) => set({ focusedTileId: id }),

      toggleDarkMode: () =>
        set((state) => ({ darkModePreview: !state.darkModePreview })),

      setFontPreview: (font, target) =>
        set({ fontPreview: font ? { font, target: target || "primary" } : null }),

      setTheme: (theme) => set({ theme }),

      setResolvedTheme: (resolved) => set({ resolvedTheme: resolved }),

      loadRandomTemplate: () => {
        // Avoid picking the same template consecutively
        let idx = Math.floor(Math.random() * STARTER_TEMPLATES.length);
        if (STARTER_TEMPLATES.length > 1 && idx === _lastTemplateIdx) {
          idx = (idx + 1) % STARTER_TEMPLATES.length;
        }
        _lastTemplateIdx = idx;
        const randomTemplate = STARTER_TEMPLATES[idx];

        // Deduplicate tile types — if a template somehow has
        // duplicate types, keep only the first of each type
        const seenTypes = new Set<string>();
        const dedupedTiles = randomTemplate.tiles.filter((t) => {
          if (seenTypes.has(t.type)) return false;
          seenTypes.add(t.type);
          return true;
        });

        set({
          brand: randomTemplate.brand,
          tiles: dedupedTiles,
          activePreset: "custom",
          tileSurfaces: { ...INITIAL_TILE_SURFACES },
          placementContent: defaultPlacementContent,
          history: {
            past: [],
            future: [],
          },
        });
      },

      shuffleBrand: () => {
        const { brand, tiles, tileSurfaces, placementContent, history } = get();
        const allPalettes = getAllPalettes();

        // Weight palettes by color count and hue diversity for better shuffle quality
        const weights = allPalettes.map((p) => {
          const colorCount = Math.min(p.colors.length, 7);
          const colorWeight = colorCount / 7; // 0-1, more colors = better

          // Hue diversity: count distinct hue buckets (60° each)
          const hueBuckets = new Set<number>();
          for (const hex of p.colors) {
            const rgb = hex.replace('#', '');
            if (rgb.length !== 6) continue;
            const r = parseInt(rgb.slice(0, 2), 16) / 255;
            const g = parseInt(rgb.slice(2, 4), 16) / 255;
            const b = parseInt(rgb.slice(4, 6), 16) / 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            if (max === min) continue;
            let h = 0;
            const d = max - min;
            if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            else if (max === g) h = ((b - r) / d + 2) / 6;
            else h = ((r - g) / d + 4) / 6;
            hueBuckets.add(Math.floor(h * 6));
          }
          const hueWeight = Math.min(hueBuckets.size, 4) / 4; // 0-1, more hue variety = better

          return 0.4 + 0.3 * colorWeight + 0.3 * hueWeight; // base 0.4 so no palette is excluded
        });

        // Weighted random selection
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let r = Math.random() * totalWeight;
        let pIdx = 0;
        for (let i = 0; i < weights.length; i++) {
          r -= weights[i];
          if (r <= 0) { pIdx = i; break; }
        }
        if (allPalettes.length > 1 && pIdx === _lastShufflePaletteIdx) {
          pIdx = (pIdx + 1) % allPalettes.length;
        }
        _lastShufflePaletteIdx = pIdx;

        // Pick random font pairing, avoiding repeat
        let fIdx = Math.floor(Math.random() * FONT_PAIRINGS.length);
        if (FONT_PAIRINGS.length > 1 && fIdx === _lastShuffleFontIdx) {
          fIdx = (fIdx + 1) % FONT_PAIRINGS.length;
        }
        _lastShuffleFontIdx = fIdx;

        const palette = allPalettes[pIdx];
        const fontPairing = FONT_PAIRINGS[fIdx];

        // Map palette to brand colors
        const rawMapping = mapPaletteToBrand(palette.colors);
        const colorMapping = enforceContrast(rawMapping);

        set({
          brand: {
            ...brand,
            typography: {
              ...brand.typography,
              primary: fontPairing.primary,
              secondary: fontPairing.secondary,
              ui: fontPairing.secondary,
              weightHeadline: fontPairing.weight,
              letterSpacing: fontPairing.spacing,
            },
            colors: colorMapping,
          },
          activePreset: "custom",
          history: {
            past: pushToHistory(history.past, { brand, tiles, tileSurfaces, placementContent }),
            future: [],
          },
        });
      },

      shuffleColors: () => {
        const { brand, tiles, tileSurfaces, placementContent, history } = get();
        const allPalettes = getAllPalettes();

        // Weighted random palette selection (same logic as shuffleBrand)
        const weights = allPalettes.map((p) => {
          const colorCount = Math.min(p.colors.length, 7);
          const colorWeight = colorCount / 7;
          const hueBuckets = new Set<number>();
          for (const hex of p.colors) {
            const rgb = hex.replace('#', '');
            if (rgb.length !== 6) continue;
            const r = parseInt(rgb.slice(0, 2), 16) / 255;
            const g = parseInt(rgb.slice(2, 4), 16) / 255;
            const b = parseInt(rgb.slice(4, 6), 16) / 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            if (max === min) return 0.4;
            let h = 0;
            const d = max - min;
            if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            else if (max === g) h = ((b - r) / d + 2) / 6;
            else h = ((r - g) / d + 4) / 6;
            hueBuckets.add(Math.floor(h * 6));
          }
          const hueWeight = Math.min(hueBuckets.size, 4) / 4;
          return 0.4 + 0.3 * colorWeight + 0.3 * hueWeight;
        });

        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let r = Math.random() * totalWeight;
        let pIdx = 0;
        for (let i = 0; i < weights.length; i++) {
          r -= weights[i];
          if (r <= 0) { pIdx = i; break; }
        }
        if (allPalettes.length > 1 && pIdx === _lastShufflePaletteIdx) {
          pIdx = (pIdx + 1) % allPalettes.length;
        }
        _lastShufflePaletteIdx = pIdx;

        const palette = allPalettes[pIdx];
        const rawMapping = mapPaletteToBrand(palette.colors);
        const colorMapping = enforceContrast(rawMapping);

        set({
          brand: { ...brand, colors: colorMapping },
          activePreset: "custom",
          history: {
            past: pushToHistory(history.past, { brand, tiles, tileSurfaces, placementContent }),
            future: [],
          },
        });
      },

      shuffleTypography: () => {
        const { brand, tiles, tileSurfaces, placementContent, history } = get();

        let fIdx = Math.floor(Math.random() * FONT_PAIRINGS.length);
        if (FONT_PAIRINGS.length > 1 && fIdx === _lastShuffleFontIdx) {
          fIdx = (fIdx + 1) % FONT_PAIRINGS.length;
        }
        _lastShuffleFontIdx = fIdx;

        const fontPairing = FONT_PAIRINGS[fIdx];

        set({
          brand: {
            ...brand,
            typography: {
              ...brand.typography,
              primary: fontPairing.primary,
              secondary: fontPairing.secondary,
              ui: fontPairing.secondary,
              weightHeadline: fontPairing.weight,
              letterSpacing: fontPairing.spacing,
            },
          },
          activePreset: "custom",
          history: {
            past: pushToHistory(history.past, { brand, tiles, tileSurfaces, placementContent }),
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
          activePreset: presetName,
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

        const rawMapping = mapPaletteToBrand(palette.colors);
        const fullMapping = enforceContrast(rawMapping);
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

        const nextBrand: Brand = {
          ...brand,
          ...newBrand,
          typography: { ...brand.typography, ...(newBrand.typography ?? {}) },
          colors: {
            ...brand.colors,
            ...(newBrand.colors ?? {}),
            surfaces: newBrand.colors?.surfaces ?? brand.colors.surfaces,
            paletteColors: newBrand.colors?.paletteColors ?? brand.colors.paletteColors,
          },
          logo: { ...brand.logo, ...(newBrand.logo ?? {}) },
          imagery: { ...brand.imagery, ...(newBrand.imagery ?? {}) },
          ui: { ...brand.ui, ...(newBrand.ui ?? {}) },
        };

        if (isCommit) {
          set({
            brand: nextBrand,
            history: {
              past: pushToHistory(history.past, { brand, tiles, tileSurfaces, placementContent }),
              future: [],
            },
          });
        } else {
          set({ brand: nextBrand });
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
          activePreset: "default",
          tileSurfaces: { ...INITIAL_TILE_SURFACES },
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
      // Merge persisted localStorage state with fresh defaults on app load.
      // Handles schema migrations (e.g. adding slot tiles for new layout system).
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<BrandStore> | undefined;
        if (!persistedState) return current;

        let tiles = Array.isArray(persistedState.tiles) && persistedState.tiles.length > 0
          ? persistedState.tiles
          : current.tiles;

        // Ensure slot tiles exist for letter placements (migration from
        // shared-ID era where 'a' -> 'logo-1' to unique-ID 'a' -> 'slot-a').
        const slotIds = ['slot-a', 'slot-b', 'slot-c', 'slot-d', 'slot-e', 'slot-f'];
        const existingIds = new Set(tiles.map((t: Tile) => t.id));
        const missingSlots = INITIAL_TILES.filter(
          (t) => slotIds.includes(t.id) && !existingIds.has(t.id)
        );
        if (missingSlots.length > 0) {
          tiles = [...tiles, ...missingSlots];
        }

        return {
          ...current,
          ...persistedState,
          brand: mergeBrand(persistedState.brand),
          tiles,
          theme: persistedState.theme ?? current.theme,
          tileSurfaces: {
            ...INITIAL_TILE_SURFACES,
            ...(persistedState.tileSurfaces ?? current.tileSurfaces),
          },
          activePreset: persistedState.activePreset ?? current.activePreset,
          placementContent: {
            ...defaultPlacementContent,
            ...(persistedState.placementContent ?? current.placementContent),
          },
        } as BrandStore;
      },
      // Persist only serializable user data. Exclude:
      // - focusedTileId (UI state, not user data)
      // - fontPreview (transient hover state)
      // - history (undo/redo is session-only)
      // - darkModePreview (transient toggle state)
      partialize: (state) => ({
        brand: state.brand,
        tiles: state.tiles,
        activePreset: state.activePreset,
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
 *
 * Lookup order:
 * 1. Map placement ID to tile ID via placements.ts (e.g., 'a' -> 'slot-a')
 * 2. Direct tile ID match (for legacy or non-placement IDs)
 * 3. Type-based fallback (last resort)
 */
export const selectFocusedTile = (state: BrandStore): Tile | undefined => {
  if (!state.focusedTileId) return undefined;
  const placementTileId = getPlacementTileId(state.focusedTileId ?? undefined);
  return state.tiles.find((t) => t.id === placementTileId)
    ?? state.tiles.find((t) => t.id === state.focusedTileId)
    ?? state.tiles.find((t) => t.type === getPlacementTileType(state.focusedTileId ?? undefined));
};

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
