---
phase: quick
plan: 002
type: execute
wave: 1
depends_on: []
files_modified:
  - src/store/useLayoutStore.ts
  - src/components/BentoCanvasNew.jsx
  - src/components/BentoGridNew.tsx
  - src/config/placements.ts
autonomous: true

must_haves:
  truths:
    - "User can drag a tile and drop it onto another tile to swap their positions"
    - "Swapped tiles retain their content, surface colors, and placement-specific overrides"
    - "A visible drop indicator shows where the tile will land during drag"
    - "Drag-and-drop works across all layout presets (balanced, geos, spread, etc.)"
    - "Tile swaps persist across preset/breakpoint changes via the layout store"
    - "Undo (Cmd+Z) reverses a tile swap"
  artifacts:
    - path: "src/store/useLayoutStore.ts"
      provides: "placementSwaps state and swapPlacements action"
      contains: "swapPlacements"
    - path: "src/components/BentoCanvasNew.jsx"
      provides: "Drag event handlers on tile wrappers"
      contains: "onDragStart"
    - path: "src/config/placements.ts"
      provides: "resolvedPlacementId helper that applies swap overrides"
      contains: "resolveSwappedId"
  key_links:
    - from: "src/components/BentoCanvasNew.jsx"
      to: "src/store/useLayoutStore.ts"
      via: "swapPlacements action called on drop"
      pattern: "swapPlacements"
    - from: "src/components/BentoCanvasNew.jsx"
      to: "src/config/placements.ts"
      via: "resolveSwappedId to look up actual tile for each slot"
      pattern: "resolveSwappedId"
---

<objective>
Add tile reordering via drag-and-drop on the bento grid. Users drag one tile onto another to swap their positions. This lets designers compose their moodboard layout by rearranging tiles without changing the underlying grid structure.

Purpose: Core moodboard interaction -- designers need to control tile arrangement to achieve the composition they want.
Output: Working drag-to-swap on all tiles, with visual feedback during drag, persisted to localStorage.
</objective>

<execution_context>
@/Users/sannagranqvist/.claude/get-shit-done/workflows/execute-plan.md
@/Users/sannagranqvist/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/store/useLayoutStore.ts (layout state -- add swap state here)
@src/store/useBrandStore.ts (brand state -- tiles, placementContent, tileSurfaces keyed by placement ID)
@src/components/BentoCanvasNew.jsx (canvas -- renders tiles via renderSlot, add drag handlers here)
@src/components/BentoGridNew.tsx (grid -- renders placement divs, may need drag-related CSS)
@src/config/placements.ts (placement resolution -- add swap-aware resolution here)
@src/config/bentoLayouts.ts (layout configs -- read-only reference, do NOT modify)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add placement swap state and resolution logic</name>
  <files>
    src/store/useLayoutStore.ts
    src/config/placements.ts
  </files>
  <action>
**In `useLayoutStore.ts`:**

Add a `placementSwaps` state field: `Record<string, string>` that maps placement IDs to other placement IDs. This represents swaps -- if `placementSwaps` contains `{ "hero": "b", "b": "hero" }`, then the "hero" slot renders what "b" normally shows, and vice versa.

Add to state interface:
```ts
placementSwaps: Record<string, string>;
```

Add action:
```ts
swapPlacements: (idA: string, idB: string) => void;
```

Implementation of `swapPlacements`:
- Get current `placementSwaps`
- Resolve what is CURRENTLY at slot A (follow existing swaps: `placementSwaps[idA] ?? idA`)
- Resolve what is CURRENTLY at slot B (follow existing swaps: `placementSwaps[idB] ?? idB`)
- Set `placementSwaps[idA] = resolvedB` and `placementSwaps[idB] = resolvedA`
- This handles chained swaps correctly (swap A-B, then swap B-C works)

Add action:
```ts
clearPlacementSwaps: () => void;
```
To reset all swaps (useful when changing layout presets -- optional, could also preserve).

Persist `placementSwaps` in the `partialize` config alongside existing persisted fields.

Initialize `placementSwaps: {}` in default state.

**In `placements.ts`:**

Add a helper function `resolveSwappedId` that takes a placement ID and the swaps map, returns the effective placement ID:

```ts
export const resolveSwappedId = (
  placementId: string,
  swaps: Record<string, string>
): string => {
  return swaps[placementId] ?? placementId;
};
```

This is called by BentoCanvasNew before looking up tile type/ID for each placement slot.

Also export a convenience function that wraps the existing lookup helpers:
```ts
export const getSwappedPlacementTileType = (
  placementId: string,
  swaps: Record<string, string>
): string | undefined => {
  return getPlacementTileType(resolveSwappedId(placementId, swaps));
};

export const getSwappedPlacementTileId = (
  placementId: string,
  swaps: Record<string, string>
): string | undefined => {
  return getPlacementTileId(resolveSwappedId(placementId, swaps));
};
```

Note: `tileSurfaces` and `placementContent` in useBrandStore are keyed by placement ID. When we swap, we swap WHICH TILE appears in a slot -- the placement-level overrides (surface color, placement content) stay with the slot position, not the tile. This is intentional: it means surface color rhythm is preserved when you rearrange tiles. But the tile's own content (stored on the tile object by tile ID) travels with the tile.
  </action>
  <verify>
Run `npm run build` -- should compile with zero errors. Verify the new types and exports are clean.
  </verify>
  <done>
`placementSwaps` state exists in layout store with `swapPlacements` and `clearPlacementSwaps` actions. `resolveSwappedId`, `getSwappedPlacementTileType`, `getSwappedPlacementTileId` exported from placements.ts. Build passes.
  </done>
</task>

<task type="auto">
  <name>Task 2: Wire drag-and-drop handlers into BentoCanvasNew</name>
  <files>
    src/components/BentoCanvasNew.jsx
    src/components/BentoGridNew.tsx
  </files>
  <action>
**In `BentoCanvasNew.jsx`:**

1. Import `resolveSwappedId` (or the swapped helpers) from placements.ts, and `swapPlacements` + `placementSwaps` from useLayoutStore.

2. Read `placementSwaps` from the layout store:
```js
const placementSwaps = useLayoutStore((s) => s.placementSwaps);
const swapPlacements = useLayoutStore((s) => s.swapPlacements);
```

3. Update `getTileForPlacement` and `renderTile` to use swapped IDs:
- In `getTileForPlacement(id)`, resolve the effective ID first: `const effectiveId = resolveSwappedId(id, placementSwaps);` then use `effectiveId` for tile type/ID lookups instead of raw `id`.
- The `placementId` prop passed to tile components should remain the ORIGINAL slot ID (so surface colors and placement content stay position-bound). But the TILE TYPE rendered should come from the swapped mapping.

4. Add drag state using `useRef`:
```js
const dragSourceRef = useRef(null);  // placement ID being dragged
```

5. Add a `useState` for the current drop target:
```js
const [dropTarget, setDropTarget] = useState(null);
```

6. On each tile wrapper div (the one with `role="gridcell"`), add HTML5 drag-and-drop attributes:

```jsx
draggable
onDragStart={(e) => {
  dragSourceRef.current = placement.id;
  e.dataTransfer.effectAllowed = 'move';
  // Set a semi-transparent drag image
  e.dataTransfer.setData('text/plain', placement.id);
  // Add a slight delay to allow the drag image to be captured
  requestAnimationFrame(() => {
    // Optionally reduce opacity on the source tile
  });
}}
onDragOver={(e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if (dragSourceRef.current && dragSourceRef.current !== placement.id) {
    setDropTarget(placement.id);
  }
}}
onDragLeave={(e) => {
  // Only clear if we're leaving the tile entirely (not entering a child)
  if (!e.currentTarget.contains(e.relatedTarget)) {
    setDropTarget(null);
  }
}}
onDrop={(e) => {
  e.preventDefault();
  const sourceId = dragSourceRef.current;
  if (sourceId && sourceId !== placement.id) {
    swapPlacements(sourceId, placement.id);
  }
  dragSourceRef.current = null;
  setDropTarget(null);
}}
onDragEnd={() => {
  dragSourceRef.current = null;
  setDropTarget(null);
}}
```

7. Add visual feedback for the drop target. On the tile wrapper div, add a conditional style:
```jsx
style={{
  boxShadow: isFocused
    ? '0 0 0 1.5px var(--accent), 0 0 0 4px var(--accent-muted)'
    : placement.id === dropTarget
      ? '0 0 0 2px var(--accent), 0 0 0 5px var(--accent-muted)'
      : 'var(--shadow-tile)',
  opacity: dragSourceRef.current === placement.id ? 0.5 : 1,
  transition: 'box-shadow 150ms ease, opacity 150ms ease',
}}
```

Note: Since `dragSourceRef` is a ref (not state), the opacity change on the source tile during drag won't trigger a re-render. This is fine -- the browser's native drag ghost provides the visual. If a more polished look is desired, use state instead, but ref is simpler and avoids unnecessary re-renders.

8. Also apply drag handlers to empty tiles (BentoTileEmpty wrappers) so users can drag into empty slots too.

**In `BentoGridNew.tsx`:**

No changes needed to BentoGridNew itself. The drag handlers live on the tile wrapper divs inside `renderSlot`, which is provided by BentoCanvasNew.

**Important considerations:**
- Do NOT add cursor: grab/grabbing styles globally -- keep the existing pointer behavior. The draggable attribute handles cursor automatically.
- The `placement.id` passed as `placementId` prop to tile components stays as the ORIGINAL slot ID. Only the tile TYPE lookup uses the swapped ID. This means if you swap hero and editorial, the hero SLOT still gets hero's surface color, but renders the editorial tile component.
- Keep the existing `onClick` for tile focus -- it should still work alongside drag. Clicks (mousedown+mouseup without movement) won't trigger drag.
  </action>
  <verify>
Run `npm run build` -- zero type errors. Then `npm run dev` and manually test:
1. Drag one tile onto another -- they should swap
2. The swap should persist on page reload
3. Changing layout preset should still render correctly with swaps
4. Click-to-focus should still work (not broken by drag handlers)
  </verify>
  <done>
Tiles are draggable. Dropping tile A onto tile B swaps their positions. Visual drop indicator (accent border) appears on hover target during drag. Swaps persist to localStorage. Click-to-focus still works. Build passes with zero errors.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Tile drag-and-drop reordering on the bento grid</what-built>
  <how-to-verify>
    1. Open the app (`npm run dev`)
    2. Drag any tile and drop it onto another tile -- they should swap positions
    3. Try multiple swaps in sequence (swap A-B, then swap B-C)
    4. Refresh the page -- swaps should persist
    5. Switch layout presets -- swaps should still apply correctly
    6. Click a tile to focus it -- focus ring should still appear (not broken by drag)
    7. Try dragging to an empty slot if any exist
    8. Check that the drop indicator (accent border highlight) appears when hovering over a valid drop target
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues to fix</resume-signal>
</task>

</tasks>

<verification>
- `npm run build` passes with zero type errors
- Drag-and-drop swaps tiles visually
- Swaps persist to localStorage (survive page reload)
- Drop indicator visible during drag hover
- Existing click-to-focus, keyboard navigation, and tile rendering unaffected
- Works across all layout presets
</verification>

<success_criteria>
- User can drag any tile onto another to swap their grid positions
- Visual drop indicator shows the target during drag
- Swapped positions persist across page reloads
- No regressions: tile focus, content editing, layout switching all still work
- Build compiles with zero errors
</success_criteria>

<output>
After completion, create `.planning/quick/002-tile-reordering-drag-and-drop/002-SUMMARY.md`
</output>
