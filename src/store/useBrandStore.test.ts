import { beforeEach, describe, expect, it } from 'vitest';
import {
  useBrandStore,
  selectFocusedTile,
  selectCanUndo,
  selectCanRedo,
  exportAsCSS,
  exportAsJSON,
} from './useBrandStore';
import { DEFAULT_BRAND } from '../data/brandPresets';
import { getAllPalettes } from '../data/colorPalettes';

const pickState = () => {
  const state = useBrandStore.getState();
  return {
    brand: state.brand,
    tiles: state.tiles,
    focusedTileId: state.focusedTileId,
    theme: state.theme,
    resolvedTheme: state.resolvedTheme,
    history: state.history,
    tileSurfaces: state.tileSurfaces,
    placementContent: state.placementContent,
  };
};

const clone = <T>(value: T): T => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

const initialState = clone(pickState());

beforeEach(() => {
  localStorage.removeItem('brand-store');
  useBrandStore.setState(clone(initialState));
});

// ---------------------------------------------------------------------------
// History behavior (existing)
// ---------------------------------------------------------------------------
describe('useBrandStore history behavior', () => {
  it('does not push history for draft tile updates', () => {
    const { tiles, updateTile } = useBrandStore.getState();
    const tileId = tiles[0].id;

    updateTile(tileId, { headline: 'Draft headline' }, false);

    const state = useBrandStore.getState();
    const updated = state.tiles.find((t) => t.id === tileId);

    expect(state.history.past.length).toBe(0);
    expect(updated?.content.headline).toBe('Draft headline');
  });

  it('pushes exactly one history entry for committed tile updates', () => {
    const { tiles, updateTile } = useBrandStore.getState();
    const tileId = tiles[0].id;

    updateTile(tileId, { headline: 'Committed headline' }, true);

    const state = useBrandStore.getState();
    expect(state.history.past.length).toBe(1);
    expect(state.history.future.length).toBe(0);
  });

  it('does not push history for no-op brand updates', () => {
    const { updateBrand, brand } = useBrandStore.getState();

    updateBrand({});
    updateBrand({ colors: brand.colors });
    updateBrand({ colors: { ...brand.colors } });
    updateBrand({
      colors: {
        ...brand.colors,
        surfaces: [...brand.colors.surfaces],
        paletteColors: [...brand.colors.paletteColors],
      },
    });

    const state = useBrandStore.getState();
    expect(state.history.past.length).toBe(0);
  });

  it('pushes history for committed brand updates with changes', () => {
    const { updateBrand, brand } = useBrandStore.getState();

    updateBrand({ logo: { ...brand.logo, text: 'New Brand' } }, true);

    const state = useBrandStore.getState();
    expect(state.history.past.length).toBe(1);
    expect(state.brand.logo.text).toBe('New Brand');
  });

  it('does not push history for draft placement content updates', () => {
    const { setPlacementContent } = useBrandStore.getState();

    setPlacementContent('social', { socialHandle: 'draft' }, false);

    const state = useBrandStore.getState();
    expect(state.history.past.length).toBe(0);
    expect(state.placementContent.social?.socialHandle).toBe('draft');
  });

  it('pushes history for committed placement content updates', () => {
    const { setPlacementContent } = useBrandStore.getState();

    setPlacementContent('social', { socialHandle: 'committed' }, true);

    const state = useBrandStore.getState();
    expect(state.history.past.length).toBe(1);
    expect(state.placementContent.social?.socialHandle).toBe('committed');
  });
});

// ---------------------------------------------------------------------------
// UI State Actions
// ---------------------------------------------------------------------------
describe('UI state actions', () => {
  it('setFocusedTile sets and clears focusedTileId', () => {
    const { setFocusedTile } = useBrandStore.getState();

    setFocusedTile('hero-1');
    expect(useBrandStore.getState().focusedTileId).toBe('hero-1');

    setFocusedTile(null);
    expect(useBrandStore.getState().focusedTileId).toBeNull();
  });

  it('setTheme sets theme preference', () => {
    useBrandStore.getState().setTheme('dark');
    expect(useBrandStore.getState().theme).toBe('dark');

    useBrandStore.getState().setTheme('light');
    expect(useBrandStore.getState().theme).toBe('light');

    useBrandStore.getState().setTheme('system');
    expect(useBrandStore.getState().theme).toBe('system');
  });

  it('setResolvedTheme sets computed theme', () => {
    useBrandStore.getState().setResolvedTheme('dark');
    expect(useBrandStore.getState().resolvedTheme).toBe('dark');

    useBrandStore.getState().setResolvedTheme('light');
    expect(useBrandStore.getState().resolvedTheme).toBe('light');
  });
});

// ---------------------------------------------------------------------------
// updateBrand
// ---------------------------------------------------------------------------
describe('updateBrand', () => {
  it('merges typography changes correctly', () => {
    useBrandStore.getState().updateBrand({
      typography: { ...useBrandStore.getState().brand.typography, primary: 'Roboto' },
    });
    expect(useBrandStore.getState().brand.typography.primary).toBe('Roboto');
    // Other typography fields preserved
    expect(useBrandStore.getState().brand.typography.secondary).toBe(DEFAULT_BRAND.typography.secondary);
  });

  it('merges color changes correctly', () => {
    useBrandStore.getState().updateBrand({
      colors: { ...useBrandStore.getState().brand.colors, primary: '#FF0000' },
    });
    expect(useBrandStore.getState().brand.colors.primary).toBe('#FF0000');
    expect(useBrandStore.getState().brand.colors.bg).toBe(DEFAULT_BRAND.colors.bg);
  });

  it('merges logo changes correctly', () => {
    useBrandStore.getState().updateBrand({
      logo: { ...useBrandStore.getState().brand.logo, text: 'NEWLOGO' },
    });
    expect(useBrandStore.getState().brand.logo.text).toBe('NEWLOGO');
    expect(useBrandStore.getState().brand.logo.padding).toBe(DEFAULT_BRAND.logo.padding);
  });

  it('merges imagery changes correctly', () => {
    useBrandStore.getState().updateBrand({
      imagery: { ...useBrandStore.getState().brand.imagery, style: 'grayscale' },
    });
    expect(useBrandStore.getState().brand.imagery.style).toBe('grayscale');
  });

  it('merges UI settings correctly', () => {
    useBrandStore.getState().updateBrand({
      ui: { ...useBrandStore.getState().brand.ui, buttonRadius: 20 },
    });
    expect(useBrandStore.getState().brand.ui.buttonRadius).toBe(20);
  });

  it('does not push history when isCommit is false', () => {
    useBrandStore.getState().updateBrand(
      { logo: { ...useBrandStore.getState().brand.logo, text: 'DRAFT' } },
      false
    );
    expect(useBrandStore.getState().brand.logo.text).toBe('DRAFT');
    expect(useBrandStore.getState().history.past.length).toBe(0);
  });

  it('detects no-op for identical typography', () => {
    const { brand } = useBrandStore.getState();
    useBrandStore.getState().updateBrand({
      typography: brand.typography,
    });
    expect(useBrandStore.getState().history.past.length).toBe(0);
  });

  it('detects no-op for identical logo', () => {
    const { brand } = useBrandStore.getState();
    useBrandStore.getState().updateBrand({
      logo: brand.logo,
    });
    expect(useBrandStore.getState().history.past.length).toBe(0);
  });

  it('detects no-op for identical imagery', () => {
    const { brand } = useBrandStore.getState();
    useBrandStore.getState().updateBrand({
      imagery: brand.imagery,
    });
    expect(useBrandStore.getState().history.past.length).toBe(0);
  });

  it('replaces surfaces array wholesale', () => {
    const newSurfaces = ['#111', '#222', '#333'];
    useBrandStore.getState().updateBrand({
      colors: { ...useBrandStore.getState().brand.colors, surfaces: newSurfaces },
    });
    expect(useBrandStore.getState().brand.colors.surfaces).toEqual(newSurfaces);
  });
});

// ---------------------------------------------------------------------------
// updateTile
// ---------------------------------------------------------------------------
describe('updateTile', () => {
  it('updates tile content by id', () => {
    const { tiles } = useBrandStore.getState();
    const tileId = tiles[0].id;

    useBrandStore.getState().updateTile(tileId, { headline: 'Updated' });

    const updated = useBrandStore.getState().tiles.find((t) => t.id === tileId);
    expect(updated?.content.headline).toBe('Updated');
  });

  it('does not modify other tiles', () => {
    const { tiles } = useBrandStore.getState();
    if (tiles.length < 2) return;
    const tileId = tiles[0].id;
    const otherContent = clone(tiles[1].content);

    useBrandStore.getState().updateTile(tileId, { headline: 'Changed' });

    const other = useBrandStore.getState().tiles.find((t) => t.id === tiles[1].id);
    expect(other?.content).toEqual(otherContent);
  });

  it('no-ops for nonexistent tile id', () => {
    const before = clone(useBrandStore.getState().tiles);
    useBrandStore.getState().updateTile('nonexistent-id', { headline: 'X' });
    expect(useBrandStore.getState().tiles).toEqual(before);
    expect(useBrandStore.getState().history.past.length).toBe(0);
  });

  it('no-ops when content has not changed', () => {
    const { tiles } = useBrandStore.getState();
    const tile = tiles[0];
    useBrandStore.getState().updateTile(tile.id, { headline: tile.content.headline });
    expect(useBrandStore.getState().history.past.length).toBe(0);
  });

  it('merges new content fields with existing content', () => {
    const { tiles } = useBrandStore.getState();
    const tile = tiles[0];
    const existingContent = clone(tile.content);

    useBrandStore.getState().updateTile(tile.id, { body: 'New body text' });

    const updated = useBrandStore.getState().tiles.find((t) => t.id === tile.id);
    expect(updated?.content.body).toBe('New body text');
    // Original fields preserved
    if (existingContent.headline) {
      expect(updated?.content.headline).toBe(existingContent.headline);
    }
  });
});

// ---------------------------------------------------------------------------
// swapTileType
// ---------------------------------------------------------------------------
describe('swapTileType', () => {
  it('changes tile type and resets content to defaults', () => {
    const { tiles } = useBrandStore.getState();
    const tileId = tiles[0].id;

    useBrandStore.getState().swapTileType(tileId, 'editorial');

    const swapped = useBrandStore.getState().tiles.find((t) => t.id === tileId);
    expect(swapped?.type).toBe('editorial');
    expect(swapped?.content.headline).toBe('New Editorial');
    expect(swapped?.content.body).toBe('Editorial body text');
  });

  it('pushes history entry', () => {
    const { tiles } = useBrandStore.getState();
    useBrandStore.getState().swapTileType(tiles[0].id, 'editorial');
    expect(useBrandStore.getState().history.past.length).toBe(1);
  });

  it('no-ops for nonexistent tile id', () => {
    const before = clone(useBrandStore.getState().tiles);
    useBrandStore.getState().swapTileType('nonexistent-id', 'editorial');
    expect(useBrandStore.getState().tiles).toEqual(before);
    expect(useBrandStore.getState().history.past.length).toBe(0);
  });

  it('uses empty content for unknown tile type', () => {
    const { tiles } = useBrandStore.getState();
    useBrandStore.getState().swapTileType(tiles[0].id, 'unknown-type-xyz');

    const swapped = useBrandStore.getState().tiles.find((t) => t.id === tiles[0].id);
    expect(swapped?.type).toBe('unknown-type-xyz');
    expect(swapped?.content).toEqual({});
  });

  it('preserves other tile properties (colSpan, rowSpan)', () => {
    const { tiles } = useBrandStore.getState();
    const tile = tiles[0];
    const { colSpan, rowSpan } = tile;

    useBrandStore.getState().swapTileType(tile.id, 'product');

    const swapped = useBrandStore.getState().tiles.find((t) => t.id === tile.id);
    expect(swapped?.colSpan).toBe(colSpan);
    expect(swapped?.rowSpan).toBe(rowSpan);
  });
});

// ---------------------------------------------------------------------------
// setTileSurface
// ---------------------------------------------------------------------------
describe('setTileSurface', () => {
  it('sets surface index for a placement', () => {
    useBrandStore.getState().setTileSurface('hero', 2);
    expect(useBrandStore.getState().tileSurfaces.hero).toBe(2);
  });

  it('pushes history for committed surface changes', () => {
    useBrandStore.getState().setTileSurface('hero', 1, true);
    expect(useBrandStore.getState().history.past.length).toBe(1);
  });

  it('does not push history when isCommit is false', () => {
    useBrandStore.getState().setTileSurface('hero', 1, false);
    expect(useBrandStore.getState().tileSurfaces.hero).toBe(1);
    expect(useBrandStore.getState().history.past.length).toBe(0);
  });

  it('no-ops when surface index is unchanged', () => {
    useBrandStore.getState().setTileSurface('hero', 3);
    const historyBefore = useBrandStore.getState().history.past.length;

    useBrandStore.getState().setTileSurface('hero', 3);
    expect(useBrandStore.getState().history.past.length).toBe(historyBefore);
  });

  it('can set surface to undefined (reset)', () => {
    useBrandStore.getState().setTileSurface('hero', 2);
    useBrandStore.getState().setTileSurface('hero', undefined);
    expect(useBrandStore.getState().tileSurfaces.hero).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// setPlacementContent
// ---------------------------------------------------------------------------
describe('setPlacementContent', () => {
  it('sets content for a placement', () => {
    useBrandStore.getState().setPlacementContent('hero', { headline: 'Test' });
    expect(useBrandStore.getState().placementContent.hero?.headline).toBe('Test');
  });

  it('merges with existing placement content', () => {
    useBrandStore.getState().setPlacementContent('hero', { headline: 'First' });
    useBrandStore.getState().setPlacementContent('hero', { body: 'Second' });

    const content = useBrandStore.getState().placementContent.hero;
    expect(content?.headline).toBe('First');
    expect(content?.body).toBe('Second');
  });

  it('no-ops when content is identical', () => {
    useBrandStore.getState().setPlacementContent('hero', { headline: 'Same' });
    const historyBefore = useBrandStore.getState().history.past.length;

    useBrandStore.getState().setPlacementContent('hero', { headline: 'Same' });
    expect(useBrandStore.getState().history.past.length).toBe(historyBefore);
  });
});

// ---------------------------------------------------------------------------
// Undo / Redo
// ---------------------------------------------------------------------------
describe('undo and redo', () => {
  it('undo restores previous brand state', () => {
    const originalText = useBrandStore.getState().brand.logo.text;

    useBrandStore.getState().updateBrand({
      logo: { ...useBrandStore.getState().brand.logo, text: 'CHANGED' },
    });
    expect(useBrandStore.getState().brand.logo.text).toBe('CHANGED');

    useBrandStore.getState().undo();
    expect(useBrandStore.getState().brand.logo.text).toBe(originalText);
  });

  it('redo restores undone state', () => {
    useBrandStore.getState().updateBrand({
      logo: { ...useBrandStore.getState().brand.logo, text: 'CHANGED' },
    });
    useBrandStore.getState().undo();
    useBrandStore.getState().redo();
    expect(useBrandStore.getState().brand.logo.text).toBe('CHANGED');
  });

  it('undo is no-op when past is empty', () => {
    const before = clone(useBrandStore.getState().brand);
    useBrandStore.getState().undo();
    expect(useBrandStore.getState().brand).toEqual(before);
  });

  it('redo is no-op when future is empty', () => {
    const before = clone(useBrandStore.getState().brand);
    useBrandStore.getState().redo();
    expect(useBrandStore.getState().brand).toEqual(before);
  });

  it('undo moves current state to future', () => {
    useBrandStore.getState().updateBrand({
      logo: { ...useBrandStore.getState().brand.logo, text: 'V2' },
    });
    useBrandStore.getState().undo();

    const state = useBrandStore.getState();
    expect(state.history.past.length).toBe(0);
    expect(state.history.future.length).toBe(1);
    expect(state.history.future[0].brand.logo.text).toBe('V2');
  });

  it('new commit clears future (redo stack)', () => {
    useBrandStore.getState().updateBrand({
      logo: { ...useBrandStore.getState().brand.logo, text: 'V2' },
    });
    useBrandStore.getState().undo();
    expect(useBrandStore.getState().history.future.length).toBe(1);

    // New commit should clear future
    useBrandStore.getState().updateBrand({
      logo: { ...useBrandStore.getState().brand.logo, text: 'V3' },
    });
    expect(useBrandStore.getState().history.future.length).toBe(0);
  });

  it('undo restores tile surfaces', () => {
    useBrandStore.getState().setTileSurface('hero', 5);
    useBrandStore.getState().undo();
    expect(useBrandStore.getState().tileSurfaces.hero).toBeUndefined();
  });

  it('undo restores placement content', () => {
    useBrandStore.getState().setPlacementContent('hero', { headline: 'Edited' });
    useBrandStore.getState().undo();
    expect(useBrandStore.getState().placementContent.hero?.headline).toBeUndefined();
  });

  it('multiple undo/redo cycles work correctly', () => {
    const original = useBrandStore.getState().brand.logo.text;

    useBrandStore.getState().updateBrand({
      logo: { ...useBrandStore.getState().brand.logo, text: 'V2' },
    });
    useBrandStore.getState().updateBrand({
      logo: { ...useBrandStore.getState().brand.logo, text: 'V3' },
    });

    expect(useBrandStore.getState().history.past.length).toBe(2);

    useBrandStore.getState().undo();
    expect(useBrandStore.getState().brand.logo.text).toBe('V2');

    useBrandStore.getState().undo();
    expect(useBrandStore.getState().brand.logo.text).toBe(original);

    useBrandStore.getState().redo();
    expect(useBrandStore.getState().brand.logo.text).toBe('V2');

    useBrandStore.getState().redo();
    expect(useBrandStore.getState().brand.logo.text).toBe('V3');
  });

  it('history is capped at MAX_HISTORY (50)', () => {
    for (let i = 0; i < 60; i++) {
      useBrandStore.getState().updateBrand({
        logo: { ...useBrandStore.getState().brand.logo, text: `V${i}` },
      });
    }
    expect(useBrandStore.getState().history.past.length).toBeLessThanOrEqual(50);
  });
});

// ---------------------------------------------------------------------------
// shuffleBrand
// ---------------------------------------------------------------------------
describe('shuffleBrand', () => {
  it('changes brand colors and typography', () => {
    const before = clone(useBrandStore.getState().brand);
    useBrandStore.getState().shuffleBrand();
    const after = useBrandStore.getState().brand;

    // At least one of colors or typography should change
    const colorsChanged = after.colors.primary !== before.colors.primary
      || after.colors.bg !== before.colors.bg;
    const fontChanged = after.typography.primary !== before.typography.primary;
    expect(colorsChanged || fontChanged).toBe(true);
  });

  it('pushes history entry', () => {
    useBrandStore.getState().shuffleBrand();
    expect(useBrandStore.getState().history.past.length).toBe(1);
  });

  it('clears redo stack', () => {
    // Create some future entries
    useBrandStore.getState().updateBrand({
      logo: { ...useBrandStore.getState().brand.logo, text: 'X' },
    });
    useBrandStore.getState().undo();
    expect(useBrandStore.getState().history.future.length).toBe(1);

    useBrandStore.getState().shuffleBrand();
    expect(useBrandStore.getState().history.future.length).toBe(0);
  });

  it('sets activePreset to "custom"', () => {
    useBrandStore.getState().shuffleBrand();
    expect(useBrandStore.getState().activePreset).toBe('custom');
  });

  it('produces valid hex colors in result', () => {
    useBrandStore.getState().shuffleBrand();
    const { colors } = useBrandStore.getState().brand;
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    expect(colors.bg).toMatch(hexRegex);
    expect(colors.text).toMatch(hexRegex);
    expect(colors.primary).toMatch(hexRegex);
    expect(colors.accent).toMatch(hexRegex);
  });
});

// ---------------------------------------------------------------------------
// loadPreset
// ---------------------------------------------------------------------------
describe('loadPreset', () => {
  it('loads a known preset', () => {
    useBrandStore.getState().loadPreset('techStartup');
    expect(useBrandStore.getState().brand.typography.primary).toBe('Sora');
    expect(useBrandStore.getState().activePreset).toBe('techStartup');
  });

  it('pushes history entry', () => {
    useBrandStore.getState().loadPreset('techStartup');
    expect(useBrandStore.getState().history.past.length).toBe(1);
  });

  it('no-ops for unknown preset name', () => {
    const before = clone(useBrandStore.getState().brand);
    useBrandStore.getState().loadPreset('nonexistent-preset');
    expect(useBrandStore.getState().brand).toEqual(before);
    expect(useBrandStore.getState().history.past.length).toBe(0);
  });

  it('is undoable', () => {
    const original = useBrandStore.getState().brand.typography.primary;
    useBrandStore.getState().loadPreset('techStartup');
    useBrandStore.getState().undo();
    expect(useBrandStore.getState().brand.typography.primary).toBe(original);
  });
});

// ---------------------------------------------------------------------------
// applyPalette
// ---------------------------------------------------------------------------
describe('applyPalette', () => {
  it('applies a palette by id', () => {
    const palettes = getAllPalettes();
    if (palettes.length === 0) return;
    const palette = palettes[0];

    useBrandStore.getState().applyPalette(palette.id);

    const { colors } = useBrandStore.getState().brand;
    expect(colors.bg).toBeDefined();
    expect(colors.primary).toBeDefined();
  });

  it('pushes history entry', () => {
    const palettes = getAllPalettes();
    if (palettes.length === 0) return;
    useBrandStore.getState().applyPalette(palettes[0].id);
    expect(useBrandStore.getState().history.past.length).toBe(1);
  });

  it('no-ops for unknown palette id', () => {
    const before = clone(useBrandStore.getState().brand);
    useBrandStore.getState().applyPalette('nonexistent-palette');
    expect(useBrandStore.getState().brand).toEqual(before);
    expect(useBrandStore.getState().history.past.length).toBe(0);
  });

  it('simple complexity uses neutral foundation', () => {
    const palettes = getAllPalettes();
    if (palettes.length === 0) return;

    useBrandStore.getState().applyPalette(palettes[0].id, 'simple');

    const { colors } = useBrandStore.getState().brand;
    expect(colors.bg).toBe('#FAFAFA');
    expect(colors.text).toBe('#171717');
    expect(colors.surface).toBe('#F5F5F5');
    expect(colors.accent).toBe(colors.primary); // Same as primary in simple mode
  });

  it('curated complexity limits surfaces to 3', () => {
    const palettes = getAllPalettes();
    if (palettes.length === 0) return;

    useBrandStore.getState().applyPalette(palettes[0].id, 'curated');

    const { colors } = useBrandStore.getState().brand;
    expect(colors.surfaces.length).toBeLessThanOrEqual(3);
  });

  it('full complexity preserves all surfaces', () => {
    const palettes = getAllPalettes();
    if (palettes.length === 0) return;

    useBrandStore.getState().applyPalette(palettes[0].id, 'full');

    const { colors } = useBrandStore.getState().brand;
    // Full mode should have at least as many surfaces as curated
    expect(colors.surfaces.length).toBeGreaterThan(0);
  });

  it('preserves non-color brand properties', () => {
    const originalTypo = clone(useBrandStore.getState().brand.typography);
    const palettes = getAllPalettes();
    if (palettes.length === 0) return;

    useBrandStore.getState().applyPalette(palettes[0].id);

    expect(useBrandStore.getState().brand.typography).toEqual(originalTypo);
  });
});

// ---------------------------------------------------------------------------
// loadRandomTemplate
// ---------------------------------------------------------------------------
describe('loadRandomTemplate', () => {
  it('loads a template with brand and tiles', () => {
    useBrandStore.getState().loadRandomTemplate();

    const state = useBrandStore.getState();
    expect(state.brand).toBeDefined();
    expect(state.tiles.length).toBeGreaterThan(0);
    expect(state.activePreset).toBe('custom');
  });

  it('clears history completely', () => {
    // Build up some history
    useBrandStore.getState().updateBrand({
      logo: { ...useBrandStore.getState().brand.logo, text: 'X' },
    });
    expect(useBrandStore.getState().history.past.length).toBe(1);

    useBrandStore.getState().loadRandomTemplate();
    expect(useBrandStore.getState().history.past.length).toBe(0);
    expect(useBrandStore.getState().history.future.length).toBe(0);
  });

  it('resets tileSurfaces', () => {
    useBrandStore.getState().setTileSurface('hero', 3);
    useBrandStore.getState().loadRandomTemplate();
    expect(useBrandStore.getState().tileSurfaces).toEqual({});
  });

  it('deduplicates tile types', () => {
    useBrandStore.getState().loadRandomTemplate();
    const types = useBrandStore.getState().tiles.map((t) => t.type);
    const uniqueTypes = new Set(types);
    expect(uniqueTypes.size).toBe(types.length);
  });

  it('avoids same template on consecutive calls', () => {
    useBrandStore.getState().loadRandomTemplate();
    const first = clone(useBrandStore.getState().brand);

    // Call many times to check it doesn't always pick the same
    let gotDifferent = false;
    for (let i = 0; i < 10; i++) {
      useBrandStore.getState().loadRandomTemplate();
      if (useBrandStore.getState().brand.logo.text !== first.logo.text) {
        gotDifferent = true;
        break;
      }
    }
    // With 6 templates, should get a different one within 10 tries
    expect(gotDifferent).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// resetToDefaults
// ---------------------------------------------------------------------------
describe('resetToDefaults', () => {
  it('resets brand to DEFAULT_BRAND', () => {
    useBrandStore.getState().updateBrand({
      logo: { ...useBrandStore.getState().brand.logo, text: 'CUSTOM' },
    });
    useBrandStore.getState().resetToDefaults();
    expect(useBrandStore.getState().brand.logo.text).toBe(DEFAULT_BRAND.logo.text);
  });

  it('resets activePreset to "default"', () => {
    useBrandStore.getState().shuffleBrand();
    expect(useBrandStore.getState().activePreset).toBe('custom');

    useBrandStore.getState().resetToDefaults();
    expect(useBrandStore.getState().activePreset).toBe('default');
  });

  it('resets tileSurfaces', () => {
    useBrandStore.getState().setTileSurface('hero', 2);
    useBrandStore.getState().resetToDefaults();
    expect(useBrandStore.getState().tileSurfaces).toEqual({});
  });

  it('pushes history (is undoable)', () => {
    useBrandStore.getState().updateBrand({
      logo: { ...useBrandStore.getState().brand.logo, text: 'BEFORE_RESET' },
    });
    useBrandStore.getState().resetToDefaults();
    expect(useBrandStore.getState().history.past.length).toBe(2);

    useBrandStore.getState().undo();
    expect(useBrandStore.getState().brand.logo.text).toBe('BEFORE_RESET');
  });
});

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------
describe('selectors', () => {
  it('selectFocusedTile returns undefined when no tile focused', () => {
    const state = useBrandStore.getState();
    expect(selectFocusedTile(state)).toBeUndefined();
  });

  it('selectFocusedTile finds tile by direct id', () => {
    useBrandStore.getState().setFocusedTile('hero-1');
    const state = useBrandStore.getState();
    const tile = selectFocusedTile(state);
    expect(tile).toBeDefined();
    expect(tile?.id).toBe('hero-1');
  });

  it('selectCanUndo returns false initially', () => {
    expect(selectCanUndo(useBrandStore.getState())).toBe(false);
  });

  it('selectCanUndo returns true after a commit', () => {
    useBrandStore.getState().updateBrand({
      logo: { ...useBrandStore.getState().brand.logo, text: 'X' },
    });
    expect(selectCanUndo(useBrandStore.getState())).toBe(true);
  });

  it('selectCanRedo returns false initially', () => {
    expect(selectCanRedo(useBrandStore.getState())).toBe(false);
  });

  it('selectCanRedo returns true after undo', () => {
    useBrandStore.getState().updateBrand({
      logo: { ...useBrandStore.getState().brand.logo, text: 'X' },
    });
    useBrandStore.getState().undo();
    expect(selectCanRedo(useBrandStore.getState())).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Export functions
// ---------------------------------------------------------------------------
describe('exportAsCSS', () => {
  it('generates valid CSS custom properties', () => {
    const css = exportAsCSS(DEFAULT_BRAND);
    expect(css).toContain(':root {');
    expect(css).toContain('--font-primary: Inter');
    expect(css).toContain('--color-bg: #FFFFFF');
    expect(css).toContain('--color-primary: #000000');
    expect(css).toContain('--logo-text: "BENTO"');
  });

  it('returns placeholder for null brand', () => {
    const css = exportAsCSS(null);
    expect(css).toContain('No brand data');
  });
});

describe('exportAsJSON', () => {
  it('exports brand as formatted JSON', () => {
    const json = exportAsJSON(DEFAULT_BRAND);
    const parsed = JSON.parse(json);
    expect(parsed.typography.primary).toBe('Inter');
    expect(parsed.colors.bg).toBe('#FFFFFF');
  });

  it('returns empty object for null brand', () => {
    const json = exportAsJSON(null);
    expect(JSON.parse(json)).toEqual({});
  });
});

