---
created: 2026-02-11T16:09
title: Font search improvements
area: ui
files:
  - src/components/FontSelector.tsx
---

## Problem

FontSelector has search + category filters + curated fonts, but discoverability and power-user features are lacking:
- Search bar is buried in the dropdown, not always visible
- No variable font support (continuous weight axis)
- No recently-used fonts section
- No live font preview at the tile level (hover a font → see it on the board)

## Solution

- Make search bar always visible at top of dropdown
- Detect variable fonts and expose continuous weight axis
- Track recently-used fonts and show at top
- Font preview on hover: temporarily apply font to tiles
