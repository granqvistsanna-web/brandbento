# Phase 5: System View - Research

**Researched:** 2026-02-07
**Domain:** Reactive UI preview with live updates, font loading, CSS transitions
**Confidence:** HIGH

## Summary

Phase 5 requires building a reactive UI preview tile that updates within 100ms when any brand asset changes (fonts, colors, images, logo). The core challenge is achieving perceived instant updates (<100ms) with smooth transitions (120-180ms ease-out) while preventing flickering, especially during font swaps.

The standard approach uses Zustand's `subscribeWithSelector` middleware for granular state subscriptions, CSS Font Loading API (`document.fonts.ready`) for font preloading, and CSS transitions with GPU acceleration (`transform`, `opacity`) for smooth visual updates. React 19's concurrent rendering is already in use, providing automatic optimizations.

**Primary recommendation:** Subscribe to specific brand asset slices using Zustand selectors with shallow comparison, preload Google Fonts using the FontFace API before applying them, and use CSS transitions on GPU-accelerated properties (`opacity`, `transform`) to achieve sub-100ms perceived updates with smooth 120-180ms transitions.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | 5.0+ | State management with selective subscriptions | Already in use; `subscribeWithSelector` middleware enables granular reactivity for optimal performance |
| CSS Font Loading API | Native | Font preloading and ready detection | Native browser API, better control than webfontloader, no dependencies |
| Google Fonts API v2 | CSS2 | Font delivery with display=swap | Standard font CDN, supports variable fonts, display=swap prevents FOIT |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React 19 | 19.2+ | Concurrent rendering, automatic batching | Already in use; concurrent features optimize update scheduling automatically |
| `useShallow` hook | Built-in (Zustand) | Prevent re-renders on object selectors | When selecting multiple state properties as object |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native FontFace API | webfontloader npm package | webfontloader adds dependency, abstracts font events, but native API provides more control and zero dependencies |
| CSS transitions | Framer Motion / react-spring | Animation libraries add bundle size (~30-50kb), overkill for simple opacity/transform transitions |
| Zustand selectors | React Context | Context causes re-renders of entire subtree, Zustand allows surgical updates |

**Installation:**
```bash
# No new dependencies needed
# Zustand 5.0+ already installed
# CSS Font Loading API is native browser API
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── tiles/
│       └── UIPreviewTile.tsx         # Reactive preview component
├── hooks/
│   └── useFontLoader.ts              # Font preloading hook
├── state/
│   └── canvasState.ts                # Already has subscribeWithSelector
└── styles/
    └── transitions.css               # Reusable transition classes
```

### Pattern 1: Selective State Subscription for Live Updates
**What:** Subscribe to specific brand asset slices to trigger re-renders only when relevant data changes
**When to use:** Any component that displays brand assets (UI preview, font tiles, color tiles)
**Example:**
```typescript
// Source: https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow
import { useShallow } from 'zustand/react/shallow';
import { useCanvasStore } from '@/state/canvasState';

function UIPreviewTile() {
  // Subscribe only to brand assets needed for preview
  const { primaryFont, secondaryFont, colors, heroImage, logo } = useCanvasStore(
    useShallow((state) => ({
      primaryFont: state.assets.primaryFont,
      secondaryFont: state.assets.secondaryFont,
      colors: state.assets.colors,
      heroImage: state.assets.heroImage,
      logo: state.assets.logo,
    }))
  );

  // Component re-renders ONLY when these specific values change
  // Not when tileSettings or editingTileId changes
}
```

### Pattern 2: Font Preloading with FontFace API
**What:** Load Google Fonts programmatically before applying to prevent FOIT/FOUT
**When to use:** Any time a font changes (user selects new font, state hydrates)
**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API
const loadGoogleFont = async (family: string, weight: string = '400'): Promise<void> => {
  // Construct Google Fonts v2 URL with display=swap
  const fontUrl = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&display=swap`;

  // Fetch CSS to extract woff2 URL
  const response = await fetch(fontUrl);
  const css = await response.text();
  const woff2Match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/);

  if (!woff2Match) throw new Error('Font URL not found');

  // Create FontFace and add to document
  const fontFace = new FontFace(family, `url(${woff2Match[1]})`, {
    weight,
    style: 'normal',
  });

  document.fonts.add(fontFace);

  // Load font before using
  await fontFace.load();

  // Wait for layout completion
  await document.fonts.ready;
};

// Usage in component
useEffect(() => {
  loadGoogleFont(primaryFont, '400').catch(console.error);
}, [primaryFont]);
```

### Pattern 3: GPU-Accelerated CSS Transitions
**What:** Use `transform` and `opacity` with `will-change` for smooth 120-180ms transitions
**When to use:** All visual updates in UI preview (font swap, color change, image swap)
**Example:**
```css
/* Source: https://www.lexo.ch/blog/2025/01/boost-css-performance-with-will-change-and-transform-translate3d-why-gpu-acceleration-matters/ */
.ui-preview-element {
  /* GPU-accelerated properties only */
  transition: opacity 150ms ease-out, transform 150ms ease-out;
  will-change: opacity, transform;
}

/* Font swap: fade out, change font-family, fade in */
.ui-preview-element.updating {
  opacity: 0;
  transform: translateY(2px); /* Subtle vertical shift */
}

/* Color swap: immediate (no transition flicker) */
.ui-preview-element {
  /* Colors update immediately, no transition */
  background-color: var(--brand-primary);
  color: var(--brand-text);
}
```

### Pattern 4: Exclusive Panel Management (One at a Time)
**What:** Close previous edit panel when opening new one
**When to use:** Already implemented in canvasState.ts via `editingTileId`
**Example:**
```typescript
// Source: Existing codebase pattern
// Current implementation in canvasState.ts already handles this
setEditingTile: (tileId) => set({ editingTileId: tileId })

// When user clicks tile:
// - If tileId is different from current, previous panel auto-closes
// - If tileId is same as current, panel toggles closed
// - UIPreviewTile has nonInteractive=true, so cannot open panel
```

### Anti-Patterns to Avoid
- **Transitioning all properties**: `transition: all 150ms` causes flickering on layout changes. Only transition `opacity` and `transform`.
- **Selecting entire state object**: `useCanvasStore(state => state)` causes re-renders on ANY state change, not just relevant asset changes.
- **Font loading in render**: Never call `loadGoogleFont()` during render; use `useEffect` with dependency array.
- **Using `transform: translate()` (2D)**: Use `transform: translate3d()` or `translateZ(0)` to trigger GPU acceleration.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font loading without flash | Custom font loader with setTimeout/polling | CSS Font Loading API (`document.fonts.ready`) | Native API handles font status, timing, and layout completion correctly; custom solutions miss edge cases like font load failures, cached fonts, or multiple weights |
| Preventing re-renders on object selectors | Custom memoization with useMemo/useCallback | Zustand's `useShallow` hook | Zustand's shallow comparison is optimized for store selectors; custom memoization requires manual dependency tracking and can still miss reference equality issues |
| GPU acceleration detection | Feature detection and fallback logic | CSS `will-change` and `transform: translate3d` | Browser handles GPU availability automatically; manual detection is error-prone across devices/drivers |
| Transition timing coordination | JavaScript-based animation queue | CSS transitions with `transitionend` event | CSS transitions are hardware-accelerated and browser-optimized; JS animations require requestAnimationFrame management and are harder to interrupt |

**Key insight:** Font loading is deceptively complex. `document.fonts.ready` handles font status (unloaded → loading → loaded → failed), multiple fonts loading in parallel, font caching, layout reflow timing, and optional fonts (`font-display: optional`) that may not load. Custom solutions inevitably miss these edge cases.

## Common Pitfalls

### Pitfall 1: Font Flicker During Swap
**What goes wrong:** User changes font, UI preview flickers or shows fallback font briefly before new font renders
**Why it happens:** Font is applied to CSS before it finishes downloading from Google Fonts API
**How to avoid:**
1. Load font via FontFace API first
2. Wait for `font.load()` promise to resolve
3. Then update state to apply font-family
4. Use `font-display: swap` as fallback for initial page load only

**Warning signs:**
- Brief flash of system font (Arial, Times New Roman) when changing fonts
- Layout shift as font metrics change mid-render
- CLS (Cumulative Layout Shift) warnings in Lighthouse

### Pitfall 2: Unnecessary Re-renders Causing Sluggishness
**What goes wrong:** UI preview re-renders when user edits logo scale, tile background, or other unrelated settings, making updates feel slow (>100ms perceived delay)
**Why it happens:** Selecting entire state object or not using shallow comparison causes re-renders on ANY state mutation
**How to avoid:**
1. Use `useShallow` when selecting multiple properties as object
2. Subscribe only to brand assets (`assets.primaryFont`, `assets.colors`, etc.), not `tileSettings`
3. Verify subscriptions in React DevTools Profiler

**Warning signs:**
- UIPreviewTile highlighted in React DevTools when editing logo scale
- Profiler shows UIPreviewTile re-rendering on every state change
- Perceived lag between user action and visual update

### Pitfall 3: CSS Transition Flickering on Color Changes
**What goes wrong:** When user drags color picker, UI preview flickers or shows intermediate visual states
**Why it happens:** Transitioning color properties causes browser to interpolate between old and new color, creating visual artifacts
**How to avoid:**
1. Do NOT transition `background-color`, `color`, or `border-color`
2. Only transition `opacity` and `transform` (GPU-accelerated)
3. For color changes, update CSS custom properties immediately with no transition

**Warning signs:**
- Visible color interpolation during rapid changes (color picker drag)
- Muddy or gray intermediate colors between vibrant colors
- Layout flickering during responsive breakpoint transitions

**Source:** [Solving Animation Layout Flickering Caused by CSS Transitions](https://stevenwoodson.com/blog/solving-animation-layout-flickering-caused-by-css-transitions/)

### Pitfall 4: will-change Overuse Causing Memory Issues
**What goes wrong:** Adding `will-change` to many elements causes browser memory pressure, crashes on low-end devices
**Why it happens:** `will-change` tells browser to create separate composite layer, consuming GPU memory
**How to avoid:**
1. Only use `will-change` on elements actively animating
2. Remove `will-change` after transition completes using `transitionend` event
3. Limit to 5-10 elements max with `will-change` simultaneously

**Warning signs:**
- Mobile Safari crashes during animations
- Chrome DevTools Layers panel shows excessive layers (>20)
- Increased memory usage in Performance Monitor

**Source:** [CSS GPU Acceleration: will-change & translate3d Guide](https://www.lexo.ch/blog/2025/01/boost-css-performance-with-will-change-and-transform-translate3d-why-gpu-acceleration-matters/)

### Pitfall 5: Font Load Blocking Rendering
**What goes wrong:** First paint delayed while waiting for Google Fonts to download
**Why it happens:** Default font loading blocks render (FOIT - Flash of Invisible Text)
**How to avoid:**
1. Add `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com` in HTML
2. Use `display=swap` parameter in Google Fonts URL
3. Load fonts asynchronously, don't block initial render

**Warning signs:**
- Lighthouse "Eliminate render-blocking resources" warning
- First Contentful Paint >1.8s
- Blank screen while fonts download

**Source:** [How to Use Google Fonts in CSS](https://thelinuxcode.com/how-to-use-google-fonts-in-css-practical-production-friendly-guide/)

## Code Examples

Verified patterns from official sources:

### Complete Font Loading Hook
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API
import { useEffect, useState } from 'react';

/**
 * Loads a Google Font and returns loading status
 * Prevents FOIT/FOUT by preloading before applying
 */
export function useFontLoader(family: string, weight: string = '400') {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;

    const loadFont = async () => {
      try {
        // Check if font already loaded
        const existing = Array.from(document.fonts).find(
          (f) => f.family === family && f.weight === weight
        );
        if (existing && existing.status === 'loaded') {
          if (!cancelled) setStatus('loaded');
          return;
        }

        // Fetch Google Fonts CSS to get woff2 URL
        const fontUrl = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&display=swap`;
        const response = await fetch(fontUrl);
        const css = await response.text();
        const woff2Match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/);

        if (!woff2Match) throw new Error(`Font URL not found for ${family}`);

        // Create and load FontFace
        const fontFace = new FontFace(family, `url(${woff2Match[1]})`, {
          weight,
          style: 'normal',
        });
        document.fonts.add(fontFace);

        await fontFace.load();
        await document.fonts.ready; // Wait for layout completion

        if (!cancelled) setStatus('loaded');
      } catch (error) {
        console.error(`Failed to load font ${family}:`, error);
        if (!cancelled) setStatus('error');
      }
    };

    loadFont();

    return () => {
      cancelled = true;
    };
  }, [family, weight]);

  return status;
}

// Usage in UIPreviewTile
function UIPreviewTile() {
  const primaryFont = useCanvasStore((state) => state.assets.primaryFont);
  const fontStatus = useFontLoader(primaryFont, '400');

  return (
    <div style={{ fontFamily: fontStatus === 'loaded' ? primaryFont : 'system-ui' }}>
      {/* Preview content */}
    </div>
  );
}
```

### Selective State Subscription Pattern
```typescript
// Source: https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow
import { useShallow } from 'zustand/react/shallow';

function UIPreviewTile() {
  // GOOD: Subscribe to specific slices with useShallow
  const brandAssets = useCanvasStore(
    useShallow((state) => ({
      primaryFont: state.assets.primaryFont,
      secondaryFont: state.assets.secondaryFont,
      colors: state.assets.colors,
      logo: state.assets.logo,
      heroImage: state.assets.heroImage,
    }))
  );

  // Component only re-renders when these specific asset values change
  // Ignores changes to tileSettings, editingTileId, extractionStage, etc.
}

// BAD: Selecting entire state object
function UIPreviewTile() {
  const state = useCanvasStore((state) => state); // Re-renders on ANY change
}

// BAD: Selecting multiple properties without useShallow
function UIPreviewTile() {
  const { primaryFont, colors } = useCanvasStore((state) => ({
    primaryFont: state.assets.primaryFont,
    colors: state.assets.colors,
  })); // New object every render, always re-renders
}
```

### GPU-Accelerated Transition CSS
```css
/* Source: Multiple sources on GPU acceleration and CSS transitions */

/* Base styles for UI preview elements */
.ui-preview-heading,
.ui-preview-body,
.ui-preview-button,
.ui-preview-card {
  /* Only transition GPU-accelerated properties */
  transition: opacity 150ms ease-out, transform 150ms ease-out;

  /* Tell browser these properties will change */
  will-change: opacity, transform;
}

/* Updating state (font swap) */
.ui-preview-heading.updating {
  opacity: 0;
  transform: translateY(2px);
}

/* Colors: NO transition, update immediately */
.ui-preview-heading {
  color: var(--brand-text);
  /* Do NOT add: transition: color 150ms; */
}

.ui-preview-button {
  background-color: var(--brand-primary);
  /* Do NOT add: transition: background-color 150ms; */
}

/* Remove will-change after transition completes */
/* Alternative: use JS transitionend event to remove will-change */
.ui-preview-heading:not(.updating) {
  will-change: auto;
}
```

### Transition End Handler for Font Swap
```typescript
// Source: Pattern derived from best practices
function UIPreviewTile() {
  const [isUpdating, setIsUpdating] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const previousFont = useRef(primaryFont);

  useEffect(() => {
    // Font changed, trigger transition
    if (primaryFont !== previousFont.current) {
      previousFont.current = primaryFont;

      // 1. Fade out with current font
      setIsUpdating(true);

      // 2. Wait for font to load
      loadGoogleFont(primaryFont).then(() => {
        // 3. Apply new font-family (while opacity: 0)
        if (elementRef.current) {
          elementRef.current.style.fontFamily = primaryFont;
        }

        // 4. Fade in with new font (next frame)
        requestAnimationFrame(() => {
          setIsUpdating(false);
        });
      });
    }
  }, [primaryFont]);

  return (
    <div
      ref={elementRef}
      className={`ui-preview-heading ${isUpdating ? 'updating' : ''}`}
    >
      {/* Content */}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| webfontloader library | Native CSS Font Loading API | Stable since 2020 | Zero dependencies, better control, smaller bundle |
| `font-display: block` (FOIT) | `font-display: swap` (FOUT) | Google Fonts default since 2019 | Text visible immediately, better perceived performance |
| Context API for state | Zustand with selectors | Zustand 4.0+ (2023) | Surgical re-renders, better performance at scale |
| `transition: all` | `transition: opacity, transform` | Best practice since GPU acceleration | No flickering, 60fps transitions |
| React 18 useTransition | React 19 automatic batching | React 19 (Dec 2024) | Automatic optimization, less manual work |

**Deprecated/outdated:**
- **webfontloader**: Use native CSS Font Loading API instead (zero dependencies, better browser support in 2026)
- **`font-display: block`**: Use `font-display: swap` (Google Fonts default, prevents FOIT)
- **2D transforms for GPU**: Use `transform: translate3d()` or `translateZ(0)` to guarantee GPU acceleration
- **Shallow comparison from `zustand/shallow`**: Moved to `zustand/react/shallow` in Zustand 4.0+, then to `useShallow` hook in 5.0+

## Open Questions

Things that couldn't be fully resolved:

1. **React 19.2 Performance Tracks in Chrome DevTools**
   - What we know: React 19.2 introduces React Performance Tracks in Chrome DevTools' Performance panel for better debugging
   - What's unclear: Specific API changes or usage patterns for debugging live update performance
   - Recommendation: Use existing React DevTools Profiler for now, explore new tracks when debugging performance

2. **Font Subsetting for Performance**
   - What we know: Google Fonts supports subsetting via `&text=` parameter to load only needed characters
   - What's unclear: Whether subsetting provides meaningful performance gains for <100ms target with modern compression (woff2)
   - Recommendation: Start without subsetting, measure font load times, add subsetting only if loads exceed 100ms

3. **Optimal Transition Timing**
   - What we know: Requirement specifies 120-180ms ease-out, research suggests 150ms as sweet spot
   - What's unclear: Whether different UI elements (text vs images vs colors) benefit from different timing
   - Recommendation: Start with uniform 150ms ease-out, adjust based on user testing if elements feel sluggish or too fast

## Sources

### Primary (HIGH confidence)
- [Zustand subscribeWithSelector Middleware](https://zustand.docs.pmnd.rs/middlewares/subscribe-with-selector) - Selective state subscriptions
- [Zustand useShallow Guide](https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow) - Prevent re-renders with shallow comparison
- [CSS Font Loading API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API) - FontFace API usage
- [Document.fonts.ready - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/fonts) - Font ready detection
- [How to Use Google Fonts in CSS](https://thelinuxcode.com/how-to-use-google-fonts-in-css-practical-production-friendly-guide/) - Google Fonts v2 API, display=swap
- [CSS GPU Acceleration: will-change & translate3d Guide](https://www.lexo.ch/blog/2025/01/boost-css-performance-with-will-change-and-transform-translate3d-why-gpu-acceleration-matters/) - GPU acceleration best practices

### Secondary (MEDIUM confidence)
- [React Performance Optimization 2026 Guide](https://medium.com/@muhammadshakir4152/react-js-optimization-every-react-developer-must-know-2026-edition-e1c098f55ee9) - Performance metrics and optimization techniques
- [Concurrent Rendering in React 19](https://medium.com/@tejutanvi773/concurrent-rendering-in-react-19-still-the-heart-of-reacts-performance-magic-832445d5e419) - Concurrent features overview
- [Solving Animation Layout Flickering](https://stevenwoodson.com/blog/solving-animation-layout-flickering-caused-by-css-transitions/) - CSS transition flickering solutions
- [Working with Zustand - TkDodo's Blog](https://tkdodo.eu/blog/working-with-zustand) - Zustand best practices

### Tertiary (LOW confidence)
- Various WebSearch results on React performance (cross-verified with official docs)
- Community discussions on GPU acceleration (verified against MDN/official sources)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Zustand already in use, CSS Font Loading API is native and well-documented
- Architecture: HIGH - Patterns verified with official Zustand docs and MDN documentation
- Pitfalls: MEDIUM-HIGH - Based on community patterns verified with official sources, specific to this use case requires implementation testing

**Research date:** 2026-02-07
**Valid until:** ~30 days (font loading APIs stable, Zustand patterns stable, React 19 patterns stabilizing)
