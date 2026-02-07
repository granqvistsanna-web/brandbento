# Phase 9: Responsive Bento Layout System - Research

**Researched:** 2026-02-07
**Domain:** CSS Grid responsive bento layout with React/TypeScript
**Confidence:** MEDIUM/HIGH

## Summary

Bento grid layouts are a dominant UI/UX pattern in 2026, inspired by Japanese bento boxes with their orderly compartments. The challenge is creating a responsive grid that always forms a filled rectangle with no gaps, fits within viewport height, and maintains deterministic, stable layouts across breakpoints.

The standard approach uses **CSS Grid with `grid-auto-flow: dense`** for gap-filling, **dynamic viewport units (dvh/svh)** for proper mobile height handling, and **fixed row heights with span-based sizing** for predictable layouts. Modern implementations leverage **container queries** for component-level responsiveness, **ResizeObserver** for dynamic adjustments, and **Tailwind utilities** for rapid development.

Key challenge: Balancing `dense` packing (which fills gaps but breaks DOM order) with accessibility concerns for keyboard/screen reader navigation.

**Primary recommendation:** Use CSS Grid with explicit grid-template-areas for layout presets, fixed row heights (auto-rows-[Npx]), span-based tile sizing, and dvh units for viewport fitting. Avoid dense packing for interactive/navigable content; use it only for static galleries.

## Standard Stack

### Core Technologies

| Library/Feature | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| CSS Grid | Native | Layout engine | Only layout system that aligns items on both X/Y axes simultaneously without JavaScript position calculations |
| Tailwind CSS | 3.4+ | Utility-first styling | Already in codebase; provides responsive grid utilities (grid, grid-cols-*, md:grid-cols-*, auto-rows-[Npx]) |
| React 19 | 19.2.0 | UI framework | Already in codebase |
| Zustand | 5.0+ | State management | Already in codebase; ideal for managing layout presets, density settings, and breakpoint state |
| Framer Motion | 12.33.0 | Animations | Already in codebase; can animate layout changes |

### Supporting Features

| Feature | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Dynamic Viewport Units (dvh/svh) | CSS Native | Viewport height handling | Use dvh for mobile-safe 100vh that accounts for browser UI; fallback to vh for older browsers |
| Container Queries (@container) | CSS Native | Component-level responsiveness | Use for individual tiles that adapt to their container rather than viewport |
| ResizeObserver | Native API | Dynamic dimension tracking | Use with debouncing for responsive grid adjustments without window resize events |
| CSS env() | Native | Safe area handling | Use for mobile safe areas (notch, home indicator): `calc(100dvh - env(safe-area-inset-bottom))` |
| grid-auto-flow: dense | CSS Native | Gap filling | **Use only for non-navigable content** (galleries, decoration) due to accessibility issues |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS Grid dense | JavaScript bin-packing (Packery, BentoGrid.js) | JS algorithms offer more control over packing but add complexity, bundle size, and runtime overhead; only worth it for user-draggable layouts |
| Fixed pixel heights | Aspect-ratio + minmax() | More flexible but harder to predict; can cause overflow or gaps if not constrained properly |
| dvh | Traditional vh | vh doesn't account for mobile browser UI, causing content to be cut off; always prefer dvh with vh fallback |
| Media queries | Container queries | Media queries work for top-level grid, but container queries enable tile-level responsiveness for truly reusable components |

**Installation:**
```bash
# All core dependencies already installed
# Ensure Tailwind config includes grid utilities
# Add to tailwind.config.js:
# theme: {
#   extend: {
#     gridTemplateColumns: { /* custom grids */ },
#     gridTemplateRows: { /* custom rows */ }
#   }
# }
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── BentoGrid.tsx           # Main grid container component
│   ├── BentoTile.tsx           # Individual tile wrapper
│   └── layouts/
│       ├── LayoutPresets.ts    # Predefined grid-template-areas configs
│       └── DebugGrid.tsx       # Debug overlay showing grid cells
├── hooks/
│   ├── useViewportHeight.ts    # Manages dvh/vh with safe areas
│   ├── useBreakpoint.ts        # Zustand-based breakpoint detection
│   └── useGridDimensions.ts    # ResizeObserver for grid sizing
├── state/
│   └── layoutState.ts          # Zustand store for layout config
└── utils/
    ├── gridPresets.ts          # Layout preset configurations
    └── tileSpans.ts            # Breakpoint-specific span mappings
```

### Pattern 1: Layout Preset System with grid-template-areas

**What:** Define multiple layout presets as named grid-template-areas configurations
**When to use:** For deterministic, stable layouts that don't reorganize unexpectedly
**Example:**

```typescript
// src/utils/gridPresets.ts
export const GRID_PRESETS = {
  balanced: {
    cols: 12,
    rows: 6,
    areas: `
      "hero hero hero hero logo logo logo logo ui ui ui ui"
      "hero hero hero hero logo logo logo logo ui ui ui ui"
      "hero hero hero hero colors colors colors colors ui ui ui ui"
      "editorial editorial editorial editorial colors colors colors colors secondary secondary secondary secondary"
      "editorial editorial editorial editorial imagery imagery imagery imagery secondary secondary secondary secondary"
      "product product product product imagery imagery imagery imagery utility utility utility utility"
    `,
    rowHeight: 'minmax(120px, 1fr)', // Or fixed: '140px'
  },
  heroLeft: {
    cols: 12,
    rows: 6,
    areas: `
      "hero hero hero hero hero hero logo logo logo ui ui ui"
      "hero hero hero hero hero hero logo logo logo ui ui ui"
      "hero hero hero hero hero hero colors colors colors ui ui ui"
      "editorial editorial editorial editorial colors colors colors secondary secondary secondary secondary"
      "editorial editorial editorial editorial imagery imagery imagery secondary secondary secondary secondary"
      "product product product product imagery imagery imagery utility utility utility utility"
    `,
    rowHeight: '140px',
  },
  // ... more presets
};
```

```typescript
// src/components/BentoGrid.tsx
import { GRID_PRESETS } from '@/utils/gridPresets';
import { useLayoutStore } from '@/state/layoutState';

export const BentoGrid = ({ children }: { children: ReactNode }) => {
  const { preset, density } = useLayoutStore();
  const config = GRID_PRESETS[preset];
  const rowHeight = density === 'dense' ? '120px' : '140px';

  return (
    <div
      className="grid gap-4 p-4 h-[100dvh] h-[100vh]" // dvh first with vh fallback
      style={{
        gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
        gridTemplateRows: `repeat(${config.rows}, ${rowHeight})`,
        gridTemplateAreas: config.areas,
      }}
    >
      {children}
    </div>
  );
};
```

**Source:** [Build a bento layout with CSS grid](https://iamsteve.me/blog/bento-layout-css-grid), [CSS Grid grid-template-areas MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas)

### Pattern 2: Span-Based Responsive Tiles

**What:** Use span keyword with responsive breakpoint modifiers for tile sizing
**When to use:** For tiles that change size at different breakpoints
**Example:**

```typescript
// src/utils/tileSpans.ts
export const TILE_SPAN_MAP = {
  hero: {
    mobile: { colSpan: 4, rowSpan: 2 },    // Full width on mobile
    tablet: { colSpan: 6, rowSpan: 3 },    // Half width on tablet
    desktop: { colSpan: 4, rowSpan: 3 },   // 1/3 width on desktop
  },
  logo: {
    mobile: { colSpan: 4, rowSpan: 1 },
    tablet: { colSpan: 4, rowSpan: 2 },
    desktop: { colSpan: 4, rowSpan: 2 },
  },
  // ... more tiles
};
```

```tsx
// src/components/BentoTile.tsx
interface BentoTileProps {
  tileId: string;
  gridArea?: string; // For preset-based layouts
  children: ReactNode;
}

export const BentoTile = ({ tileId, gridArea, children }: BentoTileProps) => {
  const spans = TILE_SPAN_MAP[tileId] || { mobile: { colSpan: 2, rowSpan: 1 } };

  return (
    <div
      className={cn(
        // Mobile (default - single column or 4-col grid)
        `col-span-${spans.mobile.colSpan} row-span-${spans.mobile.rowSpan}`,
        // Tablet (md breakpoint - 8-col grid)
        `md:col-span-${spans.tablet.colSpan} md:row-span-${spans.tablet.rowSpan}`,
        // Desktop (lg breakpoint - 12-col grid)
        `lg:col-span-${spans.desktop.colSpan} lg:row-span-${spans.desktop.rowSpan}`,
        "rounded-lg overflow-hidden"
      )}
      style={{ gridArea }} // Use grid-area if preset-based
    >
      {children}
    </div>
  );
};
```

**Source:** [Building a Bento Grid Layout with Modern CSS Grid](https://www.wearedevelopers.com/en/magazine/682/building-a-bento-grid-layout-with-modern-css-grid-682)

### Pattern 3: Viewport Height with Safe Areas

**What:** Use dvh with fallback and safe-area-inset for mobile-safe viewport fitting
**When to use:** Always for full-height layouts on mobile
**Example:**

```typescript
// src/hooks/useViewportHeight.ts
import { useEffect, useState } from 'react';

export const useViewportHeight = () => {
  const [vh, setVh] = useState('100vh');

  useEffect(() => {
    // Check if dvh is supported
    const supportsDvh = CSS.supports('height', '100dvh');

    if (supportsDvh) {
      setVh('100dvh');
    } else {
      // Fallback: calculate vh accounting for mobile browser UI
      const updateVh = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };

      updateVh();
      window.addEventListener('resize', updateVh);
      return () => window.removeEventListener('resize', updateVh);
    }
  }, []);

  return vh;
};
```

```css
/* In CSS or Tailwind config */
.grid-container {
  /* First try dvh (modern browsers) */
  height: 100dvh;
  /* Fallback to vh (older browsers) */
  height: 100vh;
  /* Account for safe areas on notched devices */
  height: calc(100dvh - env(safe-area-inset-bottom));

  /* Ensure content doesn't overflow */
  max-height: 100dvh;
  overflow: hidden;
}
```

**Source:** [Understanding dvh: The CSS Dynamic Viewport Height](https://mayank1513.medium.com/understanding-dvh-the-css-dynamic-viewport-height-9ddf70a77c6c), [Mobile-Friendly Footers](https://www.ianjmacintosh.com/articles/mobile-friendly-footers/)

### Pattern 4: Breakpoint Management with Zustand

**What:** Centralize breakpoint state in Zustand for consistent responsive behavior
**When to use:** When multiple components need to know current breakpoint
**Example:**

```typescript
// src/state/layoutState.ts
import { create } from 'zustand';

interface LayoutState {
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  preset: 'balanced' | 'heroLeft' | 'heroCenter' | 'stacked';
  density: 'cozy' | 'dense';
  debugMode: boolean;
  setBreakpoint: (bp: LayoutState['breakpoint']) => void;
  setPreset: (preset: LayoutState['preset']) => void;
  setDensity: (density: LayoutState['density']) => void;
  toggleDebug: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  breakpoint: 'desktop',
  preset: 'balanced',
  density: 'cozy',
  debugMode: false,
  setBreakpoint: (breakpoint) => set({ breakpoint }),
  setPreset: (preset) => set({ preset }),
  setDensity: (density) => set({ density }),
  toggleDebug: () => set((state) => ({ debugMode: !state.debugMode })),
}));
```

```typescript
// src/hooks/useBreakpoint.ts
import { useEffect } from 'react';
import { useLayoutStore } from '@/state/layoutState';

const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;

export const useBreakpoint = () => {
  const setBreakpoint = useLayoutStore((s) => s.setBreakpoint);

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= BREAKPOINTS.desktop) {
        setBreakpoint('desktop');
      } else if (width >= BREAKPOINTS.tablet) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('mobile');
      }
    };

    updateBreakpoint();

    // Debounce to avoid excessive updates
    let timeoutId: NodeJS.Timeout;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateBreakpoint, 100);
    };

    window.addEventListener('resize', debouncedUpdate);
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      clearTimeout(timeoutId);
    };
  }, [setBreakpoint]);
};
```

**Source:** [Zustand GitHub Discussions - Layout Context](https://github.com/pmndrs/zustand/discussions/1590), [useWindowSize Hook Guide (2026)](https://react.wiki/hooks/window-size/)

### Pattern 5: Debug Mode with Grid Visualization

**What:** Overlay showing grid cell boundaries and tile IDs
**When to use:** Development and QA to verify layout correctness
**Example:**

```tsx
// src/components/layouts/DebugGrid.tsx
import { useLayoutStore } from '@/state/layoutState';

export const DebugGrid = () => {
  const { debugMode, preset } = useLayoutStore();
  const config = GRID_PRESETS[preset];

  if (!debugMode) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-50"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
        gridTemplateRows: `repeat(${config.rows}, 1fr)`,
        gap: '1rem',
      }}
    >
      {Array.from({ length: config.cols * config.rows }).map((_, i) => (
        <div
          key={i}
          className="border border-pink-500/30 bg-pink-500/5 flex items-center justify-center"
        >
          <span className="text-[10px] text-pink-600 font-mono">{i + 1}</span>
        </div>
      ))}
    </div>
  );
};
```

Usage in BentoGrid:
```tsx
<div className="relative">
  <BentoGrid>{tiles}</BentoGrid>
  <DebugGrid />
</div>
```

### Anti-Patterns to Avoid

- **grid-auto-flow: dense for interactive content:** Breaks tab order and screen reader navigation. Only use for static galleries.
  - Source: [Grid layout and accessibility - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Grid_layout_and_accessibility)

- **Mixing auto-fit/auto-fill with explicit areas:** Creates unpredictable layouts. Choose one approach.
  - Source: [Auto-Sizing Columns in CSS Grid](https://css-tricks.com/auto-sizing-columns-css-grid-auto-fill-vs-auto-fit/)

- **Using dvh for every element:** Causes layout thrashing on scroll. Use dvh for container, fixed px or fr for children.
  - Source: [Mastering Modern Viewport Units](https://dev.to/softheartengineer/mastering-modern-viewport-units-svh-lvh-and-dvh-for-responsive-web-design-5de9)

- **No fallback for dvh:** Breaks on older browsers. Always provide vh fallback.

- **Percentage-based row heights in grid:** Unpredictable with varying content. Use fixed px or minmax().

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Window resize detection | Custom event listeners without debouncing | ResizeObserver with debounce (100-150ms) or matchMedia for breakpoints | Prevents performance issues from hundreds of resize events per second; matchMedia is more efficient for breakpoint detection |
| Viewport height calculation | Manual window.innerHeight tracking | CSS dvh/svh units with vh fallback | Browser-native solution handles mobile UI changes automatically; custom JS can't account for soft keyboard, browser chrome |
| Breakpoint management | Multiple window.matchMedia() calls | Centralized Zustand store with single listener | Avoids duplicate listeners, provides single source of truth, enables time-travel debugging |
| Grid gap filling | Custom JavaScript bin-packing algorithm | CSS grid-auto-flow: dense (for static content only) | Native CSS is faster, simpler; only reach for JS (Packery, BentoGrid.js) if you need user dragging |
| Safe area handling | Manual iOS detection and padding | CSS env(safe-area-inset-*) | Works across all devices with notches/rounded corners, automatically updated by OS |
| Responsive grid columns | Nested media queries for each breakpoint | repeat(auto-fit, minmax(Npx, 1fr)) or Tailwind's responsive grid utilities | Fewer breakpoints needed, more fluid responsiveness |

**Key insight:** CSS Grid and modern viewport units handle 95% of responsive layout needs without JavaScript. Only add JS for dynamic content changes, user interactions, or calculations that CSS can't express.

## Common Pitfalls

### Pitfall 1: The "Swiss Cheese" Layout (Empty Gaps)

**What goes wrong:** Gaps appear in the grid at certain breakpoints, especially when tiles have different spans and auto-placement is used.

**Why it happens:** Without `grid-auto-flow: dense`, CSS Grid places items in source order and leaves gaps when a large item doesn't fit in the next available space.

**How to avoid:**
- Use explicit `grid-template-areas` for predictable layouts (recommended for accessible content)
- OR use `grid-auto-flow: dense` for galleries/decorative content (with accessibility caveats)
- Always define fixed row heights (`auto-rows-[Npx]`) for predictable tall item sizing

**Warning signs:** Visual gaps appear when resizing, layout looks "broken" at certain widths

**Source:** [Building a Bento Grid Layout](https://www.wearedevelopers.com/en/magazine/682/building-a-bento-grid-layout-with-modern-css-grid-682)

### Pitfall 2: Accessibility Issues with dense Packing

**What goes wrong:** Keyboard tab order and screen reader navigation become chaotic and disconnected from visual layout.

**Why it happens:** `grid-auto-flow: dense` changes visual order but NOT DOM/tab order. Users tab through items in source order while seeing them in a different visual order.

**How to avoid:**
- Never use `dense` for forms, interactive controls, or navigable content
- Only use for image galleries, decorative tiles, or purely visual content
- Document tab order expectations for QA testing
- Consider adding aria-label descriptions that match visual order

**Warning signs:** QA reports confusing tab navigation, screen reader users complain about jumpy reading order

**Quote from experts:** "Using dense can be 'a bit terrible for accessibility… keyboard and AT navigations will be a mess with the cursor jumping everywhere without following the source content flow.'" - MDN Contributors

**Source:** [Grid layout and accessibility - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Grid_layout_and_accessibility), [The Dark Side of the Grid Part 2](https://www.matuzo.at/blog/the-dark-side-of-the-grid-part-2/)

### Pitfall 3: Mobile Browser UI Cutting Off Content

**What goes wrong:** On mobile, bottom content is hidden beneath browser UI when using `height: 100vh`.

**Why it happens:** Traditional `vh` is calculated based on maximum viewport (when browser UI is hidden), but browser UI is often visible on initial load, reducing visible area.

**How to avoid:**
- Use `100dvh` (dynamic viewport height) with `100vh` fallback
- Subtract safe area insets: `calc(100dvh - env(safe-area-inset-bottom))`
- Test on actual mobile devices, especially iOS Safari
- Consider using `100svh` (small viewport height) for min-height to guarantee visibility

**Warning signs:** Users report content cut off at bottom on mobile, can't see important UI elements

**Correct pattern:**
```css
.grid-container {
  height: 100vh; /* Fallback for older browsers */
  height: 100dvh; /* Modern browsers - adjusts for browser UI */
  max-height: calc(100dvh - env(safe-area-inset-bottom)); /* Account for safe areas */
}
```

**Source:** [Understanding Mobile Viewport Units](https://medium.com/@tharunbalaji110/understanding-mobile-viewport-units-a-complete-guide-to-svh-lvh-and-dvh-0c905d96e21a), [How to Fix CSS 100vh Being Too Tall on Mobile](https://www.codegenes.net/blog/css-100vh-is-too-tall-on-mobile-due-to-browser-ui/)

### Pitfall 4: Layout Thrashing from Excessive dvh Usage

**What goes wrong:** Layout becomes laggy/janky on scroll, especially on older/slower mobile devices.

**Why it happens:** dvh recalculates as browser UI expands/collapses, but not at 60fps. Overusing dvh for multiple elements causes layout thrashing.

**How to avoid:**
- Use dvh ONLY on the main grid container
- Use fixed px, fr units, or percentages for child elements
- Debounce resize handlers (100-150ms)
- Test on older devices (iPhone 8, low-end Android)

**Warning signs:** Scroll feels janky, layout shifts noticeably during scroll, performance issues on older devices

**Expert advice:** "Using dvh for every element was a mistake. The constant layout shifts felt broken. Users complained." - Frontend developer testimonial

**Source:** [Mastering Modern Viewport Units](https://dev.to/softheartengineer/mastering-modern-viewport-units-svh-lvh-and-dvh-for-responsive-web-design-5de9)

### Pitfall 5: Unpredictable Tile Overflow

**What goes wrong:** Tile content overflows its container or gets cut off, especially text content.

**Why it happens:** Grid items with intrinsic content size can cause unexpected sizing. Text content especially can overflow if not constrained.

**How to avoid:**
- Add `min-width: 0` to grid items with text content (prevents text from expanding grid)
- Use `overflow: hidden` or `overflow: auto` on tiles
- Set explicit max heights for tiles with dynamic content
- Use `line-clamp` for text truncation

**Warning signs:** Text overflows tile boundaries, tiles push grid cells larger than expected

```css
.bento-tile {
  min-width: 0; /* Crucial for text overflow */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
```

**Source:** [CSS Grid Max-Width Best Practices](https://copyprogramming.com/howto/css-grid-layout-with-max-width-centered-content)

### Pitfall 6: Single-Column Cascade on Mobile

**What goes wrong:** On mobile, all tiles stack into a single column, losing the bento aesthetic and creating a very long scroll.

**Why it happens:** Default responsive behavior often collapses to single column on small screens.

**How to avoid:**
- Define mobile-specific grid (e.g., 2 or 4 columns instead of 1)
- Remap spans for mobile: hero tiles might go from span-4 to span-2
- Consider a mobile-specific preset with tighter, more compact arrangement
- Maintain visual hierarchy even on mobile (hero tiles still prominent)

**Warning signs:** Mobile layout looks like a basic list, loses visual interest

**Recommendation:** "Predefine span remaps for common breakpoints (e.g., 12→8→4 columns) to prevent awkward single-column cascades; ensure hero tiles collapse into prominent stacks while preserving the importance order."

**Source:** [Bento Grids for AI Dashboards](https://baltech.in/blog/bento-grids-for-ai-dashboards/)

### Pitfall 7: Missing Debug/QA Verification

**What goes wrong:** Layout issues discovered late in production, hard to reproduce or diagnose.

**Why it happens:** No visual debugging tools to verify grid structure during development.

**How to avoid:**
- Implement debug mode toggle showing grid cell boundaries and IDs
- Add visual indicators for tile spans (e.g., data attributes visible in dev tools)
- Log layout calculations in development
- Test with different numbers of tiles (6, 8, 10, 12, 14)

**Warning signs:** Layout issues reported by users that are hard to reproduce

## Code Examples

Verified patterns from official sources:

### Responsive Bento Grid with Tailwind

**Example 1: Fixed Grid with Responsive Spans**

```tsx
// Basic responsive bento grid - fills container
<div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 auto-rows-[140px] gap-4 h-[100dvh] h-[100vh] p-4">
  {/* Hero tile - full width mobile, half tablet, 1/3 desktop */}
  <div className="col-span-4 row-span-2 md:col-span-6 md:row-span-3 lg:col-span-4 lg:row-span-3">
    <HeroTile />
  </div>

  {/* Logo - full width mobile, half tablet, 1/3 desktop */}
  <div className="col-span-4 row-span-1 md:col-span-4 md:row-span-2 lg:col-span-4 lg:row-span-2">
    <LogoTile />
  </div>

  {/* UI Preview - full width mobile, full tablet, 1/3 desktop */}
  <div className="col-span-4 row-span-2 md:col-span-8 md:row-span-3 lg:col-span-4 lg:row-span-3">
    <UIPreviewTile />
  </div>

  {/* More tiles... */}
</div>
```

**Source:** [How to build a Responsive Bento Grid with Tailwind CSS](https://dev.to/velox-web/how-to-build-a-responsive-bento-grid-with-tailwind-css-no-masonryjs-3f2c)

### Viewport Height with Safe Areas

**Example 2: Mobile-Safe Container**

```tsx
// Component with proper viewport height handling
import { useEffect } from 'react';

export const BentoContainer = ({ children }) => {
  useEffect(() => {
    // Fallback for older browsers that don't support dvh
    const setVhProperty = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVhProperty();
    window.addEventListener('resize', setVhProperty);
    return () => window.removeEventListener('resize', setVhProperty);
  }, []);

  return (
    <div
      className="grid gap-4 p-4"
      style={{
        // Modern browsers - dynamic viewport
        height: 'calc(100dvh - env(safe-area-inset-bottom))',
        // Fallback for older browsers
        maxHeight: 'calc(var(--vh, 1vh) * 100)',
      }}
    >
      {children}
    </div>
  );
};
```

**Source:** [Mobile-Friendly Footers](https://www.ianjmacintosh.com/articles/mobile-friendly-footers/)

### Grid Preset with grid-template-areas

**Example 3: Named Grid Areas**

```css
/* Deterministic layout with named areas */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(6, 140px);
  grid-template-areas:
    "hero hero hero hero logo logo logo logo ui ui ui ui"
    "hero hero hero hero logo logo logo logo ui ui ui ui"
    "hero hero hero hero colors colors colors colors ui ui ui ui"
    "editorial editorial editorial editorial colors colors colors colors secondary secondary secondary secondary"
    "editorial editorial editorial editorial imagery imagery imagery imagery secondary secondary secondary secondary"
    "product product product product imagery imagery imagery imagery utility utility utility utility";
  gap: 1rem;
  height: 100dvh;
  padding: 1rem;
}

.tile-hero { grid-area: hero; }
.tile-logo { grid-area: logo; }
.tile-ui { grid-area: ui; }
.tile-colors { grid-area: colors; }
.tile-editorial { grid-area: editorial; }
.tile-secondary { grid-area: secondary; }
.tile-imagery { grid-area: imagery; }
.tile-product { grid-area: product; }
.tile-utility { grid-area: utility; }
```

**Source:** [Build a bento layout with CSS grid](https://iamsteve.me/blog/bento-layout-css-grid)

### ResizeObserver with Debouncing

**Example 4: Efficient Grid Resizing**

```typescript
// src/hooks/useGridDimensions.ts
import { useEffect, useRef, useState } from 'react';

export const useGridDimensions = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = gridRef.current;
    if (!element) return;

    let timeoutId: NodeJS.Timeout;

    const resizeObserver = new ResizeObserver((entries) => {
      // Debounce to avoid excessive updates
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }, 150); // 150ms debounce
    });

    resizeObserver.observe(element);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, []);

  return { gridRef, dimensions };
};
```

**Source:** [Using the ResizeObserver API in React](https://blog.logrocket.com/using-resizeobserver-react-responsive-designs/)

### Responsive Grid with clamp() and minmax()

**Example 5: Fluid Spacing and Sizing**

```css
/* Fluid grid with auto-fit and dynamic gaps */
.bento-grid-auto {
  display: grid;
  /* Auto-fit columns with min 250px, max 1fr */
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  /* Fixed row height */
  grid-auto-rows: 140px;
  /* Fluid gap that scales with viewport */
  gap: clamp(0.5rem, 2vw, 2rem);
  height: 100dvh;
  padding: clamp(0.5rem, 2vw, 2rem);
}

/* Items can span multiple columns */
.tile-large {
  grid-column: span 2;
  grid-row: span 2;
}

.tile-medium {
  grid-column: span 2;
  grid-row: span 1;
}
```

**Source:** [Intrinsically Responsive CSS Grid with minmax()](https://www.evanminto.com/blog/intrinsically-responsive-css-grid-minmax-min/)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flexbox with row wrapping | CSS Grid with grid-template-areas | 2020-2022 | Grid is only layout system that aligns on both axes without JS calculations |
| JavaScript masonry libraries (Packery, Masonry.js) | CSS grid-auto-flow: dense | 2021-2023 | Native CSS is faster, simpler; JS only needed for draggable layouts |
| Media queries only | Container queries (@container) | 2023-2025 | Component-level responsiveness, truly reusable components |
| 100vh | 100dvh/100svh/100lvh | 2023-2025 | Proper mobile browser UI handling, no content cutoff |
| JavaScript viewport detection | CSS env(safe-area-inset-*) | 2020-2023 | OS-native safe area handling for notches, rounded corners |
| Multiple media query breakpoints | clamp() with viewport units | 2022-2024 | Fewer breakpoints, more fluid responsiveness |
| Manual window.matchMedia | ResizeObserver API | 2020-2023 | More efficient, element-specific resize detection |

**Deprecated/outdated:**
- **Flexbox-based bento grids:** Flexbox doesn't align items on both X/Y axes; rows end up with uneven heights. CSS Grid is the only correct choice.
- **JavaScript bin-packing for static content:** CSS `grid-auto-flow: dense` handles gap-filling natively; only use JS (Packery) for draggable/sortable grids.
- **Fixed pixel breakpoints only:** Modern approach uses `clamp()` and `minmax()` for fluid scaling between constraints.
- **Traditional 100vh:** Replaced by 100dvh (with vh fallback) to handle mobile browser UI properly.

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal tile count range**
   - What we know: Success criteria specify 6-14 tiles
   - What's unclear: Whether layout presets should define exactly which tiles are required, or support variable counts
   - Recommendation: Design presets for a fixed tile set (e.g., always 9 tiles), then implement graceful degradation if tiles are added/removed dynamically

2. **Graceful degradation strategy for tile overflow**
   - What we know: Success criteria mention "priority-based hiding" but no specifics on priority system
   - What's unclear: How to determine priority (manual assignment? tile type? position in grid?)
   - Recommendation: Add priority property to tile config (1-5), hide lowest priority tiles when grid constraints can't accommodate all tiles; show warning in debug mode

3. **Performance on low-end mobile devices**
   - What we know: dvh can cause lag on older devices; ResizeObserver needs debouncing
   - What's unclear: What's the acceptable performance threshold? 60fps? 30fps?
   - Recommendation: Target 60fps on devices from 2020+, 30fps on older; provide "reduced motion" mode that disables animations and uses svh instead of dvh

4. **Container query support level**
   - What we know: Container queries are well-supported in 2026 but may have edge cases
   - What's unclear: Should we use container queries for tile-level responsiveness or stick to media queries?
   - Recommendation: Use media queries for top-level grid breakpoints (mobile/tablet/desktop), reserve container queries for individual tile internal layout if needed

## Sources

### Primary (HIGH confidence)

- [Build a bento layout with CSS grid • iamsteve](https://iamsteve.me/blog/bento-layout-css-grid) - Complete guide to bento layout patterns
- [Building a Bento Grid Layout with Modern CSS Grid](https://www.wearedevelopers.com/en/magazine/682/building-a-bento-grid-layout-with-modern-css-grid-682) - Modern CSS Grid techniques
- [Grid layout and accessibility - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Grid_layout_and_accessibility) - Official accessibility guidance
- [Auto-placement in grid layout - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Auto-placement) - Grid auto-placement reference
- [Understanding dvh: The CSS Dynamic Viewport Height](https://mayank1513.medium.com/understanding-dvh-the-css-dynamic-viewport-height-9ddf70a77c6c) - Viewport height units guide
- [Understanding Mobile Viewport Units: svh, lvh, and dvh](https://medium.com/@tharunbalaji110/understanding-mobile-viewport-units-a-complete-guide-to-svh-lvh-and-dvh-0c905d96e21a) - Complete viewport units guide
- [Mobile-Friendly Footers](https://www.ianjmacintosh.com/articles/mobile-friendly-footers/) - Safe area handling patterns

### Secondary (MEDIUM confidence)

- [How to build a Responsive Bento Grid with Tailwind CSS](https://dev.to/velox-web/how-to-build-a-responsive-bento-grid-with-tailwind-css-no-masonryjs-3f2c) - Tailwind-specific implementation
- [Let's Create a Bento Box Design Layout Using Modern CSS](https://www.codemotion.com/magazine/frontend/lets-create-a-bento-box-design-layout-using-modern-css/) - Modern CSS patterns
- [The Dark Side of the Grid Part 2](https://www.matuzo.at/blog/the-dark-side-of-the-grid-part-2/) - Grid accessibility pitfalls
- [Auto-Sizing Columns in CSS Grid: auto-fill vs auto-fit](https://css-tricks.com/auto-sizing-columns-css-grid-auto-fill-vs-auto-fit/) - Grid auto-sizing reference
- [Using the ResizeObserver API in React](https://blog.logrocket.com/using-resizeobserver-react-responsive-designs/) - ResizeObserver patterns
- [Intrinsically Responsive CSS Grid with minmax() and min()](https://www.evanminto.com/blog/intrinsically-responsive-css-grid-minmax-min/) - Advanced grid sizing
- [Zustand GitHub Discussions - Layout Context](https://github.com/pmndrs/zustand/discussions/1590) - State management patterns
- [Bento Grids for AI Dashboards](https://baltech.in/blog/bento-grids-for-ai-dashboards/) - Layout strategies and breakpoint advice
- [Container queries in 2026](https://blog.logrocket.com/container-queries-2026/) - Modern container query usage

### Tertiary (LOW confidence - WebSearch only, marked for validation)

- [BentoGrids.com](https://bentogrids.com/) - Design inspiration gallery
- [Neue Bento Layouts With Grid Has And Container Queries](https://nerdy.dev/neue-bento-layouts-with-grid-has-and-container-queries) - Advanced techniques
- [BentoGrid.js](https://bentogrid.mariohamann.com/) - JavaScript library (alternative approach)

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** - CSS Grid, Tailwind, React/Zustand already in use; dvh/container queries are well-documented
- Architecture: **MEDIUM** - Patterns verified in multiple sources but not tested in this specific codebase
- Pitfalls: **HIGH** - Well-documented accessibility issues, viewport problems, performance concerns

**Research date:** 2026-02-07
**Valid until:** ~30 days (stable domain, minimal framework churn expected)

**Key risks:**
1. Accessibility compliance with dense packing (mitigated by using grid-template-areas instead)
2. Mobile browser UI handling (mitigated by dvh + safe-area-inset pattern)
3. Performance on older devices (needs testing, can mitigate with reduced motion mode)

**Recommended next steps for planner:**
1. Choose layout strategy: grid-template-areas (recommended for accessibility) vs. span-based with breakpoints
2. Define specific layout presets (balanced, hero-left, hero-center, stacked)
3. Create tile priority system for graceful degradation
4. Plan debug mode implementation
5. Identify performance budget and testing devices
