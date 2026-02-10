/**
 * Tile Defaults - Default content and initial tile configurations
 *
 * Contains default content for each tile type when swapping,
 * and the initial tile layout for new projects.
 */

// Local type definitions to avoid circular dependency with useBrandStore.
// Each field is used by specific tile types — not all tiles use all fields.

interface TileContent {
  /** Primary display text — used by hero, editorial, split-hero, list (split heading) */
  headline?: string;
  /** Secondary short text — used as pretitle (editorial), label (hero overlay), section heading (list) */
  subcopy?: string;
  /** Longer body copy — used by editorial, split-hero, overlay, card */
  body?: string;
  /** Call-to-action text — used by split-hero */
  cta?: string;
  /** Category/tag label — used by card, logo, overlay */
  label?: string;
  /** Price display — used by card */
  price?: string;
  /** Image URL (data URI, blob, or HTTP) — used by hero, split-hero, card, social, split-list */
  image?: string;
  /** Text overlaid on imagery — used by social tile, split-list heading */
  overlayText?: string;
  /** Ordered list of strings — used by list tile (menu items), split-list */
  items?: string[];
  /** UI element title — used by interface tile (secondary button label) */
  headerTitle?: string;
  /** Button label text — used by interface tile (primary button), list tile (action label) */
  buttonLabel?: string;
  /** Placeholder text for input fields — used by interface tile */
  inputPlaceholder?: string;
  /** Social media handle (e.g. "@brand") — used by social tile */
  socialHandle?: string;
  /** Social post caption text — used by social tile */
  socialCaption?: string;
  /** Like count display (e.g. "1,204 likes") — used by social tile */
  socialLikes?: string;
  /** Sponsored label — used by social tile */
  socialSponsored?: string;
  /** Image aspect ratio for social cards (e.g. "square", "portrait") — used by social tile */
  socialAspect?: string;
  /** Array of social post data for multi-card social tiles (1–3 cards) */
  socialPosts?: Array<{ caption?: string; likes?: string; image?: string }>;
  /** Visual pattern variant identifier — reserved for pattern tile */
  patternVariant?: string;
  /** Pattern zoom level (multiplier, default 1) — reserved for pattern tile */
  patternScale?: number;
  /** Custom uploaded image used as repeating pattern — reserved for pattern tile */
  patternImage?: string;
  /** Whether the custom pattern image is locked from shuffle — reserved for pattern tile */
  patternImageLocked?: boolean;
  /** App screen variant identifier — reserved for app-screen tile */
  screenVariant?: string;
}

interface Tile {
  id: string;
  type: string;
  content: TileContent;
  colSpan: number;
  rowSpan: number;
}

/**
 * Default content for each tile type.
 * Used when swapping tile types to provide sensible starting content.
 */
export const DEFAULT_TILE_CONTENT: Record<string, TileContent> = {
  hero: {
    headline: "New Hero",
    subcopy: "Hero subcopy",
    cta: "Click here",
  },
  editorial: {
    headline: "New Editorial",
    body: "Editorial body text",
  },
  product: {
    label: "Product",
    price: "$99",
    image: "/images/_sagr_tight_macro_still_life_tortoiseshell_glasses_blank_conf_fd90e9cb-0e01-43ed-9b69-4cc88f03a4df_0.png",
  },
  "ui-preview": {
    headerTitle: "Learn More",
    buttonLabel: "Get Started",
    inputPlaceholder: "View Details",
  },
  image: {
    image: "/images/visualelectric-1740667020762.png",
    overlayText: "Image",
  },
  utility: {},
  menu: {
    headline: "Menu",
    items: ["Breakfast", "Brunch", "Seasonal"],
  },
  logo: {
    label: "Brand",
  },
  icons: {},
  "logo-symbol": {},
  swatch: {},
  "split-hero": {
    headline: "Defining Style",
    body: "A fusion of creativity and craftsmanship. We bring timeless pieces that elevate everyday design.",
    cta: "Read More",
    image: "/images/20250622_2048_Candid Office Consultation_simple_compose_01jycfdk73fj1az74wv8n0rgwt.png",
  },
  overlay: {
    headline: "The Winter Collection",
    body: "Garments and products so essential that they merge into the wholeness of our lives.",
    label: "About Us",
    image: "/images/visualelectric-1751915506477.png",
  },
  "split-list": {
    headline: "Design\nParadigm",
    overlayText: "Core Services",
    items: ["Brand Identity Systems", "Digital Experience Design", "Creative Direction"],
    image: "/images/visualelectric-1740667228398.png",
  },
  pattern: {},
  stats: {
    headline: "12M+",
    label: "Active Users",
    body: "Growing 23% year over year",
  },
  "app-screen": {},
};

/**
 * Get default content for a tile type.
 */
export const getDefaultTileContent = (tileType: string): TileContent =>
  DEFAULT_TILE_CONTENT[tileType] || {};

/**
 * Initial tile layout for new projects.
 * A balanced bento grid demonstrating various tile types.
 *
 * Includes both named-placement tiles (hero-1, editorial-1, etc.) used by
 * layouts like "geos" and "spread", AND slot tiles (slot-a through slot-f)
 * used by letter-placement layouts (balanced, heroLeft, heroCenter, etc.).
 *
 * Each placement ID in placements.ts maps to a UNIQUE tile ID here to
 * prevent the "double-change" bug where swapping one tile's type would
 * unintentionally change another tile sharing the same backing ID.
 */
export const INITIAL_TILES: Tile[] = [
  // === Named placement tiles (used by geos, spread layouts) ===
  {
    id: "hero-1",
    type: "hero",
    content: {
      headline: "The future of brand storytelling",
      subcopy: "Create cohesive brand worlds in minutes, not weeks.",
      cta: "Get Started",
      image: "/images/visualelectric-1740667024491.png",
    },
    colSpan: 2,
    rowSpan: 2,
  },
  {
    id: "social-1",
    type: "social",
    content: {
      image: "/images/visualelectric-1750703676698.png",
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
      image: "/images/_sagr_tight_macro_still_life_tortoiseshell_glasses_blank_conf_fd90e9cb-0e01-43ed-9b69-4cc88f03a4df_0.png",
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
    content: {},
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
  {
    id: "swatch-1",
    type: "swatch",
    content: {},
    colSpan: 1,
    rowSpan: 1,
  },
  // === Letter-slot tiles (used by balanced, heroLeft, heroCenter, stacked, duo, mosaic) ===
  // Each has its own independent tile so swapping types doesn't affect named placements.
  {
    id: "slot-a",
    type: "logo",
    content: {
      label: "Brand Identity",
    },
    colSpan: 1,
    rowSpan: 1,
  },
  {
    id: "slot-b",
    type: "editorial",
    content: {
      headline: "Design with intention",
      body: "Every element in our system is designed to work together, ensuring your brand stays consistent across all touchpoints.",
    },
    colSpan: 1,
    rowSpan: 1,
  },
  {
    id: "slot-c",
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
    id: "slot-d",
    type: "social",
    content: {
      image: "/images/visualelectric-1750703676698.png",
      overlayText: "Atmosphere",
    },
    colSpan: 1,
    rowSpan: 1,
  },
  {
    id: "slot-e",
    type: "swatch",
    content: {},
    colSpan: 1,
    rowSpan: 1,
  },
  {
    id: "slot-f",
    type: "utility",
    content: {},
    colSpan: 1,
    rowSpan: 1,
  },
];
