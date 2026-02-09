# Roadmap: Brand Bento

## Overview

Brand Bento delivers a client-side brand experimentation tool. Built across 9 phases covering infrastructure (Phase 1), canvas system (Phase 2), content tiles (Phases 3-4), system view (Phase 5), workflows (Phase 6), polish (Phase 7), theming (Phase 8), and responsive layout (Phase 9). Significant work was also done outside GSD — a complete tile redesign, placement system, brand presets, and expanded color palettes.

## Phases

- [x] **Phase 1: Foundation & Extraction** - CORS proxy, state management, brand extraction with fallbacks
- [x] **Phase 2: Canvas System** - Bento grid layout with tile interaction patterns
- [x] **Phase 3: Logo & Typography Tiles** - Content tiles with editing capabilities
- [x] **Phase 4: Color & Imagery Tiles** - Visual customization with presets and live preview
- [x] **Phase 5: System View** - SUPERSEDED (achieved via new tile architecture)
- [x] **Phase 6: Workflows** - Export (PNG/CSS/JSON), sharing, read-only view, reset
- [ ] **Phase 7: Polish** - Onboarding flow and accessibility enhancements (NOT STARTED)
- [x] **Phase 8: Dark/Light Mode** - Dark and light mode theming with persistence
- [x] **Phase 9: Responsive Bento Layout System** - Responsive grid with presets and viewport fitting

## Work Done Outside GSD

Significant features were built outside the GSD workflow (2026-02-08 through 2026-02-09) that are not tracked in phase plans:

**Tile Architecture Redesign:**
- 10 specialized tile components: HeroTile, IdentityTile, EditorialTile, SocialPostTile, InterfaceTile, ColorTile, ProductTile, MenuTile, ImageTile, IconTile
- BentoCanvasNew.jsx — placement-based tile mapping with zoom and theme-aware styling
- BentoGridNew.tsx — responsive grid with slot-based rendering
- BentoTileEmpty.tsx — empty placeholder tiles with hints
- Placement system (src/config/placements.ts with unit tests)

**Brand & Color System:**
- Brand presets (src/data/brandPresets.ts)
- 200+ curated color palettes organized by mood (src/data/colorPalettes.ts)
- Color mapping with contrast enforcement (src/utils/colorMapping.ts)
- Palette style classifier (src/utils/paletteStyleClassifier.ts)
- Surface color utilities (src/utils/surface.ts)
- Color defaults system (src/utils/colorDefaults.ts)

**Layout & Canvas:**
- 6 layout presets: balanced, heroLeft, heroCenter, stacked, geos, foodDrink
- Layout presets config (src/config/layoutPresets.ts)
- Canvas background control
- Canvas zoom control
- Tile defaults system (src/data/tileDefaults.ts)

**Control Panel Evolution:**
- ControlPanel.jsx (~2800 lines) — comprehensive brand editing panel
- Color role management with semantic mapping
- Typography controls with font search
- Layout preset and density controls

## Phase Details

### Phase 1: Foundation & Extraction
**Goal**: Users can enter a URL and see extracted brand assets populate a canvas with sensible defaults when extraction fails

**Status**: ✅ Complete

**Plans**: 4/4 complete
- [x] 01-01-PLAN.md — CORS proxy infrastructure
- [x] 01-02-PLAN.md — React app foundation + state management
- [x] 01-03-PLAN.md — Brand extraction services
- [x] 01-04-PLAN.md — URL input UI + extraction integration

### Phase 2: Canvas System
**Goal**: Users see a bento grid with spanning tiles, can hover and click to interact, and experience smooth visual transitions

**Status**: ✅ Complete (architecture later replaced by BentoCanvasNew + BentoGridNew)

**Plans**: 3/3 complete
- [x] 02-01-PLAN.md — Grid layout with responsive breakpoints
- [x] 02-02-PLAN.md — Tile hover overlays and click-to-edit with dimming
- [x] 02-03-PLAN.md — Keyboard navigation and inline edit panel base

### Phase 3: Logo & Typography Tiles
**Goal**: Users can view, customize, and swap logo and typography assets with live preview and font picker

**Status**: ✅ Complete

**Plans**: 6/6 complete
- [x] 03-01-PLAN.md — Dependencies + undo/redo middleware + state extensions + luminance service
- [x] 03-02-PLAN.md — Logo tile with edit panel
- [x] 03-03-PLAN.md — Google Fonts service + font picker
- [x] 03-04-PLAN.md — Primary typography tile
- [x] 03-05-PLAN.md — Secondary typography tile
- [x] 03-06-PLAN.md — Typography sliders and weight controls

### Phase 4: Color & Imagery Tiles
**Goal**: Users can customize colors with WCAG contrast checking and apply imagery treatments with instant preview

**Status**: ✅ Complete

**What Happened**: All 4 implementation plans (04-01 through 04-04) were executed. The verification checkpoint (04-05) was written for the original tile architecture (old grid positions, ImageryTile component) which was later replaced by the new tile system. Color features are now delivered through ColorTile and the ControlPanel color section. Imagery features are handled by HeroTile, ImageTile, and SocialPostTile. The verification plan is outdated and superseded.

**Plans**: 4/4 implementation plans complete, verification superseded
- [x] 04-01-PLAN.md — Dependencies + types + color utilities
- [x] 04-02-PLAN.md — Color tile with swatches, picker, presets
- [x] 04-03-PLAN.md — Imagery tile with cover image, gradient fallback, and upload
- [x] 04-04-PLAN.md — Image treatment presets (Duotone, B&W, Hi-contrast, Soft, Grain)
- [x] ~~04-05-PLAN.md~~ — Verification checkpoint (SUPERSEDED — architecture changed)

### Phase 5: System View
**Goal**: Users see a reactive UI preview showing how all brand assets work together, updating live as any asset changes

**Status**: ✅ SUPERSEDED — Goal achieved via new tile architecture

**What Happened**: Instead of a single UIPreviewTile, a new multi-tile architecture delivers the same goal through specialized tiles (InterfaceTile, EditorialTile, IdentityTile, SocialPostTile, ColorTile, HeroTile, ProductTile, MenuTile). All tiles are reactive and update live when brand assets change.

### Phase 6: Workflows
**Goal**: Users can export canvas as PNG, share via URL, and reset to defaults

**Status**: ✅ Complete

**What Happened**: Some features were built outside GSD (CSS/JSON export, undo/redo), then remaining plans (PNG export, share link, read-only view) were executed via GSD. All workflows are implemented.

**Plans**: 5/5 complete
- [x] 06-01-PLAN.md — Dependencies + keyboard shortcuts (superseded — already existed)
- [x] 06-02-PLAN.md — PNG export with html-to-image
- [x] 06-03-PLAN.md — Share link + toast + reset with confirmation
- [x] 06-04-PLAN.md — Read-only view for shared links
- [x] 06-05-PLAN.md — Phase summary

### Phase 7: Polish
**Goal**: First-time users understand how to use the tool, and all controls are keyboard accessible

**Status**: ❌ Not started — no plans created, no code written

**Current State**: No onboarding, tutorial, or welcome components exist in the codebase. No accessibility-specific enhancements beyond basic HTML semantics.

**Original Requirements**: ONBR-01, ONBR-02, ONBR-03, ONBR-04, A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05

**Original Success Criteria** (what must be TRUE):
  1. First visit shows canvas with starter kit and overlay prompting for URL input or "start from scratch"
  2. First hover over any tile shows one-time tooltip "Click any tile to start editing"
  3. All controls are keyboard navigable with Tab, Enter activates editing, Escape closes edit panels
  4. Focus ring is 2px solid with 2px offset, clearly visible on all interactive elements
  5. Sliders support numeric input alternative, screen readers announce role and value changes

**Note**: This phase needs re-scoping. The app architecture has evolved significantly since these criteria were written. The ControlPanel-driven editing model (not tile click-to-edit) may change what onboarding looks like.

**Plans**: TBD

### Phase 8: Dark/Light Mode
**Goal**: Users can switch between dark and light mode themes with persisted preference

**Status**: ✅ Complete

**Plans**: 5/5 complete
- [x] 08-01-PLAN.md — Foundation: theme state in store, Tailwind config, FOUC prevention
- [x] 08-02-PLAN.md — useTheme hook and app integration
- [x] 08-03-PLAN.md — CSS dark mode variants for UI chrome
- [x] 08-04-PLAN.md — ThemeToggle component in toolbar
- [x] 08-05-PLAN.md — Verification checkpoint

### Phase 9: Responsive Bento Layout System
**Goal**: Build a robust responsive bento grid that fits within 100vh and supports multiple layout presets

**Status**: ✅ Complete

**What Happened**: All 5 implementation plans were executed via GSD. The verification checkpoint (09-05) was written for the original BentoGrid/BentoTile components which were later replaced by BentoGridNew/BentoCanvasNew with a placement-based rendering system. The layout system now supports 6 presets (balanced, heroLeft, heroCenter, stacked, geos, foodDrink), density modes, debug overlay, and layout fitting with priority-based tile hiding.

**Plans**: 5/5 implementation plans complete, verification superseded
- [x] 09-01-PLAN.md — Layout infrastructure: types, grid presets, layout store, viewport/breakpoint hooks
- [x] 09-02-PLAN.md — Responsive BentoGrid component with 100dvh viewport fitting
- [x] 09-03-PLAN.md — BentoTile wrapper with responsive spans per breakpoint
- [x] 09-04-PLAN.md — Density modes, debug overlay, and layout controls
- [x] ~~09-05-PLAN.md~~ — Verification checkpoint (SUPERSEDED — grid reworked outside GSD)
- [x] 09-06-PLAN.md — Layout fitting utility for tile placement

## Progress

| Phase | Plans | Status | Completed |
|-------|-------|--------|-----------|
| 1. Foundation & Extraction | 4/4 | Complete | 2026-02-07 |
| 2. Canvas System | 3/3 | Complete | 2026-02-07 |
| 3. Logo & Typography Tiles | 6/6 | Complete | 2026-02-07 |
| 4. Color & Imagery Tiles | 4/4 | Complete (verification superseded) | 2026-02-08 |
| 5. System View | N/A | Complete (superseded) | 2026-02-08 |
| 6. Workflows | 5/5 | Complete | 2026-02-08 |
| 7. Polish | 0/TBD | Not started | - |
| 8. Dark/Light Mode | 5/5 | Complete | 2026-02-07 |
| 9. Responsive Layout | 5/5 | Complete (verification superseded) | 2026-02-08 |

**Summary**: 8 of 9 phases complete. Phase 7 (Polish) is the only remaining phase.

---
*Roadmap created: 2026-02-06*
*Last updated: 2026-02-09 — full audit of codebase vs roadmap, marked outdated verifications as superseded*
