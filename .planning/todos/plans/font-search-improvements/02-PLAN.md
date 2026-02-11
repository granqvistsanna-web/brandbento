---
wave: 2
depends_on: [01]
files_modified:
  - src/components/controls/FontSelector.tsx
  - src/store/useBrandStore.ts
autonomous: true
---

# Plan 02: Live Font Preview on Tile Board

## Goal

When hovering a font in the dropdown, temporarily preview it on the bento board tiles — so users see how it looks in context before committing.

## Context

- Store already has `fontPreview: { font: string; target: "primary" | "secondary" } | null`
- `setFontPreview(font, target)` action exists and clears on null
- Tiles already read `brand.typography.primary` and `.secondary` — need to check if they also respect `fontPreview`
- FontSelector receives `label` prop ("Headline" or "Body") which maps to target

## must_haves

- [ ] Hovering a font in dropdown temporarily shows it on board tiles
- [ ] Moving away from dropdown or closing it reverts to actual font
- [ ] Preview is snappy (font must be loaded before showing on board)
- [ ] Works for both Headline and Body font selectors

## Tasks

<task id="1">
**Map FontSelector label to preview target**

In `src/components/controls/FontSelector.tsx`:
- Derive `target: "primary" | "secondary"` from `label` prop ("Headline" → "primary", "Body" → "secondary")
- Import `useBrandStore` for `setFontPreview`
</task>

<task id="2">
**Trigger preview on font hover**

In `src/components/controls/FontSelector.tsx`:
- On `FontItem` hover: after loading font, call `setFontPreview(family, target)`
- On dropdown close: call `setFontPreview(null, target)` to clear
- On font select: clear preview (actual value takes over)
- Debounce hover by ~100ms to avoid rapid preview flashing
</task>

<task id="3">
**Ensure tiles respect fontPreview**

Check that tile components read `fontPreview` from store and apply it:
- If `fontPreview?.target === "primary"` → use `fontPreview.font` instead of `typography.primary` for headline rendering
- If `fontPreview?.target === "secondary"` → use `fontPreview.font` instead of `typography.secondary` for body text
- If tiles don't currently check `fontPreview`, add the fallback chain: `fontPreview?.font ?? typography.primary`
- Update CSS custom properties (likely `--font-heading`, `--font-body`) to respect preview state
</task>

## Verification

```bash
npm run build
```

- Open Headline FontSelector → hover over different fonts → board headline text changes live
- Open Body FontSelector → hover over fonts → board body text changes
- Close dropdown → font reverts to the selected one
- Select a font → preview clears, new font persists
- No flickering or lag (fonts pre-load on hover)
- No TypeScript errors
