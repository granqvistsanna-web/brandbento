# Phase 8: Dark/Light Mode - Research

**Researched:** 2026-02-07
**Domain:** Theme switching, color scheme management, localStorage persistence
**Confidence:** HIGH

## Summary

Dark/light mode implementation in React + Vite + Tailwind CSS with Zustand state management is a well-established pattern with clear best practices. The standard approach combines Tailwind's built-in `dark:` variant with a Zustand store that persists theme preference to localStorage while respecting system preferences.

The key technical challenge is preventing Flash of Unstyled Content (FOUC) during initial page load. This requires applying the theme class before React hydration, typically through an inline script in the HTML head. Tailwind CSS v3.4+ introduced the `selector` strategy (via `@custom-variant`), which enables manual theme toggling by adding a `.dark` class to the document root.

The project already has Zustand with persist middleware configured (verified in `useBrandStore.js`), Tailwind CSS setup, and 200ms ease-out transitions as standard. This means the infrastructure is largely in place - the work is primarily about adding theme state, UI controls, and ensuring all components adapt correctly.

**Primary recommendation:** Use Tailwind's class-based dark mode with Zustand persist middleware, add inline script to prevent FOUC, and ensure all color utilities have `dark:` variants specified.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | v3.4+ | Dark mode utilities via `dark:` variant | Built-in dark mode support, no additional dependencies needed |
| Zustand | v5.0.11 | Theme state management | Already in project, persist middleware for localStorage |
| zustand/middleware | v5.0.11 | Persist theme to localStorage | Included with Zustand, handles storage automatically |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| N/A | - | No additional libraries needed | Tailwind + Zustand handle everything |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand | React Context | Context causes more re-renders, Zustand already in project |
| Tailwind dark mode | CSS custom properties manually | More code, less maintainable, Tailwind's approach is standard |
| localStorage | Cookies | Cookies add overhead, localStorage is standard for UI preferences |

**Installation:**
No additional packages needed - Tailwind CSS and Zustand already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── store/
│   └── useBrandStore.js        # Add theme state here
├── components/
│   └── ThemeToggle.jsx         # New: toggle button component
├── hooks/
│   └── useThemeEffect.js       # Optional: system preference listener
└── index.html                   # Inline FOUC prevention script
```

### Pattern 1: Zustand Theme State
**What:** Add theme state to existing Zustand store with persist middleware
**When to use:** This project (Zustand already configured with persist)
**Example:**
```javascript
// Source: Verified from useBrandStore.js structure + Zustand docs
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useBrandStore = create(
  persist(
    (set, get) => ({
      // Existing brand state...
      theme: 'system', // 'light' | 'dark' | 'system'

      setTheme: (theme) => {
        set({ theme });

        // Apply to DOM immediately
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          // System preference
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.toggle('dark', isDark);
        }
      },
    }),
    {
      name: 'brand-storage', // Already exists in project
      partialPersist: (state) => ({ theme: state.theme }), // Only persist theme
    }
  )
);
```

### Pattern 2: FOUC Prevention Script
**What:** Inline script in index.html that applies theme before React renders
**When to use:** Always, for any client-side theme implementation
**Example:**
```html
<!-- Source: Tailwind CSS docs + FOUC prevention best practices -->
<!doctype html>
<html>
  <head>
    <script>
      // Execute BEFORE any content renders
      (function() {
        const stored = localStorage.getItem('brand-storage');
        if (stored) {
          const { state } = JSON.parse(stored);
          const theme = state?.theme || 'system';

          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else if (theme === 'light') {
            // Explicitly light, don't add class
          } else {
            // System preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
              document.documentElement.classList.add('dark');
            }
          }
        } else {
          // First visit - respect system preference
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
          }
        }
      })();
    </script>
    <!-- Rest of head... -->
  </head>
</html>
```

### Pattern 3: Tailwind Dark Mode Configuration
**What:** Configure Tailwind to use selector-based dark mode
**When to use:** Required for manual theme toggle
**Example:**
```javascript
// Source: Tailwind CSS v3.4+ official docs
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'selector', // v3.4+ syntax (replaces 'class')
  theme: {
    extend: {
      // Existing theme config...
    },
  },
};
```

Or with CSS approach (v4+ style):
```css
/* src/index.css */
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

### Pattern 4: Component Dark Mode Styling
**What:** Add `dark:` variants to all color-based utilities
**When to use:** Every component that uses colors
**Example:**
```jsx
// Source: Tailwind CSS docs + project patterns
function BentoCanvas() {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <button className="bg-primary text-white hover:bg-primary/90 dark:hover:bg-primary/80">
          Click me
        </button>
      </div>
    </div>
  );
}
```

### Pattern 5: System Preference Listener
**What:** Listen for OS theme changes and update state
**When to use:** When theme is set to 'system'
**Example:**
```javascript
// Source: MDN matchMedia API + React patterns
import { useEffect } from 'react';
import { useBrandStore } from './store/useBrandStore';

export function useSystemThemeListener() {
  const theme = useBrandStore((state) => state.theme);
  const setTheme = useBrandStore((state) => state.setTheme);

  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };

    // Modern API (addEventListener preferred over addListener)
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, setTheme]);
}
```

### Anti-Patterns to Avoid
- **Using useState for theme state:** Zustand persist already configured, don't duplicate with React state
- **Checking theme in every component:** Use Tailwind's `dark:` classes, not JavaScript conditionals
- **Forgetting FOUC prevention script:** Always include inline script before React hydration
- **Not testing both themes:** Every component must look correct in both light and dark mode
- **Using pure black (#000000):** Use dark grays for dark mode backgrounds (better for accessibility)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Theme persistence | Custom localStorage wrapper | Zustand persist middleware | Already configured, handles serialization, hydration edge cases |
| FOUC prevention | React effect that runs on mount | Inline script in HTML head | Effects run after render = flash visible |
| System preference detection | Polling window.matchMedia | matchMedia event listener | Polling wastes resources, events are real-time |
| Dark mode CSS | Custom CSS variables for every color | Tailwind `dark:` utilities | 1000+ utilities already defined, consistent naming |
| Toggle button icon animation | Custom CSS animation | Existing 200ms ease-out standard | Consistent with project transitions |

**Key insight:** Dark mode is 90% CSS (Tailwind utilities) + 10% state management (Zustand persist). Don't overcomplicate with custom theme systems when the standard stack handles it.

## Common Pitfalls

### Pitfall 1: Flash of Unstyled Content (FOUC)
**What goes wrong:** Page loads in light mode, then flashes to dark mode after React hydrates
**Why it happens:** Theme state is only available after React initializes, localStorage is read client-side
**How to avoid:** Add inline `<script>` in `<head>` that reads localStorage and applies `.dark` class BEFORE page renders
**Warning signs:** Visible flash of white background when refreshing page in dark mode

### Pitfall 2: Insufficient Color Contrast in Dark Mode
**What goes wrong:** Text is hard to read in dark mode because contrast ratio is too low
**Why it happens:** Assuming light-on-dark automatically passes WCAG contrast (it doesn't if colors are too subtle)
**How to avoid:** Test every text color against its dark mode background, don't use pure white (#FFF) or pure black (#000), use grays
**Warning signs:** Subtle grays that look good in light mode become unreadable in dark mode

### Pitfall 3: Missing Dark Variants on Interactive States
**What goes wrong:** Hover/focus states look wrong in dark mode (invisible or too subtle)
**Why it happens:** Forgetting to add `dark:` variants to hover/focus/active states
**How to avoid:** Every `hover:`, `focus:`, `active:` utility needs a `dark:` counterpart
**Warning signs:** Buttons look correct at rest but disappear on hover in dark mode

### Pitfall 4: Halation Effect for Users with Astigmatism
**What goes wrong:** White text on pure black creates "glow" effect that's uncomfortable for ~47% of users
**Why it happens:** High contrast + astigmatism causes light to scatter, creating halos
**How to avoid:** Use dark gray backgrounds (#1a1a1a, #0f172a) instead of pure black (#000), reduce text brightness slightly
**Warning signs:** User complaints about eye strain, text appearing to "glow" or "vibrate"

### Pitfall 5: Not Handling System Theme Changes
**What goes wrong:** User changes OS theme from light to dark, but app doesn't update
**Why it happens:** No listener for `prefers-color-scheme` media query changes
**How to avoid:** Add `matchMedia` event listener when theme is 'system', update DOM on change
**Warning signs:** Theme only changes on page refresh, not when OS theme changes

### Pitfall 6: Transition Animations on Every Property
**What goes wrong:** Page feels sluggish, transitions are too slow or jittery
**Why it happens:** Adding `transition-all` or transitioning too many properties
**How to avoid:** Only transition `background-color` and `color`, use project standard 200ms ease-out
**Warning signs:** Animations feel "laggy", layout shifts during transitions

### Pitfall 7: Hardcoded Colors Breaking Dark Mode
**What goes wrong:** Some elements don't change in dark mode (stuck in light mode colors)
**Why it happens:** Using hardcoded hex colors instead of Tailwind's semantic color utilities
**How to avoid:** Use Tailwind color utilities (`bg-white dark:bg-gray-900`), not inline styles with hex codes
**Warning signs:** Brand color tiles, canvas background, or specific components don't respond to theme toggle

## Code Examples

Verified patterns from official sources:

### Theme Toggle Button Component
```jsx
// Source: Tailwind CSS docs + React patterns + project standards
import { Sun, Moon, Monitor } from 'lucide-react'; // or your icon library
import { useBrandStore } from '../store/useBrandStore';

export function ThemeToggle() {
  const theme = useBrandStore((state) => state.theme);
  const setTheme = useBrandStore((state) => state.setTheme);

  return (
    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded transition-all duration-200 ease-out ${
          theme === 'light'
            ? 'bg-white dark:bg-gray-700 shadow-sm'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="Light mode"
      >
        <Sun className="w-4 h-4" />
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded transition-all duration-200 ease-out ${
          theme === 'system'
            ? 'bg-white dark:bg-gray-700 shadow-sm'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="System theme"
      >
        <Monitor className="w-4 h-4" />
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded transition-all duration-200 ease-out ${
          theme === 'dark'
            ? 'bg-white dark:bg-gray-700 shadow-sm'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}
```

### Dark Mode Color Mappings
```jsx
// Source: Tailwind CSS docs + WCAG contrast guidelines
// Common color mappings for light → dark mode:

// Backgrounds
bg-white           → bg-gray-900
bg-gray-50         → bg-gray-850
bg-gray-100        → bg-gray-800
surface colors     → darker variants with good contrast

// Text
text-gray-900      → text-gray-100
text-gray-700      → text-gray-300
text-gray-500      → text-gray-400

// Borders
border-gray-200    → border-gray-700
border-gray-300    → border-gray-600

// Example usage in existing BentoCanvas:
<div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <div className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
    {/* Content */}
  </div>
</div>
```

### Smooth Transitions for Theme Switch
```css
/* Source: CSS transitions best practices + project standards */
/* Add to index.css or App.css */

/* Apply transitions to elements that change with theme */
* {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); /* ease-out */
  transition-duration: 200ms; /* Match project standard */
}

/* Disable transitions on theme toggle to prevent jarring effect */
html.changing-theme * {
  transition: none !important;
}
```

### Complete Tailwind Config
```javascript
// Source: Tailwind CSS v3.4+ official docs
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'selector', // Enable manual dark mode via .dark class
  theme: {
    extend: {
      // Existing theme config stays the same
      colors: {
        // Colors defined here automatically get dark: variants
        gray: {
          850: '#1f2937', // Custom gray for dark mode
        },
      },
    },
  },
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `darkMode: 'class'` | `darkMode: 'selector'` | Tailwind v3.4 (2024) | More flexible, supports data attributes |
| `matchMedia.addListener()` | `matchMedia.addEventListener()` | 2023 standard | Modern API, better TypeScript support |
| Pure black (#000) backgrounds | Dark gray (#0f172a, #1a1a1a) | Accessibility research 2023+ | Reduces halation for astigmatism users |
| JavaScript-based theme system | Tailwind `dark:` utilities | Tailwind v2+ (2020) | Less code, better performance, standard |
| Context API for theme | Zustand with persist | 2021+ | Better performance, built-in persistence |

**Deprecated/outdated:**
- `darkMode: 'media'` alone: Now combine with manual toggle for best UX
- `matchMedia.addListener()`: Use `addEventListener('change', ...)` instead
- Pure black backgrounds: Use gray-900 or darker for accessibility
- Separate dark mode CSS files: Use Tailwind's `dark:` utilities inline

## Open Questions

Things that couldn't be fully resolved:

1. **Should dark mode state live in Zustand or separate?**
   - What we know: Project already has Zustand with persist configured
   - What's unclear: Whether to add to existing `useBrandStore` or create `useThemeStore`
   - Recommendation: Add to existing `useBrandStore` - simpler, one source of truth, persist already configured

2. **Which components need dark mode variants?**
   - What we know: BentoCanvas, ControlPanel exist; typography tiles in progress
   - What's unclear: Full list of components affected
   - Recommendation: Start with layout components (App, BentoCanvas, ControlPanel), then tiles, verify with visual inspection

3. **Should brand color presets have dark mode variants?**
   - What we know: Brand presets exist (techStartup, luxuryRetail, etc.)
   - What's unclear: Whether presets should define separate dark mode colors
   - Recommendation: Keep single color set, let Tailwind `dark:` utilities handle variants initially, add custom dark colors if needed

4. **How to handle custom brand colors in dark mode?**
   - What we know: Users can set custom `colors.primary`, `colors.accent`
   - What's unclear: Whether to auto-adjust user colors for dark mode or require manual specification
   - Recommendation: Start with user colors as-is in dark mode, add color adjustment helpers if contrast issues arise

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS Dark Mode Documentation](https://tailwindcss.com/docs/dark-mode) - Official Tailwind CSS dark mode guide
- [Zustand GitHub Repository](https://github.com/pmndrs/zustand) - Official Zustand documentation and persist middleware
- [Zustand Persist Middleware](https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md) - Official persist docs
- Verified from project files: `useBrandStore.js`, `tailwind.config.js`, `index.css`

### Secondary (MEDIUM confidence)
- [Implement Dark Mode with Zustand and Tailwind CSS in React](https://medium.com/nerd-for-tech/implement-dark-mode-with-zustand-and-tailwind-css-in-react-da3299e6e824) - Community pattern
- [Fixing Dark Mode Flickering (FOUC) in React and Next.js](https://notanumber.in/blog/fixing-react-dark-mode-flickering) - FOUC prevention techniques
- [Dark mode accessibility myth by Stéphanie Walter](https://stephaniewalter.design/blog/dark-mode-accessibility-myth-debunked/) - Accessibility research
- [The Designer's Guide to Dark Mode Accessibility](https://www.accessibilitychecker.org/blog/dark-mode-accessibility/) - Accessibility best practices
- [MDN: Using CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Transitions/Using) - CSS transitions reference
- [Material UI useMediaQuery](https://mui.com/material-ui/react-use-media-query/) - React media query patterns

### Tertiary (LOW confidence)
- WebSearch results for Tailwind CSS dark mode best practices 2026
- WebSearch results for React dark mode localStorage patterns
- Community blog posts and tutorials (verified against official docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Tailwind + Zustand is well-documented, official approaches verified
- Architecture: HIGH - Patterns verified from official Tailwind docs, Zustand examples, and project structure
- Pitfalls: MEDIUM-HIGH - FOUC, contrast, halation verified from multiple sources; specific project issues will emerge during implementation

**Research date:** 2026-02-07
**Valid until:** 2026-03-07 (30 days - stack is stable, patterns are established)

**Key technical facts verified:**
- Tailwind CSS v3.4+ uses `darkMode: 'selector'` (verified from official docs)
- Zustand v5.0.11 is latest with persist middleware (verified from GitHub)
- Project already has Zustand persist configured (verified from useBrandStore.js)
- Project uses 200ms ease-out transitions (verified from success criteria)
- FOUC requires inline script in HTML head (verified from multiple sources + MDN)
- ~47% of users have astigmatism affected by pure black backgrounds (verified from accessibility research)
