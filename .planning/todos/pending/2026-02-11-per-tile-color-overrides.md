---
created: 2026-02-11T16:09
title: Per-tile color overrides
area: ui
files:
  - src/store/useBrandStore.ts
  - src/components/tiles/FloatingToolbar.tsx
---

## Problem

No way to override text, CTA/button, or accent colors per tile. Everything uses the global palette, which limits creative control for individual tiles.

## Solution

- Store: `tileColorOverrides: Record<string, TileColorOverrides>` with `{ text?, cta?, ctaText?, accent? }`
- FloatingToolbar "Colors" section with rows for Button, Text, Accent — swatch + "Auto" badge or reset icon
- Inline picker: click swatch → HexColorPicker + palette quick-picks
- Tile resolution: `overrides?.cta ?? colors.primary` fallback chain
- WCAG contrast warning when manual pick fails AA against tile surface
- Add to HistoryState for undo support
