# Roadmap: Brand Bento

## Overview

Brand Bento delivers a client-side brand experimentation tool in 7 phases. Starting with infrastructure and extraction (Phase 1), building the canvas system (Phase 2), implementing individual tiles (Phases 3-4), creating the system view that shows everything working together (Phase 5), adding export and sharing workflows (Phase 6), and finishing with onboarding and accessibility (Phase 7). Each phase delivers a coherent, verifiable capability that enables the next.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Extraction** - CORS proxy, state management, brand extraction with fallbacks
- [x] **Phase 2: Canvas System** - 3x3 bento grid layout with tile interaction patterns
- [x] **Phase 3: Logo & Typography Tiles** - First content tiles with editing capabilities
- [ ] **Phase 4: Color & Imagery Tiles** - Visual customization with presets and live preview
- [x] **Phase 5: System View** - SUPERSEDED (new tile architecture approach)
- [ ] **Phase 6: Workflows** - Export, sharing, and toolbar actions (partially done)
- [ ] **Phase 7: Polish** - Onboarding flow and accessibility enhancements
- [x] **Phase 8: Dark/Light Mode** - Implement dark and light mode theming
- [ ] **Phase 9: Responsive Bento Layout System** - Hole-free responsive grid with presets and 100vh constraint

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
**Goal**: Users see a structured 3x3 bento grid with spanning tiles, can hover and click to interact, and experience smooth visual transitions

**Depends on**: Phase 1

**Requirements**: CANV-01, CANV-02, CANV-03, CANV-04, CANV-05, CANV-06, CANV-07, CANV-08, CANV-09, CANV-10, CANV-11, CANV-12, TILE-01, TILE-02, TILE-03, TILE-04, TILE-05, TILE-06, TILE-07

**Success Criteria** (what must be TRUE):
  1. User sees a centered 3x3 grid with logo (1x1), primary type (1x1), imagery (1x2 spanning rows 1-2), colors (1x1), secondary type (1x1), and UI preview (3x1 full width) in correct positions
  2. Grid compresses to 2 columns on tablet and stacks to single column on mobile without breaking layout
  3. Hovering any tile shows a frosted glass overlay with label and edit icon
  4. Clicking a tile opens its edit panel inline while dimming other tiles to 60% opacity
  5. State transitions between idle, hover, and editing happen smoothly at 200ms with no flickering

**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Grid layout with UI Preview tile and responsive breakpoints
- [x] 02-02-PLAN.md — Tile hover overlays and click-to-edit with dimming
- [x] 02-03-PLAN.md — Keyboard navigation and inline edit panel base

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

**Plans**: 6 plans

Plans:
- [x] 03-01-PLAN.md — Dependencies + undo/redo middleware + state extensions + luminance service
- [x] 03-02-PLAN.md — Logo tile with edit panel (upload, variants, scale, background)
- [x] 03-03-PLAN.md — Google Fonts service + font picker with search and filters
- [x] 03-04-PLAN.md — Primary typography tile with large specimen display
- [x] 03-05-PLAN.md — Secondary typography tile with body text sample
- [x] 03-06-PLAN.md — Typography sliders and weight controls

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

**Plans**: 5 plans

Plans:
- [x] 04-01-PLAN.md — Dependencies + types + color utilities (contrast, conversion, palette generator)
- [x] 04-02-PLAN.md — Color tile with swatches, picker, presets, and role assignment
- [x] 04-03-PLAN.md — Imagery tile with cover image, gradient fallback, and upload
- [x] 04-04-PLAN.md — Image treatment presets (Duotone, B&W, Hi-contrast, Soft, Grain)
- [ ] 04-05-PLAN.md — Integration checkpoint and verification

### Phase 5: System View
**Goal**: Users see a reactive UI preview showing how all brand assets work together, updating live as any asset changes

**Status**: ✅ SUPERSEDED - Goal achieved via new tile architecture

**Depends on**: Phase 4

**Requirements**: UIPV-01, UIPV-02, UIPV-03, UIPV-04, UIPV-05, UIPV-06, UIPV-07, LIVE-01, LIVE-02, LIVE-03, LIVE-04, LIVE-05, LIVE-06

**What Happened**: The original plan called for a single UIPreviewTile showing a generic interface mock. Instead, a new tile architecture was implemented (2026-02-08) that achieves the same goal through multiple specialized tiles:
- **InterfaceTile**: Shows buttons using brand colors and typography
- **EditorialTile**: Shows text content with brand typography
- **IdentityTile**: Shows logo with brand styling
- **SocialPostTile**: Shows brand in social context
- **ColorTile**: Shows color palette

This approach is arguably superior - demonstrating brand assets in realistic, concrete use cases rather than an abstract mock interface. All tiles are reactive and update live when brand assets change.

**Original Plans** (not executed - superseded):
- ~~05-01-PLAN.md — Foundation hooks and GPU-accelerated transition CSS~~
- ~~05-02-PLAN.md — UI preview mock component and reactive tile~~
- ~~05-03-PLAN.md — Hover tooltip and LIVE-06 verification~~

### Phase 6: Workflows
**Goal**: Users can undo/redo changes, export canvas as PNG, share via URL, and reset to extracted state

**Status**: ⏳ PARTIALLY DONE - Some features implemented outside GSD

**Depends on**: Phase 5

**Requirements**: TOOL-01, TOOL-02, TOOL-03, TOOL-04, TOOL-05, TOOL-06, TOOL-07, TOOL-08, EXPRT-01, EXPRT-02, EXPRT-03, EXPRT-04, SHAR-01, SHAR-02, SHAR-03

**Already Implemented (2026-02-08)**:
- ✅ CSS/JSON export in App.tsx toolbar and ControlPanel.jsx
- ✅ Undo/redo infrastructure (zundo middleware from Phase 3)
- ✅ URL state persistence (lz-string compression from Phase 1)

**Still Needed**:
- ❌ PNG export with html-to-image (EXPRT-01 through EXPRT-04)
- ❌ Share Link button with "Copied!" toast (SHAR-02)
- ❌ Read-only view for shared links (SHAR-03)
- ❌ Reset with confirmation dialog (TOOL-07, TOOL-08)
- ❌ Auto-hiding floating toolbar (TOOL-01, TOOL-03)

**Success Criteria** (what must be TRUE):
  1. Toolbar appears floating at bottom center, auto-hides after 3 seconds of inactivity, reappears on mouse move
  2. Toolbar shows Undo, Redo, Export PNG, Share Link, and Reset with working keyboard shortcuts (Cmd+Z / Cmd+Shift+Z)
  3. Each atomic change (font swap, color change, image upload) creates one undo step with 30-entry undo stack depth
  4. Reset returns all tiles to extracted state with confirmation dialog, and reset itself is undoable
  5. Export PNG captures bento grid as clean image without toolbar, background, or edit panels, handling high-DPI screens with devicePixelRatio scaling
  6. Share Link generates URL with compressed canvas state, copies to clipboard with "Copied!" toast
  7. Shared link opens in read-only view with no edit panels or hover states

**Revised Plans**: 3 plans (slimmed down from original 5)

Plans:
- [x] 06-01-PLAN.md — ~~Dependencies + keyboard shortcuts hook~~ (superseded - undo/redo exists, CSS/JSON export done)
- [ ] 06-02-PLAN.md — PNG export with html-to-image (still needed)
- [ ] 06-03-PLAN.md — Share link + toast + reset with confirmation (still needed)
- [ ] 06-04-PLAN.md — Read-only view for shared links (still needed)
- [ ] ~~06-05-PLAN.md — Verification checkpoint~~ (can be merged into 06-04)

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

### Phase 8: Dark/Light Mode
**Goal**: Users can switch between dark and light mode themes with persisted preference

**Depends on**: Phase 7

**Requirements**: TBD (to be defined during planning)

**Success Criteria** (what must be TRUE):
  1. User can toggle between dark and light mode via a visible control
  2. Theme preference persists across sessions (localStorage)
  3. Initial theme respects system preference (prefers-color-scheme)
  4. All UI components adapt correctly to both themes
  5. Transitions between themes are smooth and non-jarring

**Plans**: 5 plans in 4 waves

Plans:
- [x] 08-01-PLAN.md — Foundation: theme state in store, Tailwind config, FOUC prevention
- [x] 08-02-PLAN.md — useTheme hook and app integration
- [x] 08-03-PLAN.md — CSS dark mode variants for UI chrome
- [x] 08-04-PLAN.md — ThemeToggle component in toolbar
- [x] 08-05-PLAN.md — Verification checkpoint

### Phase 9: Responsive Bento Layout System
**Goal**: Build a robust responsive bento grid that always fills a perfect rectangle with no holes, fits within 100vh, and supports multiple layout presets

**Depends on**: Phase 8

**Requirements**: TBD (to be defined during planning)

**Success Criteria** (what must be TRUE):
  1. Bento grid always forms a filled rectangle (no empty cells inside the bounding box) at every breakpoint
  2. Grid fits within 100dvh/100vh with no vertical scrolling
  3. Supports 3-5 layout presets (balanced, hero-left, hero-center, stacked, etc.)
  4. Deterministic and stable layout - no janky rearrangement on minor width changes
  5. Tiles never overflow the grid or overlap
  6. Graceful degradation when tiles can't fit (span reduction or priority-based hiding)
  7. Density parameter works correctly (cozy vs dense modes)
  8. Mobile safe areas respected with proper padding
  9. Debug mode available showing grid cell boundaries and tile IDs
  10. Works with 6-14 tiles within the defined min/max range

**Plans**: 6 plans

Plans:
- [x] 09-01-PLAN.md — Layout infrastructure: types, grid presets, layout store, viewport/breakpoint hooks
- [x] 09-02-PLAN.md — Responsive BentoGrid component with 100dvh viewport fitting
- [x] 09-03-PLAN.md — BentoTile wrapper with responsive spans per breakpoint
- [x] 09-04-PLAN.md — Density modes, debug overlay, and layout controls
- [ ] 09-05-PLAN.md — Verification checkpoint
- [x] 09-06-PLAN.md — Layout fitting utility for tile placement

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Extraction | 4/4 | Complete | 2026-02-07 |
| 2. Canvas System | 3/3 | Complete | 2026-02-07 |
| 3. Logo & Typography Tiles | 6/6 | Complete | 2026-02-07 |
| 4. Color & Imagery Tiles | 4/5 | In progress (verification pending) | - |
| 5. System View | N/A | Complete (superseded) | 2026-02-08 |
| 6. Workflows | 1/4 | In progress (3 plans remaining) | - |
| 7. Polish | 0/TBD | Not started | - |
| 8. Dark/Light Mode | 5/5 | Complete | 2026-02-07 |
| 9. Responsive Bento Layout | 5/6 | In progress (verification pending) | - |

**Notes:**
- Phase 5: Goal achieved via new tile architecture (IdentityTile, EditorialTile, SocialPostTile, InterfaceTile, ColorTile) created 2026-02-08. Original UIPreviewTile plans superseded.
- Phase 6: CSS/JSON export done, remaining work: PNG export, share link with toast, read-only view.

---
*Roadmap created: 2026-02-06*
*Last updated: 2026-02-08 after audit of work done outside GSD*
