# Project Research Summary

**Project:** Brand Bento
**Domain:** Client-side brand experimentation and visual design tools
**Researched:** 2026-02-06
**Confidence:** MEDIUM-HIGH

## Executive Summary

Brand Bento is a client-side brand experimentation tool that extracts visual brand elements (colors, typography, logos, imagery) from websites and lets users remix them in bento-style canvas layouts. Based on research into similar tools (Brandfetch, CSS Stats, design editors, mood board generators), the market has a clear gap: most tools are static extractors or full design platforms, but nothing offers dynamic, system-level brand experimentation.

The recommended approach is a pure client-side React SPA (no backend) using Vite for development, Cloudflare Workers for CORS proxying, native browser APIs for extraction, and URL hash state for shareability. This architecture prioritizes zero infrastructure costs, instant deployment, and shareable links without databases. The core innovation is the bento canvas visualization that shows how brand elements work together as a cohesive system, not isolated assets.

Key risks center around extraction reliability (CORS challenges, logo detection accuracy, font vs. fallback detection) and performance (canvas rendering on mobile, URL state size limits). Mitigations include self-hosted CORS proxy with rate limiting, manual upload fallbacks, lz-string compression for state, and CSS-driven rendering over canvas where possible. Brand extraction should be treated as best-effort, not guaranteed, with prominent manual alternatives.

## Key Findings

### Recommended Stack

Brand Bento requires a lightweight, modern client-side stack with strong TypeScript support and minimal dependencies. The architecture is serverless except for a simple CORS proxy.

**Core technologies:**
- **React 18+ with Vite 7+**: Industry standard SPA framework with instant HMR (<50ms), zero config for TypeScript, 100x faster than webpack/CRA. Required by React Router v7.
- **Cloudflare Workers**: CORS proxy at edge with <1ms cold starts, 300+ global data centers, unlimited bandwidth on free tier. Purpose-built for edge proxying with 20-line implementation.
- **html-to-image**: Canvas export to PNG/SVG/JPEG. Actively maintained fork of dom-to-image, 1.6M monthly downloads, better font/CSS support than html2canvas (which is unmaintained since 2022).
- **lz-string**: URL-safe state compression. 60% typical compression ratio, produces URI-safe output with `compressToEncodedURIComponent()`, 11M+ weekly downloads, battle-tested for 10+ years.
- **Zustand**: Client-side state management. ~1KB bundle, faster than Context API, built-in persistence middleware, minimal boilerplate compared to Redux.
- **Tailwind CSS + CSS Modules**: Hybrid styling approach. Tailwind for 90% of layout/spacing (rapid prototyping, AI assistant friendly), CSS Modules for complex component-specific styles.
- **Native DOM APIs**: HTML parsing via `DOMParser`, CSS extraction via `window.getComputedStyle()`, Google Fonts API for font metadata. Zero dependencies, more accurate than server-side libraries for client-side rendering.

**Confidence:** HIGH (all versions verified via official docs and npm)

**Anti-recommendations:**
- No server-side frameworks (Next.js, Remix, Astro) — defeats client-only architecture
- No html2canvas — unmaintained, author warns against production use, blurry on retina displays
- No Create React App — officially deprecated, replaced by Vite
- No Redux — 10x more boilerplate than Zustand for client-only apps

### Expected Features

Based on analysis of 15+ extraction tools, design collaboration platforms, and mood board generators, features divide into three categories:

**Must have (table stakes):**
- **URL-based extraction** — industry standard, users expect to paste URL and get results (Brandfetch, CSS Stats model)
- **Color palette extraction** — 5-10 colors with hex codes, core brand element
- **Font detection** — font families, weights, sizes (browser extensions like WhatFont set expectations)
- **Logo extraction** — header/nav scanning for SVG and raster formats
- **Visual preview** — real-time feedback as extraction completes
- **Manual asset upload** — fallback when scraping fails or for experimentation without live sites
- **PNG export** — minimum export capability, users need to take results elsewhere
- **Basic error handling** — clear messages when extraction fails (CORS, rate limiting, paywalls)
- **Mobile responsive** — 40% abandon after 3 seconds, critical for retention

**Should have (competitive differentiators):**
- **Bento-style system visualization** — core innovation, shows brand elements working TOGETHER as a system
- **Live remixing/experimentation** — swap typography, adjust colors, reposition elements in real-time
- **Typography scale extraction** — full type system (sizes, line heights, weights), not just font family
- **Shareable links** — generate unique URL for each composition (Figma normalized this expectation)
- **Template/layout variations** — multiple composition styles (landing page, social media, print)
- **Design token export** — CSS, JSON, Tailwind config for dev handoff
- **Before/after comparison** — original brand vs. remixed version

**Defer (v2+):**
- User accounts — use localStorage + shareable links initially to avoid friction
- Collaborative editing — real-time multi-user is complex, async review via links is sufficient
- Animation/motion design — adds major complexity, static compositions first
- Comprehensive imagery extraction — focus on logo + colors + typography first
- AI content generation — extraction + remixing is core, not asset creation

**Key insight from competitive analysis:** Brandfetch extracts assets but doesn't show them as a system. CSS Stats analyzes the system but doesn't extract usable assets. Mood boards let you compose but start from scratch. Brand Bento combines extraction + system visualization + experimentation — this is the market gap.

### Architecture Approach

Brand Bento uses a layered, client-side SPA architecture with clear separation of concerns: Infrastructure Layer (Cloudflare CORS proxy) → Domain Logic Layer (brand extraction, font loading, export engine) → State Management Layer (URL hash + localStorage with lz-string compression) → Presentation Layer (React components with Grid System and Canvas Renderer).

**Major components:**
1. **CORS Proxy (Cloudflare Worker)** — Fetches external HTML, adds CORS headers, returns to client. Handles OPTIONS preflight separately. Must include rate limiting (10 req/min per IP) from day one to prevent abuse.
2. **Brand Extractor** — Parses HTML with native `DOMParser`, extracts colors via `getComputedStyle()`, detects fonts from CSS declarations (not computed fallbacks), scans header/nav for logos with quality scoring.
3. **State Manager** — Manages canvas state (grid config, fonts, colors, images) with hybrid persistence: URL hash for shareability, localStorage for recovery. Uses lz-string compression to keep URLs under 2,000 chars.
4. **Grid System + Canvas Renderer** — 3×3 bento grid with tile spanning, CSS-driven rendering for performance (not canvas drawing for live preview). Uses CSS Grid for layout calculations.
5. **Font Loader** — Dynamically loads Google Fonts on-demand via `<link>` injection with preconnect hints. Waits for `document.fonts.ready` before rendering to avoid FOUT.
6. **Export Engine** — Uses html-to-image (not html2canvas) to convert DOM to PNG. Performance acceptable for 3×3 grid (~2-5 seconds). Consider lazy loading with `React.lazy()`.

**Component build order:** CORS Proxy → State Manager → Persistence Layer → Proxy Client → Brand Extractor → Grid System → Canvas Renderer → Font Loader → Export Engine

**Key patterns to follow:**
- CORS proxy with preflight handling (separate OPTIONS from GET/POST)
- URL-safe state compression with `compressToEncodedURIComponent()`
- Hybrid URL + localStorage persistence (URL for sharing, localStorage for recovery)
- Container/Presentational component separation (smart vs. dumb components)
- On-demand font loading with preconnect for performance

**Confidence:** MEDIUM (architecture is well-researched, but brand extraction accuracy requires empirical validation)

### Critical Pitfalls

1. **CORS Proxy Abuse and Rate Limiting** — Public proxies get hammered, leading to downtime. Self-host Cloudflare Worker from day one with IP-based rate limiting (10 req/min), domain allowlist if possible, and response size limits. Content type filtering to block binary abuse. Without controls, extraction becomes unreliable or stops working entirely.

2. **URL State Exceeds Browser Limits** — Canvas state in URL can exceed 2,000 chars (Safari) to 65,000 chars (Chrome), breaking share links. Use lz-string compression (60% reduction), avoid encoding image data URIs in URL (use localStorage with hash reference), show warning at 1,500 chars uncompressed, offer "Download JSON" alternative for large states.

3. **Logo Extraction Is Fundamentally Unreliable** — No standard HTML element for logos, sites use `<img>`, `<svg>`, CSS backgrounds, or JavaScript rendering. Heuristics (looking for "logo" class names) are easily fooled. Accept as best-effort, make manual upload equally prominent, default to favicon with disclaimer, show verification step ("Is this your logo?"), generate monogram fallback as last resort.

4. **Canvas Rendering Performance Degrades Quickly** — Repeated canvas drawing operations on main thread cause jank during live editing. Use CSS-driven rendering (transforms use GPU), debounce updates by 100-300ms, batch rendering by color (reduce state changes), offscreen canvas for static elements, avoid `shadowBlur` (extremely slow), monitor frame times (>16ms = below 60fps).

5. **Font Extraction Returns Computed vs Declared Fonts** — Browser returns font that actually rendered (often Arial fallback) instead of declared web font. Read CSS declarations not computed styles, wait for `document.fonts.ready` before extraction, cross-reference with loaded fonts, check Google Fonts API calls in network requests, show user verification with preview.

**Moderate pitfalls to watch:**
- Google Fonts CORS errors on self-hosted fonts (use CDN or configure server headers)
- Color extraction misses small visually dominant regions (use semantic element targeting, check CSS custom properties)
- Mobile canvas blurry on high-DPI screens (scale by devicePixelRatio, test on actual devices)
- Debouncing still feels janky (prefer React 18 `useDeferredValue` for interruptible rendering)

## Implications for Roadmap

Based on combined research, the recommended phase structure prioritizes extraction reliability, core visualization, and performance optimization before advanced features.

### Phase 1: Foundation + Core Extraction
**Rationale:** CORS proxy is a blocker for all data acquisition. State management must be established before building features. Basic extraction delivers immediate value and validates feasibility.

**Delivers:**
- Self-hosted Cloudflare Worker CORS proxy with rate limiting
- URL hash + localStorage state persistence with lz-string compression
- Basic brand extraction: colors (5-10), typography (families), logo (header scan)
- Manual asset upload as fallback
- Single bento canvas layout showing elements together
- Error handling for extraction failures

**Addresses features:**
- URL-based extraction (table stakes)
- Color palette extraction (table stakes)
- Font detection (table stakes)
- Logo extraction (table stakes, best-effort)
- Manual asset upload (table stakes)
- Visual preview (table stakes)

**Avoids pitfalls:**
- Pitfall 1: Self-hosted proxy from day one prevents reliance on third-party services
- Pitfall 2: lz-string compression prevents URL state overflow
- Pitfall 3: Manual upload prominence acknowledges logo extraction unreliability

**Research flag:** Likely needs deeper research on color extraction algorithms and logo quality scoring heuristics.

### Phase 2: Live Experimentation + Export
**Rationale:** Core value proposition is remixing, not just static extraction. Export is essential for users to take results elsewhere. This phase delivers the key differentiator.

**Delivers:**
- Live remixing UI: swap colors between elements, change typography pairings
- Before/after comparison view (original brand vs. remixed)
- Typography scale extraction (sizes, line heights, weights)
- PNG export with html-to-image
- Mobile responsive canvas with devicePixelRatio scaling

**Addresses features:**
- Live remixing/experimentation (differentiator)
- Before/after comparison (differentiator)
- Typography scale extraction (differentiator)
- PNG export (table stakes)
- Mobile responsive (table stakes)

**Avoids pitfalls:**
- Pitfall 4: CSS-driven rendering keeps performance acceptable
- Pitfall 5: Typography scale extraction from CSS declarations not computed styles
- Pitfall 8: devicePixelRatio scaling prevents mobile blur
- Pitfall 9: Use `useDeferredValue` for non-janky live updates

**Research flag:** Standard patterns for drag-and-drop UI and color picker interactions (skip research-phase).

### Phase 3: Shareability + Templates
**Rationale:** Shareable links enable collaboration and distribution. Template variations show versatility of brand system. This phase expands utility without adding extraction complexity.

**Delivers:**
- Shareable links (URL hash already established in Phase 1)
- Multiple bento layout templates (landing page, social media, print)
- Font loading optimization (preconnect, wait for `document.fonts.ready`)
- Design token export (CSS, JSON, Tailwind config)

**Addresses features:**
- Shareable links (differentiator)
- Template/layout variations (differentiator)
- Design token export (differentiator)

**Avoids pitfalls:**
- Pitfall 11: Font loading race condition (wait for fonts before render)
- Pitfall 12: SVG logo validation (check viewBox on extraction)

**Research flag:** Well-documented pattern (template switching, JSON export), skip research-phase.

### Phase 4: Intelligence + Polish (Post-MVP)
**Rationale:** AI suggestions and accessibility checks add polish but aren't essential for core value. Version history enables iteration tracking.

**Delivers:**
- AI-powered combination suggestions ("try this color with this typography")
- Accessibility checker (WCAG contrast validation)
- Version history (save snapshots of compositions)
- Comprehensive imagery extraction (hero images, product photography)

**Addresses features:**
- AI suggestions (differentiator, high complexity)
- Accessibility checker (differentiator)
- Version history (differentiator)
- Imagery extraction (deferred from Phase 1)

**Research flag:** Needs deeper research on AI model selection, prompt engineering for brand suggestions, and image relevance scoring.

### Phase Ordering Rationale

- **Foundation first:** CORS proxy and state management are blockers for all features. Establish reliable data acquisition before building UI.
- **Extraction before remixing:** Can't remix what hasn't been extracted. Validate extraction accuracy before investing in experimentation UI.
- **Static before dynamic:** Single layout before multiple templates. PNG export before design token export. Reduces complexity.
- **Core differentiator early:** Live remixing (Phase 2) validates market fit quickly. Don't wait until Phase 4 to prove the concept.
- **AI/intelligence last:** High complexity, high cost, requires iteration data. Build after core loops are proven.

### Research Flags

**Needs deeper research during planning:**
- **Phase 1 (Extraction):** Color extraction algorithms (k-means vs semantic segmentation), logo quality scoring models (NIMA), font declaration parsing patterns
- **Phase 4 (AI):** Model selection for brand suggestions, prompt patterns for combination recommendations, cost/latency analysis

**Standard patterns (skip research-phase):**
- **Phase 2 (Remixing):** Drag-and-drop UI libraries, color picker components, React performance optimization
- **Phase 3 (Templates):** Layout switching patterns, JSON export utilities, URL state management

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified via official docs (Vite 7.3.1, React Router 7.13, html-to-image 1.11.13, lz-string 1.5.0). Cloudflare Workers patterns confirmed with official examples. |
| Features | MEDIUM-HIGH | Competitive analysis covers 15+ tools with consistent patterns. Table stakes are well-established. Differentiators validated by market gap analysis (no tool combines extraction + system view + remixing). |
| Architecture | MEDIUM | Component boundaries and data flow patterns are well-researched, but brand extraction accuracy requires empirical testing. Canvas rendering performance confident based on MDN/web.dev docs. |
| Pitfalls | MEDIUM-HIGH | CORS proxy and canvas performance backed by official docs (HIGH confidence). Logo extraction and font detection based on community knowledge and web scraping best practices (MEDIUM confidence). Academic research confirms color extraction challenges. |

**Overall confidence:** MEDIUM-HIGH

Research is thorough and well-sourced. Stack decisions are verified with official documentation. Feature expectations are validated by competitive analysis. Architecture patterns are synthesized from established tools. Pitfalls are cross-verified with multiple sources (official docs, academic papers, community forums).

### Gaps to Address

**Extraction accuracy validation:** Research provides strategies but can't predict real-world accuracy rates. Needs empirical testing with diverse websites during Phase 1.
- **Mitigation:** Build MVP extraction quickly, test with 20+ diverse sites (e-commerce, SaaS, portfolio, blog), measure success rates, iterate on heuristics.

**Canvas export quality:** html-to-image is recommended based on maintenance status, but real-world quality for brand compositions is unknown.
- **Mitigation:** Prototype export early in Phase 2, test with marketing/social media use cases, consider fallback to PNG upload if quality insufficient.

**URL state size thresholds:** lz-string provides 60% compression, but actual state size depends on canvas complexity. Edge cases may still exceed browser limits.
- **Mitigation:** Implement monitoring and warnings at 1,500 chars uncompressed, provide JSON download alternative, test with complex multi-template compositions.

**Google Fonts API rate limits:** No documented public API limits, but aggressive polling could trigger throttling.
- **Mitigation:** Cache font metadata in localStorage, debounce font preview updates, monitor API response times for 429 errors.

**Mobile performance targets:** DevTools emulation doesn't catch all DPI/performance issues.
- **Mitigation:** Test on actual iOS/Android devices early in Phase 2, establish performance budget (60fps for interactions, <200ms for exports), profile with real devices.

## Sources

### Primary (HIGH confidence)
- [Vite Official Documentation](https://vite.dev/guide/) — Build tool and dev server patterns
- [React Router Official Changelog](https://reactrouter.com/changelog) — v7 migration and TypeScript support
- [Cloudflare Workers CORS Proxy](https://developers.cloudflare.com/workers/examples/cors-header-proxy/) — Official implementation pattern
- [MDN: Optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) — Canvas performance best practices
- [web.dev: Canvas Performance](https://web.dev/canvas-performance/) — Google performance guidance
- [React: useDeferredValue](https://react.dev/reference/react/useDeferredValue) — Official React 18 concurrent rendering
- [Google Fonts Troubleshooting](https://developers.google.com/fonts/docs/troubleshooting) — Official CORS and loading patterns
- [lz-string npm package](https://www.npmjs.com/package/lz-string) — Official compression library docs
- [html-to-image GitHub](https://github.com/bubkoo/html-to-image) — Official repo and release notes

### Secondary (MEDIUM confidence)
- [IEEE: Clustering Algorithms for Color Extraction](https://ieeexplore.ieee.org/document/11139272/) — Academic research on dominant color detection
- [MDPI: Dominant Color Extraction](https://www.mdpi.com/2227-7080/13/6/230) — Peer-reviewed color extraction approaches
- [nuqs: URL State Limits](https://nuqs.dev/docs/limits) — Browser URL length constraints
- [httptoolkit.com: CORS Proxies](https://httptoolkit.com/blog/cors-proxies/) — CORS proxy security and best practices
- [CSS-Tricks: Fallback Font Stacks](https://css-tricks.com/css-basics-fallback-font-stacks-robust-web-typography/) — Font fallback behavior
- [developerway.com: Debouncing in React](https://www.developerway.com/posts/debouncing-in-react) — Performance optimization patterns
- [Brandfetch](https://brandfetch.com/) — Competitive analysis reference
- [CSS Stats](https://cssstats.com/) — Design token extraction patterns
- [Peek](https://trypeek.app/) — Typography inspection tool

### Tertiary (LOW confidence, needs validation)
- [Brand.dev Logo Scraping Guide](https://www.brand.dev/blog/a-developers-guide-to-scraping-logos-from-websites) — Logo detection heuristics
- [State of Web Scraping 2026](https://www.browserless.io/blog/state-of-web-scraping-2026) — General scraping challenges
- Community forums and blog posts on canvas rendering, font detection, color extraction

---
*Research completed: 2026-02-06*
*Ready for roadmap: YES*
