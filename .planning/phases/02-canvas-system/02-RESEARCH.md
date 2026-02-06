# Phase 2: Canvas System - Research

**Researched:** 2026-02-07
**Domain:** CSS Grid bento layouts, interactive tile states, responsive design, accessibility
**Confidence:** HIGH

## Summary

Phase 2 implements the structured 3×3 bento grid canvas with spanning tiles, interactive hover/click/edit states, responsive layout, and smooth transitions. The canvas must support a specific tile arrangement (logo, typography, imagery, colors, UI preview) with mobile/tablet compression, frosted glass overlays on hover, inline edit panels on click, and keyboard accessibility.

Research confirms that:
1. **CSS Grid with `grid-auto-flow: dense`** solves the bento layout problem elegantly without JavaScript positioning
2. **Native CSS Grid spanning** via `grid-column: span N` and `grid-row: span N` handles tile sizes without line number calculations
3. **`:focus-visible` pseudo-class** provides keyboard-only focus indicators, avoiding mouse user annoyance
4. **`backdrop-filter: blur()`** creates frosted glass overlays with 97%+ browser support (requires `-webkit-` prefix)
5. **Inline edit pattern** (not modal or sidebar) keeps context visible and reduces cognitive load
6. **`opacity` transitions are GPU-accelerated** making dimming animations performant
7. **Mobile-first responsive breakpoints** at 768px (tablet) and 1024px (desktop) align with modern device distributions
8. **WCAG 2.4.13 requires 2px focus indicators** with 3:1 contrast ratio and 2px offset for visibility

**Primary recommendation:** Build with CSS Grid and `grid-auto-flow: dense`, use native CSS for transitions and overlays (no animation libraries), implement edit state in Zustand with single active tile tracking, follow mobile-first responsive pattern with content-based breakpoints.

## Standard Stack

### Core Technologies

| Library/Technology | Version | Purpose | Why Standard |
|-------------------|---------|---------|--------------|
| **CSS Grid** | Native | Bento layout with spanning tiles | Only layout system that aligns on both axes, `dense` fills gaps automatically, no JavaScript positioning needed |
| **CSS `backdrop-filter`** | Native | Frosted glass overlay effect | 97%+ browser support, GPU-accelerated, no library needed (with `-webkit-` prefix for compatibility) |
| **CSS `:focus-visible`** | Native | Keyboard-only focus indicators | Solves mouse vs keyboard focus UX, native browser support, WCAG 2.4.7 compliant |
| **CSS `transition`** | Native | State change animations | GPU-accelerated for `opacity` and `transform`, no library overhead, predictable timing |
| **Zustand** | 5.0+ | Edit state management | Already in stack, fine-grained subscriptions prevent rerenders, ~1KB, handles "only one tile editing" constraint |
| **React** | 19.x | UI framework | Project stack, hooks for state subscription, no additional dependencies needed |

### Supporting Utilities

| Tool | Purpose | When to Use |
|------|---------|-------------|
| **CSS Media Queries** | Responsive breakpoints | Mobile (< 768px), Tablet (768-1024px), Desktop (1024px+) |
| **CSS Custom Properties** | Dynamic theming values | Warm off-white background (#FAFAF8), shadow values, transition timings |
| **ARIA roles** | Accessibility semantics | `role="button"`, `aria-pressed`, `aria-label` for screen readers |

### No Additional Dependencies Required

Phase 2 requires **zero new npm packages**. All functionality achievable with native CSS and existing React/Zustand stack.

## Architecture Patterns

### Recommended Component Structure

```
src/
├── components/
│   ├── Canvas.tsx              # Grid container with layout logic
│   ├── Tile.tsx                # Base tile (already exists, enhance)
│   ├── TileOverlay.tsx         # Frosted glass hover overlay
│   ├── EditPanel.tsx           # Inline edit panel (abstract base)
│   ├── tiles/
│   │   ├── LogoTile.tsx        # Logo (1×1, col 1 row 1)
│   │   ├── PrimaryFontTile.tsx # Primary type (1×1, col 2 row 1)
│   │   ├── ImageryTile.tsx     # Imagery (1×2, col 3 rows 1-2)
│   │   ├── ColorTile.tsx       # Colors (1×1, col 1 row 2)
│   │   ├── SecondaryFontTile.tsx # Secondary type (1×1, col 2 row 2)
│   │   └── UIPreviewTile.tsx   # UI preview (3×1, cols 1-3 row 3)
│   └── panels/
│       ├── LogoEditPanel.tsx   # Logo editing controls
│       ├── FontEditPanel.tsx   # Font picker/controls
│       └── ...                 # (other edit panels in Phase 3+)
├── state/
│   └── canvasState.ts          # Add editingTileId, setEditingTile
└── styles/
    └── canvas.css              # Grid layout, responsive rules
```

### Pattern 1: CSS Grid Bento Layout with Dense Auto-Flow

**What:** 12-column CSS Grid with `grid-auto-flow: dense` to automatically fill gaps when tiles span multiple columns/rows.

**Why:** The "dense" keyword tells the browser to fill holes in the grid with smaller items, solving the "Swiss cheese problem" common in bento layouts without JavaScript positioning logic.

**Example:**
```css
/* Source: Building a Bento Grid Layout with Modern CSS Grid */
.canvas-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 180px;
  gap: 8px;
  grid-auto-flow: dense; /* Automatically fills gaps */
}

/* Tile spanning */
.tile-logo {
  grid-column: span 1;
  grid-row: span 1;
}

.tile-imagery {
  grid-column: span 1;
  grid-row: span 2; /* Spans 2 rows */
}

.tile-ui-preview {
  grid-column: span 3; /* Full width */
  grid-row: span 1;
}
```

**When to use:** All bento-style layouts with irregular tile sizes. Avoids explicit line positioning (e.g., `grid-column: 1 / 7`) which is brittle.

### Pattern 2: Frosted Glass Overlay with Extended Backdrop

**What:** Semi-transparent overlay with `backdrop-filter: blur()` that extends beyond visible boundaries for realistic glass effect.

**Why:** Default `backdrop-filter` only blurs pixels directly behind element. Real frosted glass scatters light from surrounding areas. Extended backdrop with mask-image replicates this.

**Example:**
```css
/* Source: Next-level frosted glass with backdrop-filter - Josh W. Comeau */
.tile-overlay {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 200ms ease-out;
  pointer-events: none;
}

.tile:hover .tile-overlay {
  opacity: 1;
  pointer-events: auto;
}

.tile-overlay::before {
  content: '';
  position: absolute;
  inset: -20px; /* Extend beyond boundaries */
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); /* Safari support */
  mask-image: linear-gradient(to bottom, black 20px, black calc(100% - 20px), transparent);
  border-radius: inherit;
}
```

**When to use:** Hover overlays, edit mode indicators. Not supported in older browsers (< 2022), but 97%+ modern browser coverage.

**Fallback:**
```css
@supports not (backdrop-filter: blur(10px)) {
  .tile-overlay::before {
    background: rgba(255, 255, 255, 0.9); /* Solid fallback */
  }
}
```

### Pattern 3: Zustand Edit State with Single Active Tile

**What:** Store which tile is currently being edited, automatically close previous when new one opens.

**Why:** Prevents multiple edit panels being open (requirement LIVE-06), provides single source of truth, enables dimming other tiles (TILE-04).

**Example:**
```typescript
// Source: React State Management using Zustand - Globant
interface CanvasStore {
  editingTileId: string | null;
  setEditingTile: (tileId: string | null) => void;
}

export const useCanvasStore = create<CanvasStore>()(
  subscribeWithSelector((set) => ({
    editingTileId: null,

    setEditingTile: (tileId) => set({
      editingTileId: tileId
    }),
  }))
);

// In component
function Tile({ id }: { id: string }) {
  const editingTileId = useCanvasStore(state => state.editingTileId);
  const setEditingTile = useCanvasStore(state => state.setEditingTile);

  const isEditing = editingTileId === id;
  const isDimmed = editingTileId !== null && editingTileId !== id;

  return (
    <div
      className="tile"
      style={{ opacity: isDimmed ? 0.6 : 1 }}
      onClick={() => setEditingTile(id)}
    >
      {/* tile content */}
      {isEditing && <EditPanel onClose={() => setEditingTile(null)} />}
    </div>
  );
}
```

**When to use:** Any UI with mutually exclusive edit states, modeless editing, or single-focus interactions.

### Pattern 4: Mobile-First Responsive Grid

**What:** Base styles for mobile (1 column), progressively enhance for tablet (2 columns) and desktop (3 columns).

**Why:** Mobile-first ensures smallest screens work without media queries (fastest), then adds complexity for larger screens. Modern device distribution is 60%+ mobile.

**Example:**
```css
/* Source: CSS Grid Responsive Design: Mobile-First Approach - Medium */
/* Mobile: 1 column (no media query) */
.canvas-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.tile { grid-column: span 1; } /* All tiles single column */

/* Tablet: 2 columns */
@media (min-width: 768px) {
  .canvas-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .tile-ui-preview {
    grid-column: span 2; /* Full width on tablet */
  }
}

/* Desktop: 3 columns */
@media (min-width: 1024px) {
  .canvas-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .tile-imagery {
    grid-row: span 2; /* Enable row spanning on desktop */
  }

  .tile-ui-preview {
    grid-column: span 3; /* Full width on desktop */
  }
}
```

**Breakpoint rationale:**
- `768px`: Tablet landscape, iPad Mini+, larger phones horizontal
- `1024px`: Desktop, larger tablets, laptop screens

### Pattern 5: Keyboard Navigation with `:focus-visible`

**What:** Focus indicators only appear for keyboard navigation (Tab), not mouse clicks, meeting WCAG 2.4.13 requirements.

**Why:** Mouse users find persistent focus outlines distracting. `:focus-visible` applies styles only when keyboard is used, improving UX without sacrificing accessibility.

**Example:**
```css
/* Source: A guide to designing accessible WCAG-conformant focus indicators */
.tile {
  outline: none; /* Remove default */
}

.tile:focus-visible {
  outline: 2px solid #111;
  outline-offset: 2px;
  transition: outline-offset 200ms ease-out;
}

/* For interactive elements inside tiles */
button:focus-visible,
[role="button"]:focus-visible {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
}
```

**WCAG 2.4.13 requirements:**
- Minimum 2px thick outline
- 3:1 contrast ratio against background
- 2px offset for visibility separation

**Keyboard behavior:**
```typescript
// Add to tile components
<div
  className="tile"
  tabIndex={0}
  role="button"
  aria-label="Logo tile - click to edit"
  onClick={() => setEditingTile(id)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setEditingTile(id);
    }
    if (e.key === 'Escape' && isEditing) {
      setEditingTile(null);
    }
  }}
>
```

### Anti-Patterns to Avoid

- **Explicit grid line positioning** (`grid-column: 1 / 4`): Brittle when adding/removing tiles. Use `span` instead.
- **JavaScript-based layout calculations**: CSS Grid handles this natively. Measuring and positioning in JS causes layout thrashing.
- **`outline: none` without replacement**: Accessibility violation (WCAG 2.4.7 failure). Always provide alternative focus indicator.
- **Multiple edit panels open**: Breaks requirement LIVE-06 and confuses users. Enforce single active tile in state.
- **Opacity on containers with text**: Dims text readability. Use `rgba()` background colors or separate overlay layers.
- **Animation libraries for simple transitions**: 200ms opacity/transform transitions are native CSS. Libraries add bundle size for zero benefit.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Focus management in composite widgets | Custom focus trap logic | Native `tabindex` + `:focus-visible` | Browser handles tab order, focus rings, and keyboard events. Custom solutions miss edge cases (Shift+Tab, focus restoration). |
| Grid gap polyfills | Calculate margins/padding | CSS `gap` property | 98%+ browser support (IE11 is dead). No calculation needed, cleaner code. |
| Responsive breakpoints library | JavaScript resize listeners | CSS `@media` queries | Native, declarative, zero runtime cost. JS listeners cause performance issues. |
| Animation timing | `requestAnimationFrame` loops | CSS `transition` with `ease-out` | GPU-accelerated, respects `prefers-reduced-motion`, automatically optimized. |
| Keyboard event normalization | Custom key code maps | `e.key` with modern values | Modern browsers support `e.key` ('Enter', 'Escape', ' ') instead of keyCodes. No mapping needed. |

**Key insight:** Browser APIs for layout, focus, and animation matured significantly 2020-2025. Custom solutions add complexity without value.

## Common Pitfalls

### Pitfall 1: Implicit Grid Rows Breaking Layout

**What goes wrong:** CSS Grid auto-creates implicit rows when items overflow defined grid, causing unexpected tile placement and "Swiss cheese" gaps.

**Why it happens:** If you define `grid-template-columns` but not `grid-template-rows`, and place more items than fit, Grid creates implicit rows with `auto` height (content-based). This causes visual misalignment.

**How to avoid:**
```css
/* BAD: Implicit rows have auto height */
.canvas-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  /* No rows defined - implicit rows created */
}

/* GOOD: Explicit row sizing */
.canvas-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 180px; /* All rows same height */
}
```

**Warning signs:** Tiles with different heights, gaps appearing between tiles, layout shifts when content loads.

### Pitfall 2: `backdrop-filter` Broken on `position: sticky` in Firefox

**What goes wrong:** Frosted glass effect (`backdrop-filter`) stops working in Firefox when applied to `position: sticky` element if ancestor has both `overflow` and `border-radius`.

**Why it happens:** Known Firefox rendering bug with layering and clip paths when sticky positioning + overflow + border-radius combine.

**How to avoid:**
```css
/* BAD: Ancestor with overflow + border-radius breaks sticky backdrop-filter */
.canvas {
  overflow: auto;
  border-radius: 16px;
}

.tile-overlay {
  position: sticky; /* Will break in Firefox */
  backdrop-filter: blur(10px);
}

/* GOOD: Use fixed or absolute positioning for backdrop-filter */
.tile-overlay {
  position: absolute; /* Or fixed */
  backdrop-filter: blur(10px);
}
```

**Warning signs:** Frosted glass works in Chrome/Safari but not Firefox, works without sticky positioning.

**Source:** [Next-level frosted glass with backdrop-filter - Josh W. Comeau](https://www.joshwcomeau.com/css/backdrop-filter/)

### Pitfall 3: Missing `role="button"` Keyboard Support

**What goes wrong:** Adding `role="button"` to a `<div>` makes screen readers announce it as a button, but it doesn't add keyboard event handling. Users can focus it (with `tabIndex={0}`) but Enter/Space keys don't activate it.

**Why it happens:** Native `<button>` elements handle Enter and Space automatically. Custom ARIA buttons require manual event handlers.

**How to avoid:**
```typescript
// BAD: Incomplete ARIA button
<div role="button" tabIndex={0} onClick={handleClick}>
  Click me
</div>
// Screen reader says "button" but keyboard does nothing

// GOOD: Complete keyboard support
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // Prevent Space scrolling page
      handleClick();
    }
  }}
>
  Click me
</div>

// BEST: Use native button when possible
<button onClick={handleClick}>Click me</button>
```

**Warning signs:** Tab key focuses element but Enter/Space don't work, accessibility audit fails "keyboard navigation" checks.

**Source:** [Building Accessible Buttons with ARIA - Deque](https://www.deque.com/blog/accessible-aria-buttons/)

### Pitfall 4: Transition Flickering from Class Toggling

**What goes wrong:** Adding/removing CSS classes to trigger transitions causes visual flicker or animations playing backward when state changes rapidly.

**Why it happens:** React batch updates can apply/remove classes in same render, or rapid state changes (hover on/off) interrupt transitions mid-flight.

**How to avoid:**
```css
/* BAD: Separate classes cause flickering */
.tile { opacity: 1; }
.tile.dimmed { opacity: 0.6; }
.tile.editing { opacity: 1; }
/* Rapid editing → dimmed → editing causes flicker */

/* GOOD: Single property transition */
.tile {
  opacity: 1;
  transition: opacity 200ms ease-out;
}

/* Control opacity via inline style or CSS variable */
```

```typescript
// Inline style approach (most reliable)
<div
  className="tile"
  style={{ opacity: isDimmed ? 0.6 : 1 }}
>

// Or CSS variable approach
<div
  className="tile"
  style={{ '--tile-opacity': isDimmed ? 0.6 : 1 } as React.CSSProperties}
>
```

**Warning signs:** Tiles flash during state changes, transitions don't complete smoothly, opacity jumps instead of fading.

### Pitfall 5: Overusing CSS Grid When Flexbox Would Suffice

**What goes wrong:** Using CSS Grid for simple single-axis layouts (like a toolbar or list) adds unnecessary complexity and potential performance overhead.

**Why it happens:** Grid is powerful and trendy, developers default to it even when Flexbox would be simpler.

**How to avoid:**
```css
/* BAD: Grid overkill for single row */
.toolbar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
}

/* GOOD: Flexbox for single-axis layout */
.toolbar {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Use Grid when you need two-axis alignment */
.canvas-grid {
  display: grid; /* Correct - needs row AND column control */
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 180px;
}
```

**Warning signs:** Single row/column of items using Grid, no spanning tiles, layout could be `display: flex` with same result.

**Source:** [9 Biggest Mistakes with CSS Grid - Mozilla Hacks](https://hacks.mozilla.org/2018/07/9-biggest-mistakes-with-css-grid/)

## Code Examples

Verified patterns from official sources:

### Bento Grid with Responsive Breakpoints

```css
/* Source: Building a Bento Grid Layout with Modern CSS Grid */
.canvas {
  background: #FAFAF8; /* Warm off-white */
  min-height: 100vh;
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-grid {
  display: grid;
  grid-template-columns: 1fr; /* Mobile: single column */
  grid-auto-rows: 180px;
  gap: 8px;
  max-width: 1200px;
  width: 100%;
  grid-auto-flow: dense; /* Fill gaps automatically */
}

/* Tablet: 2 columns */
@media (min-width: 768px) {
  .canvas-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 3×3 grid */
@media (min-width: 1024px) {
  .canvas-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Tile base styles */
.tile {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  transition: opacity 200ms ease-out;
}

/* Tile spanning (desktop only) */
@media (min-width: 1024px) {
  .tile-imagery {
    grid-row: span 2; /* Spans 2 rows */
  }

  .tile-ui-preview {
    grid-column: span 3; /* Full width */
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .tile-ui-preview {
    grid-column: span 2; /* Full width on tablet */
  }
}
```

### Interactive Tile with Hover Overlay

```tsx
// Source: React Interactive patterns + CSS frosted glass
interface TileProps {
  id: string;
  children: React.ReactNode;
  label: string;
}

function InteractiveTile({ id, label, children }: TileProps) {
  const editingTileId = useCanvasStore(state => state.editingTileId);
  const setEditingTile = useCanvasStore(state => state.setEditingTile);

  const isEditing = editingTileId === id;
  const isDimmed = editingTileId !== null && !isEditing;

  return (
    <div
      className="tile"
      style={{ opacity: isDimmed ? 0.6 : 1 }}
      tabIndex={0}
      role="button"
      aria-label={`${label} - click to edit`}
      onClick={() => setEditingTile(isEditing ? null : id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setEditingTile(isEditing ? null : id);
        }
        if (e.key === 'Escape' && isEditing) {
          setEditingTile(null);
        }
      }}
    >
      {/* Tile content */}
      <div className="tile-content">
        {children}
      </div>

      {/* Hover overlay (only when not editing) */}
      {!isEditing && (
        <div className="tile-overlay">
          <span className="tile-overlay-label">{label}</span>
          <span className="tile-overlay-icon">✎</span>
        </div>
      )}

      {/* Inline edit panel */}
      {isEditing && (
        <EditPanel onClose={() => setEditingTile(null)} />
      )}
    </div>
  );
}
```

```css
/* Frosted glass overlay */
.tile-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 200ms ease-out;
  pointer-events: none;
}

.tile:hover .tile-overlay {
  opacity: 1;
}

.tile-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: inherit;
}

.tile-overlay-label,
.tile-overlay-icon {
  position: relative;
  z-index: 1;
  color: #111;
  font-weight: 500;
}

/* Focus indicator (keyboard only) */
.tile:focus-visible {
  outline: 2px solid #111;
  outline-offset: 2px;
}
```

### Zustand Store with Edit State

```typescript
// Source: Zustand and React Context - TkDodo
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface CanvasStore {
  // Existing state...
  editingTileId: string | null;

  // Actions
  setEditingTile: (tileId: string | null) => void;
}

export const useCanvasStore = create<CanvasStore>()(
  subscribeWithSelector((set) => ({
    // Existing state...
    editingTileId: null,

    setEditingTile: (tileId) => set({ editingTileId: tileId }),
  }))
);

// Subscribe to edit state changes for analytics/debugging
useCanvasStore.subscribe(
  (state) => state.editingTileId,
  (tileId) => {
    console.log('Now editing:', tileId);
  }
);
```

### Accessible Keyboard Navigation

```typescript
// Source: Developing a Keyboard Interface - WAI ARIA APG
function Canvas() {
  const tiles = ['logo', 'primary-font', 'imagery', 'colors', 'secondary-font', 'ui-preview'];

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let nextIndex = currentIndex;

    // Arrow key navigation
    if (e.key === 'ArrowRight' && currentIndex < tiles.length - 1) {
      nextIndex = currentIndex + 1;
    }
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    }
    if (e.key === 'ArrowDown' && currentIndex < tiles.length - 3) {
      nextIndex = currentIndex + 3; // Next row (3 columns)
    }
    if (e.key === 'ArrowUp' && currentIndex >= 3) {
      nextIndex = currentIndex - 3; // Previous row
    }

    if (nextIndex !== currentIndex) {
      e.preventDefault();
      const nextTile = document.querySelector(`[data-tile-index="${nextIndex}"]`) as HTMLElement;
      nextTile?.focus();
    }
  };

  return (
    <div className="canvas-grid" role="grid">
      {tiles.map((id, index) => (
        <div
          key={id}
          data-tile-index={index}
          role="gridcell"
          tabIndex={index === 0 ? 0 : -1}
          onKeyDown={(e) => handleKeyDown(e, index)}
        >
          <InteractiveTile id={id} />
        </div>
      ))}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach (2026) | When Changed | Impact |
|--------------|-------------------------|--------------|--------|
| Flexbox + JavaScript positioning for bento grids | CSS Grid with `grid-auto-flow: dense` | 2020-2022 | Eliminates layout thrashing, simpler code, native browser optimizations |
| `outline: 0` to hide focus rings | `:focus-visible` for keyboard-only indicators | 2022-2024 | Better UX for mouse users while maintaining accessibility |
| Polyfill for `backdrop-filter` | Native support in all modern browsers | 2021-2023 | 97%+ support, no library needed (just `-webkit-` prefix) |
| JavaScript animation libraries (GSAP, Framer Motion) for simple transitions | Native CSS transitions with GPU acceleration | Ongoing shift 2020-2025 | Smaller bundle size, better performance, respects `prefers-reduced-motion` |
| Fixed pixel breakpoints (320px, 768px, 1024px) | Content-based breakpoints with mobile-first | 2023-2025 | Better support for foldables, ultra-wide monitors, variable device sizes |
| `gap` property polyfills for older browsers | Native CSS `gap` support (98%+) | 2020-2022 | IE11 dead, no polyfill needed, cleaner code |

**Deprecated/outdated:**
- **Grid frameworks like Bootstrap Grid**: CSS Grid made these obsolete for custom layouts. Still useful for rapid prototyping but not needed for bespoke designs.
- **`grid-gap` property**: Renamed to just `gap` (works in Grid and Flexbox). Old name still works but deprecated.
- **JavaScript resize listeners for responsive layout**: CSS media queries are declarative and more performant. Only use JS for complex viewport-dependent logic (like measuring element dimensions).

## Open Questions

Things that couldn't be fully resolved:

1. **Safari `backdrop-filter` performance on older devices**
   - What we know: Works in Safari 15+ with `-webkit-` prefix, may lag on iPhone 8 and older
   - What's unclear: Exact performance threshold for disabling blur on low-end devices
   - Recommendation: Implement `@supports` fallback (solid background), test on iPhone 8/9 if target audience uses older devices

2. **Optimal edit panel positioning (inline vs overlay)**
   - What we know: Inline panels keep context visible (best practice), overlays are simpler to implement
   - What's unclear: How inline panel affects grid row height (auto-expansion vs fixed)
   - Recommendation: Test both approaches in prototype. Inline panel should expand tile vertically or use absolute positioning overlay within tile bounds (not modal)

3. **Tab order with spanning tiles**
   - What we know: DOM order determines tab order, visual grid order may differ
   - What's unclear: Should tab order follow visual grid (reading order) or DOM order (source order)?
   - Recommendation: Follow visual reading order (left-to-right, top-to-bottom). Render tiles in DOM in reading order even if CSS Grid places them differently visually. Use `order` property only when DOM order must differ for semantic reasons.

## Sources

### Primary (HIGH confidence)

- [Building a Bento Grid Layout with Modern CSS Grid - WeAreDevelopers](https://www.wearedevelopers.com/en/magazine/682/building-a-bento-grid-layout-with-modern-css-grid-682)
- [Next-level frosted glass with backdrop-filter - Josh W. Comeau](https://www.joshwcomeau.com/css/backdrop-filter/)
- [ARIA: button role - MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role)
- [:focus-visible - CSS MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible)
- [Understanding Success Criterion 2.4.13: Focus Appearance - W3C](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- [Zustand GitHub - pmndrs](https://github.com/pmndrs/zustand)
- [Using CSS transitions - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Transitions/Using)

### Secondary (MEDIUM confidence)

- [Responsive Design Breakpoints: 2025 Playbook - DEV](https://dev.to/gerryleonugroho/responsive-design-breakpoints-2025-playbook-53ih)
- [CSS Grid Responsive Design: Mobile-First Approach - Medium](https://medium.com/codetodeploy/css-grid-responsive-design-the-mobile-first-approach-that-actually-works-194bdab9bc52)
- [9 Biggest Mistakes with CSS Grid - Mozilla Hacks](https://hacks.mozilla.org/2018/07/9-biggest-mistakes-with-css-grid/)
- [Inline Edit - PatternFly](https://www.patternfly.org/components/inline-edit/design-guidelines/)
- [Zustand and React Context - TkDodo](https://tkdodo.eu/blog/zustand-and-react-context)
- [Building Accessible Buttons with ARIA - Deque](https://www.deque.com/blog/accessible-aria-buttons/)
- [Ten tips for better CSS transitions and animations - Josh Collinsworth](https://joshcollinsworth.com/blog/great-transitions)

### Tertiary (LOW confidence)

- [8 CSS Snippets for Creating Bento Grid Layouts - Speckyboy](https://speckyboy.com/css-bento-grid-layouts/)
- [React Interactive GitHub](https://github.com/rafgraph/react-interactive)
- [CSS Grid Impact on Web Performance - Savvy](https://savvy.co.il/en/blog/wordpress-speed/css-grid-web-performance/)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Native CSS features with 97%+ browser support, Zustand already in project
- Architecture: HIGH - Patterns verified with official documentation (MDN, W3C, Josh Comeau)
- Pitfalls: MEDIUM - Common mistakes documented in Mozilla Hacks and community sources, some require testing to verify

**Research date:** 2026-02-07
**Valid until:** 2026-03-07 (30 days - CSS/browser features are stable)
