---
created: 2026-02-11T16:09
title: IconsTile overhaul
area: ui
files:
  - src/components/tiles/IconTile.tsx
  - src/components/tiles/FloatingToolbar.tsx
---

## Problem

IconTile is limited: hardcoded to 12 Remix Icons in 3 sets of 4, no color controls, no library switching, no custom SVG upload.

## Solution

### Color & Background Controls
- Manual icon color picker — override auto-derived icon color
- Toggle icon cell backgrounds on/off (show icons floating on surface)
- Per-icon color (stretch goal)

### Icon Library Switching
- Support Remix, Lucide, Phosphor, Feather, Material Symbols (all in react-icons)
- Library selector in FloatingToolbar or "Style" segmented control
- Shuffle within selected library (random icons from active library)
- Icon count/grid adapts: 4, 6, or 9 icons depending on tile shape

### Custom SVG Upload
- Upload SVG files via FloatingToolbar upload button
- SVG color override — parse and replace fill/stroke with chosen icon color
- Mixed mode — grid of uploaded SVGs + library icons together
- Store as data URIs or base64 in `placementContent`
- "Reset to library icons" action to clear custom uploads
