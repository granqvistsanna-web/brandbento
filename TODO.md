# BrandBento — Ideas & TODO

A living scratchpad for feature ideas, polish tasks, and things we notice during work.
Not a sprint board — just a place so good ideas don't get lost.

---

## Features

### ~~Save/Load Brand Configs~~ ✓
- ~~JSON export/import of full brand store state~~
- Already implemented: File menu (New/Open/Save), Cmd+S/Cmd+O shortcuts, localStorage auto-persistence

### ~~Inline Text Editing~~ ✓
- ~~No way to edit tile text (headlines, body, labels) through the UI yet~~
- All tiles now have ToolbarTextInput/TextArea/ItemList in their FloatingToolbar
- Tiles covered: Hero, Editorial, Card, SplitHero, Image, List, Stats, Social, Interface

### Typography Controls — Weights & Fine-Tuning
Currently font weights are only set via presets (no UI). Letter-spacing is global (tight/normal/wide). Need granular control:
- **Weight selectors** for headline and body independently (100–900 slider or dropdown, filtered to weights the chosen Google Font actually supports)
- **Tracking (letter-spacing)** per role: separate controls for headline vs body (not just the single global toggle)
- **Line-height** controls: headline (tight, ~1.0–1.15) vs body (comfortable, ~1.4–1.7)
- **Text transform** option per role: none / uppercase / capitalize (headline uppercase is common in brand work)
- Store additions: `typography.weightHeadline`, `typography.weightBody` already exist but need UI; add `typography.trackingHeadline`, `typography.trackingBody`, `typography.lineHeightHeadline`, `typography.lineHeightBody`, `typography.transformHeadline`

### Font Search Improvements
FontSelector already has search + category filters + curated fonts. Possible improvements:
- Make the search bar more discoverable (always visible, not buried in dropdown)
- Variable font support — detect variable fonts and expose a continuous weight axis
- Recently-used fonts section at top of dropdown
- Font preview at the tile level (hover a font → see it live on the board)

### Per-Tile Text Color Overrides
Text color is currently auto-derived from surface brightness. Need manual control:
- **Tile-level text color picker** in FloatingToolbar — override the adaptive text color for that tile
- Options: "Auto" (current behavior) or manual hex/palette pick
- Stored in a `tileTextColors` record similar to `tileSurfaces`
- Applies to headline, body, and label text within that tile
- Contrast warning if manual pick fails WCAG AA against the tile's surface

### Export Presets (sized outputs)
- Current PNG export captures whatever's on screen
- Add dimension presets: Instagram Post (1080x1080), Presentation (1920x1080), Story (1080x1920)
- Canvas aspect ratio system already exists to build on

### Lummi Image Collections UI
- Store already has `activeCollectionId`, `collectionImagePool`, `setImageCollection()`
- `src/services/lummiApi.ts` exists
- Missing: sidebar UI to browse and select collections

---

## Polish & Consistency

### ~~ImageTile Toolbar Integration~~ ✓
- ~~Every image-based tile has FloatingToolbar except ImageTile~~
- ImageTile now has shuffle, lock, upload, and overlay text editing

### ~~Wire Up Imagery Style Controls~~ ✓
- ~~`brand.imagery.style` (default/grayscale/tint) and `brand.imagery.overlay` (0-100) exist in store~~
- `getImageFilter()` utility in `src/utils/imagery.ts` converts style+overlay to CSS filters
- Applied to all image tiles: Hero, Image, Card, SplitHero, List (split), SocialPost
- Sidebar Imagery section with Style segmented control + Overlay slider

---

## Performance

### Code-Splitting
- Build warns about >500 kB chunks
- Dynamic `import()` for tile components and color picker
- Low urgency but straightforward

---

## IconsTile Overhaul

### Icon Color & Background Controls
- **Manual icon color picker** — override the auto-derived icon color (currently: primary if contrast > 25 LD, else neutral)
- **Toggle icon cell backgrounds** — option to remove the 10% tinted cell backgrounds (show icons floating on the surface instead)
- **Per-icon color** (stretch) — individually tint icons if desired, or keep uniform (default)

### Icon Library Switching
Currently hardcoded to 12 Remix Icons in 3 sets of 4. Expand to:
- **Multiple icon libraries** — Remix, Lucide, Phosphor, Feather, Material Symbols (all available in react-icons)
- **Library selector** in FloatingToolbar or a "Style" segmented control
- **Shuffle within the selected library** — pick random icons from the active library instead of cycling 3 fixed sets
- **Icon count/grid** — maybe 4, 6, or 9 icons depending on tile shape

### Custom SVG Upload
- **Upload SVG files** as custom icons (via FloatingToolbar upload button)
- **SVG color override** — parse uploaded SVGs and replace fill/stroke with the chosen icon color (single-color recoloring)
- **Mixed mode** — allow a grid of uploaded SVGs + library icons together
- Store uploaded SVGs as data URIs or base64 in `placementContent`
- Provide a "Reset to library icons" action to clear custom uploads

---

## Ideas (unvalidated)

- Copy-to-clipboard for exported images
- SVG/PDF export options
- ~~Share link generation~~ ✓ (already implemented with LZString URL compression)
- ~~Keyboard shortcuts for common actions~~ ✓ (Cmd+S, Cmd+O, Cmd+Z, Space, C, T, Esc)
- Tile reordering via drag-and-drop
