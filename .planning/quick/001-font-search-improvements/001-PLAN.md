---
phase: quick
plan: 001
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/controls/FontSelector.tsx
  - src/components/GlobalControls.tsx
autonomous: true

must_haves:
  truths:
    - "Typing in the search input filters the font list with fuzzy matching"
    - "Recently used fonts appear at the top of the dropdown with a section header"
    - "Selecting a font adds it to the recently used list"
    - "Search input auto-focuses when dropdown opens"
    - "Existing keyboard navigation, category pills, and curated stars still work"
  artifacts:
    - path: "src/components/controls/FontSelector.tsx"
      provides: "Font selector with search, recently-used, and useFontSearch hook"
      contains: "useFontSearch"
    - path: "src/components/GlobalControls.tsx"
      provides: "Wires addRecentFont on font selection"
      contains: "addRecentFont"
  key_links:
    - from: "src/components/controls/FontSelector.tsx"
      to: "src/hooks/useFontSearch.ts"
      via: "hook import and usage"
      pattern: "useFontSearch"
    - from: "src/components/GlobalControls.tsx"
      to: "src/store/useBrandStore.ts"
      via: "addRecentFont action"
      pattern: "addRecentFont"
    - from: "src/components/controls/FontSelector.tsx"
      to: "src/store/useBrandStore.ts"
      via: "recentFonts state"
      pattern: "recentFonts"
---

<objective>
Wire up the existing `useFontSearch` hook and `recentFonts` store into FontSelector, replacing manual filtering with fuzzy search, and add a search input + recently-used section to the dropdown.

Purpose: Font selection is the most frequent brand action. Search makes 1500+ fonts navigable. Recently-used surfaces the 5 fonts users actually care about.
Output: FontSelector with search bar, recently-used section, fuzzy filtering via useFontSearch hook.
</objective>

<execution_context>
@/Users/sannagranqvist/.claude/get-shit-done/workflows/execute-plan.md
@/Users/sannagranqvist/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/controls/FontSelector.tsx
@src/hooks/useFontSearch.ts
@src/store/useBrandStore.ts
@src/components/GlobalControls.tsx
@src/data/googleFontsMetadata.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace manual filtering with useFontSearch and add search input</name>
  <files>src/components/controls/FontSelector.tsx</files>
  <action>
Refactor FontSelector to use the `useFontSearch` hook instead of its manual `filteredFonts` useMemo. This is the core wiring task.

**Add new props to FontSelector:**
- `recentFonts?: string[]` (passed from parent, defaults to `[]`)

**Add search input at the top of the dropdown (ABOVE category pills):**
- Import `RiSearchLine` and `RiCloseLine` from `react-icons/ri`
- Add a ref `searchRef = useRef<HTMLInputElement>(null)` for auto-focus
- Render an input inside a container div at the top of the dropdown portal (before the category pills div)
- Style: transparent background, `var(--sidebar-border-subtle)` bottom border, `var(--sidebar-text)` color, text-12, placeholder "Search fonts...", padding `px-3 py-2`
- Left side: `RiSearchLine` at size 13, color `var(--sidebar-text-muted)`
- Right side: when `searchQuery` is non-empty, show `RiCloseLine` as a clear button (size 13, muted color, on click sets `setSearchQuery('')`)
- Auto-focus: in the `useEffect` that runs when `isOpen` changes, after the existing dropdown positioning logic, add: `setTimeout(() => searchRef.current?.focus(), 100)` (slightly after the 80ms scroll-into-view timeout)

**Replace manual filtering with hook:**
- Call `useFontSearch(recentFonts)` at the top of the component
- Destructure: `{ fonts, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, recentCount }`
- Remove the old `filteredFonts` useMemo block (lines ~121-131)
- Remove the old `firstNonCuratedIdx` useMemo block (lines ~133-135)
- Remove the local `category` state (`useState("all")`) - use `categoryFilter`/`setCategoryFilter` from the hook instead
- Update category pills: compare against `categoryFilter` (which is `null` for "all", or the category string). Map the pill `value="all"` to `setCategoryFilter(null)`, and others to `setCategoryFilter(cat.value as GoogleFontMeta['category'])`
- Replace `filteredFonts` references with `fonts` from the hook

**Adapt the font list rendering for recently-used and curated sections:**
- Compute `recentCount` from the hook to determine section boundaries
- When `recentCount > 0` AND `searchQuery` is empty (no search active): render a "Recently Used" section header before index 0, using the same styling as the existing "Curated" header (text-11 font-semibold uppercase tracking-wider, color `var(--sidebar-text-muted)`), but with `RiTimeLine` icon (size 8, opacity 0.5) instead of Star
- After the recently-used fonts (at index `recentCount`), render a divider + "Curated" header for curated fonts (if any curated fonts exist in the remaining list)
- After the last curated font, render a divider + "More Fonts" header for the rest
- When `searchQuery` is non-empty: skip all section headers (search results are flat, ranked by relevance)
- When `recentCount === 0`: keep existing Curated / More Fonts section logic

**Update keyboard navigation:**
- Replace `filteredFonts` with `fonts` in the `handleKeyDown` callback and its dependency array
- Arrow keys should work the same way over the flat `fonts` array (sections are visual only, not separate lists)
- Ensure keyboard nav still scrolls highlighted item into view

**Update footer count:**
- Change `{filteredFonts.length} fonts` to `{fonts.length} fonts`

**Reset on close:**
- When `isOpen` becomes false (in the click-outside handler and Escape key handler), call `setSearchQuery('')` and `setCategoryFilter(null)` to reset for next open
</action>
  <verify>
Run `npm run build` - should compile with zero errors. Open the app, click a FontSelector dropdown - search input should be visible and focused, typing should filter fonts with fuzzy matching, category pills should still work, keyboard navigation should still work.
  </verify>
  <done>
FontSelector uses useFontSearch hook for all filtering. Search input renders above category pills, auto-focuses on open, supports fuzzy search. Recently-used section appears when recentFonts prop is non-empty. Curated/More Fonts sections still render. All existing features (keyboard nav, pills, star icons) preserved.
  </done>
</task>

<task type="auto">
  <name>Task 2: Wire recentFonts from store and call addRecentFont on selection</name>
  <files>src/components/GlobalControls.tsx</files>
  <action>
Connect the brand store's `recentFonts` state and `addRecentFont` action to the FontSelector instances in GlobalControls.

**In GlobalControls component:**
- Add to the existing `useBrandStore` selectors at the top of the component:
  - `const recentFonts = useBrandStore((s) => s.recentFonts);`
  - `const addRecentFont = useBrandStore((s) => s.addRecentFont);`

**Pass recentFonts to both FontSelector instances:**
- Headline FontSelector: add `recentFonts={recentFonts}` prop
- Body FontSelector: add `recentFonts={recentFonts}` prop

**Call addRecentFont on font selection:**
- Wrap each FontSelector's `onChange` to also call `addRecentFont`:
  - Headline: `onChange={(font) => { addRecentFont(font); handleChange("typography", "primary", font, true); }}`
  - Body: `onChange={(font) => { addRecentFont(font); handleChange("typography", "secondary", font, true); }}`

This is intentionally placed in GlobalControls (the consumer) rather than inside FontSelector, because FontSelector is a generic component that shouldn't know about the brand store. The store connection belongs at the integration layer.
  </action>
  <verify>
Run `npm run build` - zero errors. Open the app, select a font for Headline. Close and reopen the dropdown - the font should appear under "Recently Used" at the top. Select a different Body font, reopen either dropdown - both fonts should appear in Recently Used. Verify max 5 recent fonts, most recent first.
  </verify>
  <done>
Both FontSelector instances receive recentFonts from store. Selecting any font calls addRecentFont, which persists to the store's recentFonts array (max 5, deduplicated, most-recent-first). Recently Used section is visible in both Headline and Body font dropdowns.
  </done>
</task>

</tasks>

<verification>
1. `npm run build` passes with zero type errors
2. Open Headline font dropdown: search input visible and auto-focused at top
3. Type "rob" - fuzzy match shows Roboto, Roboto Mono, Roboto Slab, etc.
4. Clear search with X button - full list returns
5. Category pills still filter (Sans, Serif, Display, Mono)
6. Select a font - dropdown closes
7. Reopen dropdown - selected font appears under "Recently Used" header
8. Select 5+ different fonts - only last 5 appear in Recently Used
9. Arrow keys navigate through all sections (recent + curated + more fonts)
10. Enter key selects highlighted font, Escape closes dropdown
11. Body font dropdown also shows same recently used fonts and search
</verification>

<success_criteria>
- useFontSearch hook is the sole source of font filtering (manual useMemo removed)
- Search input with fuzzy matching renders above category pills
- Recently Used section with header appears when recentFonts is non-empty
- addRecentFont called on every font selection in GlobalControls
- All existing features preserved: keyboard nav, category pills, curated stars, portal positioning
- Zero TypeScript build errors
</success_criteria>

<output>
After completion, create `.planning/quick/001-font-search-improvements/001-SUMMARY.md`
</output>
