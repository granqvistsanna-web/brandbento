# Requirements: Brand Bento

**Defined:** 2026-02-06
**Core Value:** See typography, color, imagery, and logo working together as a system, not isolated assets.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Infrastructure

- [ ] **INFRA-01**: CORS proxy deployed on Cloudflare Workers with rate limiting (10 req/min per IP)
- [ ] **INFRA-02**: Proxy fetches target URL HTML/CSS and returns raw content with CORS headers
- [ ] **INFRA-03**: Proxy handles OPTIONS preflight requests separately from GET requests
- [ ] **INFRA-04**: State persists in localStorage with automatic save on every change
- [ ] **INFRA-05**: State encodes to URL hash via lz-string compression for sharing
- [ ] **INFRA-06**: URL state stays under 2000 characters with compression

### Extraction

- [ ] **EXTR-01**: User can enter a website URL to trigger brand extraction
- [ ] **EXTR-02**: System extracts color palette (5-10 colors) from CSS custom properties and common selectors
- [ ] **EXTR-03**: System extracts font families from CSS declarations (not computed fallbacks)
- [ ] **EXTR-04**: System waits for document.fonts.ready before font extraction
- [ ] **EXTR-05**: System extracts logo from header/nav (SVG, img, or favicon)
- [ ] **EXTR-06**: System extracts hero/OG images for imagery tile
- [ ] **EXTR-07**: Extraction failures fill with sensible defaults (Inter, Lora, neutral palette, gradient, domain monogram)
- [ ] **EXTR-08**: Tiles show subtle "Default — click to change" label when using fallbacks
- [ ] **EXTR-09**: Extraction tiles populate progressively (shimmer → resolved) as assets extract

### Canvas Layout

- [ ] **CANV-01**: Canvas displays as 3×3 bento grid with 8px gap
- [ ] **CANV-02**: Logo tile occupies column 1, row 1 (1×1)
- [ ] **CANV-03**: Primary typography tile occupies column 2, row 1 (1×1)
- [ ] **CANV-04**: Imagery tile spans column 3, rows 1-2 (1×2)
- [ ] **CANV-05**: Color palette tile occupies column 1, row 2 (1×1)
- [ ] **CANV-06**: Secondary typography tile occupies column 2, row 2 (1×1)
- [ ] **CANV-07**: UI preview tile spans columns 1-3, row 3 (3×1)
- [ ] **CANV-08**: Canvas is centered with minimum 48px margin on desktop
- [ ] **CANV-09**: Canvas background is warm off-white (#FAFAF8), not pure white
- [ ] **CANV-10**: Tiles have subtle shadow, no borders
- [ ] **CANV-11**: Grid compresses to 2 columns on tablet (768-1024px)
- [ ] **CANV-12**: Grid stacks to single column on mobile (<768px)

### Tile Interaction

- [ ] **TILE-01**: Tiles show clean presentational state when idle (no visible controls)
- [ ] **TILE-02**: Tiles show frosted glass overlay with label and edit icon on hover
- [ ] **TILE-03**: Clicking a tile opens inline edit panel (not modal or sidebar)
- [ ] **TILE-04**: Other tiles dim to 60% opacity when one is being edited
- [ ] **TILE-05**: State transitions animate at 200ms ease-out
- [ ] **TILE-06**: Tab navigates through tiles in reading order
- [ ] **TILE-07**: Enter activates editing, Escape closes edit panel

### Logo Tile

- [ ] **LOGO-01**: Logo displays centered with minimum 24px padding
- [ ] **LOGO-02**: Logo background auto-adapts based on logo luminance (light/dark)
- [ ] **LOGO-03**: User can upload replacement logo (SVG, PNG, JPG)
- [ ] **LOGO-04**: User can toggle between Original, Dark, Light variants
- [ ] **LOGO-05**: User can adjust logo scale (40-100% of tile)
- [ ] **LOGO-06**: User can toggle tile background (white, dark #111, brand primary)

### Typography Tiles

- [ ] **TYPE-01**: Primary tile shows type specimen: large Aa glyph, font name, weight, sample heading, character set
- [ ] **TYPE-02**: Secondary tile shows body-length sample text at smaller size
- [ ] **TYPE-03**: Font picker opens on tile click with search-as-you-type
- [ ] **TYPE-04**: Font picker shows category filters (sans, serif, display, mono)
- [ ] **TYPE-05**: Font picker shows popular shortlist (~20 fonts) by default
- [ ] **TYPE-06**: Font picker shows recently used fonts pinned to top
- [ ] **TYPE-07**: Font names render in their own typeface within picker list
- [ ] **TYPE-08**: Hovering a font in picker temporarily previews it across canvas
- [ ] **TYPE-09**: Clicking a font commits it and updates all tiles using that role
- [ ] **TYPE-10**: User can adjust weight via slider (snaps to available weights)
- [ ] **TYPE-11**: User can adjust size scale via slider with live preview
- [ ] **TYPE-12**: User can adjust line height via slider with live preview
- [ ] **TYPE-13**: Slider drag creates single undo step on release
- [ ] **TYPE-14**: Fonts load on-demand via Google Fonts API
- [ ] **TYPE-15**: Font load failure shows system fallback with non-blocking warning

### Color Tile

- [ ] **COLR-01**: Palette displays swatches stacked by role with hex values
- [ ] **COLR-02**: WCAG contrast check (text/background) is always visible on tile
- [ ] **COLR-03**: User can click any swatch to open HSL color picker
- [ ] **COLR-04**: Color picker shows hue ring with saturation/lightness square
- [ ] **COLR-05**: User can input HEX value directly
- [ ] **COLR-06**: Dragging picker updates canvas continuously
- [ ] **COLR-07**: Palette presets available (extracted original, warm neutral, cool professional, bold saturated, muted editorial)
- [ ] **COLR-08**: Hovering a preset temporarily applies entire palette across canvas
- [ ] **COLR-09**: User can reassign color roles via dropdown (primary, accent, background, text)
- [ ] **COLR-10**: Low contrast shows non-blocking warning (does not prevent apply)
- [ ] **COLR-11**: Color swaps render in under 50ms

### Imagery Tile

- [ ] **IMGR-01**: Image fills tile edge-to-edge with object-fit: cover
- [ ] **IMGR-02**: If no image, tile shows gradient using brand palette colors
- [ ] **IMGR-03**: User can drag-and-drop or click to upload replacement (JPG, PNG, WebP)
- [ ] **IMGR-04**: Image treatment presets available (Original, Duotone, B&W, Hi-contrast, Soft, Grain)
- [ ] **IMGR-05**: Duotone maps image to primary + background brand colors
- [ ] **IMGR-06**: Color overlay slider adds semi-transparent wash of primary color (0-60%)
- [ ] **IMGR-07**: Hovering a treatment preset previews it instantly
- [ ] **IMGR-08**: Treatment thumbnails show current image with filter applied

### UI Preview Tile

- [ ] **UIPV-01**: Tile shows generic interface mock: header with logo, nav, CTA button, text block, card
- [ ] **UIPV-02**: Mock uses current primary font for headings, secondary for body
- [ ] **UIPV-03**: Mock uses current palette (background, text, primary for CTA, accent for links)
- [ ] **UIPV-04**: Mock shows scaled thumbnail from imagery tile
- [ ] **UIPV-05**: Mock updates live when any brand asset changes
- [ ] **UIPV-06**: Tile is NOT directly editable (reactive mirror only)
- [ ] **UIPV-07**: On hover, tooltip explains "This preview updates automatically based on your brand choices"

### Live Updates

- [ ] **LIVE-01**: Any change updates canvas within 100ms perceived delay
- [ ] **LIVE-02**: No Apply, Save, or Confirm action required for changes
- [ ] **LIVE-03**: Font swaps render in under 100ms after font load
- [ ] **LIVE-04**: Updates use 120-180ms ease-out transition (no spring/bounce)
- [ ] **LIVE-05**: No flickering or intermediate states visible during updates
- [ ] **LIVE-06**: Only one edit panel can be open at a time

### Toolbar

- [ ] **TOOL-01**: Toolbar anchored to bottom center, floating above canvas
- [ ] **TOOL-02**: Toolbar shows: Undo, Redo, Export PNG, Share Link, Reset
- [ ] **TOOL-03**: Toolbar auto-hides after 3 seconds of inactivity, reappears on mouse move
- [ ] **TOOL-04**: Undo/Redo with keyboard shortcuts (⌘Z / ⌘⇧Z)
- [ ] **TOOL-05**: Undo stack depth of 30 entries
- [ ] **TOOL-06**: Each atomic change (font swap, color change, image upload) is one undo step
- [ ] **TOOL-07**: Reset returns all tiles to extracted state with confirmation dialog
- [ ] **TOOL-08**: Reset is undoable

### Export

- [ ] **EXPRT-01**: Export PNG captures bento grid as clean image
- [ ] **EXPRT-02**: Export excludes toolbar, background, and open edit panels
- [ ] **EXPRT-03**: Export uses html-to-image (not html2canvas)
- [ ] **EXPRT-04**: Export handles high-DPI screens with devicePixelRatio scaling

### Sharing

- [ ] **SHAR-01**: Share Link generates URL with compressed canvas state
- [ ] **SHAR-02**: Share Link copies to clipboard with "Copied!" toast
- [ ] **SHAR-03**: Shared link opens read-only view (no edit panels, no hover states)

### Onboarding

- [ ] **ONBR-01**: First visit shows canvas with starter kit (Inter, Lora, neutral palette, gradient, monogram)
- [ ] **ONBR-02**: Centered overlay prompts for URL input or "start from scratch with defaults"
- [ ] **ONBR-03**: First hover over any tile shows one-time tooltip "Click any tile to start editing"
- [ ] **ONBR-04**: Tooltip stored in localStorage, never shows again

### Accessibility

- [ ] **A11Y-01**: All controls are keyboard navigable
- [ ] **A11Y-02**: Focus ring is 2px solid #111 with 2px offset
- [ ] **A11Y-03**: Sliders support numeric input alternative
- [ ] **A11Y-04**: Role selection is not color-dependent
- [ ] **A11Y-05**: Screen readers announce role and value changes

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Comparison Mode

- **COMP-01**: User can duplicate bento to create variant
- **COMP-02**: User can toggle between brand directions
- **COMP-03**: Before/after comparison view

### Advanced Export

- **EXPRT-10**: PDF brand snapshot export
- **EXPRT-11**: Design token export (CSS variables, JSON, Tailwind config)
- **EXPRT-12**: Figma-compatible export

### Persistence

- **PERS-01**: JSON export/import for saving experiments locally
- **PERS-02**: Version history with snapshots
- **PERS-03**: User accounts with cloud storage

### Intelligence

- **INTEL-01**: AI-powered combination suggestions
- **INTEL-02**: Type pairing recommendations
- **INTEL-03**: Palette harmony suggestions

### Templates

- **TEMP-01**: Multiple bento layout templates (landing page, social media, print)
- **TEMP-02**: Template switching

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User accounts and authentication | Adds backend complexity, localStorage + URL sharing sufficient for v1 |
| Server-side storage or database | Client-side only architecture for MVP |
| AI suggestions or generation | High complexity, not core to experimentation value |
| Free-form canvas / custom layouts | Opinionated constraints are the product |
| Figma sync | Requires plugin ecosystem, defer to post-MVP |
| Real-time collaboration | Async review via shared links sufficient for v1 |
| Animation/motion design | Static compositions first |
| Comprehensive imagery extraction | Focus on hero/OG images initially |
| Direct editing of UI preview tile | Reactive mirror concept is core differentiator |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Pending |
| INFRA-03 | Phase 1 | Pending |
| INFRA-04 | Phase 1 | Pending |
| INFRA-05 | Phase 1 | Pending |
| INFRA-06 | Phase 1 | Pending |
| EXTR-01 | Phase 1 | Pending |
| EXTR-02 | Phase 1 | Pending |
| EXTR-03 | Phase 1 | Pending |
| EXTR-04 | Phase 1 | Pending |
| EXTR-05 | Phase 1 | Pending |
| EXTR-06 | Phase 1 | Pending |
| EXTR-07 | Phase 1 | Pending |
| EXTR-08 | Phase 1 | Pending |
| EXTR-09 | Phase 1 | Pending |
| CANV-01 | Phase 2 | Pending |
| CANV-02 | Phase 2 | Pending |
| CANV-03 | Phase 2 | Pending |
| CANV-04 | Phase 2 | Pending |
| CANV-05 | Phase 2 | Pending |
| CANV-06 | Phase 2 | Pending |
| CANV-07 | Phase 2 | Pending |
| CANV-08 | Phase 2 | Pending |
| CANV-09 | Phase 2 | Pending |
| CANV-10 | Phase 2 | Pending |
| CANV-11 | Phase 2 | Pending |
| CANV-12 | Phase 2 | Pending |
| TILE-01 | Phase 2 | Pending |
| TILE-02 | Phase 2 | Pending |
| TILE-03 | Phase 2 | Pending |
| TILE-04 | Phase 2 | Pending |
| TILE-05 | Phase 2 | Pending |
| TILE-06 | Phase 2 | Pending |
| TILE-07 | Phase 2 | Pending |
| LOGO-01 | Phase 3 | Pending |
| LOGO-02 | Phase 3 | Pending |
| LOGO-03 | Phase 3 | Pending |
| LOGO-04 | Phase 3 | Pending |
| LOGO-05 | Phase 3 | Pending |
| LOGO-06 | Phase 3 | Pending |
| TYPE-01 | Phase 3 | Pending |
| TYPE-02 | Phase 3 | Pending |
| TYPE-03 | Phase 3 | Pending |
| TYPE-04 | Phase 3 | Pending |
| TYPE-05 | Phase 3 | Pending |
| TYPE-06 | Phase 3 | Pending |
| TYPE-07 | Phase 3 | Pending |
| TYPE-08 | Phase 3 | Pending |
| TYPE-09 | Phase 3 | Pending |
| TYPE-10 | Phase 3 | Pending |
| TYPE-11 | Phase 3 | Pending |
| TYPE-12 | Phase 3 | Pending |
| TYPE-13 | Phase 3 | Pending |
| TYPE-14 | Phase 3 | Pending |
| TYPE-15 | Phase 3 | Pending |
| COLR-01 | Phase 4 | Pending |
| COLR-02 | Phase 4 | Pending |
| COLR-03 | Phase 4 | Pending |
| COLR-04 | Phase 4 | Pending |
| COLR-05 | Phase 4 | Pending |
| COLR-06 | Phase 4 | Pending |
| COLR-07 | Phase 4 | Pending |
| COLR-08 | Phase 4 | Pending |
| COLR-09 | Phase 4 | Pending |
| COLR-10 | Phase 4 | Pending |
| COLR-11 | Phase 4 | Pending |
| IMGR-01 | Phase 4 | Pending |
| IMGR-02 | Phase 4 | Pending |
| IMGR-03 | Phase 4 | Pending |
| IMGR-04 | Phase 4 | Pending |
| IMGR-05 | Phase 4 | Pending |
| IMGR-06 | Phase 4 | Pending |
| IMGR-07 | Phase 4 | Pending |
| IMGR-08 | Phase 4 | Pending |
| UIPV-01 | Phase 5 | Pending |
| UIPV-02 | Phase 5 | Pending |
| UIPV-03 | Phase 5 | Pending |
| UIPV-04 | Phase 5 | Pending |
| UIPV-05 | Phase 5 | Pending |
| UIPV-06 | Phase 5 | Pending |
| UIPV-07 | Phase 5 | Pending |
| LIVE-01 | Phase 5 | Pending |
| LIVE-02 | Phase 5 | Pending |
| LIVE-03 | Phase 5 | Pending |
| LIVE-04 | Phase 5 | Pending |
| LIVE-05 | Phase 5 | Pending |
| LIVE-06 | Phase 5 | Pending |
| TOOL-01 | Phase 6 | Pending |
| TOOL-02 | Phase 6 | Pending |
| TOOL-03 | Phase 6 | Pending |
| TOOL-04 | Phase 6 | Pending |
| TOOL-05 | Phase 6 | Pending |
| TOOL-06 | Phase 6 | Pending |
| TOOL-07 | Phase 6 | Pending |
| TOOL-08 | Phase 6 | Pending |
| EXPRT-01 | Phase 6 | Pending |
| EXPRT-02 | Phase 6 | Pending |
| EXPRT-03 | Phase 6 | Pending |
| EXPRT-04 | Phase 6 | Pending |
| SHAR-01 | Phase 6 | Pending |
| SHAR-02 | Phase 6 | Pending |
| SHAR-03 | Phase 6 | Pending |
| ONBR-01 | Phase 7 | Pending |
| ONBR-02 | Phase 7 | Pending |
| ONBR-03 | Phase 7 | Pending |
| ONBR-04 | Phase 7 | Pending |
| A11Y-01 | Phase 7 | Pending |
| A11Y-02 | Phase 7 | Pending |
| A11Y-03 | Phase 7 | Pending |
| A11Y-04 | Phase 7 | Pending |
| A11Y-05 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 89 total
- Mapped to phases: 89
- Unmapped: 0

---
*Requirements defined: 2026-02-06*
*Last updated: 2026-02-06 after initial definition*
