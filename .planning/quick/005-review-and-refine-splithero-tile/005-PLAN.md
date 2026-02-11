---
phase: quick-005
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/store/useBrandStore.ts
  - src/components/tiles/SplitHeroTile.tsx
  - src/data/tilePresetContent.ts
autonomous: true

must_haves:
  truths:
    - "SplitHeroTile stacks vertically in portrait/narrow shapes with proportional image-to-content ratio"
    - "User can toggle image position (left/right/auto) via toolbar segmented control"
    - "User can toggle CTA visibility on/off via toolbar toggle"
    - "All five layout variations work: image-left, image-right, vertical stack, with CTA, without CTA"
    - "Image area has no text overlay -- content stays in the copy panel"
  artifacts:
    - path: "src/store/useBrandStore.ts"
      provides: "splitImagePosition field on TileContent"
      contains: "splitImagePosition"
    - path: "src/components/tiles/SplitHeroTile.tsx"
      provides: "Refined layout with toolbar controls"
      min_lines: 150
  key_links:
    - from: "src/components/tiles/SplitHeroTile.tsx"
      to: "src/store/useBrandStore.ts"
      via: "TileContent.splitImagePosition and TileContent.ctaHidden"
      pattern: "splitImagePosition|ctaHidden"
---

<objective>
Refine SplitHeroTile layout behavior and add per-tile toolbar controls for image position and CTA visibility.

Purpose: The SplitHeroTile needs better portrait/narrow adaptation and toolbar controls so users can flip the image position and toggle the CTA without editing content fields manually.

Output: Updated SplitHeroTile with improved stacking, image position segmented control, and CTA toggle in the floating toolbar.
</objective>

<execution_context>
@/Users/sannagranqvist/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@src/components/tiles/SplitHeroTile.tsx
@src/components/tiles/FloatingToolbar.tsx
@src/store/useBrandStore.ts
@src/data/tilePresetContent.ts
@CLAUDE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add splitImagePosition field to TileContent and default content</name>
  <files>src/store/useBrandStore.ts, src/data/tilePresetContent.ts</files>
  <action>
    1. In `src/store/useBrandStore.ts`, add to the `TileContent` interface:
       ```
       /** Image position for split tiles: 'left' | 'right' | 'auto' (auto = left in landscape, top in portrait) */
       splitImagePosition?: 'left' | 'right' | 'auto';
       ```
       Place it near the existing `ctaHidden` field (around line 242) since both are split-hero specific.

    2. In `src/store/useBrandStore.ts`, update the `defaultTileContent` entry for `'split-hero'`. Currently there is no explicit entry -- if missing, add one:
       ```
       'split-hero': {
         headline: 'Start With Why Not',
         body: 'Great brands start with a question nobody thought to ask.',
         cta: 'See How',
         image: '/images/visualelectric-1751915506477.png',
       },
       ```
       Do NOT add `splitImagePosition` to defaults -- it should be `undefined` which means 'auto'.

    3. No changes needed to `tilePresetContent.ts` -- the SplitHeroPresetContent interface and preset data already provide headline/body/cta. The `splitImagePosition` is layout metadata, not preset copy.

    Run `npm run build` to verify no type errors.
  </action>
  <verify>Run `npm run build` -- zero errors. Grep for `splitImagePosition` in useBrandStore.ts to confirm field exists.</verify>
  <done>TileContent type includes splitImagePosition field. Default split-hero tile content exists in defaultTileContent map. Build passes.</done>
</task>

<task type="auto">
  <name>Task 2: Refine SplitHeroTile layout and add toolbar controls</name>
  <files>src/components/tiles/SplitHeroTile.tsx</files>
  <action>
    This task updates the SplitHeroTile component in three areas: layout refinement, image position support, and toolbar controls.

    **A. Layout refinement for portrait/narrow shapes:**

    1. Adjust the ResizeObserver thresholds. Current: portrait < 0.75, landscape > 1.4. Change to:
       - Portrait: ratio < 0.85 (catches more nearly-square-but-tall tiles)
       - Landscape: ratio > 1.3 (catches slightly wider tiles)
       - Square: between 0.85 and 1.3

    2. In portrait mode, change the image section height from fixed `50%` to `45%` for the image and let the copy area flex to fill the rest. This gives copy more breathing room in tall tiles. Use `flex: '0 0 45%'` on the image div and `flex: 1` on the copy div (already has flex:1).

    3. In portrait mode, center-align the copy content (add `alignItems: 'center'` and `textAlign: 'center'` on the copy div). This looks more intentional for a stacked layout. The button should also be `alignSelf: 'center'` instead of `self-start` in portrait.

    **B. Image position support:**

    1. Read `splitImagePosition` from content: `const imagePosition = content.splitImagePosition || 'auto';`

    2. Compute effective image side:
       ```
       const effectiveImageFirst = (() => {
         if (imagePosition === 'left') return true;
         if (imagePosition === 'right') return false;
         // 'auto' or undefined: image first (left in landscape, top in portrait)
         return true;
       })();
       ```

    3. In the JSX, conditionally render image div before or after copy div based on `effectiveImageFirst`. Use a simple conditional: if `effectiveImageFirst`, render image then copy. Otherwise, render copy then image. Do NOT use `flexDirection: 'row-reverse'` because it causes issues with border rendering and is harder to reason about. Instead, literally reorder the JSX elements using a fragment or conditional rendering pattern.

       Simplest approach -- extract image and copy as variables, then render in order:
       ```
       const imageSection = <div ...>...</div>;
       const copySection = <div ...>...</div>;

       return (
         <div ref={containerRef} ...>
           {effectiveImageFirst ? <>{imageSection}{copySection}</> : <>{copySection}{imageSection}</>}
           {/* toolbar */}
         </div>
       );
       ```

    **C. Toolbar controls:**

    1. Import `ToolbarSegmented` and `ToolbarToggle` from `FloatingToolbar` (add to existing import).

    2. Add a ToolbarSegmented for image position AFTER the surface swatches section:
       ```
       <ToolbarSegmented
         label="Image Position"
         options={[
           { value: 'auto', label: 'Auto' },
           { value: 'left', label: 'Left' },
           { value: 'right', label: 'Right' },
         ]}
         value={content.splitImagePosition || 'auto'}
         onChange={(v) => updateTile(tile!.id, { splitImagePosition: v as 'left' | 'right' | 'auto' }, true)}
       />
       ```

    3. Add a ToolbarToggle for CTA visibility AFTER the CTA text input:
       ```
       <ToolbarToggle
         label="Show CTA"
         checked={!ctaHidden}
         onChange={(checked) => updateTile(tile!.id, { ctaHidden: !checked }, true)}
       />
       ```

    4. Add a ToolbarDivider between the new layout controls section and the content section.

    **D. Verify image area is purely visual:**
    Confirm there is no text overlay, headline, or label rendered inside the image div. The current code is already clean -- the image div only contains the `<motion.img>` or gradient fallback. No changes needed here, but verify during review.

    Run `npm run build` to verify zero type errors.
  </action>
  <verify>
    1. `npm run build` passes with zero errors.
    2. Open the app and find a SplitHeroTile. Verify:
       - In landscape placement: image appears on the left, copy on the right
       - Toggle "Image Position" to "Right" in toolbar: image flips to the right side
       - Toggle "Show CTA" off: button disappears. Toggle on: button reappears
       - Resize tile to portrait shape: layout stacks vertically with image on top
  </verify>
  <done>
    SplitHeroTile renders in five variations: image-left, image-right, vertical stack, with CTA, without CTA. Toolbar has Image Position segmented control (Auto/Left/Right) and Show CTA toggle. Portrait layout uses 45/55 split with centered content. Build passes with zero errors.
  </done>
</task>

</tasks>

<verification>
1. `npm run build` passes with zero type errors
2. SplitHeroTile adapts layout correctly across aspect ratios (portrait stacks, landscape splits)
3. Image Position control (Auto/Left/Right) in toolbar works and persists
4. CTA toggle in toolbar shows/hides the button and persists
5. Image area contains no text overlays -- purely visual
6. All spacing and typography use brand tokens (no hardcoded values)
7. Undo/redo works after toggling image position and CTA visibility
</verification>

<success_criteria>
- SplitHeroTile supports all five variations from the task description
- Toolbar has two new controls: Image Position (segmented) and Show CTA (toggle)
- Portrait mode uses proportional stacking with centered copy
- Zero type errors on build
- No regressions in existing tile behavior
</success_criteria>

<output>
After completion, create `.planning/quick/005-review-and-refine-splithero-tile/005-SUMMARY.md`
</output>
