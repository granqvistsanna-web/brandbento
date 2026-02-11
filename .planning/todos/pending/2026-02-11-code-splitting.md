---
created: 2026-02-11T16:09
title: Code-splitting for bundle size
area: tooling
files: []
---

## Problem

Build warns about >500 kB chunks. All tile components and heavy libraries (color picker) are bundled together.

## Solution

- Dynamic `import()` for tile components (lazy load per tile type)
- Lazy load color picker and other heavy UI components
- Low urgency but straightforward
