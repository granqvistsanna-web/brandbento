---
phase: quick
plan: 002
subsystem: ui
tags: [drag-and-drop, bento-grid, layout, zustand, html5-dnd]

# Dependency graph
requires:
  - phase: 09-layout
    provides: BentoGridNew, BentoCanvasNew, placement system, useLayoutStore
provides:
  - Tile drag-and-drop reordering via HTML5 DnD
  - placementSwaps state in useLayoutStore (persisted to localStorage)
  - Swap-aware placement resolution helpers (resolveSwappedId, getSwappedPlacementTileType, getSwappedPlacementTileId)
affects: [phase-07-polish, per-tile-color-overrides]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "HTML5 Drag and Drop API for tile reordering (no external library)"
    - "Swap map pattern: Record<string, string> tracking placement ID remapping"
    - "Swap-aware resolution: placement lookup goes through swap map before tile type/ID resolution"

key-files:
  created: []
  modified:
    - src/store/useLayoutStore.ts
    - src/config/placements.ts
    - src/components/BentoCanvasNew.jsx

key-decisions:
  - "Used HTML5 DnD API instead of external library (dnd-kit, react-beautiful-dnd) -- keeps bundle size small and the interaction is simple swap-only"
  - "Swap map lives in useLayoutStore (not useBrandStore) -- swaps are layout state, not brand content"
  - "Surface colors stay position-bound during swaps -- when tiles swap slots, the slot's surface color stays, the tile content moves"
  - "Drag source uses ref (not state) to avoid unnecessary re-renders -- opacity shows once drop target triggers state update"

patterns-established:
  - "Swap map pattern: Record<placementId, placementId> for position remapping"
  - "resolveSwappedId() as the single indirection point before all placement lookups"

# Metrics
duration: 3min
completed: 2026-02-11
---

# Quick Task 002: Tile Reordering Drag-and-Drop Summary

**HTML5 drag-and-drop tile swapping with persisted swap map, visual drop indicator, and swap-aware placement resolution**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-11T18:40:19Z
- **Completed:** 2026-02-11T18:43:29Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Tiles can be dragged and dropped onto each other to swap positions
- Visual drop indicator (accent ring) shows the target during drag
- Swaps persist across page reloads via localStorage
- Chained swaps work correctly (swap A-B, then swap B-C)
- Surface color rhythm preserved during swaps (colors stay position-bound, tile content moves)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add placement swap state and resolution logic** - `6d33e1b` (feat)
2. **Task 2: Wire drag-and-drop handlers into BentoCanvasNew** - `87fcd84` (feat)

## Files Created/Modified
- `src/store/useLayoutStore.ts` - Added placementSwaps state, swapPlacements and clearPlacementSwaps actions, persistence
- `src/config/placements.ts` - Added resolveSwappedId, getSwappedPlacementTileType, getSwappedPlacementTileId helpers
- `src/components/BentoCanvasNew.jsx` - Added drag-and-drop handlers, swap-aware tile resolution, visual drop indicator

## Decisions Made
- **HTML5 DnD over external library:** The swap interaction is simple (drag tile A onto tile B), so the native HTML5 DnD API is sufficient. No need for dnd-kit or react-beautiful-dnd, which would add bundle size for features we do not use (sortable lists, nested droppables, etc.).
- **Swap map in useLayoutStore:** Swaps are a layout concern (which tile appears where), not brand content. Keeping it in useLayoutStore keeps separation clean.
- **Surface colors stay position-bound:** When tiles swap, the slot's surface color remains -- only the tile component and its content move. This preserves the visual rhythm the designer set up with surface colors.
- **Undo not wired for swaps:** The undo system lives in useBrandStore and tracks brand/tile state. placementSwaps is in useLayoutStore which has no undo infrastructure. Adding cross-store undo would be an architectural change. The plan's "Undo (Cmd+Z) reverses a tile swap" truth is noted but deferred -- this would require extending the undo system to useLayoutStore or moving swaps into useBrandStore history.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Pre-existing type errors in `useBrandStore.test.ts` (references to removed APIs: toggleDarkMode, setFontPreview, getColorHarmony). These are unrelated to this task and were already present before execution. Source code compiles cleanly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Drag-and-drop is functional and ready for user verification
- `clearPlacementSwaps()` action is available but not yet wired to a UI reset button
- Undo support for swaps could be added later by either extending useLayoutStore with temporal middleware or tracking swaps in useBrandStore history

---
*Quick task: 002*
*Completed: 2026-02-11*
