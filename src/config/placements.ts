/**
 * Placement Mapping
 *
 * Maps grid cell placement IDs (e.g. "hero", "a", "b") to their
 * semantic kind, tile type, and tile instance ID. This decouples
 * layout position from tile content — a placement like "a" always
 * resolves to the same tile regardless of which layout preset is active.
 *
 * Named placements ("hero", "editorial") are used by specific layouts;
 * letter placements ("a"–"f") are generic slots used across presets.
 *
 * ── Tile Content Resolution Flow ──
 *
 * When BentoGridNew renders the grid, each cell has a placement ID.
 * The content that appears in that cell is resolved through these steps:
 *
 * 1. **Layout → placement ID**
 *    bentoLayouts.ts (or layoutPresets.ts) defines which placement IDs
 *    appear in each grid cell (e.g. cell [0,0] = "hero", cell [1,2] = "b").
 *
 * 2. **Placement ID → tile component**
 *    `getPlacementTileType(id)` returns the React component type to render
 *    (e.g. "hero" → HeroTile, "b" → EditorialTile). BentoGridNew uses
 *    this to pick the component from its TILE_COMPONENTS map.
 *
 * 3. **Placement ID → tile instance ID**
 *    `getPlacementTileId(id)` returns the backing tile's store ID
 *    (e.g. "hero" → "hero-1", "b" → "slot-b"). The tile component uses
 *    this to find its data in `useBrandStore.tiles[]`.
 *
 * 4. **Content merge (inside each tile component)**
 *    Final content = tile.content ← placementContent overrides.
 *    - `tile.content`: persistent data from the store (tileDefaults.ts initial values)
 *    - `placementContent`: per-placement overrides from `state.placementContent[placementId]`
 *    - Industry copy fallback: if both are empty, `getPresetContent(activePreset)`
 *      provides default text based on the active brand preset (e.g. "studio", "cafe").
 *
 * 5. **Surface color resolution (parallel path)**
 *    `resolveSurfaceColor({ placementId, tileSurfaceIndex, surfaces, bg })`
 *    picks the background color for this tile from the palette's surface array.
 *    Each placement can have its own surface index stored in `state.tileSurfaces`.
 */

/** Semantic category of a grid cell placement. */
export type PlacementKind =
  | 'identity'
  | 'editorial'
  | 'social'
  | 'interface'
  | 'colors'
  | 'icons'
  | 'product';

/** Maps placement IDs to their semantic kind (what category of content fills this slot). */
export const PLACEMENT_KIND_BY_ID = {
  hero: 'identity',
  editorial: 'editorial',
  social: 'social',
  buttons: 'interface',
  logo: 'identity',
  colors: 'colors',
  product: 'product',
  a: 'identity',
  b: 'editorial',
  c: 'interface',
  d: 'social',
  e: 'colors',
  f: 'editorial',
} as const;

/** Maps placement IDs to the component type that renders in this slot. */
export const PLACEMENT_TILE_TYPE_BY_ID = {
  hero: 'hero',
  editorial: 'editorial',
  social: 'social',
  buttons: 'ui-preview',
  logo: 'logo',
  colors: 'utility',
  product: 'product',
  a: 'logo',
  b: 'editorial',
  c: 'ui-preview',
  d: 'social',
  e: 'swatch',
  f: 'stats',
} as const;

/** Maps placement IDs to the specific tile instance ID used for store lookups.
 *  IMPORTANT: Each placement must map to a UNIQUE tile ID. Sharing IDs between
 *  placements causes Bug A (changing one tile's type changes two tiles) because
 *  swapTileType operates on the shared tile object.
 */
export const PLACEMENT_TILE_ID_BY_ID = {
  hero: 'hero-1',
  editorial: 'editorial-1',
  social: 'social-1',
  buttons: 'ui-preview-1',
  logo: 'logo-1',
  colors: 'utility-1',
  product: 'product-1',
  a: 'slot-a',
  b: 'slot-b',
  c: 'slot-c',
  d: 'slot-d',
  e: 'slot-e',
  f: 'slot-f',
} as const;

/**
 * Default surface index assignments for placements.
 *
 * The surfaces array is ordered neutral → muted → tinted → accent → contrast,
 * so higher indices = more colorful. Most tiles use defaultIndex 0 or 1 (neutral).
 * These overrides add visual rhythm to the board by giving some placements
 * a tinted or accent surface out of the box.
 *
 * Index meanings (typical):
 *   0-1: Neutrals (very close to bg)
 *   2-3: Muted tints (subtle palette hue)
 *   4:   Accent (saturated pop)
 *   5:   Contrast (opposite lightness)
 *   6-7: Primary/accent brand colors
 */
export const INITIAL_TILE_SURFACES: Record<string, number> = {
  // Named placements (Focus, Trio, Panel, etc.)
  editorial: 2,  // muted tint — gives editorial tile a whisper of color
  social: 3,     // deeper muted tint — social posts pop with subtle bg
  product: 2,    // muted tint — product cards get gentle warmth
  // Letter placements (Grid, Spread, Mosaic, etc.)
  b: 2,          // editorial slot — muted tint
  d: 3,          // social slot — deeper muted tint
  f: 4,          // stats slot — accent pop (big number can handle bold bg)
};

/** Union of all valid placement IDs (named + letter slots). */
export type PlacementId = keyof typeof PLACEMENT_KIND_BY_ID;

/** Resolve a placement ID to its semantic kind (e.g. "hero" -> "identity"). */
export const getPlacementKind = (id?: string): PlacementKind | undefined => {
  if (!id) return undefined;
  return PLACEMENT_KIND_BY_ID[id as PlacementId];
};

/** Resolve a placement ID to the tile component type (e.g. "a" -> "logo"). */
export const getPlacementTileType = (id?: string): string | undefined => {
  if (!id) return undefined;
  return PLACEMENT_TILE_TYPE_BY_ID[id as PlacementId];
};

/** Resolve a placement ID to the tile instance ID for store lookups (e.g. "a" -> "slot-a", "hero" -> "hero-1"). */
export const getPlacementTileId = (id?: string): string | undefined => {
  if (!id) return undefined;
  return PLACEMENT_TILE_ID_BY_ID[id as PlacementId];
};
