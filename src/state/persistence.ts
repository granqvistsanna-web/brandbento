import type { CanvasState } from '@/types/brand';
import { compressState, decompressState } from '@/utils/compression';
import { createDefaultState } from './defaults';

const STORAGE_KEY = 'brandBentoState';

export function syncStateToURL(state: CanvasState): void {
  const compressed = compressState(state);
  const url = new URL(window.location.href);
  url.hash = compressed;
  window.history.replaceState(null, '', url);
}

export function loadStateFromURL(): CanvasState | null {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  return decompressState(hash);
}

export function saveStateToLocalStorage(state: CanvasState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(`${STORAGE_KEY}:timestamp`, Date.now().toString());
  } catch (error) {
    if ((error as Error).name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, clearing old data');
      clearOldImageData();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('Failed to save state after cleanup', e);
      }
    }
  }
}

export function loadStateFromLocalStorage(): CanvasState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    // Validate the parsed data has the expected shape
    if (!isValidCanvasState(parsed)) {
      console.warn('Invalid state data in localStorage, clearing corrupted data');
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(`${STORAGE_KEY}:timestamp`);
      return null;
    }

    return parsed as CanvasState;
  } catch (error) {
    console.error('Failed to load from localStorage', error);
    return null;
  }
}

function isValidCanvasState(data: unknown): boolean {
  // Check that it's an object
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  // Check that required properties exist
  if (!('version' in obj) || typeof obj.version !== 'number') {
    return false;
  }

  if (!('assets' in obj) || typeof obj.assets !== 'object' || obj.assets === null) {
    return false;
  }

  if (!('tileSettings' in obj) || typeof obj.tileSettings !== 'object' || obj.tileSettings === null) {
    return false;
  }

  return true;
}

export function persistState(state: CanvasState): void {
  syncStateToURL(state);
  saveStateToLocalStorage(state);
}

export function loadState(): CanvasState {
  // URL takes precedence (for sharing)
  const urlState = loadStateFromURL();
  if (urlState) {
    return urlState;
  }

  // Fallback to localStorage
  const localState = loadStateFromLocalStorage();
  if (localState) {
    return localState;
  }

  // No state found, use defaults
  return createDefaultState();
}

function clearOldImageData(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('bb:img:')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
}
