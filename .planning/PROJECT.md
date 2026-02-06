# Brand Bento

## What This Is

Brand Bento is a client-side brand experimentation tool. Users enter a URL to extract brand assets (typography, colors, imagery, logo), then remix them inside a bento-style canvas with live updates. The result is a structured moodboard with real constraints — no accounts, no backend, runs entirely in the browser.

## Core Value

See typography, color, imagery, and logo working together as a system, not isolated assets. The canvas must always be usable — extraction failures fill with sensible defaults, never empty tiles.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] URL-based brand extraction via CORS proxy (Cloudflare Worker)
- [ ] Fixed 3×3 bento grid with intentional tile spanning
- [ ] Logo tile (1×1) with light/dark/mono toggle and upload fallback
- [ ] Primary typography tile (1×1) with font picker and controls
- [ ] Secondary typography tile (1×1) with font picker and controls
- [ ] Color palette tile (1×1) with role assignments and picker
- [ ] Imagery tile (1×2) with upload and style presets
- [ ] UI preview tile (3×1) showing header, button, card, text block
- [ ] Live updates across all tiles when any asset changes
- [ ] Font picker with search-as-you-type, category filters, popular shortlist
- [ ] Google Fonts integration with on-demand loading
- [ ] Extraction fallbacks: Inter/Lora fonts, neutral palette, gradient placeholder, domain monogram
- [ ] PNG export via html2canvas
- [ ] Shareable URL with encoded canvas state (lz-string compressed)
- [ ] localStorage persistence
- [ ] JSON export/import for manual backup
- [ ] Responsive layout (single column on mobile)

### Out of Scope

- Accounts and authentication — adds backend complexity, defer to post-MVP
- Server-side storage or database — client-side only for MVP
- AI suggestions or generation — future feature, not core to experimentation value
- Free-form canvas / custom layouts — opinionated constraints are the product
- Comparison mode — post-MVP toggle between brand directions
- Figma sync — requires plugin ecosystem, defer
- History / versioning — requires storage, defer
- AI image generation — complexity and cost, not core value

## Context

**Inspiration:** Inspotype (brand inspection tool) — retained for extraction accuracy, but core value pivoted from inspection-first to experimentation-first.

**Technical architecture:**
- Client-side SPA (React + Vite)
- CORS proxy via Cloudflare Worker for URL fetching
- Google Fonts API for typography
- html2canvas for PNG export
- lz-string for URL state compression
- No database, no auth, no server-side state

**Grid layout (3×3 with spanning):**
```
┌──────────┬──────────┬──────────┐
│  Logo    │ Primary  │ Imagery  │
│  1×1     │ Type 1×1 │  1×2     │
├──────────┼──────────┤ (spans   │
│  Colors  │Secondary │  2 rows) │
│  1×1     │ Type 1×1 │          │
├──────────┴──────────┴──────────┤
│     UI Preview (3×1 full)      │
└────────────────────────────────┘
```

**Extraction fallbacks:**
| Asset | Fallback |
|-------|----------|
| Primary font | Inter |
| Secondary font | Lora |
| Colors | #111, #555, #F5F5F5, #2563EB, #FFFFFF |
| Imagery | Gradient or abstract SVG pattern |
| Logo | Monogram from domain (e.g., "AB" for acmebrand.com) |

**Font picker UX:**
- Search-as-you-type against Google Fonts
- Category filters: serif, sans-serif, display, handwriting, monospace
- Popular shortlist (~20 fonts) shown by default
- Recently used fonts pinned to top
- Live preview on hover within picker
- Fonts loaded on-demand

## Constraints

- **Tech stack**: React + Vite, Cloudflare Worker — chosen for simplicity and zero backend
- **No backend**: All state in browser (localStorage + URL hash) — intentional constraint
- **Fixed grid**: 3×3 with specific spanning — opinionated layout is the product
- **Client-side only**: Extraction, rendering, export all happen in browser

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Client-side only architecture | Avoid backend complexity, enable instant sharing via URL state | — Pending |
| Fixed grid layout over free-form | Constraints enable faster experimentation, reduce decision fatigue | — Pending |
| Extraction fallbacks always populate | Empty tiles kill the experimentation flow — canvas must always be usable | — Pending |
| Google Fonts over system fonts for primary | Broader selection, consistent cross-platform rendering | — Pending |
| lz-string for URL state | Canvas state can get large, compression keeps URLs shareable | — Pending |

---
*Last updated: 2025-02-06 after initialization*
