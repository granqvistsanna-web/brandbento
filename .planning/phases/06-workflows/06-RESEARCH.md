# Phase 6: Workflows - Research

**Researched:** 2026-02-07
**Domain:** React state management, undo/redo, canvas export, URL sharing
**Confidence:** HIGH

## Summary

Phase 6 implements workflow features: undo/redo with keyboard shortcuts, PNG export, URL sharing, and reset functionality. The project already has the core infrastructure in place with zundo v2.3.0 for undo/redo (30-step limit configured) and lz-string for URL compression.

The standard approach combines zundo's temporal middleware (already configured in canvasState.ts with partialize excluding transient state), html-to-image for PNG export, the Clipboard API for copying share links, and custom React patterns for auto-hiding toolbars and read-only views.

Key recommendations: Use html-to-image v1.11.13 (locked version - recent releases have export bugs), implement keyboard shortcuts with useEffect + event.preventDefault, use pointer-events: none for read-only view, and implement auto-hide toolbar with mousemove + setTimeout pattern.

**Primary recommendation:** Leverage existing zundo configuration, add html-to-image for export, use native Clipboard API for sharing, and build custom toolbar with CSS-based auto-hide behavior.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zundo | 2.3.0 | Undo/redo middleware for Zustand | Official Zustand temporal middleware, <700B, already installed and configured |
| html-to-image | 1.11.13 | DOM to image conversion | Requirement EXPRT-03, uses SVG foreignObject, handles high-DPI |
| Clipboard API | Native | Copy share links to clipboard | Native browser API, works in all modern browsers, secure contexts only |
| lz-string | 1.5.0 | URL state compression | Already installed, compressToEncodedURIComponent for URL-safe output |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hot-toast | 7.0+ | Toast notifications | "Copied!" feedback, 5KB lightweight, promise-based API |
| sonner | Latest | Alternative toast library | If using shadcn/ui components (not applicable here) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| html-to-image | html2canvas | Requirement EXPRT-03 specifies html-to-image, html2canvas is older approach |
| Clipboard API | document.execCommand('copy') | execCommand is deprecated, Clipboard API is modern standard |
| Custom undo | zustand-travel | zustand-travel is 10x faster but uses JSON Patch - zundo is simpler, already installed |
| react-hot-toast | react-toastify | react-toastify is heavier (2M downloads vs 5KB), more features than needed |

**Installation:**
```bash
npm install html-to-image@1.11.13 react-hot-toast
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── Toolbar.tsx          # Auto-hiding toolbar component
│   └── ReadOnlyBanner.tsx   # Read-only view indicator
├── hooks/
│   └── useKeyboardShortcuts.ts  # Keyboard event handling
├── utils/
│   ├── export.ts            # PNG export logic
│   └── sharing.ts           # URL generation and clipboard
└── state/
    └── canvasState.ts       # Already has zundo configured
```

### Pattern 1: Zundo Temporal Middleware (Already Implemented)
**What:** Wrap Zustand store with temporal middleware to enable undo/redo
**When to use:** Already configured in canvasState.ts
**Example:**
```typescript
// Source: https://github.com/charkour/zundo
// Already implemented in src/state/canvasState.ts
export const useCanvasStore = create<CanvasStore>()(
  temporal(
    subscribeWithSelector((set, get) => ({
      // store implementation
    })),
    {
      partialize: (state) => ({
        // Only track these fields for undo/redo
        assets: state.assets,
        tileSettings: state.tileSettings,
      }),
      limit: 30,  // TOOL-05: 30-step undo stack
      equality: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    }
  )
);

// Access undo/redo
export const useTemporalStore = () => useCanvasStore.temporal.getState();
```

### Pattern 2: Keyboard Shortcuts with useEffect
**What:** Listen for Cmd+Z / Cmd+Shift+Z and prevent default browser behavior
**When to use:** For undo/redo shortcuts (TOOL-04)
**Example:**
```typescript
// Source: React keyboard shortcuts best practices
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Check for Cmd (Mac) or Ctrl (Windows/Linux)
    const isMod = e.metaKey || e.ctrlKey;

    if (isMod && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        temporal.redo();
      } else {
        temporal.undo();
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### Pattern 3: HTML-to-Image Export with High-DPI Support
**What:** Convert DOM element to PNG with devicePixelRatio scaling
**When to use:** Export PNG feature (EXPRT-01, EXPRT-04)
**Example:**
```typescript
// Source: https://github.com/bubkoo/html-to-image
import { toPng } from 'html-to-image';

const exportToPng = async (node: HTMLElement) => {
  const filter = (node: HTMLElement) => {
    // Exclude toolbar, edit panels
    const excluded = ['toolbar', 'edit-panel', 'controls'];
    return !excluded.some((cls) => node.classList?.contains(cls));
  };

  try {
    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: window.devicePixelRatio, // EXPRT-04: High-DPI support
      filter: filter, // EXPRT-02: Exclude elements
    });

    // Download
    const link = document.createElement('a');
    link.download = 'bento-grid.png';
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Export failed:', err);
  }
};
```

### Pattern 4: Auto-Hide Toolbar with Inactivity Timer
**What:** Show toolbar on mouse move, hide after 3 seconds of inactivity
**When to use:** Toolbar auto-hide (TOOL-03)
**Example:**
```typescript
// Source: React auto-hide toolbar patterns
const [isVisible, setIsVisible] = useState(true);
const timeoutRef = useRef<number>();

useEffect(() => {
  const handleMouseMove = () => {
    setIsVisible(true);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, 3000); // TOOL-03: 3 seconds
  };

  window.addEventListener('mousemove', handleMouseMove);
  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };
}, []);

return (
  <div className={`toolbar ${isVisible ? 'visible' : 'hidden'}`}>
    {/* toolbar content */}
  </div>
);
```

### Pattern 5: Clipboard API with Toast Feedback
**What:** Copy share link to clipboard and show "Copied!" toast
**When to use:** Share Link feature (SHAR-02)
**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
import toast from 'react-hot-toast';

const shareLink = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url);
    toast.success('Copied!', {
      duration: 2000,
      position: 'bottom-center',
    });
  } catch (error) {
    console.error('Failed to copy:', error);
    toast.error('Failed to copy link');
  }
};
```

### Pattern 6: URL State Compression for Sharing
**What:** Compress canvas state to URL hash for sharing
**When to use:** Share Link generation (SHAR-01)
**Example:**
```typescript
// Source: https://github.com/pieroxy/lz-string
// Already implemented in src/state/persistence.ts
import LZString from 'lz-string';

export function syncStateToURL(state: CanvasState): void {
  const compressed = LZString.compressToEncodedURIComponent(
    JSON.stringify(state)
  );
  const url = new URL(window.location.href);
  url.hash = compressed;
  window.history.replaceState(null, '', url);
}

// Generate shareable link
const shareableUrl = `${window.location.origin}${window.location.pathname}#${compressed}`;
```

### Pattern 7: Read-Only View with Pointer Events
**What:** Disable all interactions using CSS pointer-events
**When to use:** Shared link read-only view (SHAR-03)
**Example:**
```typescript
// Source: CSS pointer-events best practices
// Detect read-only mode from URL parameter or context
const isReadOnly = new URLSearchParams(window.location.search).get('view') === 'readonly';

// Apply to root or container
<div className={isReadOnly ? 'read-only' : ''}>
  {/* canvas content */}
</div>

// CSS
.read-only {
  pointer-events: none;
  user-select: none;
}

.read-only .edit-panel,
.read-only .hover-indicator {
  display: none;
}
```

### Pattern 8: Reset with Confirmation Dialog
**What:** Show confirmation before reset, make reset action undoable
**When to use:** Reset feature (TOOL-07, TOOL-08)
**Example:**
```typescript
// Source: React confirmation dialog best practices
const handleReset = () => {
  const confirmed = window.confirm(
    'Reset all tiles to extracted state? This action can be undone.'
  );

  if (confirmed) {
    // Create undo snapshot before reset
    // reset() is already tracked by zundo since it modifies assets/tileSettings
    canvasStore.reset();
  }
};
```

### Anti-Patterns to Avoid
- **Storing undo history in localStorage:** Undo stack is transient, don't persist it - causes memory bloat
- **Including editingTileId in undo tracking:** Already correctly excluded via partialize - transient UI state shouldn't be undoable
- **Using html-to-image v1.12+:** Recent versions have export bugs, lock to v1.11.13
- **Calling undo/redo without checking canUndo/canRedo:** Check temporal.getState().pastStates.length and futureStates.length first
- **Not preventing default on keyboard shortcuts:** Browser undo/redo will conflict, always e.preventDefault()

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| DOM to image conversion | Custom canvas drawing logic | html-to-image library | Handles SVG, CSS, fonts, images, cross-origin issues, high-DPI screens automatically |
| Undo/redo state management | Manual state snapshots array | zundo temporal middleware | Already configured, handles partialize, limits, equality checks, memory management |
| URL state compression | Base64 or custom encoding | lz-string compressToEncodedURIComponent | Already installed, URL-safe, ~50-70% compression, well-tested |
| Toast notifications | Custom timeout + position logic | react-hot-toast | 5KB, accessible, promise-based, handles stacking, positioning, dismissal |
| Clipboard copy | document.execCommand fallback | navigator.clipboard.writeText | Modern API, works in all browsers (secure contexts), promise-based error handling |

**Key insight:** The "simple" workflows (undo, export, share) have many edge cases. DOM export fails on tainted canvas, large images, cross-origin resources. Undo needs equality checks, memory limits, partialize. URL compression needs URL-safe encoding. Use battle-tested libraries rather than custom implementations.

## Common Pitfalls

### Pitfall 1: html-to-image Version Regression
**What goes wrong:** Using html-to-image v1.12+ results in broken PNG exports
**Why it happens:** Known bug in recent versions - images don't export properly, open GitHub issue
**How to avoid:** Lock to v1.11.13 in package.json: `"html-to-image": "1.11.13"`
**Warning signs:** Exported PNGs are blank, corrupted, or missing elements

### Pitfall 2: Clipboard API Security Requirements
**What goes wrong:** navigator.clipboard.writeText() silently fails or throws NotAllowedError
**Why it happens:** Requires HTTPS (or localhost) AND user interaction (click handler)
**How to avoid:** Always call from click handler, wrap in try/catch, provide fallback message
**Warning signs:** Clipboard works in dev (localhost) but fails in production (if not HTTPS)

### Pitfall 3: Keyboard Shortcuts Without preventDefault
**What goes wrong:** App undo/redo fires AND browser undo/redo fires (e.g., form input undo)
**Why it happens:** Browser default Cmd+Z behavior not prevented
**How to avoid:** Always call e.preventDefault() in keyboard event handler
**Warning signs:** Undo seems to skip states or behave inconsistently

### Pitfall 4: Export Includes Hidden Elements
**What goes wrong:** Toolbar, edit panels, or hover states appear in exported PNG
**Why it happens:** html-to-image captures current DOM state, including CSS-hidden elements
**How to avoid:** Use filter function to exclude elements by className, don't rely on CSS visibility
**Warning signs:** Exported image has UI elements that shouldn't be there

### Pitfall 5: URL State Exceeds Browser Limits
**What goes wrong:** Share links don't work, URL gets truncated, browser history breaks
**Why it happens:** Browsers limit URL length (2000-8000 chars), large data URIs in state
**How to avoid:** Already handled - prior decision (01-02) to store large data URIs separately with hash references
**Warning signs:** Share links fail to load, URL looks truncated in browser

### Pitfall 6: Read-Only Mode Still Allows Edits
**What goes wrong:** Shared links allow editing when they shouldn't
**Why it happens:** Only hiding edit panels, not disabling underlying click handlers
**How to avoid:** Use pointer-events: none on container, conditionally disable all state-modifying actions
**Warning signs:** Read-only links still respond to clicks, show hover states

### Pitfall 7: Reset Not Actually Undoable
**What goes wrong:** Reset action clears undo history or can't be undone
**Why it happens:** reset() bypasses normal state updates, or clears temporal state
**How to avoid:** Ensure reset() uses set() to modify tracked state (assets, tileSettings), zundo will auto-track
**Warning signs:** Undo stack clears after reset, or undo after reset doesn't work

### Pitfall 8: Auto-Hide Toolbar Fights with Clicks
**What goes wrong:** Toolbar hides while user is clicking buttons
**Why it happens:** Timeout not cleared when interacting with toolbar
**How to avoid:** Reset timeout on mousemove over toolbar, or pause auto-hide when toolbar has focus
**Warning signs:** Toolbar disappears mid-interaction, buttons become unclickable

### Pitfall 9: High-DPI Export Produces Huge Files
**What goes wrong:** Exported PNGs are 10MB+ on Retina displays
**Why it happens:** pixelRatio: window.devicePixelRatio creates 2x-4x resolution images
**How to avoid:** Offer quality settings, or cap pixelRatio at 2, or compress output
**Warning signs:** Slow exports, huge file downloads, browser memory issues

### Pitfall 10: Undo After URL Load Loses Shared State
**What goes wrong:** User loads shared link, clicks undo, state reverts to empty
**Why it happens:** Undo history not initialized when loading from URL
**How to avoid:** Clear or initialize undo history after URL state load, or disable undo for first action
**Warning signs:** Undo after page load behaves unexpectedly

## Code Examples

Verified patterns from official sources:

### Accessing Zundo Undo/Redo
```typescript
// Source: https://github.com/charkour/zundo
import { useCanvasStore, useTemporalStore } from '@/state/canvasState';

function UndoRedoButtons() {
  const { undo, redo, pastStates, futureStates } = useTemporalStore();

  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  return (
    <>
      <button onClick={() => undo()} disabled={!canUndo}>
        Undo
      </button>
      <button onClick={() => redo()} disabled={!canRedo}>
        Redo
      </button>
    </>
  );
}
```

### Complete Export Function
```typescript
// Source: https://github.com/bubkoo/html-to-image
import { toPng } from 'html-to-image';
import { useRef } from 'react';

function ExportButton() {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!canvasRef.current) return;

    const filter = (node: HTMLElement) => {
      // EXPRT-02: Exclude toolbar, panels, backgrounds
      const excluded = ['toolbar', 'edit-panel', 'background'];
      return !excluded.some((cls) => node.classList?.contains(cls));
    };

    try {
      const dataUrl = await toPng(canvasRef.current, {
        cacheBust: true,
        pixelRatio: window.devicePixelRatio, // EXPRT-04
        filter,
      });

      const link = document.createElement('a');
      link.download = `bento-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return <button onClick={handleExport}>Export PNG</button>;
}
```

### Complete Share Function
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
import toast from 'react-hot-toast';
import { useCanvasStore } from '@/state/canvasState';
import { compressState } from '@/utils/compression';

function ShareButton() {
  const state = useCanvasStore();

  const handleShare = async () => {
    // SHAR-01: Generate URL with compressed state
    const compressed = compressState({
      version: state.version,
      sourceUrl: state.sourceUrl,
      assets: state.assets,
      tileSettings: state.tileSettings,
      extractedAt: state.extractedAt,
      lastModified: state.lastModified,
    });

    const shareUrl = `${window.location.origin}${window.location.pathname}#${compressed}`;

    // SHAR-02: Copy to clipboard with toast
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Copied!', {
        duration: 2000,
        position: 'bottom-center',
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    }
  };

  return <button onClick={handleShare}>Share Link</button>;
}
```

### Complete Keyboard Shortcuts Hook
```typescript
// Source: React keyboard shortcuts patterns
import { useEffect } from 'react';
import { useTemporalStore } from '@/state/canvasState';

export function useKeyboardShortcuts() {
  const { undo, redo, pastStates, futureStates } = useTemporalStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // TOOL-04: Cmd+Z / Cmd+Shift+Z
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === 'z') {
        e.preventDefault();

        if (e.shiftKey && futureStates.length > 0) {
          redo();
        } else if (!e.shiftKey && pastStates.length > 0) {
          undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, pastStates, futureStates]);
}
```

### Auto-Hide Toolbar Component
```typescript
// Source: React auto-hide patterns
import { useState, useEffect, useRef } from 'react';

function Toolbar() {
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    const handleMouseMove = () => {
      setIsVisible(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // TOOL-03: Auto-hide after 3 seconds
      timeoutRef.current = window.setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      className={`
        fixed bottom-8 left-1/2 -translate-x-1/2
        transition-opacity duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      {/* TOOL-02: Undo, Redo, Export PNG, Share Link, Reset */}
    </div>
  );
}
```

### Read-Only View Detection
```typescript
// Source: React read-only view patterns
import { createContext, useContext, ReactNode } from 'react';

const ReadOnlyContext = createContext(false);

export function ReadOnlyProvider({ children }: { children: ReactNode }) {
  // SHAR-03: Detect read-only mode from URL
  const isReadOnly = new URLSearchParams(window.location.search).get('view') === 'readonly';

  return (
    <ReadOnlyContext.Provider value={isReadOnly}>
      <div className={isReadOnly ? 'read-only' : ''}>
        {children}
      </div>
    </ReadOnlyContext.Provider>
  );
}

export const useReadOnly = () => useContext(ReadOnlyContext);

// CSS (in globals or component)
// .read-only {
//   pointer-events: none;
//   user-select: none;
// }
// .read-only .edit-panel,
// .read-only .hover-state {
//   display: none;
// }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| html2canvas | html-to-image | ~2019 | html-to-image uses SVG foreignObject, better CSS/font support, smaller bundle |
| document.execCommand('copy') | navigator.clipboard.writeText() | ~2020 (Baseline) | Clipboard API is promise-based, secure, standard, execCommand deprecated |
| Manual undo state snapshots | zundo/zustand-travel middleware | 2022+ | Automatic tracking, partialize, memory limits, equality checks, <700B |
| react-toastify (heavy) | react-hot-toast/sonner | 2023+ | Lighter (5KB), simpler API, better DX, less configuration |
| Base64 encoding | lz-string compression | Established | ~50-70% compression vs Base64, URL-safe, handles Unicode |

**Deprecated/outdated:**
- **document.execCommand:** Deprecated for clipboard operations, use Clipboard API
- **html2canvas:** Still maintained but html-to-image is lighter and handles CSS better
- **Custom undo implementations:** Zustand ecosystem has standardized on zundo for temporal middleware

## Open Questions

Things that couldn't be fully resolved:

1. **Toast library choice: react-hot-toast vs sonner**
   - What we know: Both are lightweight, modern, well-maintained
   - What's unclear: If project will use shadcn/ui (sonner is default), or stay with current stack
   - Recommendation: Use react-hot-toast (5KB, zero config, promise-based) unless shadcn/ui is planned

2. **Read-only mode parameter: URL query vs hash vs subdomain**
   - What we know: ?view=readonly is simple, hash already used for state
   - What's unclear: If read-only should be permanent (subdomain) or temporary (query param)
   - Recommendation: Use ?view=readonly query param for simplicity, easy to add to share links

3. **Confirmation dialog: native confirm() vs custom modal**
   - What we know: native confirm() is simple, works immediately, accessible
   - What's unclear: If custom modal needed for brand consistency
   - Recommendation: Start with native confirm() (TOOL-07), upgrade to custom modal in polish phase if needed

4. **Undo history after URL load**
   - What we know: Loading from URL populates state but not undo history
   - What's unclear: Should first state after load be undoable, or should undo stack be empty?
   - Recommendation: Initialize with empty undo stack after URL load, first edit becomes undo point (prevents confusing undo behavior)

## Sources

### Primary (HIGH confidence)
- [zundo GitHub](https://github.com/charkour/zundo) - v2.3.0 features, partialize, limit, API
- [html-to-image GitHub](https://github.com/bubkoo/html-to-image) - v1.11.13, filter, pixelRatio, known issues
- [Clipboard API writeText MDN](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) - Security requirements, browser support, API
- [lz-string GitHub](https://github.com/pieroxy/lz-string) - compressToEncodedURIComponent, compression ratios

### Secondary (MEDIUM confidence)
- [React Hot Toast](https://react-hot-toast.com/) - API, features, bundle size
- [Top React toast libraries 2026](https://knock.app/blog/the-top-notification-libraries-for-react) - Comparison, recommendations
- [Zustand temporal middleware discussion](https://github.com/pmndrs/zustand/discussions/1611) - Community patterns
- [React keyboard shortcuts patterns](https://medium.com/@amarkanala/introducing-react-keyboard-shortcuts-clean-performant-hook-based-keyboard-shortcuts-for-modern-f9edefbf92bb) - Modern approaches

### Tertiary (LOW confidence)
- [Auto-hide toolbar CodePen](https://codepen.io/karlyhoffman/pen/YLmKLY) - jQuery example, pattern applicable to React
- [pointer-events CSS Tricks](https://css-tricks.com/almanac/properties/p/pointer-events/) - Read-only view pattern

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - zundo and lz-string already installed, html-to-image requirement specified, Clipboard API is standard
- Architecture: HIGH - Verified zundo configuration in codebase, official docs for html-to-image patterns, MDN for Clipboard API
- Pitfalls: MEDIUM-HIGH - html-to-image version issue verified via GitHub issues, Clipboard security from MDN, undo patterns from community + docs

**Research date:** 2026-02-07
**Valid until:** ~30 days (2026-03-07) - Stack is stable, but html-to-image may release fixes, check for v1.12+ stability updates
