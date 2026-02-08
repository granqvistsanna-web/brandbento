import LZString from 'lz-string';
import type { CanvasState } from '@/types/brand';

export function compressState(state: CanvasState): string {
  const assets = state.assets ?? { logo: null, heroImage: null };

  const storeDataUri = (key: string, dataUri: string): boolean => {
    try {
      localStorage.setItem(key, dataUri);
      return true;
    } catch (e) {
      console.warn('Failed to store image in localStorage', e);
      return false;
    }
  };

  // Remove large data URIs before compression - store separately
  const serializable = {
    ...state,
    assets: {
      ...assets,
      logo: assets.logo?.startsWith('data:')
        ? (() => {
            const hash = hashString(assets.logo);
            const stored = storeDataUri(`bb:img:${hash}`, assets.logo);
            return stored ? `ref:${hash}` : assets.logo;
          })()
        : assets.logo,
      heroImage: assets.heroImage?.startsWith('data:')
        ? (() => {
            const hash = hashString(assets.heroImage);
            const stored = storeDataUri(`bb:img:${hash}`, assets.heroImage);
            return stored ? `ref:${hash}` : assets.heroImage;
          })()
        : assets.heroImage,
    }
  };

  const json = JSON.stringify(serializable);
  const compressed = LZString.compressToEncodedURIComponent(json);

  if (compressed.length > 1800) {
    console.warn(`URL state: ${compressed.length} chars (approaching 2000 limit)`);
  }

  return compressed;
}

export function decompressState(compressed: string): CanvasState | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;

    const state = JSON.parse(json) as CanvasState;
    if (!state.assets) {
      state.assets = { logo: null, heroImage: null } as CanvasState['assets'];
    }

    // Restore data URIs from localStorage
    if (state.assets?.logo?.startsWith('ref:')) {
      const hash = state.assets.logo.slice(4);
      state.assets.logo = localStorage.getItem(`bb:img:${hash}`) || null;
    }
    if (state.assets?.heroImage?.startsWith('ref:')) {
      const hash = state.assets.heroImage.slice(4);
      state.assets.heroImage = localStorage.getItem(`bb:img:${hash}`) || null;
    }

    return state;
  } catch (error) {
    console.error('Failed to decompress state', error);
    return null;
  }
}

/**
 * cyrb53 hash function - fast, good distribution, low collision probability
 * Produces a 53-bit hash (JavaScript's max safe integer precision)
 * @see https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
 */
function hashString(str: string, seed: number = 0): string {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;

  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  // Combine h1 and h2 into a 53-bit value, then convert to base36
  const hash = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return hash.toString(36);
}
