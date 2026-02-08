# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-06)

**Core value:** See typography, color, imagery, and logo working together as a system, not isolated assets.

**Current focus:** Completing remaining Phase 6 workflows and verification checkpoints

## Current Position

Phase: Phase 6 (Workflows) - complete
Plan: 06-04 of 4 completed - Read-only View
Status: Phase complete
Last activity: 2026-02-08 - Completed 06-04-PLAN.md

Progress: [███████████░] ~97% (Phase 5 superseded, Phase 6 complete, verifications pending)

## Performance Metrics

**Velocity:**
- Total plans completed: 30
- Average duration: ~5.8 min
- Total execution time: ~2h 58min

**By Phase:**

| Phase | Plans | Total | Avg/Plan | Notes |
|-------|-------|-------|----------|-------|
| 01 | 4/4 ✓ | ~48 min | ~12 min | |
| 02 | 3/3 ✓ | ~19 min | ~6 min | |
| 03 | 6/6 ✓ | ~39 min | ~6.5 min | |
| 04 | 4/5 | ~12 min | ~3 min | 04-05 verification pending |
| 05 | N/A ✓ | - | - | Superseded - goal achieved via new tile architecture |
| 06 | 4/4 ✓ | ~15 min | ~3.75 min | CSS/JSON+Share+Reset done (outside GSD), PNG export + readonly done via GSD |
| 08 | 5/5 ✓ | ~17 min | ~3.4 min | |
| 09 | 5/6 | ~10 min | ~2 min | 09-05 verification pending |

**Recent Trend:**
- Last GSD plans: 09-01, 09-02, 09-03, 09-06, 09-04
- External work: New tiles and canvas refactor (2026-02-08)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Phase 1: Self-hosted Cloudflare Worker CORS proxy from day one (prevents reliance on third-party services)
- Phase 1: lz-string compression for URL state (keeps shared links under 2000 chars)
- Phase 1: Manual upload prominence alongside extraction (acknowledges extraction unreliability)
- Phase 1: Extraction fallbacks always populate tiles (empty tiles kill experimentation flow)
- 01-02: Used subscribeWithSelector middleware for granular state persistence
- 01-02: Store large data URIs separately with hash references to keep URL under 2000 chars
- 01-02: URL state takes precedence over localStorage for sharing workflow
- 01-03: Multi-strategy extraction with fallback hierarchy for each asset type
- 01-03: Progressive updates via onProgress callback for real-time UI feedback
- 01-03: Default-first approach - populate defaults before extraction starts
- 02-02: editingTileId not persisted - resets on page load for clean UX
- 02-02: UI Preview tile excluded from edit interactions
- 02-03: EditPanel renders absolutely positioned within tile (maintains system view context)
- 02-03: tabIndex set to -1 when tile is dimmed (removes from tab order during edit mode)
- 02-03: nonInteractive prop for UIPreviewTile (role='region' instead of button)
- 03-01: 30-step undo history limit via temporal middleware
- 03-01: Partialize excludes transient state from undo tracking
- 03-01: ITU-R BT.709 luminance formula for WCAG compliance
- 03-02: Slider uses temporal.pause/resume for single undo step per drag
- 03-02: LogoTile is self-contained component (not a prop-driven wrapper)
- 03-02: Background auto mode uses useImageLuminance hook
- 03-03: 3s timeout for font loading with graceful fallback
- 03-03: Font names rendered in own typeface on hover (lazy load)
- 03-03: useHoverPreview pattern for preview/commit without state mutation
- 03-04: Primary tile uses large Aa glyph with full character set
- 03-04: Secondary tile shows typography-themed body paragraphs
- 03-04: previewFont prop pattern for hover preview without state mutation
- 03-05: Weight availability dots on slider show available font weights
- 03-05: TypographyTileWithPanel pattern for preview wiring to tiles
- 08-01: Theme state in useBrandStore without persist middleware (to be added later)
- 08-01: FOUC script reads 'brand-store' localStorage key
- 08-01: Tailwind darkMode: 'selector' for class-based dark mode
- 08-02: useTheme hook manages .dark class on document.documentElement
- 08-02: System preference detection via matchMedia listener
- 08-03: Light mode as default, dark mode as .dark class override
- 08-03: 200ms transitions for smooth theme changes
- 08-03: color-scheme property for native form controls
- 08-04: ThemeToggle button shows resolved theme icon (Sun/Moon) not selected theme
- 08-04: Dropdown uses check mark to indicate current selection
- 08-04: Old darkModePreview toggle removed from toolbar in favor of new ThemeToggle
- 08-05: Zustand persist middleware added with partialize for theme/brand/tiles
- 08-05: Theme persistence verified across refresh and browser close/reopen
- 04-01: ColorPalette with semantic roles (primary, accent, background, text)
- 04-01: color-contrast-checker for WCAG AA/AAA compliance
- 04-01: ITU-R BT.709 luminance formula (consistent with 03-01)
- 04-01: 5 palette presets (original, warm, cool, bold, muted)
- 04-02: ColorPicker uses rAF throttling for 60fps updates during drag
- 04-02: ContrastBadge checks text/background pair for WCAG compliance
- 04-02: PalettePresets uses useHoverPreview for temporary preview on hover
- 04-02: RoleDropdown enables switching which color role is being edited
- 04-03: Images resized to max 1920px and converted to JPEG 85% for smaller data URI
- 04-03: Gradient uses 40%/30% opacity on primary/accent for subtle appearance
- 04-03: ImageUpload overlay always present, shown on hover
- 04-04: DuotoneFilter uses CSS mix-blend-mode (darken + lighten) for GPU-accelerated duotone
- 04-04: GrainFilter uses SVG feTurbulence with unique filter ID per instance
- 04-04: TreatmentPresets uses committedRef for proper hover reversion
- 09-01: 4 layout presets (balanced, heroLeft, heroCenter, stacked) for deterministic grid layouts
- 09-01: Persist only preset and density, not breakpoint (computed) or debugMode (dev-only)
- 09-01: 100ms debounced resize handler to prevent performance issues
- 09-01: Breakpoints at 768px (tablet) and 1024px (desktop) - standard device sizes
- 09-02: twMerge over cn util for class merging (simpler, already in project)
- 09-02: Type-only import for ReactNode due to verbatimModuleSyntax
- 09-03: Default 1x1 span fallback for unknown tile types
- 09-03: Motion inner div pattern - Framer Motion inside BentoTile, not on wrapper
- 09-06: Dual props pattern: children for backward compat, tiles+renderTile for fitting
- 09-06: Priority order: hero (1) > brand assets (2) > content (3) > utility (4)
- 09-06: Minimum 1x1 span fallback when tile cant fit at full size
- 09-04: DebugGrid reads layout state from useLayoutStore for consistent visualization
- 09-04: Pink color scheme for debug overlay distinguishes it from app content
- 09-04: Layout section in ControlPanel uses existing Section and SegmentedControl components
- 06-03: Toast notifications use bottom-center position with dark theme
- 06-03: Share URL uses hash for compressed state + ?view=readonly parameter
- 06-03: Reset shows confirmation dialog before executing
- 06-03: Reset preserves state in history.past for undo capability
- 06-03: Clipboard API with document.execCommand fallback for older browsers
- 06-02: html-to-image (not html2canvas) for PNG export
- 06-02: data-export-exclude attribute pattern for filtering UI from exports
- 06-02: forwardRef pattern for BentoCanvasNew to expose canvas ref to App
- 06-02: PNG export as first option in Export dropdown menu
- 06-02: devicePixelRatio scaling for high-DPI screens in PNG exports
- 06-04: Read-only mode detected via ?view=readonly URL parameter
- 06-04: ReadOnlyProvider context wraps entire app for global read-only state
- 06-04: Banner provides clear 'Create your own' action to exit read-only mode
- 06-04: All interactive UI (header, control panel, footer, toaster) hidden in read-only mode

### Pending Todos

- [ ] Make sure bento looks great and like a bento, and is responsive
- [ ] Run 04-05 verification checkpoint
- [ ] Run 09-05 verification checkpoint
- [x] Execute 06-02: PNG export with html-to-image (completed 2026-02-08)
- [x] Execute 06-03: Share link + toast + reset with confirmation (completed 2026-02-08)
- [x] Execute 06-04: Read-only view for shared links (completed 2026-02-08)

### Blockers/Concerns

None currently blocking. Previous concerns resolved:

**Resolved (2026-02-08):**
- ✅ Phase 5 direction: Marked as superseded - new tile architecture achieves same goal better
- ✅ Phase 6 direction: Slimmed down to 3 remaining plans (PNG export, share link, read-only view)

**Cleanup completed (2026-02-08):**
Deleted unused legacy code:
- Components: BentoCanvas.tsx, BentoCanvas.jsx, BentoGrid.tsx, BentoTile.tsx, Tile.tsx, TypographyTileWithPanel.tsx, EditPanel.tsx, index.ts
- Directories: panels/, pickers/, filters/, controls/

Active code now uses:
- BentoCanvasNew.jsx → BentoGridNew.tsx
- New tiles: IdentityTile, EditorialTile, SocialPostTile, InterfaceTile, ColorTile

### Roadmap Evolution

- Phase 8 added: Implement dark/light mode theming
- Phase 9 added: Responsive Bento Layout System (hole-free grid with presets, 100vh constraint, density modes)
- 2026-02-08: Significant work done outside GSD - new tile architecture, canvas refactor, export functionality
- 2026-02-08: Phase 5 marked superseded (goal achieved via new tile architecture instead of UIPreviewTile)
- 2026-02-08: Phase 6 slimmed from 5 plans to 4 (CSS/JSON export already done, 3 plans remaining)
- 2026-02-08: Phase 6 complete - all 4 workflows implemented (CSS/JSON export, PNG export, share link, read-only view)

## Session Continuity

Last session: 2026-02-08
Stopped at: Completed 06-04-PLAN.md (Read-only View)
Resume file: None

**Current active architecture:**
- src/components/BentoCanvasNew.jsx (main canvas with forwardRef)
- src/components/BentoGridNew.tsx (responsive grid)
- src/components/tiles/IdentityTile.tsx
- src/components/tiles/EditorialTile.tsx
- src/components/tiles/SocialPostTile.tsx
- src/components/tiles/InterfaceTile.tsx
- src/components/tiles/ColorTile.tsx
- src/config/bentoLayouts.ts (includes 'geos' preset)
- src/utils/sharing.ts (URL generation and clipboard)
- src/utils/export.ts (PNG export with filtering)
- src/store/useBrandStore.ts (with resetToDefaults action)
- src/hooks/useReadOnly.ts (read-only mode detection)

---
*State initialized: 2026-02-06*
*Last updated: 2026-02-08 after completing 06-02*
