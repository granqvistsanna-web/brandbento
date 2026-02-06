# Architecture Patterns: Client-Side Brand Experimentation Tools

**Domain:** Brand extraction and canvas-based experimentation tools
**Researched:** 2026-02-06
**Confidence:** MEDIUM

## Executive Summary

Client-side brand experimentation tools require a layered architecture that separates data acquisition, extraction, presentation, and persistence concerns. The architecture must handle CORS restrictions via proxy, parse and extract brand elements from HTML/CSS, render interactive grids/canvases, and persist shareable state without databases.

Based on research into similar tools (design editors, brand extractors, canvas-based applications) and the technologies involved (CORS proxies, HTML parsing, canvas rendering, state compression), this document outlines recommended component boundaries, data flow patterns, and build order considerations.

## Recommended Architecture

### High-Level System Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        React SPA                            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Presentation Layer                       │ │
│  │  (UI Components, Canvas Renderer, Grid System)        │ │
│  └────────────────┬──────────────────────────────────────┘ │
│                   │                                         │
│  ┌────────────────▼──────────────────────────────────────┐ │
│  │              State Management                         │ │
│  │  (URL Hash + localStorage + React State)              │ │
│  └────────────────┬──────────────────────────────────────┘ │
│                   │                                         │
│  ┌────────────────▼──────────────────────────────────────┐ │
│  │           Domain Logic Layer                          │ │
│  │  (Brand Extractor, Font Loader, Export Engine)        │ │
│  └────────────────┬──────────────────────────────────────┘ │
│                   │                                         │
│  ┌────────────────▼──────────────────────────────────────┐ │
│  │          Infrastructure Layer                         │ │
│  │  (CORS Proxy Client, HTML Fetcher)                    │ │
│  └───────────────────────────────────────────────────────┘ │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Cloudflare Worker   │
          │    (CORS Proxy)      │
          └──────────┬───────────┘
                     │
                     ▼
              External Websites
```

**Source:** Architecture patterns synthesized from [React separation of concerns](https://krasimirtsonev.com/blog/article/react-separation-of-concerns), [Frontend Architecture Patterns 2026](https://dev.to/sizan_mahmud0_e7c3fd0cb68/the-complete-guide-to-frontend-architecture-patterns-in-2026-3ioo)

### Component Boundaries

| Component | Responsibility | Communicates With | Data Flow Direction |
|-----------|---------------|-------------------|---------------------|
| **CORS Proxy (Cloudflare Worker)** | Fetch external HTML, add CORS headers, return to client | External websites ↔ React SPA | Bidirectional (request/response) |
| **Proxy Client** | Send fetch requests to CORS proxy, handle errors | CORS Proxy → Brand Extractor | Downstream |
| **Brand Extractor** | Parse HTML/CSS, extract colors/fonts/logos | Proxy Client → State Manager | Downstream |
| **Font Loader** | Dynamically load Google Fonts on demand | State Manager ↔ Browser Font API | Bidirectional |
| **State Manager** | Manage application state (grid config, selected fonts, colors) | All components (hub) | Hub (bidirectional) |
| **Persistence Layer** | Serialize state to URL hash (lz-string) + localStorage | State Manager ↔ Browser APIs | Bidirectional |
| **Grid System** | Manage 3×3 bento grid layout with tile spanning | State Manager → Canvas Renderer | Downstream |
| **Canvas Renderer** | Render tiles, handle interactions (drag, resize) | Grid System → DOM | Downstream |
| **Export Engine** | Convert canvas to PNG using html2canvas | Canvas Renderer → Browser Download | Downstream |

**Sources:**
- [Cloudflare Workers CORS Proxy](https://developers.cloudflare.com/workers/examples/cors-header-proxy/)
- [React Component Architecture](https://handsonreact.com/docs/component-architecture)
- [Thinking in React](https://react.dev/learn/thinking-in-react)

## Data Flow Patterns

### 1. Brand Extraction Flow (User Input → Brand Data)

```
User enters URL
    ↓
Proxy Client sends request to Cloudflare Worker
    ↓
Worker fetches HTML from external site
    ↓
Worker adds CORS headers and returns HTML
    ↓
Brand Extractor parses HTML/CSS:
  - Extract color palette (primary, text, background, border colors)
  - Identify typography (font families, sizes, weights)
  - Detect logos/images
    ↓
Extracted brand data stored in State Manager
    ↓
State persisted to URL hash (compressed) + localStorage
    ↓
UI updates to show extracted brand elements
```

**Pattern:** Request → Proxy → Parse → Store → Persist → Render
**Confidence:** HIGH (verified with official Cloudflare docs and brand extraction tool patterns)

**Sources:**
- [Brand Element Extractor patterns](https://chromewebstore.google.com/detail/brand-element-extractor/gaenmhdlokogeeglalgddpjebcfghepb)
- [Peek: Extract Assets, Colors & Typography](https://trypeek.app/)

### 2. State Persistence Flow (Application State → Shareable URL)

```
User modifies grid (adds tile, changes color, selects font)
    ↓
State Manager updates React state
    ↓
State serialized to JSON
    ↓
JSON compressed with lz-string.compressToEncodedURIComponent()
    ↓
Compressed string written to URL hash via History API
    ↓
State also saved to localStorage (fallback/recovery)
    ↓
URL is now shareable (other users can load same state)
```

**Pattern:** Modify → Serialize → Compress → URL Hash + localStorage
**Confidence:** HIGH (verified with lz-string official documentation)

**Sources:**
- [lz-string URL compression](https://pieroxy.net/blog/pages/lz-string/index.html)
- [Storing state in the URL](https://antonz.org/storing-state/)
- [URL as state management](https://alfy.blog/2025/10/31/your-url-is-your-state.html)

### 3. Font Loading Flow (Font Selection → Rendered Text)

```
User selects Google Font from palette
    ↓
Font Loader checks if font already loaded
    ↓
If not loaded:
  - Append <link> tag to document head with Google Fonts API URL
  - Preconnect to fonts.googleapis.com and fonts.gstatic.com
    ↓
Browser fetches font files
    ↓
Font applied to canvas tiles via CSS font-family
    ↓
Canvas re-renders with new typography
```

**Pattern:** Select → Check → Load (if needed) → Apply → Render
**Confidence:** MEDIUM (verified with React Google Fonts patterns, but specific implementation varies)

**Sources:**
- [use-googlefonts React hook](https://github.com/useflyyer/use-googlefonts)
- [react-google-font component](https://github.com/dherault/react-google-font)
- [Google Fonts dynamic loading patterns](https://codepen.io/trent48/pen/RQzBvo)

### 4. Export Flow (Canvas → PNG Download)

```
User clicks "Export" button
    ↓
Export Engine calls html2canvas(canvasElement)
    ↓
html2canvas parses DOM tree of canvas:
  - Walks through all elements
  - Reconstructs styles (colors, fonts, borders, etc.)
  - Renders to <canvas> element
    ↓
Canvas converted to Blob via canvas.toBlob()
    ↓
Blob downloaded as PNG file via browser download API
```

**Pattern:** Click → Parse DOM → Render Canvas → Convert to Blob → Download
**Confidence:** HIGH (verified with official html2canvas documentation)

**Performance Warning:** html2canvas can be slow for complex DOMs. For 10 widgets, expect ~7-21 seconds. Consider dom-to-image-more (SVG-based) for better performance (7 seconds vs 21 seconds for same workload).

**Sources:**
- [html2canvas GitHub](https://github.com/niklasvh/html2canvas)
- [Capturing DOM as Image challenges](https://engineering.monday.com/capturing-dom-as-image-is-harder-than-you-think-how-we-solved-it-at-monday-com/)
- [html2canvas alternatives comparison](https://portalzine.de/best-html-to-canvas-solutions-in-2025/)

### 5. Grid Rendering Flow (State → Visual Grid)

```
State Manager holds grid configuration:
  - 3×3 grid structure
  - Tile positions and spans
  - Content for each tile (color, text, font)
    ↓
Grid System component receives grid config as props
    ↓
For each tile:
  - Calculate grid-column and grid-row CSS values
  - Render tile with appropriate spans
  - Apply brand colors, fonts, and content
    ↓
Canvas Renderer uses CSS Grid or canvas element
    ↓
User interactions (drag, resize) update state → re-render
```

**Pattern:** State → Calculate Layout → Render → Interact → Update State
**Confidence:** MEDIUM (based on grid layout patterns, but specific bento grid logic is custom)

**Sources:**
- [react-grid-layout architecture](https://github.com/react-grid-layout/react-grid-layout)
- [shadcn/designer composable canvas architecture](https://ds.shadcn.com/)
- [Weave.js canvas architecture (Inditex)](https://medium.com/@InditexTech/meet-weave-js-an-open-source-library-to-build-whiteboards-canvas-and-design-applications-0b6046f50363)

## Patterns to Follow

### Pattern 1: CORS Proxy with Preflight Handling

**What:** Cloudflare Worker that handles OPTIONS preflight requests separately from GET/POST requests.

**When:** Any time you need to fetch external HTML from client-side JavaScript.

**Why:** Browsers send OPTIONS preflight requests before actual requests. The proxy must respond with CORS headers immediately without forwarding to the target server.

**Implementation:**
```javascript
// Cloudflare Worker
async function handleRequest(request) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  // Fetch target and add CORS headers
  const response = await fetch(targetUrl);
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Access-Control-Allow-Origin', '*');
  newResponse.headers.set('Vary', 'Origin');
  return newResponse;
}
```

**Source:** [Cloudflare Workers CORS header proxy](https://developers.cloudflare.com/workers/examples/cors-header-proxy/)

**Confidence:** HIGH

### Pattern 2: URL-Safe State Compression with lz-string

**What:** Use `compressToEncodedURIComponent()` to compress JSON state into URL-safe strings.

**When:** Storing complex application state in URL hash for shareability.

**Why:** Avoids need for database, enables instant sharing via URL, and produces strings ~1000 characters (well within URL limits).

**Implementation:**
```javascript
import LZString from 'lz-string';

// Compress state to URL
function saveStateToURL(state) {
  const json = JSON.stringify(state);
  const compressed = LZString.compressToEncodedURIComponent(json);
  window.history.replaceState(null, '', `#?state=${compressed}`);
}

// Decompress state from URL
function loadStateFromURL() {
  const hash = window.location.hash.slice(1);
  const params = new URLSearchParams(hash);
  const compressed = params.get('state');
  if (!compressed) return null;
  const json = LZString.decompressFromEncodedURIComponent(compressed);
  return JSON.parse(json);
}
```

**Source:** [lz-string official documentation](https://pieroxy.net/blog/pages/lz-string/index.html)

**Confidence:** HIGH

### Pattern 3: Hybrid URL + localStorage Persistence

**What:** Save state to both URL hash (for sharing) and localStorage (for recovery).

**When:** Building client-side applications where state must be shareable but also persist across sessions.

**Why:** URL provides shareability, localStorage provides persistence. If URL is cleared, state can be recovered from localStorage.

**Implementation:**
```javascript
function persistState(state) {
  // Save to URL hash (shareable)
  saveStateToURL(state);

  // Save to localStorage (persistent)
  localStorage.setItem('brandBentoState', JSON.stringify(state));
}

function loadState() {
  // Try URL first (takes precedence)
  const urlState = loadStateFromURL();
  if (urlState) return urlState;

  // Fallback to localStorage
  const stored = localStorage.getItem('brandBentoState');
  return stored ? JSON.parse(stored) : getDefaultState();
}
```

**Source:** [Persisting and Sharing Application State](https://dev.to/prabhu66/persisting-and-sharing-your-applications-state-local-url-and-beyond-4527)

**Confidence:** MEDIUM

### Pattern 4: Container/Presentational Component Separation

**What:** Separate components into containers (smart, stateful) and presentational (dumb, stateless).

**When:** Building complex UIs with multiple layers of components.

**Why:** Presentational components are reusable, testable, and focused on UI. Containers handle business logic and state management.

**Example:**
```
src/
  components/
    BentoGrid.tsx           # Presentational (receives grid config via props)
    Tile.tsx                # Presentational (renders single tile)
    ColorPicker.tsx         # Presentational (UI for selecting colors)
  containers/
    BentoGridContainer.tsx  # Container (manages grid state, handles interactions)
    BrandExtractorContainer.tsx  # Container (fetches HTML, extracts brand)
```

**Source:** [React Container-Presentational Pattern](https://devshi-bambhaniya.medium.com/a-complete-guide-to-react-architecture-patterns-ea386d2ba327)

**Confidence:** HIGH

### Pattern 5: Brand Extraction via CSS Selectors

**What:** Parse HTML using CSS selectors to extract brand elements (colors, fonts, logos).

**When:** Extracting structured data from external HTML.

**Why:** CSS selectors are widely supported, efficient, and part of web standards. Libraries like cheerio (Node.js) or DOMParser (browser) provide robust parsing.

**Implementation Strategy:**
```javascript
// In browser (using DOMParser)
function extractBrandColors(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const colors = new Set();

  // Extract colors from computed styles
  const elements = doc.querySelectorAll('*');
  elements.forEach(el => {
    const style = window.getComputedStyle(el);
    colors.add(style.color);
    colors.add(style.backgroundColor);
    colors.add(style.borderColor);
  });

  return Array.from(colors).filter(c => c && c !== 'rgba(0, 0, 0, 0)');
}
```

**Source:** [Parsing HTML with CSS Selectors](https://scrapfly.io/blog/posts/parsing-html-with-css)

**Confidence:** MEDIUM (requires client-side adaptation, computedStyle not available on raw HTML)

### Pattern 6: On-Demand Font Loading with Preconnect

**What:** Dynamically load Google Fonts by appending `<link>` tags to document head, with preconnect hints for performance.

**When:** User selects a font that isn't yet loaded.

**Why:** Reduces initial bundle size, improves performance by only loading fonts when needed.

**Implementation:**
```javascript
function loadGoogleFont(fontFamily) {
  // Check if already loaded
  const existing = document.querySelector(`link[href*="${fontFamily}"]`);
  if (existing) return;

  // Add preconnect (if not already present)
  if (!document.querySelector('link[href="https://fonts.googleapis.com"]')) {
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect1);

    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect2);
  }

  // Add font link
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}`;
  document.head.appendChild(link);
}
```

**Source:** [use-googlefonts React hook](https://github.com/useflyyer/use-googlefonts)

**Confidence:** HIGH

## Anti-Patterns to Avoid

### Anti-Pattern 1: Bypassing CORS with `no-cors` Mode

**What:** Setting `fetch(url, { mode: 'no-cors' })` to bypass CORS errors.

**Why bad:** `no-cors` mode returns an opaque response that cannot be read by JavaScript. You won't have access to response body, headers, or status. This makes it useless for brand extraction.

**Instead:** Implement a proper CORS proxy (Cloudflare Worker) that adds CORS headers to the response.

**Source:** [CORS proxy with Cloudflare Workers](https://samjmck.com/en/blog/cors-cloudflare/)

**Confidence:** HIGH

### Anti-Pattern 2: Parsing HTML with Regex

**What:** Using regular expressions to extract data from HTML (e.g., `/style="color:\s*([^"]+)"/g`).

**Why bad:** HTML is not a regular language and cannot be reliably parsed with regex. Edge cases (nested tags, malformed HTML, CDATA, comments) will cause failures.

**Instead:** Use a proper HTML parser (DOMParser in browser, or libraries like cheerio/jsdom in Node.js).

**Source:** [HTML Parser best practices](https://brightdata.com/glossary/html-parser)

**Confidence:** HIGH

### Anti-Pattern 3: Storing Uncompressed JSON in URL Hash

**What:** Directly encoding `JSON.stringify(state)` into URL hash without compression.

**Why bad:** URLs have practical limits (~2000 characters in some browsers). Complex state will exceed this, breaking shareability.

**Instead:** Use lz-string compression to reduce state size by ~60-80%.

**Example:** A 5KB JSON state compresses to ~1KB with `compressToEncodedURIComponent()`.

**Source:** [lz-string compression ratios](https://pieroxy.net/blog/pages/lz-string/index.html)

**Confidence:** HIGH

### Anti-Pattern 4: Synchronous Font Loading Blocking Render

**What:** Loading all Google Fonts synchronously in `<head>` before first render.

**Why bad:** Blocks rendering until fonts are downloaded, increasing First Contentful Paint (FCP) and Largest Contentful Paint (LCP). For 10+ fonts, this can add seconds to load time.

**Instead:** Load fonts on-demand (only when user selects them) or use `font-display: swap` to show fallback fonts while loading.

**Source:** [Making Google Fonts Faster](https://sia.codes/posts/making-google-fonts-faster/)

**Confidence:** HIGH

### Anti-Pattern 5: Using html2canvas for Real-Time Preview

**What:** Calling html2canvas on every state change to update a preview.

**Why bad:** html2canvas is slow (8-66 seconds for complex DOMs). Running it on every change will freeze the UI.

**Instead:** Use html2canvas only for final export. For previews, render directly to DOM with React components or use CSS/Canvas for real-time rendering.

**Source:** [html2canvas performance issues](https://github.com/niklasvh/html2canvas/issues/1250)

**Confidence:** HIGH

### Anti-Pattern 6: Mixing State Management Approaches

**What:** Using both Context API and prop drilling for the same state, or combining Zustand + Redux for overlapping concerns.

**Why bad:** Creates confusion about single source of truth, makes debugging harder, and increases bundle size.

**Instead:** Choose one state management approach for the entire application. For Brand Bento (small app, no server state), React useState + URL hash + localStorage is sufficient. Context API if prop drilling becomes painful.

**Source:** [React State Management best practices](https://remix.run/docs/en/main/discussion/state-management)

**Confidence:** HIGH

## Scalability Considerations

| Concern | Current (MVP) | At Scale (1000+ Users/Day) | At Scale (10K+ Users/Day) |
|---------|---------------|----------------------------|---------------------------|
| **CORS Proxy** | Single Cloudflare Worker | Same (Cloudflare auto-scales) | Same (Cloudflare handles millions of requests) |
| **HTML Parsing** | Client-side (DOMParser) | Client-side (no change) | Client-side (no change) |
| **Font Loading** | On-demand via Google Fonts CDN | Same (Google Fonts CDN scales) | Consider self-hosting popular fonts to reduce Google API requests |
| **State Storage** | URL hash + localStorage | Same (client-side only) | Same (client-side only) |
| **Export (html2canvas)** | Client-side rendering | Client-side (acceptable for occasional use) | If users export frequently, consider server-side rendering with Puppeteer for better performance |
| **Analytics** | None | Add client-side analytics (PostHog, Plausible) | Same |
| **Error Tracking** | None | Add Sentry or similar | Same |

**Key Insight:** Because Brand Bento is entirely client-side, scaling is handled by browsers and CDNs (Cloudflare, Google Fonts). The only potential bottleneck is html2canvas performance, which can be addressed by switching to dom-to-image or server-side rendering if needed.

**Source:** Synthesized from architecture patterns research

**Confidence:** MEDIUM

## Component Build Order

Based on dependencies between components, the recommended build order is:

### Phase 1: Foundation (No dependencies)
1. **CORS Proxy (Cloudflare Worker)** - Independent service, can be built and deployed first
2. **State Manager** - Core state structure and URL encoding/decoding logic
3. **Persistence Layer** - localStorage utilities (depends on state structure)

### Phase 2: Data Acquisition (Depends on Phase 1)
4. **Proxy Client** - Fetches HTML via CORS proxy
5. **Brand Extractor** - Parses HTML and extracts colors/fonts (depends on Proxy Client)

### Phase 3: Presentation (Depends on Phase 1 + 2)
6. **Grid System** - 3×3 bento grid layout logic (depends on State Manager)
7. **Canvas Renderer** - Renders tiles with brand elements (depends on Grid System + State Manager)
8. **Font Loader** - Dynamically loads Google Fonts (independent, can be built in parallel with Grid)

### Phase 4: Features (Depends on Phase 3)
9. **Export Engine** - html2canvas PNG export (depends on Canvas Renderer)

### Rationale for Ordering

- **CORS Proxy first** because it's an external dependency that all data acquisition depends on. Deploy and test it early.
- **State Manager early** because nearly every other component needs to read/write state. Establish the state structure before building features.
- **Persistence after State** because you need to know what state looks like before compressing it to URLs.
- **Brand Extractor after Proxy** because extraction logic needs HTML from the proxy to work with.
- **Grid + Canvas after State + Extraction** because rendering requires both the grid structure (state) and brand data (extraction).
- **Export last** because it's a nice-to-have feature that depends on everything else being rendered correctly.

**Parallel Opportunities:**
- Font Loader can be built in parallel with Grid System (independent concerns)
- Persistence Layer can be built in parallel with Proxy Client (independent concerns)

**Source:** Synthesized from component dependency analysis

**Confidence:** HIGH

## Technology-Specific Architectural Notes

### Cloudflare Workers
- **Stateless:** Workers are ephemeral. Do not store state between requests.
- **CPU Time Limit:** 50ms for free tier, 50s for paid. Brand Bento's proxy should complete in <10ms (simple fetch + header manipulation).
- **Request Size Limit:** 100MB. HTML pages are typically <1MB, so this is not a concern.

**Source:** [Cloudflare Workers limits](https://developers.cloudflare.com/workers/platform/limits/)

**Confidence:** HIGH

### React + Vite
- **Code Splitting:** Consider lazy loading Export Engine (`React.lazy`) since users may not export on every session.
- **Tree Shaking:** Vite automatically tree-shakes unused code. Ensure modular imports (e.g., `import { compress } from 'lz-string'` not `import LZString from 'lz-string'`).

**Source:** [Vite performance best practices](https://vitejs.dev/guide/features.html#code-splitting)

**Confidence:** MEDIUM

### html2canvas
- **Limitations:** Cannot render cross-origin images without CORS. Cannot render CSS properties that aren't manually implemented. Slow for large DOMs.
- **Mitigation:** For Brand Bento's fixed 3×3 grid, DOM complexity is controlled. Performance should be acceptable (expect 2-5 seconds for export).
- **Alternative:** If performance becomes an issue, switch to dom-to-image-more (SVG-based, ~3x faster).

**Source:** [html2canvas README](https://github.com/niklasvh/html2canvas)

**Confidence:** HIGH

### Google Fonts API
- **Rate Limits:** No documented rate limits for public API. However, self-hosting fonts can improve performance by ~780ms.
- **GDPR Concerns:** Loading fonts from Google Fonts sends user IP to Google. Consider self-hosting (via Fontsource) if privacy is critical.

**Source:** [Google Fonts loading patterns](https://blog.larsbehrenberg.com/the-best-way-to-load-and-use-google-fonts-with-react-gatsby-and-nextjs)

**Confidence:** MEDIUM

### lz-string
- **Compression Ratio:** Expect ~60-80% reduction for JSON state. A 5KB JSON state compresses to ~1-1.5KB.
- **Browser Support:** Works in all modern browsers (IE9+).
- **Performance:** Compression/decompression is fast (<10ms for <10KB JSON).

**Source:** [lz-string official docs](https://pieroxy.net/blog/pages/lz-string/index.html)

**Confidence:** HIGH

## Recommended Architecture Improvements for Future Phases

### Short-Term (MVP+)
1. **Error Boundaries:** Wrap major components in React Error Boundaries to prevent full app crashes.
2. **Loading States:** Add loading spinners for brand extraction and export operations.
3. **Validation:** Validate URLs before sending to CORS proxy (check for valid format).

### Medium-Term (v2)
1. **Optimistic UI:** Update grid immediately on user interactions, persist to URL/localStorage asynchronously.
2. **Debounced Persistence:** Avoid writing to URL on every keystroke. Debounce by 500ms.
3. **Web Workers:** Move brand extraction parsing to Web Worker to avoid blocking main thread.

### Long-Term (v3+)
1. **Server-Side Export:** For better performance, render exports server-side with Puppeteer.
2. **Self-Hosted Fonts:** Bundle popular Google Fonts to reduce external dependencies and improve privacy.
3. **Canvas-Based Rendering:** Switch from DOM-based rendering to canvas for better export performance (avoids html2canvas entirely).

**Source:** Synthesized from scalability patterns and performance best practices

**Confidence:** MEDIUM

## Open Questions & Research Gaps

1. **Brand Extraction Accuracy:** How accurately can we extract brand elements from arbitrary websites? Different sites structure CSS differently (inline styles, CSS-in-JS, utility classes).
   **Mitigation:** Build MVP with basic extraction (getComputedStyle), iterate based on real-world testing.

2. **Font Detection:** How to detect which Google Fonts are used on a website vs. custom fonts?
   **Mitigation:** Check `font-family` against Google Fonts API list. For custom fonts, allow manual selection.

3. **Grid Spanning Algorithm:** How to automatically suggest tile spans based on content?
   **Mitigation:** Start with manual spanning, add smart suggestions in future phase.

4. **Export Quality:** Will html2canvas produce acceptable quality for marketing/social media use?
   **Mitigation:** Test with real brand extractions, consider higher DPI rendering or SVG export if needed.

**Confidence:** LOW (these require empirical testing)

## Summary

The recommended architecture for Brand Bento is a **layered, client-side SPA** with clear separation of concerns:

1. **Infrastructure Layer:** Cloudflare Worker CORS proxy
2. **Domain Logic Layer:** Brand extraction, font loading, export engine
3. **State Management Layer:** URL hash + localStorage with lz-string compression
4. **Presentation Layer:** React components with Grid System and Canvas Renderer

Key architectural decisions:
- **Client-side only** (no database, no auth, no server-side state)
- **Shareable via URL** (lz-string compressed state in hash)
- **On-demand font loading** (Google Fonts API with preconnect)
- **Controlled DOM complexity** (fixed 3×3 grid keeps html2canvas performant)

Build order: CORS Proxy → State → Persistence → Proxy Client → Brand Extractor → Grid → Canvas → Font Loader → Export

**Overall Confidence:** MEDIUM (architecture is well-researched, but brand extraction and export quality require empirical validation)
