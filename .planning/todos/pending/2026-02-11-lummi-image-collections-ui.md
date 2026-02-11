---
created: 2026-02-11T16:09
title: Lummi image collections UI
area: ui
files:
  - src/services/lummiApi.ts
  - src/store/useBrandStore.ts
---

## Problem

Store already has `activeCollectionId`, `collectionImagePool`, `setImageCollection()` and `lummiApi.ts` exists, but there's no sidebar UI to browse and select image collections.

## Solution

- Build sidebar panel to browse Lummi image collections
- Show collection thumbnails/previews
- Select collection → populate `collectionImagePool`
- Integrate with existing store actions
