---
created: 2026-02-11T16:09
title: Restructure color palettes panel
area: ui
files:
  - src/components/GlobalControls.tsx:393-420
  - src/components/ColorPalettePanel.tsx
---

## Problem

The "Colors" section in GlobalControls (5 swatches, lines 393-420) is redundant — it just opens Color Palettes when clicked. The ColorPalettePanel itself needs restructuring with the active palette always visible at top.

## Solution

- Delete Colors section from GlobalControls (lines 393-420)
- Add ActivePaletteStrip to top of ColorPalettePanel showing all `paletteColors` as swatches
- Show semantic role dots (BG/Text/Primary/Accent/Surface) below active palette
- Move Edit Colors + Import buttons into the active palette area
- Keep PaletteStyleFilter + PaletteGrid unchanged below a divider
