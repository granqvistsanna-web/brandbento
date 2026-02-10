## Project Overview

This is a TypeScript React moodboard/brand design app (BrandBento) using Zustand for state management. Key areas: bento grid tiles, color palettes, typography, props panel, dark/light mode. Always use brand typography settings and dynamic tokens — never hardcode Tailwind classes for brand-controlled styles.

## UI/Component Design Philosophy

When designing UI components, start with the SIMPLEST possible implementation first. Do not over-engineer with decorative elements, complex layouts, or 'Swiss Precision' aesthetics. Wait for user feedback before adding complexity. Simple and flexible > impressive and rigid.

## Code Editing Practices

When editing large files or stores, use small incremental edits rather than full file rewrites. Watch for circular dependencies when extracting code to separate files. After any refactor that moves code between files, immediately run the build to catch import issues.

## Verification

After making code changes, always run `npm run build` (or the project's build/typecheck command) to verify zero type errors before presenting work as complete. Do not rely solely on Playwright/browser verification.

## Debugging Approach

When the user reports a visual bug (e.g., element not appearing, clipped, overlapping), check CSS overflow, z-index, and positioning properties FIRST before doing broad codebase exploration. Diagnose before exploring.

## Working With User Inputs

When the user provides reference images, curated lists, or specific design references, use them directly. Do not explore the codebase for alternatives or present generic options when the user has already specified what they want.

## Tile Design Rules

BrandBento is a moodboard tool for graphic designers exploring brand identity. The goal is a board that looks like it came from a design studio — not a dashboard, not a wireframe, not a UI kit. Every tile in `src/components/tiles/` must follow these rules:

### 1. One Job Per Tile
Each tile communicates exactly one idea — a logo, a product card, a typography sample, a social post. If a tile tries to say two things, it says nothing. Split it.

### 2. No Unnecessary Features, But Never Boring
A tile should have no features beyond its core concept. A logo tile doesn't need a tagline field. A color tile doesn't need a color picker. But "minimal" means no unnecessary *functionality* — not no visual quality. Generous whitespace, considered typography, and subtle surface treatment are not extras, they're the baseline.

### 3. Designer Swappability
Every tile is a template the designer fills with their brand. They must be able to:
- **Upload/shuffle images** where the tile uses photography
- **Upload a logo** where relevant
- **See their brand colors** applied automatically via the palette
- **See their chosen fonts** on all text
- **Edit text content** (headlines, labels, copy) via the floating toolbar

### 4. Brand Token Driven
All visual styling — colors, fonts, border-radius, spacing — comes from the brand store and CSS custom properties. Never hardcode brand-controlled values. When the designer changes their palette or typeface, every tile should transform instantly.

### 5. Shape Adaptive
Tiles live in a bento grid and appear in any aspect ratio. Every tile must look intentional whether it's landscape, portrait, or square. Use ResizeObserver to detect shape and adapt layout (e.g., side-by-side → stacked). Never clip, overflow, or leave awkward empty space.
- _Implementation:_ Use `clampFontSize()` and `clamp(min, %, max)` for all text sizes, padding, and gaps so proportions hold at any scale.

### 6. Whitespace Is the Design
Generous inner padding is what separates a moodboard from a spreadsheet. Content should breathe. Never pack a tile edge-to-edge — let the surface color and empty space do work. When in doubt, add more padding, not more content.
- _Implementation:_ Use proportional padding via `clamp()`, e.g., `clamp(16px, 6%, 32px)`. Cap body text at 25–32ch (`maxWidth`) to prevent wall-of-text.

### 7. Typographic Authority
Typography is the primary design tool across all tiles. It should feel editorial — like a magazine spread, not a form label.
- **Clear hierarchy:** 3–4 levels of visual weight through size, not color. Headline → body → label → detail.
- **Tight headlines:** Line-height ~1.05 for display type. Loose body: ~1.5 for reading comfort.
- **Uppercase labels:** Pretitles, categories, and metadata use uppercase + wide letter-spacing (0.08–0.16em).
- **No orphans:** Use `textWrap: 'balance'` on headlines.
- **Opacity, not color, for hierarchy:** Primary text 100% → body ~55% → labels ~45% → detail ~32%.
- _Implementation:_ Use `getTypeScale()` for proportional size steps. Always `clampFontSize(value, min, max)`.

### 8. Image Craft
Photography in tiles should feel curated, not clipped from a screenshot.
- Fill containers with `object-cover` — never stretch or distort
- Text over images requires a gradient scrim (not a flat overlay) for legibility
- Images fade in on load with a gentle scale transition (1.02 → 1)
- Support upload, shuffle, and lock via the floating toolbar

### 9. Aspirational Defaults
The moodboard must look professional *before* the designer customizes anything. Default text should read like real copy ("The Art of Less" not "Headline Here"). Default images should feel curated. Default layout should already suggest a brand direction. The out-of-box experience is the first impression — make it worth screenshotting.

### 10. The Grid Is the Moodboard
Individual tile quality is table stakes. The real design is how tiles sit together — color rhythm across the board, alternating density (image-heavy next to type-only), visual weight distribution. Each tile should be designed knowing it lives alongside others. No tile should demand all the attention. The composition is the product.

### 11. Real-World Design References
Every tile should reference an actual design genre — magazine editorial, e-commerce product card, social media post, identity guideline page — not abstract UI patterns. A designer looking at the board should think "this looks like something from a studio" not "this looks like a component library."

### 12. No Tile-Internal Navigation
Tiles are static visual previews. No tabs, no modals, no carousels, no internal state machines. The only interactivity is content editing via the floating toolbar. The tile is a poster, not an app.
