---
wave: 1
depends_on: []
files_modified:
  - src/components/controls/FontSelector.tsx
  - src/store/useBrandStore.ts
  - src/hooks/useFontSearch.ts
autonomous: true
---

# Plan 01: Search Input + Recently Used Fonts

## Goal

Add a search input to FontSelector and wire up recently-used font tracking, replacing the inline filter logic with the existing `useFontSearch` hook.

## Context

- `src/hooks/useFontSearch.ts` already exists with Fuse.js fuzzy search + recently-used support — **fully implemented but unused**
- Current FontSelector has NO text search — only category pill filters
- Store has no recently-used font tracking

## must_haves

- [ ] Text search input always visible at top of dropdown (above category pills)
- [ ] Fuzzy search via Fuse.js (typo-tolerant)
- [ ] Recently-used fonts section at top of list (max 5, persisted in store)
- [ ] Search + category filters work together (AND logic)
- [ ] Existing keyboard nav (arrow keys, enter, escape) still works

## Tasks

<task id="1">
**Add `recentFonts` to brand store**

In `src/store/useBrandStore.ts`:
- Add `recentFonts: string[]` to state (default `[]`, max 5)
- Add `addRecentFont(family: string)` action — prepends to array, deduplicates, caps at 5
- Add to `HistoryState` so it survives undo/redo
- Persist via existing localStorage middleware
</task>

<task id="2">
**Wire `useFontSearch` hook into FontSelector**

In `src/components/controls/FontSelector.tsx`:
- Import `useFontSearch` from `@/hooks/useFontSearch`
- Import `useBrandStore` for `recentFonts`
- Replace the inline `filteredFonts` useMemo (lines 120-131) with `useFontSearch(recentFonts)`
- Map `category` state to `setCategoryFilter` from the hook
- Map `searchQuery`/`setSearchQuery` from the hook
- Remove now-unused `GOOGLE_FONTS` import (it's used inside the hook)
</task>

<task id="3">
**Add search input to dropdown**

In `src/components/controls/FontSelector.tsx`:
- Add a text input between the dropdown header and category pills
- Style: transparent bg, `var(--sidebar-border-subtle)` border, rounded-lg, text-12
- Placeholder: "Search fonts..."
- Auto-focus on dropdown open
- Clear button (×) when query is non-empty
- Wire to `setSearchQuery` from the hook
- Search icon (RiSearchLine) on the left
</task>

<task id="4">
**Add "Recently Used" section to font list**

In `src/components/controls/FontSelector.tsx`:
- When `recentCount > 0` from the hook, render a "Recently Used" header before the first recent font
- Add a divider after the recently-used section
- Style header same as existing "Curated" header (uppercase, tracking-wider, text-11)
- Call `addRecentFont(family)` in the `onSelect` handler
</task>

<task id="5">
**Wire keyboard focus to search input**

- When dropdown opens, auto-focus the search input
- Arrow down from search input moves focus to font list
- Typing while in font list should redirect to search input
- Escape clears search first, second Escape closes dropdown
</task>

## Verification

```bash
npm run build
```

- Open FontSelector dropdown → search input visible and focused
- Type "rob" → shows Roboto, Roboto Mono, etc. (fuzzy match)
- Select a font → appears in "Recently Used" on next open
- Category filter + search work together
- Arrow keys still navigate, Enter selects, Escape closes
- No TypeScript errors
