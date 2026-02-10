import { describe, expect, it } from 'vitest';
import { resolveSurfaceColor } from './surface';

describe('resolveSurfaceColor', () => {
  const surfaces = ['#F5F5F5', '#E0E0E0', '#D0D0D0'];
  const bg = '#FFFFFF';

  it('returns surface at defaultIndex when no placementId', () => {
    expect(
      resolveSurfaceColor({ surfaces, bg, defaultIndex: 1 })
    ).toBe('#E0E0E0');
  });

  it('returns surface at tileSurfaceIndex when placementId is set', () => {
    expect(
      resolveSurfaceColor({
        placementId: 'tile-1',
        tileSurfaceIndex: 2,
        surfaces,
        bg,
        defaultIndex: 0,
      })
    ).toBe('#D0D0D0');
  });

  it('falls back to defaultIndex when tileSurfaceIndex is undefined', () => {
    expect(
      resolveSurfaceColor({
        placementId: 'tile-1',
        tileSurfaceIndex: undefined,
        surfaces,
        bg,
        defaultIndex: 1,
      })
    ).toBe('#E0E0E0');
  });

  it('returns bg when surfaces is undefined', () => {
    expect(
      resolveSurfaceColor({
        surfaces: undefined,
        bg,
        defaultIndex: 0,
      })
    ).toBe('#FFFFFF');
  });

  it('returns bg when surfaces is empty', () => {
    expect(
      resolveSurfaceColor({
        surfaces: [],
        bg,
        defaultIndex: 0,
      })
    ).toBe('#FFFFFF');
  });

  it('returns bg when index is out of bounds', () => {
    expect(
      resolveSurfaceColor({
        surfaces,
        bg,
        defaultIndex: 99,
      })
    ).toBe('#FFFFFF');
  });

  it('uses tileSurfaceIndex 0 correctly (not falsy)', () => {
    expect(
      resolveSurfaceColor({
        placementId: 'tile-1',
        tileSurfaceIndex: 0,
        surfaces,
        bg,
        defaultIndex: 2,
      })
    ).toBe('#F5F5F5');
  });
});
