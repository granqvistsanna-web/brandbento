export type PlacementKind =
  | 'identity'
  | 'editorial'
  | 'social'
  | 'interface'
  | 'colors';

export const PLACEMENT_KIND_BY_ID = {
  hero: 'identity',
  editorial: 'editorial',
  image: 'social',
  buttons: 'interface',
  logo: 'identity',
  colors: 'colors',
  a: 'identity',
  b: 'editorial',
  c: 'interface',
  d: 'social',
  e: 'identity',
  f: 'colors',
} as const;

export const PLACEMENT_TILE_TYPE_BY_ID = {
  hero: 'hero',
  editorial: 'editorial',
  image: 'image',
  buttons: 'ui-preview',
  logo: 'logo',
  colors: 'utility',
  a: 'hero',
  b: 'editorial',
  c: 'ui-preview',
  d: 'image',
  e: 'logo',
  f: 'utility',
} as const;

export const PLACEMENT_TILE_ID_BY_ID = {
  hero: 'hero-1',
  editorial: 'editorial-1',
  image: 'image-1',
  buttons: 'ui-preview-1',
  logo: 'logo-1',
  colors: 'utility-1',
  a: 'hero-1',
  b: 'editorial-1',
  c: 'ui-preview-1',
  d: 'image-1',
  e: 'logo-1',
  f: 'utility-1',
} as const;

export type PlacementId = keyof typeof PLACEMENT_KIND_BY_ID;

export const getPlacementKind = (id?: string): PlacementKind | undefined => {
  if (!id) return undefined;
  return PLACEMENT_KIND_BY_ID[id as PlacementId];
};

export const getPlacementTileType = (id?: string): string | undefined => {
  if (!id) return undefined;
  return PLACEMENT_TILE_TYPE_BY_ID[id as PlacementId];
};

export const getPlacementTileId = (id?: string): string | undefined => {
  if (!id) return undefined;
  return PLACEMENT_TILE_ID_BY_ID[id as PlacementId];
};
