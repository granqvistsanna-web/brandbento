# Technology Stack

**Project:** Brand Bento
**Researched:** 2026-02-06
**Confidence:** HIGH

## Executive Summary

Brand Bento is a client-side brand experimentation tool requiring zero backend. The recommended stack prioritizes modern, lightweight, client-side technologies with strong TypeScript support. Core technologies: React 18+ with Vite 7+ for development, Cloudflare Workers for CORS proxying, html-to-image for canvas export, and lz-string for URL state compression.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **React** | 18+ | UI framework | Industry standard for SPAs, excellent TypeScript support, hooks API perfect for client-side state management, required by React Router v7 |
| **Vite** | 7.3+ | Build tool & dev server | 100x faster than webpack/CRA, instant HMR (<50ms), native ESM, zero config for React+TS, current industry standard for new projects in 2025 |
| **TypeScript** | 5.0+ | Type safety | First-class Vite support, prevents runtime errors, better DX with autocomplete, required for maintainability |
| **React Router** | v7 (7.13+) | Client-side routing | Non-breaking upgrade from v6, first-class TypeScript support with typegen, optimized for SPAs, can use `react-router` directly (v7 simplified package structure) |

**Rationale:** React + Vite is the 2025 standard for SPAs, replacing Create React App entirely. Vite's dev server startup is near-instant, HMR is under 50ms, and it requires zero configuration for most features. React Router v7 provides type-safe routing with minimal boilerplate.

**Confidence:** HIGH (verified via official Vite docs and React Router changelog)

---

### CORS Proxy Infrastructure

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Cloudflare Workers** | Latest | CORS proxy for URL fetching | Serverless edge computing with <1ms cold starts, 300+ global data centers, unlimited bandwidth on free tier, V8 isolate runtime is perfect for simple proxy tasks, negligible latency due to edge proximity |

**Alternative Considered:**
- **Vercel Edge Functions**: Also viable, but caps at 100GB/month free vs Cloudflare's unlimited bandwidth. Better Next.js integration (irrelevant for this project).

**Rationale:** Cloudflare Workers are purpose-built for edge proxying with unmatched global performance. The free tier is generous enough for a tool like Brand Bento. Simple CORS header injection requires minimal code (~20 lines).

**Implementation Pattern:**
```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url).searchParams.get('url');
    const response = await fetch(url);
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    return newResponse;
  }
}
```

**Confidence:** HIGH (verified via Cloudflare Workers official documentation)

---

### HTML/CSS Parsing & Extraction

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Native DOM APIs** | N/A (browser built-in) | Primary HTML parsing | Zero dependencies, `DOMParser` and `document.createElement` handle remote HTML, `window.getComputedStyle()` extracts computed CSS accurately |
| **Google Fonts API** | v1 | Font metadata retrieval | REST API provides JSON metadata for all Google Fonts families, styles, and weights. Direct CSS link injection for on-demand loading |
| **Web Font Loader** | 1.6.28 | Dynamic font loading (optional) | Event-driven font loading with FOUT control, supports callbacks for loading/active/inactive states. Use only if you need load state tracking |

**Rationale:** Native DOM APIs are sufficient for parsing HTML and extracting computed styles. `window.getComputedStyle()` returns all resolved CSS properties including fonts, colors, and layout. For Google Fonts, the Developer API provides metadata, while dynamic `<link>` injection handles loading.

**Why NOT libraries like Cheerio/JSDOM:** These are server-side libraries. Brand Bento runs entirely in the browser, so native DOM APIs are both lighter and more accurate.

**Pattern for extracting brand assets:**
```typescript
// Fetch HTML via CORS proxy
const html = await fetch(`${CORS_PROXY}?url=${targetUrl}`).then(r => r.text());

// Parse with native DOMParser
const parser = new DOMParser();
const doc = parser.parseFromString(html, 'text/html');

// Extract computed styles
const heading = doc.querySelector('h1');
const styles = window.getComputedStyle(heading);
const fontFamily = styles.getPropertyValue('font-family');
const color = styles.getPropertyValue('color');
```

**Confidence:** HIGH (verified via MDN documentation for `getComputedStyle`)

---

### Color Extraction

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **extract-colors** | 1.1.0+ | Extract color palettes from images | <6kB minified, browser-native (no dependencies), works with HTMLImageElement/ImageData, fast clustering algorithm, supports custom color count |
| **Color Thief** | 2.4+ | Alternative color extraction | MIT licensed, works in browser and Node, palette clustering via k-means, widely used (battle-tested) |

**Recommendation:** Use **extract-colors** for primary implementation due to smaller bundle size and zero dependencies. Color Thief is a solid fallback if you need more sophisticated clustering.

**Rationale:** Client-side color extraction from brand imagery (logos, hero images) is essential. extract-colors provides sufficient accuracy at minimal bundle cost.

**Confidence:** MEDIUM (extract-colors package exists but version verification limited; Color Thief widely documented)

---

### Canvas Rendering & Image Export

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **html-to-image** | 1.11.13 | Convert DOM to PNG/SVG/JPEG | Modern, actively maintained fork of dom-to-image (unmaintained), 1.6M monthly downloads, multiple output formats (toPng, toJpeg, toSvg, toBlob), better CSS/font support than html2canvas, no dependencies |
| **html2canvas** | 1.4.1 | Fallback/alternative | Most popular (2.6M weekly downloads), but author considers it "experimental", last updated Jan 2022, struggles with retina displays and complex CSS |

**Recommendation:** Use **html-to-image** as primary solution. It's better maintained, handles fonts/SVGs more reliably, and offers multiple output formats.

**Why NOT html2canvas:** Despite higher download count, it's effectively unmaintained (last release 2022), author warns against production use, known issues with blurry text on high-DPI displays.

**Usage Pattern:**
```typescript
import { toPng } from 'html-to-image';

const exportCanvas = async (element: HTMLElement) => {
  const dataUrl = await toPng(element, { quality: 0.95 });
  const link = document.createElement('a');
  link.download = 'brand-bento.png';
  link.href = dataUrl;
  link.click();
};
```

**Confidence:** HIGH (verified via GitHub releases and npm comparison data)

---

### URL State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **lz-string** | 1.5.0 | URL-safe state compression | 60% typical compression ratio, zero dependencies, `compressToEncodedURIComponent()` produces URI-safe output (no encoding needed), 20-60 MB/s decompression, 11M+ weekly downloads, battle-tested |

**Alternatives Considered:**

| Library | Why Not |
|---------|---------|
| **Zstandard (zstd-wasm)** | Better compression (50-60% more efficient), but requires WebAssembly loading overhead. Overkill for URL state compression. |
| **Brotli** | 17-20% better than gzip, but browser CompressionStream API has limited encoding support. Better for static assets than dynamic state. |
| **smol-string** | Faster than lz-string, uses Zig+WASM, but newer/less proven. Only 2 years old vs lz-string's 10+ years. |

**Recommendation:** Use **lz-string** for production. It's proven, lightweight, and specifically designed for URL encoding. The `compressToEncodedURIComponent` method is perfect for URL hash state.

**Pattern:**
```typescript
import LZString from 'lz-string';

// Compress state to URL
const state = { canvas: [...], fonts: [...], colors: [...] };
const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(state));
window.location.hash = compressed;

// Decompress from URL
const hash = window.location.hash.slice(1);
const decompressed = LZString.decompressFromEncodedURIComponent(hash);
const state = JSON.parse(decompressed);
```

**Confidence:** HIGH (verified via npm package page and community usage data)

---

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Zustand** | 5.0+ | Client-side state management | Minimal boilerplate, ~1KB bundle, faster than Context API, built-in persistence middleware (for localStorage), no provider hell, scales well for medium apps |
| **React Context API** | Built-in | Lightweight state (theme, settings) | No dependencies, sufficient for simple state like UI theme or user preferences |

**Recommendation:** Use **Zustand** for canvas/brand state (frequently updated), and **Context API** for static config (CORS proxy URL, Google Fonts API key).

**Why NOT Redux:** Overkill for client-only app with no server sync. Zustand provides similar functionality with 90% less boilerplate.

**Why NOT Context API alone:** Performance issues with frequent updates. Context causes re-renders of entire subtree, while Zustand only re-renders subscribed components.

**Confidence:** HIGH (verified via multiple 2025 state management comparisons)

---

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Tailwind CSS** | 3.4+ | Utility-first CSS framework | Rapid prototyping, consistent design system, excellent responsive/dark mode support, AI coding assistants suggest Tailwind classes, perfect for bento-style grid layouts |
| **CSS Modules** | Built-in (Vite) | Component-specific complex styles | Zero config in Vite, scoped styles prevent conflicts, use for complex animations or canvas-specific styling that Tailwind can't handle |

**Recommendation:** **Hybrid approach.** Use Tailwind for 90% of styling (layout, spacing, colors, typography), CSS Modules for complex component-specific styles (canvas animations, custom transitions).

**Rationale:** Tailwind accelerates development and provides consistency. CSS Modules handle edge cases where Tailwind utilities are insufficient (complex pseudo-selectors, keyframe animations).

**Confidence:** HIGH (verified via multiple 2025 styling comparisons)

---

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **clsx** | 2.1+ | Conditional className utility | Combine Tailwind classes dynamically based on state |
| **react-use** | 17.5+ | React hooks collection | Useful hooks: `useLocalStorage`, `useDebounce`, `useClickAway`, `useCopyToClipboard` |
| **nanoid** | 5.0+ | Unique ID generation | Generate IDs for canvas elements, 2x faster than uuid, smaller bundle (130 bytes) |

**Confidence:** MEDIUM (common utility libraries, versions approximate)

---

## Development Tooling

| Tool | Version | Purpose | Why |
|------|---------|---------|-----|
| **ESLint** | 9.0+ | Linting | Pre-configured in Vite React-TS template, use flat config format (`eslint.config.js`), catches bugs early |
| **Prettier** | 3.0+ | Code formatting | Auto-format on save, integrates with ESLint via `eslint-config-prettier` |
| **TypeScript ESLint** | 8.0+ | TypeScript linting rules | Enforces TypeScript best practices, included in Vite template |

**Recommended ESLint Plugins:**
- `eslint-plugin-react-hooks` - Enforces Rules of Hooks
- `eslint-plugin-react-refresh` - Ensures Fast Refresh compatibility
- `eslint-plugin-jsx-a11y` - Accessibility checks

**Confidence:** HIGH (standard Vite + React + TypeScript setup)

---

## Alternatives Considered

### CORS Proxy

| Alternative | Why Not |
|-------------|---------|
| **Vercel Edge Functions** | Bandwidth cap (100GB/month) vs Cloudflare's unlimited. Vercel is better for Next.js integration (not needed here). |
| **Self-hosted proxy** | Requires server management, increases costs, defeats "client-side only" philosophy. |

### Canvas Export

| Alternative | Why Not |
|-------------|---------|
| **html2canvas** | Unmaintained since 2022, author warns against production use, blurry on retina displays. |
| **dom-to-image** | Original project is unmaintained; html-to-image is the maintained fork with same API. |
| **Puppeteer** | Server-side only, requires Node.js backend. Brand Bento is client-only. |

### State Management

| Alternative | Why Not |
|-------------|---------|
| **Redux** | 10x more boilerplate than Zustand, designed for large-scale apps with complex async flows. Overkill for client-only tool. |
| **Jotai** | Atomic state model is elegant but less familiar to most developers than Zustand's store pattern. |
| **Recoil** | Meta's library, but less active development than Zustand. Smaller community. |

### Build Tool

| Alternative | Why Not |
|-------------|---------|
| **Create React App** | Officially deprecated, replaced by Vite. Slow dev server, no HMR optimization. |
| **webpack** | Configuration complexity, slower than Vite for dev server. Vite uses Rollup for production anyway. |
| **Parcel** | Good zero-config option, but Vite has better React ecosystem integration and larger community. |

---

## Installation

### Core Dependencies

```bash
# Create project
npm create vite@latest brandbento -- --template react-ts

# Core libraries
npm install react-router zustand lz-string html-to-image clsx

# Utilities
npm install react-use nanoid

# Styling
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Optional: Color extraction (choose one)
npm install extract-colors
# OR
npm install colorthief
```

### Dev Dependencies

```bash
# ESLint + Prettier (pre-installed in Vite template, but confirm versions)
npm install -D eslint prettier eslint-config-prettier
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D eslint-plugin-react-hooks eslint-plugin-jsx-a11y
```

### Environment Variables

Create `.env` file in project root:

```bash
# Cloudflare Worker CORS proxy URL
VITE_CORS_PROXY_URL=https://your-worker.workers.dev

# Google Fonts API key (optional, for metadata retrieval)
VITE_GOOGLE_FONTS_API_KEY=your_api_key_here
```

**Important:** Prefix all variables with `VITE_` so Vite exposes them to client code via `import.meta.env.VITE_*`.

Add TypeScript types in `src/vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CORS_PROXY_URL: string;
  readonly VITE_GOOGLE_FONTS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## Anti-Recommendations

### What NOT to Use

| Technology | Why Avoid |
|------------|-----------|
| **Any server-side framework** | Defeats "client-only" architecture. No Next.js, Remix, Astro for this project. |
| **jQuery** | Legacy library, unnecessary with modern React. DOM manipulation should go through React's virtual DOM. |
| **Lodash** | Modern JavaScript and TypeScript make most Lodash utilities obsolete. Use native methods or tiny alternatives (e.g., `clsx` instead of `_.classNames`). |
| **Moment.js** | Deprecated, huge bundle size. Use native `Intl.DateTimeFormat` or `date-fns` if needed (unlikely for this project). |
| **Axios** | Native `fetch()` API is sufficient for simple GET requests to CORS proxy. No need for extra dependency. |

---

## Performance Considerations

| Concern | Strategy |
|---------|----------|
| **Bundle size** | Vite's tree-shaking + code splitting keeps initial bundle <200KB. Lazy load canvas export library with `React.lazy()`. |
| **Image processing** | Use Web Workers for color extraction from large images to avoid blocking main thread. |
| **Font loading** | Load Google Fonts on-demand only when user selects them. Use `font-display: swap` to prevent FOUT. |
| **CORS proxy latency** | Cloudflare Workers run at edge (300+ locations), latency typically <50ms. Cache fetched HTML in sessionStorage to avoid re-fetching. |
| **URL state size** | lz-string compression keeps URL hash under 2KB even with complex canvas state. Browsers support URLs up to ~2000 chars (safe limit). |

---

## Security Considerations

| Risk | Mitigation |
|------|-----------|
| **XSS from fetched HTML** | Parse with `DOMParser` instead of `innerHTML`. Never execute scripts from fetched HTML. |
| **CORS proxy abuse** | Rate-limit Cloudflare Worker (free tier: 100k requests/day). Consider adding origin validation in production. |
| **Sensitive data in URL** | Don't compress API keys or tokens into URL state. Only encode canvas layout, colors, fonts. |
| **Open redirect** | Validate URLs before passing to CORS proxy. Whitelist domains or use URL parser to reject suspicious patterns. |

---

## Sources

**Build Tools & Frameworks:**
- [Vite Official Documentation](https://vite.dev/guide/)
- [Advanced Guide to Using Vite with React in 2025](https://codeparrot.ai/blogs/advanced-guide-to-using-vite-with-react-in-2025)
- [React Router Official Changelog](https://reactrouter.com/changelog)
- [React Router v7 Releases](https://github.com/remix-run/react-router/releases)

**CORS Proxy:**
- [Cloudflare Workers CORS Header Proxy Example](https://developers.cloudflare.com/workers/examples/cors-header-proxy/)
- [Building a CORS-Enabled Proxy with Cloudflare Workers](https://ah-mahir.medium.com/building-a-cors-enabled-proxy-server-with-cloudflare-workers-47f97c16d60b)
- [Vercel vs Cloudflare Serverless Functions Guide](https://www.digitalapplied.com/blog/serverless-functions-vercel-cloudflare-guide)

**HTML/CSS Parsing:**
- [MDN: window.getComputedStyle()](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle)
- [Best HTML Parsing Libraries in JavaScript](https://dev.to/apiforseo/best-html-parsing-libraries-in-javascript-6bn)
- [Google Fonts Web Font Loader](https://developers.google.com/fonts/docs/webfont_loader)

**Canvas Export:**
- [html-to-image GitHub Repository](https://github.com/bubkoo/html-to-image)
- [Best HTML to Canvas Solutions in 2025](https://portalzine.de/best-html-to-canvas-solutions-in-2025/)
- [Replacing html2canvas with html-to-image](https://betterprogramming.pub/heres-why-i-m-replacing-html2canvas-with-html-to-image-in-our-react-app-d8da0b85eadf)
- [html2canvas Official Site](https://html2canvas.hertzen.com/)

**State Compression:**
- [lz-string npm package](https://www.npmjs.com/package/lz-string)
- [Browser Compression Options 2025](https://dev.to/jswhisperer/browser-compression-options-2025-4gc9)

**State Management:**
- [React State Management in 2025: Context API vs Zustand](https://dev.to/cristiansifuentes/react-state-management-in-2025-context-api-vs-zustand-385m)
- [State Management in 2025: Redux vs Zustand vs Jotai](https://dev.to/hijazi313/state-management-in-2025-when-to-use-context-redux-zustand-or-jotai-2d2k)

**Styling:**
- [Tailwind CSS vs CSS Modules in 2025](https://medium.com/@sanjeevanibhandari3/tailwind-css-vs-css-modules-whats-more-efficient-in-2025-72bafbc75a79)
- [CSS Architecture 2025: Tailwind Analysis](https://dev.to/andriy_ovcharov_312ead391/css-architecture-2025-is-tailwind-a-must-have-or-just-hype-jed)

**Development Setup:**
- [Vite Environment Variables](https://vite.dev/guide/env-and-mode)
- [TypeScript ESLint Prettier Setup 2025](https://dev.to/marina_eremina/how-to-set-up-eslint-and-prettier-for-react-app-in-vscode-2025-2341)
- [Setting Up React + TypeScript with Vite](https://javascript.plainenglish.io/setting-up-a-react-typescript-project-with-vite-eslint-prettier-and-husky-ef7c9dada761)

**Color Extraction:**
- [extract-colors npm package](https://www.npmjs.com/package/extract-colors)
- [Color Thief](https://lokeshdhakar.com/projects/color-thief/)
- [6 JavaScript Color Generation Tools](https://blog.logrocket.com/6-javascript-tools-color-generation/)

---

## Version Verification Status

| Library | Version Verified | Source | Confidence |
|---------|-----------------|--------|------------|
| Vite | 7.3.1 | Official docs | HIGH |
| React Router | 7.13.0 | npm + official changelog | HIGH |
| html-to-image | 1.11.13 | GitHub releases | HIGH |
| lz-string | 1.5.0 | npm package page | HIGH |
| html2canvas | 1.4.1 | GitHub + official site | HIGH |
| Tailwind CSS | 3.4+ | Community articles | MEDIUM |
| Zustand | 5.0+ | Community articles | MEDIUM |
| React | 18+ | Vite requirements | HIGH |
| TypeScript | 5.0+ | Standard for 2025 | MEDIUM |

---

## Summary

This stack prioritizes:
1. **Zero backend** - Everything runs in browser
2. **Modern DX** - Vite's instant HMR, TypeScript safety, minimal config
3. **Performance** - Edge CORS proxy, efficient compression, tree-shaking
4. **Maintainability** - Active libraries (avoid unmaintained tools like dom-to-image/html2canvas)
5. **Proven technologies** - High-download-count libraries with 2025 relevance

**Total bundle estimate (production, gzipped):**
- React + React Router: ~45KB
- Zustand: ~1KB
- lz-string: ~3KB
- html-to-image: ~15KB
- Tailwind (purged): ~10KB
- App code: ~30KB
- **Total: ~100-120KB initial load**

**Development velocity:** With Vite's HMR and Tailwind's utility classes, feature development should be rapid. Expect 2-3 week timeline for MVP.
