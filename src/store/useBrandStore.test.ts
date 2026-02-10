import { beforeEach, describe, expect, it } from 'vitest';
import { useBrandStore } from './useBrandStore';

const pickState = () => {
  const state = useBrandStore.getState();
  return {
    brand: state.brand,
    tiles: state.tiles,
    focusedTileId: state.focusedTileId,
    darkModePreview: state.darkModePreview,
    fontPreview: state.fontPreview,
    theme: state.theme,
    resolvedTheme: state.resolvedTheme,
    history: state.history,
    tileSurfaces: state.tileSurfaces,
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
