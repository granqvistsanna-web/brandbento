---
created: 2026-02-11T16:09
title: Tile reordering via drag-and-drop
area: ui
files:
  - src/components/BentoGridNew.tsx
  - src/config/placements.ts
---

## Problem

No way to reorder tiles on the bento grid. Users are stuck with the preset tile arrangement.

## Solution

- Drag-and-drop tile reordering on the bento grid
- Swap placements when tiles are dragged to new positions
- TBD: library choice (dnd-kit, react-beautiful-dnd, or native drag)
