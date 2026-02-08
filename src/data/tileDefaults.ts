/**
 * Tile Defaults - Default content and initial tile configurations
 *
 * Contains default content for each tile type when swapping,
 * and the initial tile layout for new projects.
 */

// Local type definitions to avoid circular dependency with useBrandStore
interface TileContent {
  headline?: string;
  subcopy?: string;
  body?: string;
  cta?: string;
  label?: string;
  price?: string;
  image?: string;
  overlayText?: string;
  items?: string[];
  headerTitle?: string;
  buttonLabel?: string;
  inputPlaceholder?: string;
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
  utility: {
    headline: "Features",
    items: ["Item 1", "Item 2", "Item 3"],
  },
  logo: {
    label: "Brand",
  },
};

/**
 * Get default content for a tile type.
 */
export const getDefaultTileContent = (tileType: string): TileContent =>
  DEFAULT_TILE_CONTENT[tileType] || {};

/**
 * Initial tile layout for new projects.
 * A balanced bento grid demonstrating various tile types.
 */
export const INITIAL_TILES: Tile[] = [
  {
    id: "hero-1",
    type: "hero",
    content: {
      headline: "The future of brand storytelling",
      subcopy: "Create cohesive brand worlds in minutes, not weeks.",
      cta: "Get Started",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
    },
    colSpan: 2,
    rowSpan: 2,
  },
  {
    id: "image-1",
    type: "image",
    content: {
      image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop",
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
      image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=500&auto=format&fit=crop",
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
