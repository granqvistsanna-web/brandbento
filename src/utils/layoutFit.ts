// Layout fitting utility for graceful tile degradation
// Handles tiles that don't fit in the grid by reducing spans or hiding

import type {
  TileType,
  TileSpan,
  BreakpointName,
  LayoutPreset,
} from '../types/layout';

/**
 * Tile data structure for fitting algorithm
 */
export interface TileData {
  id: string;
  type: TileType;
  colSpan: number;
  rowSpan: number;
}

/**
 * Adjusted tile with potentially reduced spans
 */
export interface AdjustedTile extends TileData {
  adjustedColSpan: number;
  adjustedRowSpan: number;
}

/**
 * Result of tile fitting algorithm
 */
export interface TileFitResult {
  visibleTiles: AdjustedTile[];
  hiddenTiles: TileData[];
}

/**
 * Grid configuration for fitting
 */
export interface GridConfig {
  columns: number;
  rows: number;
}

/**
 * Priority values for tile types (lower = higher priority)
 * Hero tiles are preserved first, utility tiles hidden first
 */
const TILE_PRIORITY: Record<TileType, number> = {
  hero: 1,
  logo: 2,
  colors: 2,
  primaryType: 2,
  secondaryType: 2,
  imagery: 3,
  uiPreview: 3,
  editorial: 3,
  product: 3,
  utility: 4,
};

/**
 * Gets the priority number for a tile type
 * Lower number = higher priority (hidden last)
 */
export function getTilePriority(tileType: TileType): number {
  return TILE_PRIORITY[tileType] ?? 4;
}

/**
 * Reduces a tile's spans to fit within grid constraints
 * @param tile - The tile to potentially reduce
 * @param maxCols - Maximum columns available
 * @param maxRows - Maximum rows available
 * @returns New tile with reduced spans if necessary
 */
export function reduceTileSpans(
  tile: TileData,
  maxCols: number,
  maxRows: number
): AdjustedTile {
  return {
    ...tile,
    adjustedColSpan: Math.min(tile.colSpan, maxCols),
    adjustedRowSpan: Math.min(tile.rowSpan, maxRows),
  };
}

/**
 * Calculates the area (cells consumed) by a tile
 */
function getTileArea(tile: AdjustedTile): number {
  return tile.adjustedColSpan * tile.adjustedRowSpan;
}

/**
 * Main fitting function - fits tiles into available grid space
 * Uses priority-based placement with span reduction and overflow hiding
 *
 * @param tiles - Array of tiles to fit
 * @param gridConfig - Grid columns and rows
 * @param _breakpoint - Current breakpoint (for future use)
 * @returns Object with visible and hidden tile arrays
 */
export function fitTilesToGrid(
  tiles: TileData[],
  gridConfig: GridConfig,
  _breakpoint: BreakpointName
): TileFitResult {
  const { columns, rows } = gridConfig;
  const totalCells = columns * rows;

  // Sort tiles by priority (lower number = higher priority)
  const sortedTiles = [...tiles].sort((a, b) => {
    return getTilePriority(a.type) - getTilePriority(b.type);
  });

  const visibleTiles: AdjustedTile[] = [];
  const hiddenTiles: TileData[] = [];
  let usedCells = 0;

  for (const tile of sortedTiles) {
    // First, reduce spans if they exceed grid dimensions
    const adjustedTile = reduceTileSpans(tile, columns, rows);
    const tileArea = getTileArea(adjustedTile);

    // Check if tile fits in remaining space
    if (usedCells + tileArea <= totalCells) {
      visibleTiles.push(adjustedTile);
      usedCells += tileArea;
    } else {
      // Try to fit with minimum 1x1 span if we have any space left
      if (usedCells < totalCells) {
        const minimalTile: AdjustedTile = {
          ...tile,
          adjustedColSpan: 1,
          adjustedRowSpan: 1,
        };
        visibleTiles.push(minimalTile);
        usedCells += 1;
      } else {
        // No space at all - hide the tile
        hiddenTiles.push(tile);
      }
    }
  }

  return { visibleTiles, hiddenTiles };
}

/**
 * Expands tiles to fill available space when tile count is below capacity
 * Called after initial fitting to utilize any remaining cells
 *
 * @param result - Initial fit result
 * @param gridConfig - Grid configuration
 * @returns Updated fit result with expanded tiles
 */
export function expandTilesToFillSpace(
  result: TileFitResult,
  gridConfig: GridConfig
): TileFitResult {
  const { columns, rows } = gridConfig;
  const totalCells = columns * rows;

  // Calculate current used cells
  let usedCells = result.visibleTiles.reduce(
    (sum, tile) => sum + getTileArea(tile),
    0
  );

  if (usedCells >= totalCells) {
    return result;
  }

  // Try to expand high-priority tiles to fill space
  const expandedTiles = result.visibleTiles.map((tile) => {
    // Only expand non-utility tiles
    if (getTilePriority(tile.type) >= 4) {
      return tile;
    }

    const remainingCells = totalCells - usedCells;
    if (remainingCells <= 0) {
      return tile;
    }

    // Try to add one row if possible
    const canExpandRow =
      tile.adjustedRowSpan < rows &&
      remainingCells >= tile.adjustedColSpan;

    if (canExpandRow) {
      const expanded = {
        ...tile,
        adjustedRowSpan: tile.adjustedRowSpan + 1,
      };
      usedCells += tile.adjustedColSpan;
      return expanded;
    }

    return tile;
  });

  return {
    visibleTiles: expandedTiles,
    hiddenTiles: result.hiddenTiles,
  };
}

/**
 * Creates tile data from a tile type using preset spans
 *
 * @param id - Unique tile identifier
 * @param type - Tile type
 * @param preset - Layout preset with span definitions
 * @param breakpoint - Current breakpoint
 * @returns TileData object
 */
export function createTileData(
  id: string,
  type: TileType,
  preset: LayoutPreset,
  breakpoint: BreakpointName
): TileData {
  const spans = preset.tileSpans[type]?.[breakpoint] ?? { colSpan: 1, rowSpan: 1 };

  return {
    id,
    type,
    colSpan: spans.colSpan,
    rowSpan: spans.rowSpan,
  };
}

/**
 * Gets the adjusted span for a tile in a fit result
 */
export function getAdjustedSpan(tile: AdjustedTile): TileSpan {
  return {
    colSpan: tile.adjustedColSpan,
    rowSpan: tile.adjustedRowSpan,
  };
}
