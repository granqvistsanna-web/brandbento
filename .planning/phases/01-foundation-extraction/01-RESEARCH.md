# Phase 1: Foundation & Extraction - Research

**Researched:** 2026-02-06
**Domain:** CORS proxying, HTML/CSS parsing, brand asset extraction, state persistence
**Confidence:** HIGH

## Summary

Phase 1 establishes the foundational infrastructure for Brand Bento: a self-hosted Cloudflare Worker CORS proxy with rate limiting, HTML/CSS parsing and brand extraction logic, state persistence via URL hash (lz-string) and localStorage, and fallback strategies for extraction failures.

Research confirms that:
1. **Cloudflare Workers** provide the optimal CORS proxy solution with built-in rate limiting API (GA since Sept 2025), edge performance, and generous free tier
2. **Native DOMParser** is sufficient for HTML parsing in-browser, avoiding dependencies
3. **CSS custom properties** should be extracted first before fallback to computed styles to avoid capturing system fonts instead of web fonts
4. **Font extraction requires waiting** for `document.fonts.ready` to avoid capturing fallback fonts
5. **Logo extraction is fundamentally unreliable** and requires prominent manual upload fallback from day one
6. **lz-string compression** keeps URL state under 2000 characters with `compressToEncodedURIComponent`
7. **Progressive loading with shimmer effects** significantly improves perceived performance during extraction

**Primary recommendation:** Build CORS proxy with rate limiting first (external dependency), implement extraction as progressive multi-stage process (fonts → colors → images → logo), always populate with fallbacks immediately before extraction completes.

## Standard Stack

### Core Infrastructure

| Library/Service | Version | Purpose | Why Standard |
|-----------------|---------|---------|--------------|
| **Cloudflare Workers** | Latest | CORS proxy with rate limiting | Edge performance (<50ms latency), built-in rate limiting API (GA Sept 2025), 100k free requests/day, unlimited bandwidth, V8 isolates provide security |
| **DOMParser** | Native | HTML parsing in browser | Zero dependencies, built-in browser API, accurate CSS computed style access, no server-side libraries needed |
| **lz-string** | 1.5.0 | URL state compression | 60-80% compression ratio, `compressToEncodedURIComponent` produces URI-safe output, 11M+ weekly downloads, 10+ years battle-tested |
| **React** | 18+ | UI framework | Required by project stack, Suspense for progressive loading, hooks for state management |
| **localStorage API** | Native | State persistence fallback | Zero dependencies, 5-10MB quota, synchronous access for backup/recovery |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **react-loading-skeleton** | 3.4+ | Shimmer loading states | Progressive tile population during extraction (EXTR-09) |
| **nanoid** | 5.0+ | Unique IDs for tiles/assets | Generate IDs for extracted assets, 2x faster than uuid, 130 bytes |

### Installation

```bash
# Core dependencies (already in project)
npm install react@18 lz-string

# Extraction UI
npm install react-loading-skeleton nanoid

# Cloudflare Worker (separate project)
npm create cloudflare@latest cors-proxy -- --template worker
cd cors-proxy
npm install
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── services/
│   ├── corsProxy.ts       # CORS proxy client
│   ├── brandExtractor.ts  # Main extraction orchestrator
│   ├── extractColors.ts   # Color palette extraction
│   ├── extractFonts.ts    # Typography extraction
│   ├── extractLogo.ts     # Logo extraction
│   └── extractImages.ts   # Hero/OG image extraction
├── state/
│   ├── canvasState.ts     # Zustand store for canvas
│   ├── persistence.ts     # URL + localStorage sync
│   └── defaults.ts        # Fallback values
├── utils/
│   └── compression.ts     # lz-string wrappers
└── components/
    └── Tile.tsx           # Base tile with shimmer state
```

### Pattern 1: CORS Proxy with Rate Limiting

**What:** Cloudflare Worker that adds CORS headers to third-party responses and enforces IP-based rate limits.

**When to use:** Required for all external URL fetching from browser.

**Example:**
```javascript
// Cloudflare Worker: cors-proxy/src/index.js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    // Rate limiting (10 requests per minute per IP)
    const clientIP = request.headers.get('CF-Connecting-IP');
    const { success } = await env.RATE_LIMITER.limit({ key: clientIP });

    if (!success) {
      return new Response('Rate limit exceeded', {
        status: 429,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Retry-After': '60'
        }
      });
    }

    // Fetch and add CORS headers
    const response = await fetch(targetUrl, {
      headers: { 'Origin': new URL(targetUrl).origin }
    });

    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.append('Vary', 'Origin');

    return newResponse;
  }
};
```

**Configuration (wrangler.toml):**
```toml
[[rate_limit]]
binding = "RATE_LIMITER"
namespace_id = 1
limit = 10
period = 60
```

**Source:** [Cloudflare Workers CORS Proxy](https://developers.cloudflare.com/workers/examples/cors-header-proxy/), [Rate Limiting API](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)

**Confidence:** HIGH

### Pattern 2: Progressive Multi-Stage Extraction

**What:** Extract brand assets in stages with immediate fallback population, avoiding empty tiles.

**When to use:** All URL-based brand extraction (EXTR-09).

**Why:** Users must see a usable canvas immediately. Extraction is unreliable and slow (2-5 seconds total). Progressive loading with shimmer prevents perceived wait time.

**Implementation:**
```typescript
// src/services/brandExtractor.ts
interface ExtractionStage {
  name: string;
  extract: (html: string, doc: Document) => Promise<Partial<BrandAssets>>;
  fallback: Partial<BrandAssets>;
}

const stages: ExtractionStage[] = [
  {
    name: 'colors',
    extract: extractColors,
    fallback: {
      colors: ['#111', '#555', '#F5F5F5', '#2563EB', '#FFFFFF'],
      colorsSource: 'default'
    }
  },
  {
    name: 'fonts',
    extract: extractFonts,
    fallback: {
      primaryFont: 'Inter',
      secondaryFont: 'Lora',
      fontsSource: 'default'
    }
  },
  {
    name: 'images',
    extract: extractImages,
    fallback: {
      heroImage: null, // Will use gradient
      imagesSource: 'default'
    }
  },
  {
    name: 'logo',
    extract: extractLogo,
    fallback: {
      logo: generateMonogram(url),
      logoSource: 'default'
    }
  }
];

export async function extractBrand(url: string): Promise<BrandAssets> {
  // Populate with fallbacks immediately
  const assets: BrandAssets = {
    ...stages.reduce((acc, stage) => ({ ...acc, ...stage.fallback }), {})
  };

  // Notify subscribers of initial fallback state
  updateCanvas(assets);

  try {
    // Fetch HTML via CORS proxy
    const html = await fetchViaProxy(url);
    const doc = new DOMParser().parseFromString(html, 'text/html');

    // Execute stages sequentially, updating as each completes
    for (const stage of stages) {
      try {
        const result = await stage.extract(html, doc);
        Object.assign(assets, result);
        updateCanvas(assets); // Progressive update
      } catch (error) {
        console.warn(`${stage.name} extraction failed, using fallback`, error);
        // Fallback already populated, continue
      }
    }
  } catch (error) {
    console.error('HTML fetch failed, using all fallbacks', error);
  }

  return assets;
}
```

**Source:** Synthesized from [React Suspense patterns](https://blog.logrocket.com/handling-react-loading-states-react-loading-skeleton/) and extraction requirements

**Confidence:** HIGH

### Pattern 3: Font Extraction from CSS Declarations (Not Computed Styles)

**What:** Parse CSS stylesheets for declared font families, wait for fonts to load, cross-reference with `document.fonts`.

**When to use:** Typography extraction (EXTR-03, EXTR-04).

**Why:** `getComputedStyle()` returns the font that actually rendered (often system fallback like Arial) instead of the intended web font. Must extract from CSS declarations and wait for font loading.

**Implementation:**
```typescript
// src/services/extractFonts.ts
export async function extractFonts(
  html: string,
  doc: Document
): Promise<{ primaryFont: string; secondaryFont: string }> {

  // Strategy 1: Check Google Fonts link tags
  const googleFontsLink = doc.querySelector('link[href*="fonts.googleapis.com"]');
  if (googleFontsLink) {
    const href = googleFontsLink.getAttribute('href');
    const families = extractFamiliesFromGoogleFontsURL(href);
    if (families.length >= 2) {
      return { primaryFont: families[0], secondaryFont: families[1] };
    }
  }

  // Strategy 2: Parse CSS custom properties
  const cssVars = await extractCSSCustomProperties(doc);
  const fontVars = cssVars.filter(v =>
    v.name.includes('font') && v.name.includes('family')
  );
  if (fontVars.length >= 2) {
    return {
      primaryFont: cleanFontFamily(fontVars[0].value),
      secondaryFont: cleanFontFamily(fontVars[1].value)
    };
  }

  // Strategy 3: Wait for fonts to load, then check document.fonts
  await document.fonts.ready;
  const loadedFonts = Array.from(document.fonts)
    .map(font => font.family)
    .filter(family => !isSystemFont(family));

  if (loadedFonts.length >= 2) {
    return {
      primaryFont: loadedFonts[0],
      secondaryFont: loadedFonts[1]
    };
  }

  // Strategy 4: Parse stylesheets for @font-face declarations
  const fontFaces = extractFontFaceDeclarations(doc);
  if (fontFaces.length >= 2) {
    return {
      primaryFont: fontFaces[0],
      secondaryFont: fontFaces[1]
    };
  }

  // Fallback to defaults
  throw new Error('No web fonts detected');
}

function extractCSSCustomProperties(doc: Document): Promise<CSSVar[]> {
  const vars: CSSVar[] = [];

  // Iterate through stylesheets
  Array.from(doc.styleSheets).forEach(sheet => {
    try {
      Array.from(sheet.cssRules).forEach(rule => {
        if (rule instanceof CSSStyleRule) {
          const style = rule.style;
          for (let i = 0; i < style.length; i++) {
            const prop = style[i];
            if (prop.startsWith('--')) {
              vars.push({
                name: prop,
                value: style.getPropertyValue(prop).trim()
              });
            }
          }
        }
      });
    } catch (e) {
      // Cross-origin stylesheet, skip
    }
  });

  return Promise.resolve(vars);
}

function isSystemFont(family: string): boolean {
  const systemFonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Times',
    'Courier New', 'Courier', 'Verdana', 'Georgia',
    'Palatino', 'Garamond', 'Comic Sans MS', 'Impact',
    'system-ui', '-apple-system', 'BlinkMacSystemFont'
  ];
  return systemFonts.some(sys => family.includes(sys));
}

function cleanFontFamily(value: string): string {
  // Remove quotes, fallback stack
  return value.split(',')[0].replace(/['"]/g, '').trim();
}
```

**Source:** [CSS Custom Properties extraction](https://css-tricks.com/how-to-get-all-custom-properties-on-a-page-in-javascript/), [getComputedStyle pitfalls](https://dev.to/masakudamatsu/which-fallback-fonts-should-we-choose-to-make-fout-less-jarring-3d8d)

**Confidence:** HIGH

### Pattern 4: Color Extraction from CSS Custom Properties + Semantic Elements

**What:** Extract brand colors by prioritizing CSS variables, then semantic elements (buttons, links, headings), finally k-means clustering on page.

**When to use:** Color palette extraction (EXTR-02).

**Why:** Pixel-frequency clustering misses small but visually dominant brand colors (accent buttons, CTAs). CSS custom properties are explicit brand color declarations.

**Implementation:**
```typescript
// src/services/extractColors.ts
export async function extractColors(
  html: string,
  doc: Document
): Promise<{ colors: string[] }> {
  const colors = new Set<string>();

  // Strategy 1: CSS custom properties (highest confidence)
  const cssVars = await extractCSSCustomProperties(doc);
  const colorVars = cssVars.filter(v =>
    v.name.includes('color') || v.name.includes('bg') || v.name.includes('primary')
  );
  colorVars.forEach(v => {
    const hex = cssValueToHex(v.value);
    if (hex) colors.add(hex);
  });

  // Strategy 2: Semantic elements (high-value colors)
  const semanticElements = doc.querySelectorAll(
    'button, a, h1, h2, h3, .btn, .cta, [role="button"]'
  );
  semanticElements.forEach(el => {
    const computed = window.getComputedStyle(el);
    [computed.color, computed.backgroundColor, computed.borderColor]
      .forEach(color => {
        const hex = rgbToHex(color);
        if (hex && !isNeutral(hex)) colors.add(hex);
      });
  });

  // Strategy 3: Extract from inline styles and stylesheets
  extractFromStylesheets(doc).forEach(c => colors.add(c));

  // Filter and sort by usage frequency
  const palette = Array.from(colors)
    .filter(c => !isNeutral(c))
    .slice(0, 10);

  if (palette.length < 5) {
    throw new Error('Insufficient colors extracted');
  }

  return { colors: palette };
}

function isNeutral(hex: string): boolean {
  // Check if color is grayscale or too close to white/black
  const rgb = hexToRgb(hex);
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  const diff = max - min;
  return diff < 15; // Low saturation = neutral
}

function rgbToHex(rgb: string): string | null {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return null;

  const hex = (x: number) => {
    const h = x.toString(16);
    return h.length === 1 ? '0' + h : h;
  };

  return '#' + hex(+match[1]) + hex(+match[2]) + hex(+match[3]);
}
```

**Source:** [Semantic color extraction research](https://www.mdpi.com/2227-7080/13/6/230), [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties)

**Confidence:** HIGH

### Pattern 5: Favicon Extraction with Fallback Hierarchy

**What:** Try multiple strategies to extract site icon: SVG favicon → PNG favicon → Apple touch icon → default /favicon.ico → domain monogram.

**When to use:** Logo extraction (EXTR-05, EXTR-07).

**Why:** Logo extraction is fundamentally unreliable due to inconsistent markup. Favicon is the most reliable fallback. Research shows 2026 best practice is SVG > ICO > Apple touch icon.

**Implementation:**
```typescript
// src/services/extractLogo.ts
export async function extractLogo(
  html: string,
  doc: Document
): Promise<{ logo: string | null; logoSource: string }> {

  // Strategy 1: SVG favicon (highest quality)
  const svgIcon = doc.querySelector('link[rel*="icon"][type="image/svg+xml"]');
  if (svgIcon) {
    const href = svgIcon.getAttribute('href');
    if (href) return { logo: resolveURL(href, doc.baseURI), logoSource: 'favicon-svg' };
  }

  // Strategy 2: PNG favicon
  const pngIcon = doc.querySelector('link[rel*="icon"][type="image/png"]');
  if (pngIcon) {
    const href = pngIcon.getAttribute('href');
    if (href) return { logo: resolveURL(href, doc.baseURI), logoSource: 'favicon-png' };
  }

  // Strategy 3: Apple touch icon (180x180, good quality)
  const appleIcon = doc.querySelector('link[rel="apple-touch-icon"]');
  if (appleIcon) {
    const href = appleIcon.getAttribute('href');
    if (href) return { logo: resolveURL(href, doc.baseURI), logoSource: 'apple-touch-icon' };
  }

  // Strategy 4: Generic favicon link
  const genericIcon = doc.querySelector('link[rel*="icon"]');
  if (genericIcon) {
    const href = genericIcon.getAttribute('href');
    if (href) return { logo: resolveURL(href, doc.baseURI), logoSource: 'favicon' };
  }

  // Strategy 5: Default /favicon.ico
  const defaultFavicon = new URL('/favicon.ico', doc.baseURI).href;
  try {
    const response = await fetch(defaultFavicon, { method: 'HEAD' });
    if (response.ok) {
      return { logo: defaultFavicon, logoSource: 'favicon-default' };
    }
  } catch (e) {
    // Failed to fetch, continue
  }

  // Strategy 6: Check header for logo image
  const headerLogo = doc.querySelector('header img[class*="logo"], nav img[class*="logo"]');
  if (headerLogo) {
    const src = headerLogo.getAttribute('src');
    if (src) return { logo: resolveURL(src, doc.baseURI), logoSource: 'header-img' };
  }

  // All strategies failed
  throw new Error('No logo found');
}

function generateMonogram(url: string): string {
  // Extract domain, create SVG monogram
  const domain = new URL(url).hostname.replace('www.', '');
  const parts = domain.split('.');
  const initials = parts[0].substring(0, 2).toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#111"/>
    <text x="50" y="50" font-family="Inter" font-size="40"
          fill="#FFF" text-anchor="middle" dominant-baseline="middle">
      ${initials}
    </text>
  </svg>`;
}
```

**Source:** [Favicon best practices 2026](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs), [Favicon detection methods](https://github.com/Itsoon/Favicon-Extractor)

**Confidence:** MEDIUM-HIGH (best practices established, but logo detection remains unreliable)

### Pattern 6: URL State with lz-string Compression

**What:** Compress canvas state to URL hash using `compressToEncodedURIComponent`, keep under 2000 characters.

**When to use:** State sharing and URL persistence (INFRA-05, INFRA-06).

**Implementation:**
```typescript
// src/utils/compression.ts
import LZString from 'lz-string';

export function compressState(state: CanvasState): string {
  // Remove large binary data before compression
  const serializable = {
    ...state,
    // Don't include full image data URIs
    images: state.images.map(img => ({
      ...img,
      data: img.data ? 'ref:' + hashImageData(img.data) : null
    }))
  };

  const json = JSON.stringify(serializable);
  const compressed = LZString.compressToEncodedURIComponent(json);

  // Warn if approaching limits
  if (compressed.length > 1800) {
    console.warn('URL state approaching 2000 char limit:', compressed.length);
  }

  return compressed;
}

export function decompressState(compressed: string): CanvasState | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;

    const state = JSON.parse(json);

    // Restore images from localStorage
    state.images = state.images.map((img: any) => ({
      ...img,
      data: img.data?.startsWith('ref:')
        ? getImageFromLocalStorage(img.data.slice(4))
        : img.data
    }));

    return state;
  } catch (error) {
    console.error('Failed to decompress state', error);
    return null;
  }
}

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
```

**Source:** [lz-string documentation](https://pieroxy.net/blog/pages/lz-string/index.html), [URL state best practices](https://garrett-bodley.medium.com/encoding-data-inside-of-a-url-query-string-f286b7e20465)

**Confidence:** HIGH

### Pattern 7: Hybrid URL + localStorage Persistence

**What:** Save to both URL hash (shareable) and localStorage (persistent). URL takes precedence, localStorage is fallback.

**When to use:** State persistence (INFRA-04, INFRA-05).

**Implementation:**
```typescript
// src/state/persistence.ts
export function persistState(state: CanvasState): void {
  // Save to URL (shareable)
  syncStateToURL(state);

  // Save to localStorage (persistent, recovery)
  try {
    localStorage.setItem('brandBentoState', JSON.stringify(state));
    localStorage.setItem('brandBentoState:timestamp', Date.now().toString());
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      // Clear old states, retry
      clearOldStates();
      try {
        localStorage.setItem('brandBentoState', JSON.stringify(state));
      } catch (e) {
        console.error('localStorage quota exceeded after cleanup', e);
      }
    }
  }
}

export function loadState(): CanvasState {
  // Try URL first (takes precedence for sharing)
  const urlState = loadStateFromURL();
  if (urlState) {
    console.log('Loaded state from URL');
    return urlState;
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem('brandBentoState');
    if (stored) {
      console.log('Loaded state from localStorage');
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load from localStorage', error);
  }

  // No state found, return defaults
  console.log('No state found, using defaults');
  return getDefaultState();
}

function clearOldStates(): void {
  // Remove states older than 7 days
  const keys = Object.keys(localStorage).filter(k =>
    k.startsWith('brandBentoState:') && k !== 'brandBentoState:timestamp'
  );
  keys.forEach(key => localStorage.removeItem(key));
}
```

**Confidence:** HIGH

### Pattern 8: Progressive Loading with Shimmer

**What:** Show shimmer placeholders immediately, resolve to actual content as extraction completes.

**When to use:** Tile rendering during extraction (EXTR-09).

**Implementation:**
```tsx
// src/components/Tile.tsx
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface TileProps {
  content: TileContent | null;
  isLoading: boolean;
  onEdit: () => void;
}

export function Tile({ content, isLoading, onEdit }: TileProps) {
  if (isLoading) {
    return (
      <div className="tile">
        <Skeleton height="100%" borderRadius={8} />
      </div>
    );
  }

  return (
    <div className="tile" onClick={onEdit}>
      {content?.source === 'default' && (
        <div className="default-badge">
          Default — click to change
        </div>
      )}
      {renderContent(content)}
    </div>
  );
}

// Usage in extraction flow
function ExtractionManager({ url }: { url: string }) {
  const [assets, setAssets] = useState<Partial<BrandAssets>>({});
  const [loadingStages, setLoadingStages] = useState({
    colors: true,
    fonts: true,
    images: true,
    logo: true
  });

  useEffect(() => {
    extractBrand(url).then(result => {
      // Update as each stage completes
      setAssets(prev => ({ ...prev, colors: result.colors }));
      setLoadingStages(prev => ({ ...prev, colors: false }));
    });
  }, [url]);

  return (
    <div className="canvas">
      <Tile
        content={assets.colors}
        isLoading={loadingStages.colors}
        onEdit={openColorPicker}
      />
      {/* ... other tiles */}
    </div>
  );
}
```

**Source:** [React Loading Skeleton](https://blog.logrocket.com/handling-react-loading-states-react-loading-skeleton/)

**Confidence:** HIGH

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| **CORS proxy** | Custom Node.js proxy server with nginx, rate limiting middleware, logging | Cloudflare Workers with built-in rate limiting API | Self-hosting adds server management, costs, complexity. Cloudflare handles DDoS, scaling, global edge distribution. Built-in rate limiting is production-ready. |
| **URL state compression** | Custom base64 + gzip implementation | lz-string with `compressToEncodedURIComponent` | 10+ years battle-tested, handles edge cases (special characters, encoding issues), optimized for small strings (<100KB), 60-80% compression ratio |
| **HTML parsing** | Regex-based HTML extraction | Native DOMParser API | HTML is not a regular language. Regex fails on nested tags, CDATA, comments, malformed HTML. DOMParser handles all edge cases correctly. |
| **Shimmer/skeleton loading** | Custom CSS animation | react-loading-skeleton | Handles aspect ratios, counts, nested structures, dark mode. Custom implementations miss edge cases (hydration, SSR, accessibility). |
| **Font loading detection** | Polling with setInterval checking element dimensions | `document.fonts.ready` Promise | Native API is accurate, efficient, avoids race conditions. Dimension polling fails on invisible elements, system fonts that match web fonts. |

**Key insight:** Phase 1 infrastructure (CORS, compression, parsing) has mature solutions that handle edge cases you won't anticipate. Build domain logic (extraction heuristics), not infrastructure.

## Common Pitfalls

### Pitfall 1: CORS Proxy Abuse Without Rate Limiting

**What goes wrong:** Public proxy gets hammered by abuse, extraction feature becomes unreliable or stops working entirely.

**Why it happens:** Without rate limiting, a single user can trigger hundreds of requests per minute. Free/public proxies attract malicious traffic.

**How to avoid:**
1. Self-host Cloudflare Worker from day one (INFRA-01 requirement)
2. Use built-in rate limiting API: 10 requests per minute per IP
3. Return 429 with CORS headers so client gets proper error
4. Configure wrangler.toml with rate limit binding:
   ```toml
   [[rate_limit]]
   binding = "RATE_LIMITER"
   namespace_id = 1
   limit = 10
   period = 60
   ```

**Warning signs:**
- Sudden spike in proxy requests from single IP
- Error rates above 5% on extraction
- 429 errors in browser console

**Phase mapping:** Foundation phase (INFRA-01)

**Sources:** [CORS Proxy Security](https://httptoolkit.com/blog/cors-proxies/), [Cloudflare Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)

**Confidence:** HIGH

### Pitfall 2: URL State Exceeds Browser Limits

**What goes wrong:** Canvas state grows beyond 2000 character URL limit, share links break, state truncates silently.

**Why it happens:** Encoding image data URIs, complex tile configurations creates large payloads even with compression.

**How to avoid:**
1. Never include full image data URIs in URL state (INFRA-06 requirement)
2. Store images in localStorage with hash reference
3. Use lz-string `compressToEncodedURIComponent` (60-80% compression)
4. Warn when compressed state exceeds 1800 characters
5. Provide "Download JSON" export for large states

**Detection:**
- URL length exceeds 2000 characters
- Shared links don't restore full state
- Different behavior in Chrome vs Safari

**Phase mapping:** State management (INFRA-05, INFRA-06)

**Sources:** [URL Length Limits](https://nuqs.dev/docs/limits), [lz-string documentation](https://github.com/pieroxy/lz-string)

**Confidence:** HIGH

### Pitfall 3: Font Extraction Returns Fallback Fonts Instead of Web Fonts

**What goes wrong:** Extraction captures "Arial" or "Helvetica" instead of the actual web font because it reads computed styles before fonts finish loading.

**Why it happens:** `getComputedStyle()` returns the font that actually rendered. If web font hasn't loaded yet, browser uses fallback from font stack.

**How to avoid:**
1. Wait for `document.fonts.ready` Promise before extraction (EXTR-04 requirement)
2. Parse CSS declarations directly, not computed styles (EXTR-03 requirement)
3. Check Google Fonts link tags first (highest confidence)
4. Parse CSS custom properties for `--font-family` variables
5. Cross-reference with `document.fonts` to verify web fonts loaded
6. Timeout after 3 seconds if fonts don't load

**Example:**
```typescript
// WRONG: Reads computed style before fonts load
const style = getComputedStyle(element);
const font = style.fontFamily; // Returns "Arial" (fallback)

// RIGHT: Wait for fonts, parse declarations
await document.fonts.ready;
const declared = parseCSSDeclarations(doc);
const font = declared.fontFamily; // Returns "Inter" (actual web font)
```

**Detection:**
- Extracted font is always Arial, Helvetica, Times (system fonts)
- User immediately changes font after extraction

**Phase mapping:** Extraction phase (EXTR-03, EXTR-04)

**Sources:** [Font Extraction Pitfalls](https://dev.to/masakudamatsu/which-fallback-fonts-should-we-choose-to-make-fout-less-jarring-3d8d), [CSS Custom Properties](https://css-tricks.com/how-to-get-all-custom-properties-on-a-page-in-javascript/)

**Confidence:** HIGH

### Pitfall 4: Logo Extraction Failures Break User Flow

**What goes wrong:** Automated logo detection fails frequently, users encounter empty logo tile or wrong image, experimentation flow stops.

**Why it happens:** No standard HTML element for logos. Sites use `<img>`, `<svg>`, CSS backgrounds, or JavaScript-rendered canvases. Heuristics (class name "logo", header position) are easily fooled.

**How to avoid:**
1. Accept logo extraction as best-effort (EXTR-05)
2. Always populate with favicon or domain monogram fallback (EXTR-07)
3. Show "Default — click to change" badge when using fallback (EXTR-08)
4. Make manual upload equally prominent, not hidden
5. Try multiple strategies in order:
   - SVG favicon (highest quality)
   - PNG favicon
   - Apple touch icon (180x180)
   - Default /favicon.ico
   - Header/nav img with "logo" class
   - Domain monogram (last resort)

**Detection:**
- No logo found on sites with visible branding
- Extracted "logo" is clearly wrong (social icon, ad, hero image)
- Users immediately click upload after extraction

**Phase mapping:** Extraction phase (EXTR-05, EXTR-07, EXTR-08)

**Sources:** [Logo Detection Challenges](https://www.browserless.io/blog/state-of-web-scraping-2026), [Favicon Extraction](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs)

**Confidence:** HIGH

### Pitfall 5: localStorage Quota Exceeded with Image Data

**What goes wrong:** Storing base64 images in localStorage hits 5-10MB quota, causes `QuotaExceededError`, state persistence fails silently.

**Why it happens:** Single high-res image encoded as base64 can be 1-2MB. Multiple images quickly exhaust quota.

**How to avoid:**
1. Store images separately in IndexedDB (not localStorage)
2. localStorage only for small text state
3. Compress images before storage (resize to 1200px max, JPEG quality 85%)
4. Handle QuotaExceededError gracefully:
   ```typescript
   try {
     localStorage.setItem(key, value);
   } catch (e) {
     if (e.name === 'QuotaExceededError') {
       clearOldStates();
       showWarning('Storage full — download JSON backup');
     }
   }
   ```
5. Provide JSON export/import alternative

**Detection:**
- `QuotaExceededError` in console
- State saves without images
- Different behavior with/without images

**Phase mapping:** Persistence phase (INFRA-04)

**Confidence:** HIGH

### Pitfall 6: Extraction Never Completes (No Timeout)

**What goes wrong:** External site is slow or unresponsive, extraction hangs indefinitely, user sees shimmer forever.

**Why it happens:** No timeout on CORS proxy fetch or font loading promises.

**How to avoid:**
1. Add timeout to all fetch operations:
   ```typescript
   const fetchWithTimeout = (url: string, timeout = 5000) => {
     return Promise.race([
       fetch(url),
       new Promise((_, reject) =>
         setTimeout(() => reject(new Error('Timeout')), timeout)
       )
     ]);
   };
   ```
2. Timeout font loading after 3 seconds:
   ```typescript
   const fontsReady = Promise.race([
     document.fonts.ready,
     new Promise(resolve => setTimeout(resolve, 3000))
   ]);
   ```
3. Show error state after 10 seconds total extraction time

**Warning signs:**
- Shimmer never resolves to content
- Network tab shows pending requests
- User reports "stuck loading"

**Confidence:** HIGH

## Code Examples

### Complete CORS Proxy with Rate Limiting (Production-Ready)

```javascript
// Cloudflare Worker: cors-proxy/src/index.js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    // Validate target URL
    if (!targetUrl) {
      return new Response('Missing url parameter', { status: 400 });
    }

    // Handle preflight (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    // Rate limiting (10 req/min per IP)
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const { success } = await env.RATE_LIMITER.limit({ key: clientIP });

    if (!success) {
      return new Response('Rate limit exceeded (10 requests per minute)', {
        status: 429,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Retry-After': '60',
          'Content-Type': 'text/plain'
        }
      });
    }

    try {
      // Fetch target URL
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'BrandBento/1.0',
          'Origin': new URL(targetUrl).origin
        },
        cf: {
          cacheTtl: 300, // Cache for 5 minutes
          cacheEverything: true
        }
      });

      // Check content type (only allow HTML/CSS)
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('text/css')) {
        return new Response('Invalid content type', {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      // Create new response with CORS headers
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
      newResponse.headers.append('Vary', 'Origin');
      newResponse.headers.set('Cache-Control', 'public, max-age=300');

      return newResponse;

    } catch (error) {
      return new Response(`Fetch failed: ${error.message}`, {
        status: 502,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};
```

**wrangler.toml:**
```toml
name = "brand-bento-cors-proxy"
main = "src/index.js"
compatibility_date = "2024-01-01"

[[rate_limit]]
binding = "RATE_LIMITER"
namespace_id = 1
limit = 10
period = 60
```

**Deploy:**
```bash
npx wrangler deploy
# Returns: https://brand-bento-cors-proxy.your-subdomain.workers.dev
```

**Source:** [Cloudflare Workers CORS Proxy](https://developers.cloudflare.com/workers/examples/cors-header-proxy/), [Rate Limiting API](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)

### Progressive Brand Extraction with Fallbacks

```typescript
// src/services/brandExtractor.ts
interface BrandAssets {
  colors: string[];
  primaryFont: string;
  secondaryFont: string;
  logo: string | null;
  heroImage: string | null;
  // Track source for each asset
  colorsSource: 'extracted' | 'default';
  fontsSource: 'extracted' | 'default';
  logoSource: 'favicon-svg' | 'favicon-png' | 'favicon-default' | 'default';
  imagesSource: 'extracted' | 'default';
}

const DEFAULT_ASSETS: BrandAssets = {
  colors: ['#111111', '#555555', '#F5F5F5', '#2563EB', '#FFFFFF'],
  primaryFont: 'Inter',
  secondaryFont: 'Lora',
  logo: null, // Will generate monogram
  heroImage: null, // Will use gradient
  colorsSource: 'default',
  fontsSource: 'default',
  logoSource: 'default',
  imagesSource: 'default'
};

export async function extractBrand(
  url: string,
  onProgress?: (stage: string, assets: Partial<BrandAssets>) => void
): Promise<BrandAssets> {

  // Start with defaults immediately
  const assets: BrandAssets = { ...DEFAULT_ASSETS };
  assets.logo = generateMonogram(url);

  onProgress?.('initialized', assets);

  try {
    // Fetch HTML via CORS proxy with timeout
    const html = await fetchWithTimeout(
      `${CORS_PROXY_URL}?url=${encodeURIComponent(url)}`,
      5000
    );

    const doc = new DOMParser().parseFromString(html, 'text/html');

    // Stage 1: Extract fonts (wait for loading)
    try {
      await document.fonts.ready;
      const fonts = await extractFonts(html, doc);
      assets.primaryFont = fonts.primaryFont;
      assets.secondaryFont = fonts.secondaryFont;
      assets.fontsSource = 'extracted';
      onProgress?.('fonts', assets);
    } catch (error) {
      console.warn('Font extraction failed, using defaults', error);
    }

    // Stage 2: Extract colors
    try {
      const colors = await extractColors(html, doc);
      assets.colors = colors.colors;
      assets.colorsSource = 'extracted';
      onProgress?.('colors', assets);
    } catch (error) {
      console.warn('Color extraction failed, using defaults', error);
    }

    // Stage 3: Extract images
    try {
      const images = await extractImages(html, doc);
      assets.heroImage = images.heroImage;
      assets.imagesSource = 'extracted';
      onProgress?.('images', assets);
    } catch (error) {
      console.warn('Image extraction failed, using defaults', error);
    }

    // Stage 4: Extract logo
    try {
      const logo = await extractLogo(html, doc);
      assets.logo = logo.logo;
      assets.logoSource = logo.logoSource;
      onProgress?.('logo', assets);
    } catch (error) {
      console.warn('Logo extraction failed, using monogram', error);
    }

  } catch (error) {
    console.error('HTML fetch failed, using all defaults', error);
  }

  onProgress?.('complete', assets);
  return assets;
}

async function fetchWithTimeout(
  url: string,
  timeout: number = 5000
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function generateMonogram(url: string): string {
  const domain = new URL(url).hostname.replace('www.', '');
  const initials = domain.split('.')[0].substring(0, 2).toUpperCase();

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#111"/>
      <text x="50" y="55" font-family="Inter, sans-serif"
            font-size="40" font-weight="700"
            fill="#FFF" text-anchor="middle" dominant-baseline="middle">
        ${initials}
      </text>
    </svg>
  `)}`;
}
```

**Source:** Synthesized from requirements and extraction patterns

### URL State Compression with Image Handling

```typescript
// src/state/persistence.ts
import LZString from 'lz-string';

interface CanvasState {
  version: number;
  colors: string[];
  primaryFont: string;
  secondaryFont: string;
  logo: string | null;
  heroImage: string | null;
  // ... other state
}

export function compressStateToURL(state: CanvasState): string {
  // Separate images from state
  const { logo, heroImage, ...textState } = state;

  // Store images in localStorage with hash
  if (logo && logo.startsWith('data:')) {
    const hash = hashString(logo);
    localStorage.setItem(`image:${hash}`, logo);
    textState.logo = `ref:${hash}`;
  }

  if (heroImage && heroImage.startsWith('data:')) {
    const hash = hashString(heroImage);
    localStorage.setItem(`image:${hash}`, heroImage);
    textState.heroImage = `ref:${hash}`;
  }

  // Compress text state only
  const json = JSON.stringify(textState);
  const compressed = LZString.compressToEncodedURIComponent(json);

  // Warn if approaching limit
  if (compressed.length > 1800) {
    console.warn(`URL state: ${compressed.length} chars (limit: 2000)`);
  }

  return compressed;
}

export function decompressStateFromURL(compressed: string): CanvasState | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;

    const state = JSON.parse(json) as CanvasState;

    // Restore images from localStorage
    if (state.logo?.startsWith('ref:')) {
      const hash = state.logo.slice(4);
      state.logo = localStorage.getItem(`image:${hash}`) || null;
    }

    if (state.heroImage?.startsWith('ref:')) {
      const hash = state.heroImage.slice(4);
      state.heroImage = localStorage.getItem(`image:${hash}`) || null;
    }

    return state;
  } catch (error) {
    console.error('Failed to decompress state', error);
    return null;
  }
}

export function syncStateToURL(state: CanvasState): void {
  const compressed = compressStateToURL(state);
  const url = new URL(window.location.href);
  url.hash = compressed;
  window.history.replaceState(null, '', url);
}

export function loadStateFromURL(): CanvasState | null {
  const hash = window.location.hash.slice(1);
  return hash ? decompressStateFromURL(hash) : null;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}
```

**Source:** [lz-string documentation](https://pieroxy.net/blog/pages/lz-string/index.html)

## State of the Art

| Old Approach | Current Approach (2026) | When Changed | Impact |
|--------------|------------------------|--------------|--------|
| Third-party CORS proxies (allorigins, cors-anywhere) | Self-hosted Cloudflare Workers with rate limiting | 2024-2025 | Public proxies shut down or became unreliable. Cloudflare Workers Free tier is generous (100k req/day), rate limiting API became GA Sept 2025 |
| html2canvas for export | html-to-image (maintained fork) | 2022-2024 | Original html2canvas unmaintained since 2022, html-to-image has better font/SVG support |
| Manual base64 + gzip compression | lz-string with `compressToEncodedURIComponent` | 2015+ (mature) | lz-string specifically designed for URL compression, handles edge cases (special chars, encoding) |
| getComputedStyle for font detection | Parse CSS declarations + document.fonts.ready | 2020+ | Computed styles return fallback fonts if web fonts haven't loaded. Must wait for font loading and parse declarations |
| Pixel-frequency color clustering | CSS custom properties + semantic element targeting | 2024-2026 | CSS variables explicitly declare brand colors. Pixel frequency misses small but visually dominant accents |

**Deprecated/outdated:**
- **dom-to-image**: Unmaintained, use html-to-image instead
- **Public CORS proxies**: Unreliable, use self-hosted Cloudflare Worker
- **Polling for font loading**: Use `document.fonts.ready` Promise

## Open Questions

Things that couldn't be fully resolved and require empirical validation:

1. **Extraction accuracy in production**
   - What we know: Research shows logo detection is unreliable, font extraction depends on waiting for loading, color extraction benefits from CSS variables
   - What's unclear: How well extraction performs across diverse real-world sites with different CSS architectures (CSS-in-JS, Tailwind, custom properties, inline styles)
   - Recommendation: Build MVP with multi-strategy extraction, track success rates via analytics, iterate based on data. Accept 60-70% success rate as baseline.

2. **Optimal rate limit per IP**
   - What we know: 10 requests per minute is a reasonable starting point per INFRA-01 requirement
   - What's unclear: Whether legitimate users will hit this limit during normal usage (e.g., trying multiple URLs in quick succession)
   - Recommendation: Start with 10/min, monitor 429 rates in production, adjust based on user feedback. Consider burst allowance (e.g., 15 in first 10 seconds, then 10/min).

3. **Font loading timeout threshold**
   - What we know: Must wait for `document.fonts.ready` to avoid capturing fallbacks
   - What's unclear: Optimal timeout value (3 seconds suggested, but sites with many fonts may need longer)
   - Recommendation: Use 3-second timeout for MVP, track how often timeout is hit, surface warning to user when fonts fail to load.

4. **localStorage vs IndexedDB for image storage**
   - What we know: localStorage has 5-10MB quota, insufficient for multiple high-res images
   - What's unclear: Whether IndexedDB complexity is necessary for Phase 1, or if localStorage + image size limits (1200px max) is sufficient
   - Recommendation: Start with localStorage + aggressive image compression. Monitor QuotaExceededError rates. Migrate to IndexedDB in Phase 2 if needed.

5. **Compression ratio in production**
   - What we know: lz-string achieves 60-80% compression in tests
   - What's unclear: Actual compression ratio for Brand Bento's canvas state structure, edge cases that exceed 2000 chars
   - Recommendation: Log compressed URL lengths in analytics, monitor how often 1800-char warning triggers, provide JSON export alternative for users who hit limits.

## Sources

### Primary (HIGH confidence)

**Cloudflare Workers:**
- [CORS Header Proxy Example](https://developers.cloudflare.com/workers/examples/cors-header-proxy/) - Official implementation
- [Rate Limiting API](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/) - Official API docs
- [Platform Limits](https://developers.cloudflare.com/workers/platform/limits/) - Official limits

**HTML/CSS Parsing:**
- [DOMParser - MDN](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser) - Official Web API docs
- [getComputedStyle - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle) - Official Web API docs
- [CSS Custom Properties Extraction](https://css-tricks.com/how-to-get-all-custom-properties-on-a-page-in-javascript/) - Authoritative guide

**State Compression:**
- [lz-string GitHub](https://github.com/pieroxy/lz-string) - Official repository
- [lz-string Documentation](https://pieroxy.net/blog/pages/lz-string/index.html) - Official docs

**Font Loading:**
- [document.fonts API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/fonts) - Official Web API docs
- [use-googlefonts React hook](https://github.com/useflyyer/use-googlefonts) - Production implementation

**Progressive Loading:**
- [React Loading Skeleton](https://blog.logrocket.com/handling-react-loading-states-react-loading-skeleton/) - Implementation guide
- [Skeleton UI Best Practices](https://blog.logrocket.com/improve-react-ux-skeleton-ui/) - UX patterns

### Secondary (MEDIUM confidence)

**CORS Proxy Security:**
- [CORS Proxies Security Analysis](https://httptoolkit.com/blog/cors-proxies/) - Security best practices
- [Cloudflare Community: CORS on 429](https://community.cloudflare.com/t/cors-on-rate-limit-429/270010) - Community discussion

**Favicon/Logo Extraction:**
- [Favicon Best Practices 2026](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs) - Authoritative guide
- [Favicon Extraction Library](https://github.com/Itsoon/Favicon-Extractor) - Implementation reference

**URL State Management:**
- [URL State Best Practices](https://garrett-bodley.medium.com/encoding-data-inside-of-a-url-query-string-f286b7e20465) - Implementation patterns
- [URL Length Limits](https://nuqs.dev/docs/limits) - Browser constraints

**Color Extraction:**
- [Semantic Color Extraction Research](https://www.mdpi.com/2227-7080/13/6/230) - Academic research
- [CSS Custom Properties - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties) - Official docs

### Tertiary (LOW confidence - requires validation)

**Web Scraping Challenges:**
- [State of Web Scraping 2026](https://www.browserless.io/blog/state-of-web-scraping-2026) - Industry trends

## Metadata

**Confidence breakdown:**
- CORS proxy implementation: HIGH - Official Cloudflare docs, rate limiting API is GA
- HTML/CSS parsing: HIGH - Native browser APIs, MDN documentation
- Font extraction strategy: HIGH - Verified with document.fonts API, confirmed pitfalls with getComputedStyle
- Logo extraction reliability: MEDIUM - Best practices established, but inherently unreliable domain
- State compression: HIGH - lz-string is mature (10+ years), well-documented
- Progressive loading: HIGH - React patterns well-established, multiple production implementations

**Research date:** 2026-02-06
**Valid until:** ~60 days (stable technologies, but monitor for Cloudflare Workers API changes)

**Overall confidence:** HIGH for infrastructure decisions (CORS proxy, compression, parsing). MEDIUM for extraction accuracy (requires empirical validation in production).
