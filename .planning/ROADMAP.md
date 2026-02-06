# Roadmap: Brand Bento

## Overview

Brand Bento delivers a client-side brand experimentation tool in 7 phases. Starting with infrastructure and extraction (Phase 1), building the canvas system (Phase 2), implementing individual tiles (Phases 3-4), creating the system view that shows everything working together (Phase 5), adding export and sharing workflows (Phase 6), and finishing with onboarding and accessibility (Phase 7). Each phase delivers a coherent, verifiable capability that enables the next.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Extraction** - CORS proxy, state management, brand extraction with fallbacks
- [ ] **Phase 2: Canvas System** - 3×3 bento grid layout with tile interaction patterns
- [ ] **Phase 3: Logo & Typography Tiles** - First content tiles with editing capabilities
- [ ] **Phase 4: Color & Imagery Tiles** - Visual customization with presets and live preview
- [ ] **Phase 5: System View** - UI preview tile showing everything working together
- [ ] **Phase 6: Workflows** - Export, sharing, and toolbar actions
- [ ] **Phase 7: Polish** - Onboarding flow and accessibility enhancements

## Phase Details

### Phase 1: Foundation & Extraction
**Goal**: Users can enter a URL and see extracted brand assets populate a canvas with sensible defaults when extraction fails

**Depends on**: Nothing (first phase)

**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06, EXTR-01, EXTR-02, EXTR-03, EXTR-04, EXTR-05, EXTR-06, EXTR-07, EXTR-08, EXTR-09

**Success Criteria** (what must be TRUE):
  1. User can deploy and access a CORS proxy that fetches external URLs without browser blocking
  2. User can enter any website URL and see brand extraction begin (with loading states)
  3. When extraction succeeds, tiles populate with actual brand colors, fonts, logo, and imagery
  4. When extraction fails, tiles populate with sensible defaults (Inter, Lora, neutral palette, gradient, domain monogram) with subtle "Default - click to change" labels
  5. Canvas state persists automatically in localStorage and can be restored on reload
  6. Canvas state encodes to URL hash under 2000 characters for sharing

**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — CORS proxy infrastructure (code ready, deployment deferred)
- [x] 01-02-PLAN.md — React app foundation + state management (localStorage + URL hash)
- [x] 01-03-PLAN.md — Brand extraction services (colors, fonts, logo, images)
- [x] 01-04-PLAN.md — URL input UI + extraction integration

### Phase 2: Canvas System
**Goal**: Users see a structured 3×3 bento grid with spanning tiles, can hover and click to interact, and experience smooth visual transitions

**Depends on**: Phase 1

**Requirements**: CANV-01, CANV-02, CANV-03, CANV-04, CANV-05, CANV-06, CANV-07, CANV-08, CANV-09, CANV-10, CANV-11, CANV-12, TILE-01, TILE-02, TILE-03, TILE-04, TILE-05, TILE-06, TILE-07

**Success Criteria** (what must be TRUE):
  1. User sees a centered 3×3 grid with logo (1×1), primary type (1×1), imagery (1×2 spanning rows 1-2), colors (1×1), secondary type (1×1), and UI preview (3×1 full width) in correct positions
  2. Grid compresses to 2 columns on tablet and stacks to single column on mobile without breaking layout
  3. Hovering any tile shows a frosted glass overlay with label and edit icon
  4. Clicking a tile opens its edit panel inline while dimming other tiles to 60% opacity
  5. State transitions between idle, hover, and editing happen smoothly at 200ms with no flickering

**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Grid layout with UI Preview tile and responsive breakpoints
- [ ] 02-02-PLAN.md — Tile hover overlays and click-to-edit with dimming
- [ ] 02-03-PLAN.md — Keyboard navigation and inline edit panel base

### Phase 3: Logo & Typography Tiles
**Goal**: Users can view, customize, and swap logo and typography assets with live preview and font picker

**Depends on**: Phase 2

**Requirements**: LOGO-01, LOGO-02, LOGO-03, LOGO-04, LOGO-05, LOGO-06, TYPE-01, TYPE-02, TYPE-03, TYPE-04, TYPE-05, TYPE-06, TYPE-07, TYPE-08, TYPE-09, TYPE-10, TYPE-11, TYPE-12, TYPE-13, TYPE-14, TYPE-15

**Success Criteria** (what must be TRUE):
  1. Logo displays centered with adaptive background (light/dark based on logo luminance) and user can upload replacement, toggle variants (original/dark/light), adjust scale (40-100%), and change tile background
  2. Primary typography tile shows large specimen with font name, weight, sample heading, and full character set
  3. Secondary typography tile shows body-length sample text at smaller size with its own font controls
  4. User can open font picker with search-as-you-type, category filters, popular shortlist, and recently used fonts pinned to top
  5. Hovering a font in picker temporarily previews it across canvas, clicking commits the change
  6. User can adjust weight, size scale, and line height via sliders with live preview and single undo step per drag
  7. Fonts load on-demand from Google Fonts API, with system fallback shown on load failure

**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: Color & Imagery Tiles
**Goal**: Users can customize colors with WCAG contrast checking and apply imagery treatments with instant preview

**Depends on**: Phase 3

**Requirements**: COLR-01, COLR-02, COLR-03, COLR-04, COLR-05, COLR-06, COLR-07, COLR-08, COLR-09, COLR-10, COLR-11, IMGR-01, IMGR-02, IMGR-03, IMGR-04, IMGR-05, IMGR-06, IMGR-07, IMGR-08

**Success Criteria** (what must be TRUE):
  1. Color palette tile displays swatches stacked by role (primary, accent, background, text) with hex values and always-visible WCAG contrast check
  2. User can click any swatch to open HSL color picker with hue ring, saturation/lightness square, and direct HEX input
  3. Dragging color picker updates canvas continuously (under 50ms) with smooth transitions
  4. Palette presets (extracted original, warm neutral, cool professional, bold saturated, muted editorial) preview on hover and apply on click
  5. User can reassign color roles via dropdown and see low contrast warnings (non-blocking)
  6. Imagery tile fills edge-to-edge with object-fit cover, shows gradient using brand colors when no image
  7. User can drag-and-drop or click to upload replacement image (JPG, PNG, WebP)
  8. Treatment presets (Original, Duotone, B&W, Hi-contrast, Soft, Grain) preview instantly on hover with thumbnails showing current image with filter applied

**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: System View
**Goal**: Users see a reactive UI preview showing how all brand assets work together, updating live as any asset changes

**Depends on**: Phase 4

**Requirements**: UIPV-01, UIPV-02, UIPV-03, UIPV-04, UIPV-05, UIPV-06, UIPV-07, LIVE-01, LIVE-02, LIVE-03, LIVE-04, LIVE-05, LIVE-06

**Success Criteria** (what must be TRUE):
  1. UI preview tile displays generic interface mock (header with logo, nav, CTA button, text block, card) using current brand assets
  2. Mock uses current primary font for headings, secondary for body, current palette (background, text, primary for CTA, accent for links), and scaled thumbnail from imagery tile
  3. When user changes any brand asset (font, color, image, logo), UI preview updates within 100ms perceived delay with smooth 120-180ms ease-out transition
  4. Font swaps render in under 100ms after font load, with no flickering or intermediate states
  5. No Apply, Save, or Confirm button required - all changes are live and immediate
  6. Only one edit panel can be open at a time, closing previous panel automatically
  7. Hovering UI preview shows tooltip "This preview updates automatically based on your brand choices" (not directly editable)

**Plans**: TBD

Plans:
- [ ] 05-01: TBD

### Phase 6: Workflows
**Goal**: Users can undo/redo changes, export canvas as PNG, share via URL, and reset to extracted state

**Depends on**: Phase 5

**Requirements**: TOOL-01, TOOL-02, TOOL-03, TOOL-04, TOOL-05, TOOL-06, TOOL-07, TOOL-08, EXPRT-01, EXPRT-02, EXPRT-03, EXPRT-04, SHAR-01, SHAR-02, SHAR-03

**Success Criteria** (what must be TRUE):
  1. Toolbar appears floating at bottom center, auto-hides after 3 seconds of inactivity, reappears on mouse move
  2. Toolbar shows Undo, Redo, Export PNG, Share Link, and Reset with working keyboard shortcuts (⌘Z / ⌘⇧Z)
  3. Each atomic change (font swap, color change, image upload) creates one undo step with 30-entry undo stack depth
  4. Reset returns all tiles to extracted state with confirmation dialog, and reset itself is undoable
  5. Export PNG captures bento grid as clean image without toolbar, background, or edit panels, handling high-DPI screens with devicePixelRatio scaling
  6. Share Link generates URL with compressed canvas state, copies to clipboard with "Copied!" toast
  7. Shared link opens in read-only view with no edit panels or hover states

**Plans**: TBD

Plans:
- [ ] 06-01: TBD

### Phase 7: Polish
**Goal**: First-time users understand how to use the tool, and all controls are keyboard accessible

**Depends on**: Phase 6

**Requirements**: ONBR-01, ONBR-02, ONBR-03, ONBR-04, A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05

**Success Criteria** (what must be TRUE):
  1. First visit shows canvas with starter kit (Inter, Lora, neutral palette, gradient, monogram) and centered overlay prompting for URL input or "start from scratch with defaults"
  2. First hover over any tile shows one-time tooltip "Click any tile to start editing", stored in localStorage and never shown again
  3. All controls are keyboard navigable with Tab, Enter activates editing, Escape closes edit panels
  4. Focus ring is 2px solid with 2px offset, clearly visible on all interactive elements
  5. Sliders support numeric input alternative, role selection is not color-dependent, screen readers announce role and value changes

**Plans**: TBD

Plans:
- [ ] 07-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Extraction | 4/4 | Complete | 2026-02-07 |
| 2. Canvas System | 0/3 | Planned | - |
| 3. Logo & Typography Tiles | 0/TBD | Not started | - |
| 4. Color & Imagery Tiles | 0/TBD | Not started | - |
| 5. System View | 0/TBD | Not started | - |
| 6. Workflows | 0/TBD | Not started | - |
| 7. Polish | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-06*
*Last updated: 2026-02-07 after Phase 2 planning*
