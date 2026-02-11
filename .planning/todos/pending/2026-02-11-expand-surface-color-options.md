---
created: 2026-02-11T16:09
title: Expand surface color options
area: ui
files:
  - src/components/tiles/FloatingToolbar.tsx
  - src/store/useBrandStore.ts
  - src/utils/surface.ts
---

## Problem

ToolbarSurfaceSwatches in FloatingToolbar is limited to 7 auto-generated surfaces. Users can't pick from all palette colors or use a custom hex color.

## Solution

- Two groups in swatches: "Surfaces" (auto-generated 5-8) then "Palette" (all remaining paletteColors)
- `[+]` button opens inline HexColorPicker for arbitrary hex
- Change `tileSurfaces` type from `Record<string, number | undefined>` to `Record<string, number | string | undefined>` — string = raw hex
- `resolveSurfaceColor()` checks type: number → index lookup, string → use directly as hex
