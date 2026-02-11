---
phase: quick
plan: 003
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/tiles/IconsTile.tsx
  - src/store/useBrandStore.ts
  - src/data/tileDefaults.ts
autonomous: true

must_haves:
  truths:
    - "User can switch between 5 icon libraries (Remix, Feather, Lucide, Phosphor, Tabler) via toolbar"
    - "User can toggle between grid layouts (2x2, 3x3, single large icon) via toolbar"
    - "User can upload a custom SVG that replaces the icon grid with their own icon"
    - "Library choice, grid size, and custom SVG persist across sessions via placementContent"
    - "Shuffle cycles through icon sets within the currently selected library"
  artifacts:
    - path: "src/components/tiles/IconsTile.tsx"
      provides: "Multi-library icon tile with grid size variants and SVG upload"
    - path: "src/store/useBrandStore.ts"
      provides: "TileContent fields for iconLibrary, iconGridSize, iconCustomSvg"
    - path: "src/data/tileDefaults.ts"
      provides: "TileContent type parity with new icon fields"
  key_links:
    - from: "src/components/tiles/IconsTile.tsx"
      to: "placementContent"
      via: "useBrandStore setPlacementContent"
      pattern: "setPlacementContent.*iconLibrary|iconGridSize|iconCustomSvg"
---

<objective>
Overhaul the Icons tile to support multiple icon libraries, grid size variations, and custom SVG upload.

Purpose: The current tile is locked to 3 hardcoded Remix Icon sets in a fixed 2x2 grid. Designers need to pick from curated icon families that match their brand aesthetic, control density (1 / 4 / 9 icons), and drop in custom SVGs.

Output: Enhanced IconsTile.tsx with library selector, grid size control, and SVG upload in the floating toolbar. All choices persisted in placementContent.
</objective>

<execution_context>
@/Users/sannagranqvist/.claude/get-shit-done/workflows/execute-plan.md
@/Users/sannagranqvist/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/tiles/IconsTile.tsx
@src/components/tiles/FloatingToolbar.tsx
@src/store/useBrandStore.ts
@src/data/tileDefaults.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add TileContent fields and build icon library data</name>
  <files>
    src/store/useBrandStore.ts
    src/data/tileDefaults.ts
  </files>
  <action>
  Add three new optional fields to the `TileContent` interface in `useBrandStore.ts` (after the existing `iconShowBg` field):
  - `iconLibrary?: 'remix' | 'feather' | 'lucide' | 'phosphor' | 'tabler'` -- which icon library to use (default 'remix')
  - `iconGridSize?: '1' | '2x2' | '3x3'` -- grid layout (default '2x2')
  - `iconCustomSvg?: string` -- data URI of uploaded SVG (when set, replaces the icon grid with this single SVG)

  Mirror the same three fields in the local `TileContent` interface in `tileDefaults.ts` to maintain type parity. No changes to default content needed (icons entry stays `{}`).
  </action>
  <verify>Run `npm run build` -- zero type errors.</verify>
  <done>TileContent in both files has `iconLibrary`, `iconGridSize`, and `iconCustomSvg` fields. Build passes.</done>
</task>

<task type="auto">
  <name>Task 2: Overhaul IconsTile with multi-library support, grid sizes, and SVG upload</name>
  <files>
    src/components/tiles/IconsTile.tsx
  </files>
  <action>
  Rewrite IconsTile.tsx with these changes (use incremental edits where possible):

  **1. Icon library data structure:**
  Create a `LIBRARIES` record keyed by library ID. Each library has 3 icon sets (for shuffle). Curate 9 icons per library (3 sets of varied counts to support all grid sizes). Pick design-system-appropriate icons -- geometric, abstract, brand-feeling. Avoid literal/emoji-like icons.

  Icon selections per library (all filled/solid variants where available):
  - `remix` (react-icons/ri): Keep current 3 sets of 4, but expand each set to 9 icons to support 3x3. Use: RiPaletteFill, RiFontSize, RiStackFill, RiVipDiamondFill, RiCameraLensFill, RiQuillPenFill, RiHexagonFill, RiSparklingFill, RiBallPenFill, RiContrastDropFill, RiPokerDiamondsFill, RiCompassFill + add RiPlanetFill, RiPrismFill, RiDropFill, RiRecycleFill, RiBookOpenFill, RiMagicFill, RiLeafFill, RiFlashlightFill, RiAwardFill, RiFireFill, RiLightbulbFill, RiShieldFill, RiCupFill, RiHeartFill, RiEyeFill
  - `feather` (react-icons/fi): FiFeather, FiCompass, FiHexagon, FiDroplet, FiStar, FiSun, FiTarget, FiZap, FiAperture, FiGrid, FiLayers, FiPenTool, FiCircle, FiTriangle, FiSquare, FiAnchor, FiCrosshair, FiCommand, FiTrello, FiGlobe, FiEye, FiHeart, FiAward, FiBookOpen, FiCoffee, FiBox, FiCode
  - `lucide` (react-icons/lu): LuPalette, LuPentagon, LuDiamond, LuSparkles, LuLeaf, LuDroplets, LuFlame, LuAperture, LuCircleDot, LuHexagon, LuTriangle, LuSquare, LuStar, LuSun, LuMoon, LuZap, LuGem, LuCompass, LuTarget, LuAtom, LuShield, LuCrown, LuFeather, LuGlobe, LuEye, LuHeart, LuLayers
  - `phosphor` (react-icons/pi): PiDiamondFill, PiStarFill, PiHexagonFill, PiLeafFill, PiDropFill, PiLightningFill, PiSunFill, PiCompassFill, PiEyeFill, PiFireFill, PiFlowerFill, PiCrownFill, PiGlobeFill, PiAtomFill, PiShieldCheckFill, PiButterflyFill, PiSnowflakeFill, PiSpiralFill, PiHeartFill, PiSparkeFill, PiMountainsFill, PiPlanetFill, PiPuzzlePieceFill, PiWaveSawtoothFill, PiTreeFill, PiPaintBrushFill, PiLightbulbFill
  - `tabler` (react-icons/tb): TbHexagonFilled, TbDiamondFilled, TbStarFilled, TbDropletFilled, TbLeafFilled, TbFlameFilled, TbBoltFilled, TbSunFilled, TbPalette, TbCompass, TbTarget, TbAtom, TbBrandAbstract, TbGeometry, TbShape, TbTopologyRing, TbTopologyStar, TbBrandCodesandbox, TbPrism, TbCrystalBall, TbPentagon, TbOctagon, TbSquareRotated, TbTriangle, TbCircle, TbHexagon, TbFeather

  Organize into 3 sets of 9 per library. When grid is 2x2, use first 4 of the set. When 1, use first 1. When 3x3, use all 9.

  **2. Grid size constants:**
  Define grid configs for each size:
  - `'1'`: single icon, large (GRID_W=60, GRID_H=60, CELL=60, ICON_SIZE=36)
  - `'2x2'`: current layout (GRID_W=120, GRID_H=120, CELL=48, GAP=12, ICON_SIZE=22) -- keep as-is
  - `'3x3'`: 3-col grid (GRID_W=168, GRID_H=168, CELL=48, GAP=12, ICON_SIZE=20)

  **3. Read persisted state:**
  Read `iconLibrary`, `iconGridSize`, and `iconCustomSvg` from `placementContent`, defaulting to `'remix'`, `'2x2'`, and `undefined`.

  **4. Render logic:**
  - If `iconCustomSvg` is set, render a single centered `<img>` using the data URI, scaled to fill ~60% of tile area, tinted via CSS filter if possible (or just show raw). The icon color and cell bg controls still apply around it.
  - Otherwise, slice the current icon set based on grid size (1, 4, or 9 icons) and render the grid using the appropriate grid config.
  - The scale-to-fit ResizeObserver logic stays the same but uses the dynamic GRID_W/GRID_H from the active grid config.

  **5. Shuffle behavior:**
  Shuffle cycles through the 3 icon sets of the currently selected library (same as today, but per-library). If custom SVG is active, shuffle clears it and returns to library icons.

  **6. Toolbar additions:**
  Add to the existing toolbar (between ToolbarActions and the existing color picker):
  - `ToolbarSegmented` for library selection with options: `[{value:'remix', label:'Remix'}, {value:'feather', label:'Feather'}, {value:'lucide', label:'Lucide'}, {value:'phosphor', label:'Phosphor'}, {value:'tabler', label:'Tabler'}]`. On change, persist via `setPlacementContent(placementId, { iconLibrary: value }, true)` and reset iconSetIndex to 0.
  - `ToolbarSegmented` for grid size with options: `[{value:'1', label:'Single'}, {value:'2x2', label:'2x2'}, {value:'3x3', label:'3x3'}]`. On change, persist via `setPlacementContent(placementId, { iconGridSize: value }, true)`.
  - SVG upload: Add a file input (accept=".svg,image/svg+xml") triggered by a small upload button (use RiUploadLine or similar icon). On upload, read as data URL and persist via `setPlacementContent(placementId, { iconCustomSvg: dataUrl }, true)`. Show a small "Clear" button if custom SVG is active.

  Keep existing controls: icon color picker, cell backgrounds toggle, surface swatches, tile type grid.

  **Important implementation notes:**
  - Use dynamic imports or direct imports for the 5 libraries. Since react-icons supports tree-shaking per-icon, import each icon individually from its package path (e.g., `import { FiFeather } from 'react-icons/fi'`).
  - The icon arrays should use `IconType` from react-icons for typing.
  - Keep the component memo'd.
  - Maintain the existing brand-token-driven color logic (autoIconColor, tintBg).
  - The cell border-radius should be `rounded-xl` for 2x2, `rounded-lg` for 3x3, and `rounded-2xl` for single.
  </action>
  <verify>Run `npm run build` -- zero type errors. Open the app, click on an Icons tile, verify the toolbar shows library selector and grid size selector. Switch libraries and grid sizes. Upload an SVG.</verify>
  <done>
  - Icons tile renders icons from 5 different libraries based on toolbar selection
  - Grid toggles between 1, 2x2, and 3x3 layouts
  - Custom SVG upload works and displays the uploaded icon
  - All settings persist in placementContent
  - Shuffle cycles within selected library
  - Build passes with zero type errors
  </done>
</task>

</tasks>

<verification>
- `npm run build` passes with zero type errors
- Icons tile shows Remix icons by default in 2x2 grid (backward compatible)
- Switching library in toolbar changes displayed icons immediately
- Grid size control switches between single, 2x2, 3x3 layouts smoothly
- Upload SVG replaces grid with custom icon; "Clear" returns to library icons
- Shuffle works per-library (cycles 3 sets)
- Icon color picker and cell backgrounds toggle work across all modes
- ResizeObserver scaling works for all 3 grid sizes
- Tile looks good at various aspect ratios (portrait, landscape, square)
</verification>

<success_criteria>
- 5 icon libraries selectable via toolbar segmented control
- 3 grid sizes (single, 2x2, 3x3) selectable via toolbar segmented control
- Custom SVG upload with clear functionality
- All choices persisted in placementContent (iconLibrary, iconGridSize, iconCustomSvg)
- Existing color/background controls work with all new modes
- Zero type errors on build
</success_criteria>

<output>
After completion, create `.planning/quick/003-icons-tile-overhaul/003-SUMMARY.md`
</output>
