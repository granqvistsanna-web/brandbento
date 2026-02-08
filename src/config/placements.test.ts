import { describe, expect, it } from 'vitest';
import {
  PLACEMENT_KIND_BY_ID,
  PLACEMENT_TILE_ID_BY_ID,
  PLACEMENT_TILE_TYPE_BY_ID,
  getPlacementKind,
  getPlacementTileId,
  getPlacementTileType,
} from './placements';

describe('placements mapping', () => {
  it('returns undefined for unknown placement ids', () => {
    expect(getPlacementKind('unknown')).toBeUndefined();
    expect(getPlacementTileType('unknown')).toBeUndefined();
    expect(getPlacementTileId('unknown')).toBeUndefined();
  });

  it('maps every placement id to a kind and tile type', () => {
    const ids = Object.keys(PLACEMENT_KIND_BY_ID);
    ids.forEach((id) => {
      expect(getPlacementKind(id)).toBe(PLACEMENT_KIND_BY_ID[id as keyof typeof PLACEMENT_KIND_BY_ID]);
      expect(getPlacementTileType(id)).toBe(
        PLACEMENT_TILE_TYPE_BY_ID[id as keyof typeof PLACEMENT_TILE_TYPE_BY_ID]
      );
      expect(getPlacementTileId(id)).toBe(
        PLACEMENT_TILE_ID_BY_ID[id as keyof typeof PLACEMENT_TILE_ID_BY_ID]
      );
    });
  });
});
