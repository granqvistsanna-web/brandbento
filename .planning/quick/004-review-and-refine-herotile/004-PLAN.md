---
phase: quick
plan: 004
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/tiles/HeroTile.tsx
  - src/store/useBrandStore.ts
  - src/data/tilePresetContent.ts
  - src/data/tileDefaults.ts
  - src/components/tiles/FloatingToolbar.tsx
  - src/components/BentoCanvasNew.jsx
autonomous: true

must_haves:
  truths:
    - "HeroTile renders headline only -- no body text, no label, no subcopy visible"
    - "User can control headline font weight, font size multiplier, letter spacing, line height, text color, and text alignment via toolbar"
    - "User can position headline horizontally (left/center/right), vertically (top/center/bottom), and adjust padding"
    - "User can toggle overlay on/off, set overlay color, adjust opacity, and choose between solid and gradient overlay"
    - "Tile supports three variations: image-only (no text), image+headline, solid color surface+headline"
    - "All variations look intentional across portrait, square, and landscape aspect ratios"
  artifacts:
    - path: "src/components/tiles/HeroTile.tsx"
      provides: "Unified HeroTile with 3 variations and full toolbar controls"
    - path: "src/store/useBrandStore.ts"
      provides: "TileContent fields for hero overlay, typography, and positioning"
    - path: "src/data/tileDefaults.ts"
      provides: "Updated default content for hero tile type"
    - path: "src/data/tilePresetContent.ts"
      provides: "Simplified hero preset content (headline only)"
  key_links:
    - from: "src/components/tiles/HeroTile.tsx"
      to: "src/store/useBrandStore.ts"
      via: "updateTile with new TileContent fields"
      pattern: "updateTile.*hero(Variation|FontWeight|FontScale|Tracking|LineHeight|TextColor|TextAlign|AlignH|AlignV|Padding|MaxWidth|OverlayEnabled|OverlayColor|OverlayOpacity|OverlayGradient)"
    - from: "src/components/tiles/HeroTile.tsx"
      to: "FloatingToolbar components"
      via: "ToolbarSlider, ToolbarSegmented, ToolbarColorPicker, ToolbarToggle"
---

<objective>
Refine HeroTile into a bold, headline-only atmospheric tile with full creative controls.

Purpose: The HeroTile currently has two variants (hero/overlay) with body text, label, and subcopy. The redesign simplifies it to a single unified component focused on a powerful headline, with three variation modes (image-only, image+headline, solid color+headline) and granular controls for typography, positioning, and overlay treatment.

Output: A redesigned HeroTile.tsx with toolbar controls, updated store types, and updated defaults/presets.
</objective>

<execution_context>
@/Users/sannagranqvist/.claude/get-shit-done/workflows/execute-plan.md
@/Users/sannagranqvist/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/tiles/HeroTile.tsx
@src/store/useBrandStore.ts
@src/data/tilePresetContent.ts
@src/data/tileDefaults.ts
@src/components/tiles/FloatingToolbar.tsx
@src/components/BentoCanvasNew.jsx
@src/utils/typography.ts
@src/utils/colorDefaults.ts
@src/components/tiles/LogoSymbolTile.tsx (reference for toolbar control patterns)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add TileContent fields for hero controls and update defaults/presets</name>
  <files>
    src/store/useBrandStore.ts
    src/data/tileDefaults.ts
    src/data/tilePresetContent.ts
  </files>
  <action>
Add new optional fields to the `TileContent` interface in `src/store/useBrandStore.ts` (and the local TileContent interface in `src/data/tileDefaults.ts`). Group them under a `/* --- Hero/Statement tile fields --- */` comment block, following the same pattern as the Logo Symbol fields:

```
/* --- Hero/Statement tile fields --- */
/** Variation mode: 'image' (no text), 'image-headline' (default), 'solid-headline' */
heroVariation?: 'image' | 'image-headline' | 'solid-headline';
/** Headline font weight override (e.g. 400, 600, 700, 800, 900) */
heroFontWeight?: number;
/** Font size multiplier relative to type scale step3 (default 1.0, range 0.5-2.0) */
heroFontScale?: number;
/** Letter spacing in em (e.g. -0.04 to 0.2) */
heroTracking?: number;
/** Line height (e.g. 0.85 to 1.4) */
heroLineHeight?: number;
/** Text color override hex (null = white over images, brand text over solid) */
heroTextColor?: string;
/** Text alignment: 'left' | 'center' | 'right' */
heroTextAlign?: 'left' | 'center' | 'right';
/** Horizontal content alignment: 'left' | 'center' | 'right' */
heroAlignH?: 'left' | 'center' | 'right';
/** Vertical content alignment: 'top' | 'center' | 'bottom' */
heroAlignV?: 'top' | 'center' | 'bottom';
/** Content padding as percentage (3-12, default 6) */
heroPadding?: number;
/** Max width constraint for headline in ch (0 = none, e.g. 12-30ch) */
heroMaxWidth?: number;
/** Whether overlay is enabled (default true for image variations) */
heroOverlayEnabled?: boolean;
/** Overlay base color hex (default #000000) */
heroOverlayColor?: string;
/** Overlay opacity 0-100 (default 50) */
heroOverlayOpacity?: number;
/** Gradient overlay: null = solid color, or { color1: hex, color2: hex } */
heroOverlayGradient?: { color1: string; color2: string } | null;
/** CSS blend mode for overlay (default 'normal') */
heroBlendMode?: string;
```

Update `DEFAULT_TILE_CONTENT` in `src/data/tileDefaults.ts`:
- For `hero` key: Remove `subcopy` and `cta`. Keep `headline` ("Nothing Extra") and `image`. Add `heroVariation: 'image-headline'`.
- For `overlay` key: Remove `body` and `label`. Keep `headline` ("Less, But Better") and `image`. Add `heroVariation: 'image-headline'`.

Update `defaultTileContent` in `src/store/useBrandStore.ts` (the one inside the store file around line 1301):
- For `hero` key: Remove `subcopy` and `cta`. Keep `headline` and add `heroVariation: 'image-headline'`.
- For `overlay` key: Remove `body` and `label`. Keep `headline` and `image`. Add `heroVariation: 'image-headline'`.

Update `src/data/tilePresetContent.ts`:
- Change the `OverlayPresetContent` interface: Remove `body` and `label` fields. Keep only `headline: string`.
- Update every preset's `overlay` object to contain only `headline` (remove `body` and `label` values).
- NOTE: The `overlay` key in tilePresetContent is used by the overlay variant of HeroTile. Since we're unifying hero and overlay, this content key will serve both.

Also update the `STARTER_TEMPLATES` tile content in `useBrandStore.ts` where tiles reference hero/overlay types:
- Remove `subcopy`, `body`, `label` from hero/overlay tile content entries. Keep `headline` and `image`.
  </action>
  <verify>
Run `npm run build` -- zero type errors. Grep for `subcopy` in HeroTile-related default content to ensure it's removed (should not appear in hero or overlay defaults).
  </verify>
  <done>
TileContent interface has all hero control fields. Default content for hero and overlay tiles contains only headline + image + heroVariation. Preset content for overlay is headline-only. Build passes.
  </done>
</task>

<task type="auto">
  <name>Task 2: Rewrite HeroTile component -- unified renderer with 3 variations</name>
  <files>
    src/components/tiles/HeroTile.tsx
  </files>
  <action>
Rewrite HeroTile.tsx as a single unified component. Remove the separate hero/overlay variant branches. The component should:

**Keep the same public interface:** `HeroTile({ placementId, variant })` -- the `variant` prop is still accepted but now only affects which preset content key is used for fallback defaults. Both 'hero' and 'overlay' render through the same unified code path.

**Naming decision:** Keep the filename as `HeroTile.tsx` and component name as `HeroTile`. The name is fine -- "hero" is standard design vocabulary for a bold visual anchor tile. No rename needed.

**Shape detection (keep existing):**
- Use ResizeObserver on containerRef (already exists).
- Always run shape detection (not just for overlay variant).
- Thresholds: ratio < 0.75 = portrait, > 1.6 = landscape, else square.

**Read tile content fields with sensible defaults:**
```typescript
const variation = content.heroVariation || 'image-headline';
const fontWeight = content.heroFontWeight || parseInt(typography.weightHeadline) || 700;
const fontScale = content.heroFontScale ?? 1.0;
const tracking = content.heroTracking;  // undefined = use brand default
const lineHeight = content.heroLineHeight;  // undefined = use brand default
const textColor = content.heroTextColor;  // undefined = auto
const textAlign = (content.heroTextAlign || 'left') as React.CSSProperties['textAlign'];
const alignH = content.heroAlignH || 'left';
const alignV = content.heroAlignV || 'bottom';
const padding = content.heroPadding ?? 6;
const maxWidth = content.heroMaxWidth;  // undefined = no constraint
const overlayEnabled = content.heroOverlayEnabled ?? true;
const overlayColor = content.heroOverlayColor || '#000000';
const overlayOpacity = content.heroOverlayOpacity ?? 50;
const overlayGradient = content.heroOverlayGradient;
const blendMode = content.heroBlendMode || 'normal';
```

**Rendering logic by variation:**

1. `'image'` -- Image only, no headline. Show image with optional overlay for mood treatment. No text at all.

2. `'image-headline'` (default) -- Image background + headline text. This is the main hero state.

3. `'solid-headline'` -- No image. Use brand primary/accent as background (gradient from primary to accent). Show headline in brand text color (or custom heroTextColor).

**Shared image layer (for 'image' and 'image-headline'):**
- motion.img with fade-in animation (keep existing `initial={{ opacity: 0, scale: 1.02 }}`)
- Apply imageFilter from imagery settings
- If no imageUrl, fall back to color gradient (same as current: `linear-gradient(145deg, ${colors.primary}dd, ${colors.accent || colors.primary}88)`)

**Overlay layer (for 'image' and 'image-headline' when overlayEnabled is true):**
- If `overlayGradient` is set: `linear-gradient(180deg, ${gradient.color1}XX, ${gradient.color2}YY)` where XX/YY derived from overlayOpacity
- If no gradient (default): `linear-gradient(180deg, ${overlayColor}00 0%, ${overlayColor}XX 60%, ${overlayColor}YY 100%)` where XX = overlayOpacity * 0.5 as hex, YY = overlayOpacity as hex
- Apply blendMode via `mixBlendMode` CSS property

Convert opacity (0-100) to hex alpha:
```typescript
const toHexAlpha = (pct: number) => Math.round((pct / 100) * 255).toString(16).padStart(2, '0');
```

**Headline layer (for 'image-headline' and 'solid-headline'):**
- Container div with flexbox positioning driven by alignH and alignV:
  - alignH: 'left' -> alignItems: 'flex-start', 'center' -> 'center', 'right' -> 'flex-end'
  - alignV: 'top' -> justifyContent: 'flex-start', 'center' -> 'center', 'bottom' -> 'flex-end'
- Padding: `clamp(12px, ${padding}%, 48px)`
- h1 element with:
  - fontFamily: headlineFont (from useGoogleFonts, same as current)
  - fontWeight: from content field (not brand typography -- allows per-tile override)
  - fontSize: `clampFontSize(typeScale.step3 * fontScale, 18, 72)` px
  - lineHeight: `heroLineHeight ?? getHeadlineLineHeight(typography)`
  - letterSpacing: `heroTracking !== undefined ? heroTracking + 'em' : getHeadlineTracking(typography)`
  - textTransform: from brand typography (keep existing)
  - textAlign: from content field
  - color: Determine automatically based on variation:
    - 'image-headline': heroTextColor || IMAGE_OVERLAY_TEXT (white)
    - 'solid-headline': heroTextColor || colors.text (brand text)
  - textWrap: 'balance'
  - maxWidth: heroMaxWidth ? `${heroMaxWidth}ch` : undefined

**Solid background (for 'solid-headline'):**
- Full surface fill using `linear-gradient(160deg, ${colors.primary}ee, ${colors.accent || colors.primary}99)` -- same gradient the current code uses when no image is present, but at full opacity.
- OR simpler: just use `colors.primary` as solid background. Let the user control this via surface swatches.
- Actually, use the tile's resolved surface color from the placement system. This way the user can pick any surface. Fall back to primary if no surface.

**Toolbar section (see Task 3 for details):** The toolbar will be built in the next task. For now, ensure the component structure supports it by keeping the `isFocused && anchorRect && tile?.id` conditional rendering pattern.

**Important implementation notes:**
- Use `clampFontSize()` and `clamp()` for ALL text sizes and padding (Shape Adaptive rule).
- Import and use existing toolbar components: ToolbarSlider, ToolbarSegmented, ToolbarColorPicker, ToolbarToggle, ToolbarLabel, ToolbarDivider.
- Keep the existing usePlacementTile, useTileToolbar, useGoogleFonts hooks.
- Keep the existing toolbarActions block (shuffle/upload/lock) for image variations.
- For 'solid-headline' variation, hide the image action bar (no shuffle/upload/lock) since there's no image.
  </action>
  <verify>
Run `npm run build` -- zero type errors. The app should render HeroTile correctly (may need to test manually).
  </verify>
  <done>
HeroTile renders a bold headline (no body/subcopy) with positioning driven by new content fields. Three variations work: image-only shows just the image, image-headline shows image + headline, solid-headline shows colored surface + headline.
  </done>
</task>

<task type="auto">
  <name>Task 3: Build comprehensive toolbar controls for HeroTile</name>
  <files>
    src/components/tiles/HeroTile.tsx
  </files>
  <action>
Add the full toolbar UI inside HeroTile's FloatingToolbar. Follow the exact same patterns used in LogoSymbolTile.tsx for ToolbarSlider/ToolbarColorPicker/ToolbarToggle/ToolbarSegmented usage (live preview via onChange with isCommit=false, commit on onCommit with isCommit=true).

Create a helper inside the component:
```typescript
const handleContentChange = useCallback((updates: Partial<TileContent>, commit: boolean) => {
  if (tile?.id) updateTile(tile.id, updates, commit);
}, [tile?.id, updateTile]);
```

**Toolbar layout (ordered sections):**

1. **Action bar** (shuffle/upload/lock) -- only show when variation is 'image' or 'image-headline'

2. **ToolbarDivider**

3. **Tile Type Grid** (existing ToolbarTileTypeGrid for swapping types)

4. **ToolbarDivider**

5. **Variation** section:
   - ToolbarSegmented with label "Variation" and options:
     - { value: 'image', label: 'Image' }
     - { value: 'image-headline', label: 'Hero' }
     - { value: 'solid-headline', label: 'Solid' }
   - Value: `variation`
   - onChange: `handleContentChange({ heroVariation: v }, true)`

6. **Content** section (only when variation !== 'image'):
   - ToolbarLabel "Content"
   - ToolbarTextInput for headline (same as current, label "Headline")

7. **Typography** section (only when variation !== 'image'):
   - ToolbarLabel "Typography"
   - ToolbarSegmented for font weight with label "Weight" and options:
     - { value: '400', label: 'Regular' }, { value: '600', label: 'Semi' }, { value: '700', label: 'Bold' }, { value: '800', label: 'Extra' }, { value: '900', label: 'Black' }
     - value: `String(fontWeight)`
     - onChange: `handleContentChange({ heroFontWeight: parseInt(v) }, true)`
   - ToolbarSlider for font size scale with label "Size", min 0.5, max 2.0, step 0.05, displayValue `${Math.round(fontScale * 100)}%`
     - onChange: `handleContentChange({ heroFontScale: v }, false)`
     - onCommit: `handleContentChange({ heroFontScale: v }, true)`
   - ToolbarSlider for letter spacing with label "Tracking", min -0.06, max 0.2, step 0.005, displayValue `${(tracking ?? 0).toFixed(3)}em`
     - value: `tracking ?? 0`
     - onChange: `handleContentChange({ heroTracking: v }, false)`
     - onCommit: `handleContentChange({ heroTracking: v }, true)`
   - ToolbarSlider for line height with label "Leading", min 0.8, max 1.5, step 0.05, displayValue `${(lineHeight ?? getHeadlineLineHeight(typography)).toFixed(2)}`
     - value: `lineHeight ?? getHeadlineLineHeight(typography)`
     - onChange: `handleContentChange({ heroLineHeight: v }, false)`
     - onCommit: `handleContentChange({ heroLineHeight: v }, true)`
   - ToolbarColorPicker for text color with label "Text Color":
     - color: resolved text color (the actual color being used)
     - autoColor: IMAGE_OVERLAY_TEXT for image variations, colors.text for solid
     - paletteColors: [colors.text, colors.primary, colors.accent, IMAGE_OVERLAY_TEXT, '#000000', '#FFFFFF']
     - onChange: `(hex) => handleContentChange({ heroTextColor: hex || undefined }, false)`
     - onCommit: `() => handleContentChange({ heroTextColor: content.heroTextColor }, true)`
   - ToolbarSegmented for text alignment with label "Align" and options:
     - { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }
     - value: `textAlign`
     - onChange: `handleContentChange({ heroTextAlign: v }, true)`

8. **Position** section (only when variation !== 'image'):
   - ToolbarLabel "Position"
   - ToolbarSegmented for horizontal alignment with label "Horizontal":
     - { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }
     - onChange: `handleContentChange({ heroAlignH: v }, true)`
   - ToolbarSegmented for vertical alignment with label "Vertical":
     - { value: 'top', label: 'Top' }, { value: 'center', label: 'Center' }, { value: 'bottom', label: 'Bottom' }
     - onChange: `handleContentChange({ heroAlignV: v }, true)`
   - ToolbarSlider for padding with label "Padding", min 2, max 14, step 0.5, displayValue `${padding}%`
     - onChange: `handleContentChange({ heroPadding: v }, false)`
     - onCommit: `handleContentChange({ heroPadding: v }, true)`
   - ToolbarSlider for max width with label "Max Width", min 0, max 30, step 1, displayValue: `maxWidth ? maxWidth + 'ch' : 'None'`
     - value: `maxWidth ?? 0`
     - onChange: `handleContentChange({ heroMaxWidth: v || undefined }, false)` (0 means no constraint)
     - onCommit: `handleContentChange({ heroMaxWidth: v || undefined }, true)`

9. **Overlay** section (only when variation is 'image' or 'image-headline'):
   - ToolbarLabel "Overlay"
   - ToolbarToggle for overlay enabled, label "Overlay", checked: overlayEnabled
     - onChange: `handleContentChange({ heroOverlayEnabled: v }, true)`
   - When overlayEnabled is true, show:
     - ToolbarColorPicker for overlay color, label "Color":
       - color: overlayColor
       - autoColor: '#000000'
       - paletteColors: ['#000000', colors.primary, colors.accent, '#1a1a1a', '#0a0a0a']
       - onChange/onCommit pattern for heroOverlayColor
     - ToolbarSlider for opacity, label "Opacity", min 0, max 100, step 1, displayValue `${overlayOpacity}%`
       - onChange/onCommit for heroOverlayOpacity
     - ToolbarToggle for gradient mode, label "Gradient", checked: !!overlayGradient
       - onChange: toggle between null and { color1: overlayColor, color2: '#000000' }
     - When overlayGradient is set, show two ToolbarColorPickers for gradient color1 and color2
       - label "Gradient Start" / "Gradient End"
       - onChange/onCommit updating the nested gradient object

Do NOT add blend mode to the visible toolbar (the requirement says "hidden under advanced settings" and we don't have an advanced settings pattern yet). Store the field but don't expose the UI. This keeps controls minimal.
  </action>
  <verify>
Run `npm run build` -- zero type errors. The toolbar should have sections: Action bar, Type, Variation, Content, Typography, Position, Overlay -- all with working controls.
  </verify>
  <done>
Complete toolbar with Variation segmented control, Typography section (weight, size, tracking, leading, color, alignment), Position section (horizontal, vertical, padding, max-width), and Overlay section (toggle, color, opacity, gradient toggle + gradient color pickers). All controls use live preview + commit pattern.
  </done>
</task>

<task type="auto">
  <name>Task 4: Update canvas mapping and clean up old overlay preset content references</name>
  <files>
    src/components/BentoCanvasNew.jsx
    src/data/tilePresetContent.ts
  </files>
  <action>
1. In `src/components/BentoCanvasNew.jsx`, the `renderTileByType` switch already maps:
   - `'hero'` -> `<HeroTile placementId={id} />`
   - `'overlay'` -> `<HeroTile placementId={id} variant="overlay" />`
   This is fine -- no changes needed here unless the HeroTile component signature changed (it didn't).

2. In `src/data/tilePresetContent.ts`, verify the `OverlayPresetContent` interface was updated in Task 1. If body/label still exist in any preset's overlay object, remove them now. The interface should be:
   ```typescript
   export interface OverlayPresetContent {
     headline: string;
   }
   ```
   And each preset should have `overlay: { headline: '...' }` only.

3. In `HeroTile.tsx`, verify that when `variant === 'overlay'`, the preset content fallback reads from the simplified overlay preset (headline only). The fallback for headline should be:
   ```typescript
   const presetContent = getPresetContent(activePreset);
   const defaultHeadline = isOverlay
     ? presetContent.overlay.headline
     : 'Your brand, on its best day.';
   const headline = content.headline || defaultHeadline;
   ```
   This should already be handled in Task 2, but verify it works end-to-end.

4. In `src/store/useBrandStore.ts`, check the `STARTER_TEMPLATES` array. For any template tile with `type: 'overlay'`, ensure the content no longer has `body` or `label` fields. For any with `type: 'hero'`, ensure no `subcopy` or `cta` fields. These were addressed in Task 1 but verify completeness:
   - "Creative Studio" template has an overlay tile (social-1, type: 'overlay') -- remove body, label from content
   - "Wellness Brand" template has an overlay tile (ui-preview-1, type: 'overlay') -- remove body, label from content
   - All hero tiles across templates -- remove subcopy, cta from content

5. Run a final check: grep the entire `src/` directory for any remaining references to `subcopy` or `body` or `label` being read inside HeroTile.tsx. There should be ZERO such references (the component should only read `headline` and `hero*` prefixed fields from content).
  </action>
  <verify>
Run `npm run build` -- zero type errors. Grep `src/components/tiles/HeroTile.tsx` for `content.subcopy`, `content.body`, `content.label` -- should return zero matches. Grep `src/data/tilePresetContent.ts` for the overlay objects to confirm they only have `headline`.
  </verify>
  <done>
All old body/subcopy/label references removed from HeroTile and related defaults. Canvas mapping works. Preset content is headline-only for overlay. Starter templates cleaned up. Build passes clean.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
Redesigned HeroTile with:
- Headline-only focus (no body text, no label, no subcopy)
- Three variations: image-only, image+headline, solid color+headline
- Full toolbar controls: typography (weight, size, tracking, leading, color, alignment), positioning (H/V alignment, padding, max-width), overlay (toggle, color, opacity, gradient)
- Shape-adaptive layout across portrait/square/landscape
  </what-built>
  <how-to-verify>
1. Run `npm run dev` and open the app
2. Click on a Hero tile to open its toolbar
3. Test **Variation** switching:
   - "Image" -- tile shows only the background image, no text
   - "Hero" (default) -- image + bold headline
   - "Solid" -- colored surface + headline (no image)
4. Test **Typography controls** (in Hero or Solid variation):
   - Change font weight between Regular/Semi/Bold/Extra/Black
   - Drag Size slider -- headline scales up/down
   - Drag Tracking slider -- letter spacing changes
   - Drag Leading slider -- line height changes
   - Pick a text color -- headline color updates
   - Switch text alignment Left/Center/Right
5. Test **Position controls**:
   - Switch horizontal alignment -- headline moves left/center/right
   - Switch vertical alignment -- headline moves top/center/bottom
   - Drag Padding slider -- inner spacing changes
   - Drag Max Width slider -- headline wraps at narrower width (or "None" for unrestricted)
6. Test **Overlay controls** (in Image or Hero variation):
   - Toggle overlay off -- image has no darkening scrim
   - Toggle back on -- scrim returns
   - Change overlay color -- scrim tint changes
   - Drag opacity slider -- scrim strength changes
   - Toggle Gradient on -- two color pickers appear
   - Pick gradient start/end colors
7. Resize the tile in the grid (if possible) or test with different grid layouts to verify shape-adaptive behavior
8. Verify undo/redo works after making changes
  </how-to-verify>
  <resume-signal>Type "approved" or describe any issues to fix</resume-signal>
</task>

</tasks>

<verification>
- `npm run build` passes with zero errors after all tasks
- HeroTile renders only headline text (no body, subcopy, or label)
- Toolbar shows all control sections: Variation, Content, Typography, Position, Overlay
- Three variations function correctly and look intentional
- All controls use live preview (onChange) + committed save (onCommit) pattern
- Undo/redo works for all toolbar changes
- Shape-adaptive: tile looks good in portrait, square, and landscape
</verification>

<success_criteria>
- HeroTile is a bold, headline-only atmospheric tile
- Three distinct variation states work: image-only, image+headline, solid+headline
- Typography controls (weight, size, tracking, leading, color, alignment) all function
- Positioning controls (H align, V align, padding, max-width) all function
- Overlay controls (toggle, color, opacity, gradient) all function
- No references to body/subcopy/label remain in HeroTile or its defaults
- Build passes clean
</success_criteria>

<output>
After completion, create `.planning/quick/004-review-and-refine-herotile/004-SUMMARY.md`
</output>
