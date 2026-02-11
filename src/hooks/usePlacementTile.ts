import { useLayoutStore } from '@/store/useLayoutStore';
import {
  getPlacementTileId,
  getPlacementTileType,
  resolveSwappedId,
} from '@/config/placements';

/**
 * Swap-aware placement tile resolution.
 *
 * Each tile component receives a `placementId` (the grid slot ID).
 * When tiles have been drag-swapped, this hook resolves through
 * the swap map so the tile looks up the correct tile instance.
 */
export function usePlacementTile(placementId?: string) {
  const swaps = useLayoutStore((s) => s.placementSwaps);
  if (!placementId) return { tileId: undefined, tileType: undefined };
  const effectiveId = resolveSwappedId(placementId, swaps);
  return {
    tileId: getPlacementTileId(effectiveId),
    tileType: getPlacementTileType(effectiveId),
  };
}
