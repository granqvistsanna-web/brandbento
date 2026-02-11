export interface LummiImage {
  id: string;
  url: string;
  blurhash: string;
  width: number;
  height: number;
  aspectRatio: number;
  focalPositionX: number;
  focalPositionY: number;
  colorPalette: string[];
  name: string;
}

export interface LummiCollection {
  id: string;
  name: string;
  count: number;
}

const LUMMI_BASE = 'https://api.lummi.ai/v1';

export const LUMMI_COLLECTIONS: LummiCollection[] = [
  { id: 'kyZvQAT', name: 'Professional Portrait', count: 4 },
  { id: '4CgoSUa', name: 'Tactile Macro Shots', count: 22 },
  { id: 'xhZn2XY', name: 'Nordic Life', count: 18 },
  { id: 'bJSPAoo', name: 'Video Meeting', count: 8 },
  { id: '4Erck4u', name: 'Selfie', count: 12 },
  { id: 'TG3KOqL', name: 'European Professionals', count: 14 },
  { id: 'bPMYmPZ', name: 'Authentic Avatars', count: 53 },
  { id: 'OXOGWBT', name: 'Modern Workspaces', count: 51 },
];

function getApiKey(): string {
  const key = import.meta.env.VITE_LUMMI_API_KEY;
  if (!key) throw new Error('VITE_LUMMI_API_KEY not set in .env');
  return key;
}

/** Build an optimized image URL with Lummi transform params */
export function lummiImageUrl(
  baseUrl: string,
  opts: { w?: number; h?: number; fm?: 'webp' | 'jpeg' | 'png' } = {},
): string {
  const params = new URLSearchParams();
  if (opts.w) params.set('w', String(opts.w));
  if (opts.h) params.set('h', String(opts.h));
  if (opts.fm) params.set('fm', opts.fm);
  const qs = params.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

// In-memory cache for collection images
const cache = new Map<string, { images: LummiImage[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchCollectionImages(
  collectionId: string,
  perPage: number = 20,
): Promise<LummiImage[]> {
  const res = await fetch(
    `${LUMMI_BASE}/collections/${collectionId}/images?perPage=${perPage}`,
    { headers: { Authorization: `Bearer ${getApiKey()}` } },
  );
  if (res.status === 429) throw new Error('Rate limited, try again shortly');
  if (!res.ok) throw new Error(`Lummi API error: ${res.status}`);
  const json = await res.json();
  return json.data ?? json;
}

/** Get collection images with caching (5-min TTL) */
export async function getCollectionImages(
  collectionId: string,
): Promise<LummiImage[]> {
  const cached = cache.get(collectionId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.images;
  }
  const images = await fetchCollectionImages(collectionId, 20);
  cache.set(collectionId, { images, timestamp: Date.now() });
  return images;
}

/** Check if API key is configured */
export function hasApiKey(): boolean {
  return !!import.meta.env.VITE_LUMMI_API_KEY;
}
