---
created: 2026-02-11T16:09
title: Export presets for sized outputs
area: ui
files:
  - src/utils/export.ts
---

## Problem

Current PNG export captures whatever's on screen. No way to export at specific dimensions for social media or presentations.

## Solution

- Add dimension presets: Instagram Post (1080x1080), Presentation (1920x1080), Story (1080x1920)
- Build on existing canvas aspect ratio system
- Preset selector in export flow
