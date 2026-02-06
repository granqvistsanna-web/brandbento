# Phase 4: Color & Imagery Tiles - Research

**Researched:** 2026-02-07
**Domain:** Color manipulation (HSL pickers, WCAG contrast checking, real-time palette updates), image treatment (duotone, filters, grain overlays), performance optimization (sub-50ms updates, continuous dragging), file upload
**Confidence:** HIGH

## Summary

Phase 4 implements interactive color and imagery tiles with instant preview, WCAG contrast checking, and image treatment presets. This phase builds on Phase 2's tile system to add editing capabilities for color palette customization and image manipulation.

Research confirms that:
1. **react-colorful** (2.8KB gzipped) is the standard for HSL color pickers in React - provides HslColorPicker component with zero dependencies, full TypeScript support, and 100% test coverage
2. **WCAG contrast checking** uses established libraries (color-contrast-checker by BBC) with simple API for AA/AAA compliance checking
3. **Sub-50ms performance** requires requestAnimationFrame + useRef pattern instead of useState to avoid re-render overhead during continuous dragging
4. **Duotone effects** use CSS mix-blend-mode with pseudo-elements (darken + lighten) for GPU-accelerated performance without canvas overhead
5. **Image grain/noise** uses SVG feTurbulence filters - more performant than loading PNG textures, animatable, scalable
6. **CSS filters** (grayscale, contrast, brightness) are GPU-accelerated and sufficient for real-time preview without canvas manipulation
7. **react-dropzone** is the standard for drag-and-drop file uploads - uses HTML5 native API, hook-based, minimal overhead
8. **Hover preview pattern** requires dual state (preview/committed) to show temporary changes that revert on mouse leave
9. **Color role assignment** follows 60-30-10 rule (primary/accent/background) with "on-" prefix for text colors (Material Design pattern)

**Primary recommendation:** Use react-colorful for HSL picker, color-contrast-checker for WCAG validation, CSS filters + mix-blend-mode for image treatments (avoid canvas), requestAnimationFrame + useRef for continuous updates, react-dropzone for file upload, dual state pattern for hover previews.

## Standard Stack

### Core Libraries

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **react-colorful** | 5.6.1+ | HSL color picker component | Industry standard: 2.8KB gzipped (13x smaller than react-color), zero dependencies, 100% test coverage, full TypeScript support, WAI-ARIA compliant, provides HslColorPicker and HexColorInput components |
| **color-contrast-checker** | 2.1.0+ | WCAG AA/AAA compliance validation | BBC-developed, supports WCAG 2.0/2.1, accepts hex shorthand, provides isLevelAA/isLevelAAA methods, based on ISO-9241-3 standards |
| **react-dropzone** | 14.2.3+ | Drag-and-drop file upload | HTML5-compliant, hook-based (useDropzone), minimal API surface, handles both drag-drop and click-to-upload, file type filtering, React 16.8+ required |
| **requestAnimationFrame** | Native | Continuous updates during dragging | Native browser API, throttles to 60fps automatically, prevents render thrashing, pairs with useRef for non-state updates |
| **CSS filter + mix-blend-mode** | Native | Image treatment effects | GPU-accelerated, no canvas overhead, darken/lighten blend modes for duotone, grayscale/contrast/brightness for presets |
| **SVG feTurbulence** | Native | Grain/noise texture overlay | More performant than PNG textures, scalable, no network request, animatable |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **color-convert** | 2.0.1+ | HSL ↔ Hex ↔ RGB conversion | If react-colorful's built-in conversions insufficient (supports cmyk, hwb, ansi, CSS keywords); 11KB unpacked |
| **hsl-to-hex** | 1.0.0 | Lightweight HSL → Hex conversion | If only need one-way conversion (37 projects use it); minimal alternative to color-convert |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| **react-colorful** | react-color, @react-spectrum/color | react-color is 36KB (13x larger), unmaintained. React Spectrum ColorPicker is comprehensive but brings 200KB+ Adobe design system overhead. react-colorful is purpose-built, tiny, maintained. |
| **CSS filters** | Canvas pixel manipulation | Canvas gives precise control but 10-50x slower for real-time preview, requires CORS handling for external images, blocks UI thread. CSS filters are GPU-accelerated, instant preview. |
| **react-dropzone** | react-drag-drop-files, dnd-kit, Uppy | react-drag-drop-files is simpler but less flexible. dnd-kit is overkill (general drag-drop, not file-specific). Uppy is heavy (chunked uploads, resumable - unnecessary). react-dropzone is focused, maintained, lightweight. |
| **CSS mix-blend-mode duotone** | Canvas duotone, react-image-filter | Canvas approach can be slow for large images, requires CORS. react-image-filter adds bundle weight. CSS blend modes are instant, GPU-accelerated, native. |
| **SVG grain filter** | PNG grain texture overlay | PNG requires network request, fixed resolution, no animation. SVG feTurbulence is code-only, scalable, animatable, more performant. |

### Installation

```bash
# Color picker
npm install react-colorful

# WCAG contrast checker
npm install color-contrast-checker

# File upload
npm install react-dropzone

# Optional: color conversion utilities
npm install color-convert
npm install -D @types/color-convert
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── tiles/
│   │   ├── ColorTile.tsx          # Color palette display + edit
│   │   └── ImageryTile.tsx        # Image display + treatment
│   ├── pickers/
│   │   ├── ColorPicker.tsx        # HSL picker wrapper (react-colorful)
│   │   ├── PalettePresets.tsx    # Preset palette buttons
│   │   └── TreatmentPresets.tsx  # Image treatment buttons
│   ├── controls/
│   │   ├── ColorSwatch.tsx       # Individual color swatch with role
│   │   ├── ContrastBadge.tsx     # WCAG AA/AAA indicator
│   │   ├── RoleDropdown.tsx      # Color role assignment
│   │   └── ImageUpload.tsx       # Dropzone wrapper
│   └── filters/
│       ├── DuotoneFilter.tsx     # Duotone CSS filter overlay
│       ├── GrainFilter.tsx       # SVG feTurbulence grain
│       └── TreatmentFilter.tsx   # Unified filter component
├── utils/
│   ├── colorContrast.ts          # WCAG contrast calculations
│   ├── colorConversion.ts        # HSL ↔ Hex helpers
│   ├── paletteGenerator.ts       # Generate warm/cool/muted presets
│   └── imageFilters.ts           # CSS filter string builders
├── hooks/
│   ├── useColorPicker.ts         # Color picker state + continuous updates
│   ├── useContrastCheck.ts       # Real-time WCAG validation
│   ├── useHoverPreview.ts        # Temporary preview pattern (reuse from Phase 3)
│   └── useImageUpload.ts         # File upload + validation
└── state/
    └── canvasState.ts            # Extended with color roles + image treatments
```

### Pattern 1: HSL Color Picker with Continuous Updates

**What:** Real-time color updates during dragging without triggering full React re-renders.

**When to use:** Color picker dragging (COLR-06), palette updates under 50ms (COLR-11).

**Example:**
```typescript
// src/components/pickers/ColorPicker.tsx
import { HslColorPicker, HslColor } from 'react-colorful';
import { useRef, useCallback, useEffect } from 'react';
import { useCanvasStore } from '@/state/canvasState';

interface ColorPickerProps {
  colorRole: 'primary' | 'accent' | 'background' | 'text';
  onClose: () => void;
}

export function ColorPicker({ colorRole, onClose }: ColorPickerProps) {
  const currentColor = useCanvasStore(state => state.assets.colors[colorRole]);
  const setColor = useCanvasStore(state => state.setColorByRole);

  // Use ref for continuous updates to avoid re-render overhead
  const rafRef = useRef<number | null>(null);
  const latestColorRef = useRef<HslColor>(hexToHsl(currentColor));

  const handleChange = useCallback((color: HslColor) => {
    latestColorRef.current = color;

    // Cancel pending frame
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    // Schedule update on next frame (throttled to 60fps)
    rafRef.current = requestAnimationFrame(() => {
      const hex = hslToHex(latestColorRef.current);
      setColor(colorRole, hex);
      rafRef.current = null;
    });
  }, [colorRole, setColor]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div className="color-picker-panel">
      <HslColorPicker color={latestColorRef.current} onChange={handleChange} />
      <HexColorInput
        color={hslToHex(latestColorRef.current)}
        onChange={(hex) => handleChange(hexToHsl(hex))}
      />
      <ContrastBadge colorRole={colorRole} />
    </div>
  );
}
```

**Key technique:** requestAnimationFrame automatically throttles to 60fps (~16.67ms), ensuring sub-50ms updates. useRef avoids triggering React re-renders during continuous dragging.

**Source:** [ReactJS useState vs useRef - Optimizing Performance](https://medium.com/@rrardian/usestate-vs-useref-optimizing-react-performance-by-preventing-unnecessary-re-renders-c8c9e4211cb2), [requestAnimationFrame for debouncing](https://gomakethings.com/debouncing-events-with-requestanimationframe-for-better-performance/)

### Pattern 2: WCAG Contrast Checking

**What:** Real-time contrast ratio validation between text and background colors.

**When to use:** Color palette updates (COLR-02), role reassignment (COLR-10).

**Example:**
```typescript
// src/utils/colorContrast.ts
import ColorContrastChecker from 'color-contrast-checker';

const checker = new ColorContrastChecker();

export interface ContrastResult {
  ratio: number;
  AA: boolean;      // 4.5:1 for normal text, 3:1 for large
  AAA: boolean;     // 7:1 for normal text, 4.5:1 for large
  level: 'AAA' | 'AA' | 'fail';
}

export function checkContrast(
  textColor: string,   // hex: "#FFFFFF"
  bgColor: string,     // hex: "#000000"
  fontSize: number = 16
): ContrastResult {
  const AA = checker.isLevelAA(textColor, bgColor, fontSize);
  const AAA = checker.isLevelAAA(textColor, bgColor, fontSize);

  // Calculate ratio manually for display (BBC library doesn't expose it)
  const ratio = calculateContrastRatio(textColor, bgColor);

  return {
    ratio,
    AA,
    AAA,
    level: AAA ? 'AAA' : AA ? 'AA' : 'fail',
  };
}

function calculateContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map(val => {
    const sRGB = val / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
```

**Key technique:** BBC's color-contrast-checker handles WCAG compliance. Luminance calculation uses ITU-R BT.709 formula (same as Phase 3 logo luminance detection).

**Source:** [BBC color-contrast-checker](https://github.com/bbc/color-contrast-checker), [WCAG 2.1 Contrast Guidelines](https://www.interaction-design.org/literature/article/ui-color-palette)

### Pattern 3: Duotone Image Effect with CSS Blend Modes

**What:** Two-color image treatment using CSS mix-blend-mode (highlights and shadows).

**When to use:** Duotone preset (IMGR-05), mapping to brand colors.

**Example:**
```typescript
// src/components/filters/DuotoneFilter.tsx
interface DuotoneFilterProps {
  image: string;
  highlightColor: string;  // Hex (e.g., primary color)
  shadowColor: string;     // Hex (e.g., background color)
}

export function DuotoneFilter({ image, highlightColor, shadowColor }: DuotoneFilterProps) {
  return (
    <div className="duotone-container" style={{
      position: 'relative',
      backgroundColor: shadowColor, // Base color for shadows
    }}>
      {/* Image layer with darken blend mode */}
      <img
        src={image}
        alt="Duotone"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'grayscale(100%) contrast(1)',
          mixBlendMode: 'darken',
        }}
      />

      {/* Highlight overlay with lighten blend mode */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: highlightColor,
          mixBlendMode: 'lighten',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
```

**Key technique:** Darken blend mode keeps darker pixels (shadows), lighten blend mode keeps lighter pixels (highlights). Grayscale first converts to monochrome. GPU-accelerated, instant preview.

**Source:** [CSS Duotone with mix-blend-mode](https://dev.to/itsjp/how-to-apply-a-duotone-effect-to-images-with-css-5gj2), [Duotone using CSS blend modes](https://jmperezperez.com/blog/duotone-using-css-blend-modes/)

### Pattern 4: SVG Grain Filter

**What:** Perlin noise overlay using SVG feTurbulence filter for film grain effect.

**When to use:** Grain treatment preset (IMGR-04, IMGR-08).

**Example:**
```typescript
// src/components/filters/GrainFilter.tsx
interface GrainFilterProps {
  image: string;
  intensity?: number;  // 0-1
}

export function GrainFilter({ image, intensity = 0.5 }: GrainFilterProps) {
  const filterId = `grain-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div style={{ position: 'relative' }}>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id={filterId}>
            {/* Generate Perlin noise */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="4"
              stitchTiles="stitch"
            />
            {/* Adjust intensity */}
            <feColorMatrix
              type="saturate"
              values="0"
            />
            <feComponentTransfer>
              <feFuncA type="discrete" tableValues={`0 ${intensity}`} />
            </feComponentTransfer>
            {/* Blend with source */}
            <feBlend mode="multiply" in2="SourceGraphic" />
          </filter>
        </defs>
      </svg>

      <img
        src={image}
        alt="Grainy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: `url(#${filterId})`,
        }}
      />
    </div>
  );
}
```

**Key technique:** feTurbulence generates Perlin noise, feColorMatrix desaturates, feComponentTransfer controls opacity, feBlend multiplies with source image. More performant than loading PNG texture.

**Source:** [Grainy Gradients with SVG](https://css-tricks.com/grainy-gradients/), [SVG Grainy Filters](https://webdesign.tutsplus.com/better-web-images-with-svg-grainy-filters--cms-39739t)

### Pattern 5: Image Treatment Presets

**What:** Pre-defined CSS filter combinations for instant image effects.

**When to use:** Treatment preset buttons (IMGR-04, IMGR-07).

**Example:**
```typescript
// src/utils/imageFilters.ts
export type TreatmentPreset =
  | 'original'
  | 'duotone'
  | 'bw'
  | 'hi-contrast'
  | 'soft'
  | 'grain';

export function getTreatmentFilter(preset: TreatmentPreset): string {
  switch (preset) {
    case 'original':
      return 'none';

    case 'bw':
      return 'grayscale(100%)';

    case 'hi-contrast':
      return 'contrast(1.3) saturate(1.2) brightness(1.05)';

    case 'soft':
      return 'contrast(0.85) saturate(0.9) brightness(1.1)';

    // Duotone and grain use component-based filters (not CSS string)
    default:
      return 'none';
  }
}

// Usage in component
export function ImageryTile() {
  const [treatment, setTreatment] = useState<TreatmentPreset>('original');
  const [hoverPreview, setHoverPreview] = useHoverPreview(treatment);

  const currentTreatment = hoverPreview ?? treatment;
  const filterString = getTreatmentFilter(currentTreatment);

  return (
    <div className="imagery-tile">
      {currentTreatment === 'duotone' ? (
        <DuotoneFilter image={image} {...duotoneColors} />
      ) : currentTreatment === 'grain' ? (
        <GrainFilter image={image} intensity={0.5} />
      ) : (
        <img
          src={image}
          style={{ filter: filterString }}
          className="tile-image"
        />
      )}

      <TreatmentPresets
        current={treatment}
        onHover={setHoverPreview}
        onClick={setTreatment}
      />
    </div>
  );
}
```

**Key technique:** CSS filter strings for simple effects (grayscale, contrast, brightness), component-based filters for complex effects (duotone, grain). Hover preview uses dual state pattern from Phase 3.

**Source:** [CSS Filter Performance](https://www.f22labs.com/blogs/how-css-properties-affect-website-performance/), [GPU-accelerated CSS](https://helloamitpal.medium.com/gpu-accelerated-css-properties-de656c1ced97)

### Pattern 6: Hover Preview with State Revert

**What:** Temporarily apply changes on hover, revert on mouse leave, commit on click.

**When to use:** Palette preset hover (COLR-08), treatment preset hover (IMGR-07).

**Example:**
```typescript
// src/hooks/useHoverPreview.ts (reuse from Phase 3)
import { useState, useCallback } from 'react';

export function useHoverPreview<T>(committedValue: T) {
  const [previewValue, setPreviewValue] = useState<T | null>(null);

  const onHoverStart = useCallback((value: T) => {
    setPreviewValue(value);
  }, []);

  const onHoverEnd = useCallback(() => {
    setPreviewValue(null);
  }, []);

  const activeValue = previewValue ?? committedValue;

  return {
    activeValue,        // Use this for rendering
    isPreviewActive: previewValue !== null,
    onHoverStart,
    onHoverEnd,
  };
}

// Usage
function PalettePresets() {
  const currentPalette = useCanvasStore(state => state.assets.colors);
  const setPalette = useCanvasStore(state => state.setPalette);
  const preview = useHoverPreview(currentPalette);

  return (
    <div className="presets">
      {PALETTE_PRESETS.map(preset => (
        <button
          key={preset.name}
          onMouseEnter={() => preview.onHoverStart(preset.colors)}
          onMouseLeave={preview.onHoverEnd}
          onClick={() => setPalette(preset.colors)}
        >
          {preset.name}
        </button>
      ))}
    </div>
  );
}
```

**Key technique:** useState for preview state (separate from committed Zustand state), null when not previewing. Mouse enter sets preview, mouse leave clears it, click commits to store.

**Source:** [React onHover Event Handling](https://upmostly.com/tutorials/react-onhover-event-handling-with-examples), [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)

### Pattern 7: File Upload with Drag-and-Drop

**What:** HTML5-compliant file upload with both drag-and-drop and click-to-browse.

**When to use:** Image replacement (IMGR-03).

**Example:**
```typescript
// src/components/controls/ImageUpload.tsx
import { useDropzone } from 'react-dropzone';
import { useCallback } from 'react';
import { useCanvasStore } from '@/state/canvasState';

const ACCEPTED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ImageUpload() {
  const setHeroImage = useCanvasStore(state => state.setHeroImage);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // Convert to data URI for storage
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      setHeroImage(dataUri);
    };
    reader.readAsDataURL(file);
  }, [setHeroImage]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop image here</p>
      ) : (
        <p>Drag image or click to browse</p>
      )}
      {fileRejections.length > 0 && (
        <p className="error">
          Invalid file: {fileRejections[0].errors[0].message}
        </p>
      )}
    </div>
  );
}
```

**Key technique:** react-dropzone's useDropzone hook provides getRootProps/getInputProps for HTML5 file API integration. FileReader converts to data URI for storage (consistent with Phase 1 image extraction).

**Source:** [react-dropzone documentation](https://github.com/react-dropzone/react-dropzone), [FileReader API](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)

### Pattern 8: Color Role Assignment

**What:** Semantic color roles (primary, accent, background, text) with "on-" prefix for contrast pairs.

**When to use:** Role reassignment dropdown (COLR-09), palette organization.

**Example:**
```typescript
// src/types/brand.ts (extend existing)
export interface ColorPalette {
  primary: string;          // Main brand color (60% usage)
  accent: string;           // Highlight color (10% usage)
  background: string;       // Surface color (30% usage)
  text: string;             // Body text color
  onPrimary: string;        // Text on primary background
  onAccent: string;         // Text on accent background
}

// src/utils/paletteGenerator.ts
export function generatePalette(
  baseColors: string[],
  style: 'warm' | 'cool' | 'muted' | 'bold' | 'editorial'
): ColorPalette {
  // Extract most saturated color as primary
  const primary = baseColors.sort((a, b) =>
    getSaturation(b) - getSaturation(a)
  )[0];

  // Apply style transformation
  switch (style) {
    case 'warm':
      return {
        primary: shiftHue(primary, 15),       // Warmer
        accent: shiftHue(primary, -30),
        background: '#FFF9F5',                // Warm neutral
        text: '#2C1810',
        onPrimary: getContrastColor(primary),
        onAccent: getContrastColor(shiftHue(primary, -30)),
      };

    case 'cool':
      return {
        primary: shiftHue(primary, -15),      // Cooler
        accent: shiftHue(primary, 30),
        background: '#F5F9FF',                // Cool neutral
        text: '#0F1C2E',
        onPrimary: getContrastColor(primary),
        onAccent: getContrastColor(shiftHue(primary, 30)),
      };

    case 'muted':
      return {
        primary: desaturate(primary, 0.3),    // Lower saturation
        accent: desaturate(primary, 0.2),
        background: '#F8F8F6',                // Muted neutral
        text: '#3A3A37',
        onPrimary: getContrastColor(desaturate(primary, 0.3)),
        onAccent: getContrastColor(desaturate(primary, 0.2)),
      };

    case 'bold':
      return {
        primary: saturate(primary, 0.3),      // Higher saturation
        accent: complementary(primary),       // Opposite on color wheel
        background: '#FFFFFF',
        text: '#000000',
        onPrimary: getContrastColor(saturate(primary, 0.3)),
        onAccent: getContrastColor(complementary(primary)),
      };

    case 'editorial':
      return {
        primary: desaturate(primary, 0.5),    // Very muted
        accent: shiftHue(primary, 180),       // Complementary but muted
        background: '#FFFCF5',                // Warm paper
        text: '#1A1814',
        onPrimary: getContrastColor(desaturate(primary, 0.5)),
        onAccent: getContrastColor(shiftHue(primary, 180)),
      };
  }
}

function getContrastColor(bgColor: string): string {
  const luminance = getLuminance(bgColor);
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
```

**Key technique:** Material Design color role system with semantic names. "on-" prefix indicates text/icon color for a background. Auto-calculate contrast colors using luminance detection.

**Source:** [Material Design Color Roles](https://m3.material.io/styles/color/roles), [60-30-10 Color Rule](https://www.interaction-design.org/literature/article/ui-color-palette)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| **HSL color picker UI** | Custom picker with canvas/gradients | react-colorful | HSL color space math is complex (hue ring geometry, saturation/lightness squares), touch/mouse handling is error-prone, accessibility (keyboard nav, ARIA) is mandatory. react-colorful is 2.8KB, battle-tested, WAI-ARIA compliant. |
| **WCAG contrast ratio calculation** | Manual luminance formula implementation | color-contrast-checker | Luminance calculation is precise (ITU-R BT.709), WCAG has specific rounding rules, AA/AAA thresholds vary by font size. BBC library is ISO-compliant, handles edge cases (shorthand hex, case insensitivity). |
| **File upload drag-and-drop** | Manual dragenter/dragleave/drop handlers | react-dropzone | Drag events fire multiple times per pixel moved, dragenter/dragleave bubble to children causing flicker, file validation is repetitive. react-dropzone handles all edge cases, provides isDragActive state, validates MIME types. |
| **Color space conversions** | Manual HSL ↔ Hex ↔ RGB formulas | react-colorful (built-in) or color-convert | Conversion formulas have precision issues (rounding, normalization), edge cases (grayscale, full saturation). Libraries are tested across color space boundaries. |
| **Duotone image effect** | Canvas pixel manipulation | CSS mix-blend-mode | Canvas requires iterating every pixel (slow for large images), CORS issues with external images, blocks UI thread. CSS blend modes are GPU-accelerated, instant, no CORS issues. |
| **Grain/noise texture** | Pre-rendered PNG texture files | SVG feTurbulence filter | PNG textures require network requests (latency), fixed resolution (pixelation), multiple files for intensities. SVG filter is code-only, scalable, parameterizable, more performant. |
| **Real-time continuous updates** | Debounce with setTimeout | requestAnimationFrame | setTimeout doesn't sync with browser paint cycle (can cause jank), manual debounce logic is error-prone. requestAnimationFrame throttles to 60fps automatically, cancels pending frames on unmount. |

**Key insight:** Color manipulation and image effects are deceptively complex. HSL color pickers require precise geometry, WCAG calculations have rounding rules, drag-and-drop has bubbling issues, and canvas pixel manipulation is slow. CSS filters and established libraries handle edge cases and performance optimization.

## Common Pitfalls

### Pitfall 1: Using useState for Continuous Dragging Updates

**What goes wrong:** Color picker dragging triggers 60+ re-renders per second, causing lag, dropped frames, and unresponsive UI.

**Why it happens:** Every useState update triggers React reconciliation. At 60fps, that's 60 re-renders/second. On slower devices or complex UIs, this causes visible lag and violates the 50ms update requirement (COLR-11).

**How to avoid:** Use useRef + requestAnimationFrame pattern (see Pattern 1). Store dragging state in ref (mutable, no re-render), schedule updates with requestAnimationFrame (throttled to 60fps), only update Zustand store on frame (not on every mouse move).

**Warning signs:**
- Color picker feels sluggish or jumpy during dragging
- Browser DevTools Performance tab shows long tasks (>50ms) during color changes
- React DevTools Profiler shows 60+ renders/second on ColorPicker component

**Source:** [useState vs useRef for performance](https://medium.com/@rrardian/usestate-vs-useref-optimizing-react-performance-by-preventing-unnecessary-re-renders-c8c9e4211cb2), [requestAnimationFrame explained](https://dev.to/tawe/requestanimationframe-explained-why-your-ui-feels-laggy-and-how-to-fix-it-3ep2)

### Pitfall 2: Canvas Pixel Manipulation for Image Effects

**What goes wrong:** Using canvas getImageData/putImageData for duotone or filters is 10-50x slower than CSS, blocks UI thread, requires CORS handling.

**Why it happens:** Canvas pixel manipulation iterates every pixel (e.g., 1920x1080 = 2 million pixels), runs on main thread (blocks UI), requires toDataURL (slow), and fails on cross-origin images without CORS headers.

**How to avoid:** Use CSS filters + mix-blend-mode for real-time effects (GPU-accelerated, instant preview). Only use canvas for effects impossible with CSS (e.g., custom pixel algorithms).

**Warning signs:**
- Image treatment preview has noticeable delay (>100ms)
- Browser freezes or becomes unresponsive when applying filters
- Console errors: "Tainted canvases may not be exported" or CORS errors
- Mobile devices struggle with filter preview

**Source:** [Web Image Effects Performance Showdown](https://www.smashingmagazine.com/2016/05/web-image-effects-performance-showdown/), [CSS Duotone with mix-blend-mode](https://dev.to/itsjp/how-to-apply-a-duotone-effect-to-images-with-css-5gj2)

### Pitfall 3: Incorrect Contrast Ratio Calculation

**What goes wrong:** Manual WCAG contrast calculation gets rounding wrong, misses edge cases (sRGB gamma correction), or uses wrong luminance formula.

**Why it happens:** WCAG uses specific formulas (relative luminance with sRGB gamma correction, contrast ratio with +0.05 offset), rounding rules matter for pass/fail thresholds, and font size affects AA/AAA requirements.

**How to avoid:** Use color-contrast-checker library (BBC, ISO-compliant). If implementing manually, follow W3C spec exactly: sRGB gamma correction (≤0.03928 → linear, >0.03928 → power curve), ITU-R BT.709 weights (0.2126R + 0.7152G + 0.0722B), contrast ratio = (lighter + 0.05) / (darker + 0.05).

**Warning signs:**
- Contrast badge shows "AA" but text is barely readable
- Contrast ratios don't match online checkers (WebAIM, Coolors)
- Edge cases fail (pure white, pure black, near-black grays)

**Source:** [WCAG 2.1 Contrast Guidelines](https://www.interaction-design.org/literature/article/ui-color-palette), [BBC color-contrast-checker](https://github.com/bbc/color-contrast-checker)

### Pitfall 4: backdrop-filter Performance Issues

**What goes wrong:** Using backdrop-filter: blur() for image effects causes frame drops, sluggish scrolling, and high GPU usage.

**Why it happens:** backdrop-filter recalculates blur on every repaint (expensive), triggers GPU compositing layer creation, and multiplies cost when multiple elements use it. Mobile devices particularly struggle.

**How to avoid:** Avoid backdrop-filter for image treatments. Use CSS filter (not backdrop-filter) for static images, or pre-blur images and swap them. Limit backdrop-filter to small areas (modals, navigation) and keep blur radius <20px.

**Warning signs:**
- Scrolling feels janky when image tile is visible
- DevTools Performance shows long GPU tasks
- Mobile devices heat up or drain battery quickly
- Chrome DevTools Layers panel shows excessive compositing layers

**Source:** [backdrop-filter Performance Issues](https://medium.com/@JTCreateim/backdrop-filter-property-in-css-leads-to-choppiness-in-streaming-video-45fa83f3521b), [Costly CSS Properties](https://dev.to/leduc1901/costly-css-properties-and-how-to-optimize-them-3bmd)

### Pitfall 5: Hover Preview State Leaks

**What goes wrong:** Hover preview state persists after mouse leave (user sees wrong colors/treatments), or preview applies without user action.

**Why it happens:** onMouseLeave doesn't fire when element is removed from DOM, rapid hover/click causes state update race conditions, or parent component unmounts while preview is active.

**How to avoid:**
1. Set preview to null on unmount (useEffect cleanup)
2. Clear preview on click (commit action)
3. Use separate preview state (not overwriting committed state)
4. Test rapid hover → click sequences

**Warning signs:**
- Palette preset hover "sticks" after clicking
- Treatment preview shows wrong effect after switching tiles
- Preview state carries over when navigating back to tile
- Console warnings about setState on unmounted component

**Source:** [React onHover Event Handling](https://upmostly.com/tutorials/react-onhover-event-handling-with-examples), [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)

### Pitfall 6: File Upload Data URI Size Explosion

**What goes wrong:** Uploading large images (5MB JPEG) creates data URIs that exceed URL length limits (2000 chars), breaking sharing workflow.

**Why it happens:** Base64 encoding increases size by ~33% (5MB → 6.6MB Base64). URL state uses lz-string compression but data URIs don't compress well (already encoded).

**How to avoid:**
1. Resize images on upload (max 1920px width, quality 85%)
2. Store data URI hash in URL state, full URI in localStorage (Phase 1 pattern)
3. Warn user when image size exceeds threshold (before upload)
4. Consider Cloudflare Images R2 for user-uploaded images (future optimization)

**Warning signs:**
- Share URL exceeds 2000 chars after image upload
- lz-string compression fails or times out
- Browser performance degrades with large data URIs
- Canvas state serialization takes >100ms

**Source:** Phase 1 decisions (lz-string compression, URL state <2000 chars), [lz-string documentation](https://www.npmjs.com/package/lz-string)

## Code Examples

Verified patterns from official sources.

### Color Picker with HEX Input

```typescript
// Source: https://github.com/omgovich/react-colorful
import { HslColorPicker } from 'react-colorful';
import { HexColorInput } from 'react-colorful';

function ColorPickerPanel() {
  const [color, setColor] = useState({ h: 200, s: 50, l: 50 });

  const handleHexChange = (hex: string) => {
    setColor(hexToHsl(hex));
  };

  return (
    <>
      <HslColorPicker color={color} onChange={setColor} />
      <HexColorInput
        color={hslToHex(color)}
        onChange={handleHexChange}
        prefixed
        alpha
      />
    </>
  );
}
```

### WCAG Contrast Check

```typescript
// Source: https://github.com/bbc/color-contrast-checker
import ColorContrastChecker from 'color-contrast-checker';

const checker = new ColorContrastChecker();

// Check AA compliance
const isAA = checker.isLevelAA('#FFFFFF', '#000000', 14);
console.log(isAA); // true

// Check AAA compliance
const isAAA = checker.isLevelAAA('#FFFFFF', '#000000', 14);
console.log(isAAA); // true

// Check custom ratio
const meetsRatio = checker.isLevelCustom('#FFFFFF', '#000000', 3.0);
```

### Drag-and-Drop File Upload

```typescript
// Source: https://github.com/react-dropzone/react-dropzone
import { useDropzone } from 'react-dropzone';

function ImageDropzone() {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? <p>Drop here</p> : <p>Drag or click</p>}
    </div>
  );
}
```

### CSS Duotone Effect

```css
/* Source: https://dev.to/itsjp/how-to-apply-a-duotone-effect-to-images-with-css-5gj2 */
.duotone-container {
  position: relative;
  background-color: #0a192f; /* Shadow color */
}

.duotone-container img {
  display: block;
  width: 100%;
  filter: grayscale(100%) contrast(1);
  mix-blend-mode: darken;
}

.duotone-container::after {
  content: '';
  position: absolute;
  inset: 0;
  background-color: #64ffda; /* Highlight color */
  mix-blend-mode: lighten;
  pointer-events: none;
}
```

### SVG Grain Filter

```tsx
// Source: https://css-tricks.com/grainy-gradients/
function GrainOverlay() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feBlend mode="multiply" in2="SourceGraphic" />
        </filter>
      </defs>
    </svg>
  );
}

// Apply to image
<img src={image} style={{ filter: 'url(#grain)' }} />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| **react-color** | **react-colorful** | 2020 | react-colorful is 13x smaller (2.8KB vs 36KB), uses hooks instead of class components, maintained. react-color is unmaintained since 2020. |
| **Canvas pixel manipulation for filters** | **CSS filter + mix-blend-mode** | 2015 (CSS filters stable) | CSS filters are GPU-accelerated, instant preview, no CORS issues. Canvas is 10-50x slower, blocks UI thread, requires CORS. |
| **setTimeout debounce for dragging** | **requestAnimationFrame throttle** | 2016 (rAF widely supported) | rAF syncs with browser paint cycle (no jank), automatically throttles to 60fps, cancels pending frames. setTimeout can overshoot or undershoot frame timing. |
| **PNG grain textures** | **SVG feTurbulence filters** | 2018 (SVG filters IE11+) | SVG filters are scalable, no network request, animatable, parameterizable. PNG textures are fixed resolution, require loading, multiple files for intensities. |
| **Custom WCAG calculators** | **color-contrast-checker (BBC)** | 2016 (WCAG 2.1) | BBC library is ISO-compliant, handles edge cases, tested across browsers. Custom implementations miss sRGB gamma correction, rounding rules, font size thresholds. |
| **react-beautiful-dnd for file upload** | **react-dropzone for files** | 2021 (hello-pangea fork) | react-dropzone is purpose-built for file upload (8KB), HTML5-compliant. react-beautiful-dnd is general drag-drop (100KB+), overkill for files. |

**Deprecated/outdated:**
- **react-color**: Unmaintained since 2020, class-based components, 36KB bundle. Use react-colorful.
- **react-fontpicker-ts**: 8MB bundle size, includes entire Google Fonts list. Use Google Fonts API v2 directly.
- **Canvas-based image filters**: Slow, CORS issues, blocks UI thread. Use CSS filter + mix-blend-mode.
- **color.js, tinycolor**: Heavy color manipulation libraries (20-50KB). Use react-colorful's built-in conversions or color-convert (11KB).

## Open Questions

Things that couldn't be fully resolved:

1. **Palette preset generation algorithms**
   - What we know: Color theory (warm = +hue, cool = -hue, muted = -saturation, bold = +saturation, complementary = +180° hue)
   - What's unclear: Optimal hue shift amounts (15° vs 30° vs 45°), saturation multipliers (0.7x vs 0.5x for muted), whether to use extracted colors as base or regenerate entirely
   - Recommendation: Start with simple HSL transformations (±15° hue, ±0.2 saturation), test with real brand colors, iterate based on visual quality. Consider using Poline library if algorithmic generation proves insufficient.

2. **Color overlay slider blending with treatments**
   - What we know: IMGR-06 requires semi-transparent primary color wash (0-60%). CSS allows rgba overlays with mix-blend-mode.
   - What's unclear: How color overlay interacts with duotone (both manipulate color), whether grain should be above or below overlay, performance impact of stacking multiple blend modes
   - Recommendation: Implement overlay as separate layer above duotone/filters, test performance with 3+ simultaneous blend modes, provide "flatten" option if performance degrades

3. **Image treatment thumbnail generation**
   - What we know: IMGR-08 requires thumbnails showing current image with each filter applied
   - What's unclear: Whether to pre-generate all thumbnails (fast switching but memory cost) or generate on-demand (slower but lower memory), optimal thumbnail size (48px? 64px? 96px?)
   - Recommendation: Generate thumbnails on-demand with 64px size, cache in React state (not localStorage - too large), use CSS transforms for miniaturization (fast, GPU-accelerated)

4. **WCAG contrast checking for dynamic palettes**
   - What we know: COLR-02 requires always-visible contrast check. Color-contrast-checker validates text/background pairs.
   - What's unclear: Which color pairs to check (text on background? text on primary? all combinations?), whether to block color changes on fail (COLR-10 says non-blocking warning), how to display multiple contrast ratios without cluttering UI
   - Recommendation: Check text-on-background (primary pair) and display prominently. Check other pairs and show warnings in expandable panel. Never block changes - always allow user override with warning.

5. **Data URI compression for uploaded images**
   - What we know: Phase 1 uses lz-string for URL state, stores large data URIs separately with hash references
   - What's unclear: Whether to compress images before upload (client-side resize/quality), optimal size threshold for localStorage vs hash reference, whether to use WebP conversion for smaller size
   - Recommendation: Resize on upload (max 1920px, JPEG quality 85%), convert to WebP if browser supports (20-30% smaller), store hash in URL state, full URI in localStorage (Phase 1 pattern). LOW confidence - needs validation with real images.

## Sources

### Primary (HIGH confidence)

- **react-colorful**: [GitHub](https://github.com/omgovich/react-colorful) - 2.8KB HSL color picker, verified bundle size, TypeScript support, component API
- **color-contrast-checker**: [GitHub](https://github.com/bbc/color-contrast-checker) - BBC WCAG library, verified API methods, ISO-compliant
- **react-dropzone**: [GitHub](https://github.com/react-dropzone/react-dropzone) - HTML5 file upload, verified hook API, file type filtering
- **CSS Duotone with mix-blend-mode**: [DEV Community](https://dev.to/itsjp/how-to-apply-a-duotone-effect-to-images-with-css-5gj2) - Verified CSS technique, darken/lighten blend modes
- **Grainy Gradients (SVG feTurbulence)**: [CSS-Tricks](https://css-tricks.com/grainy-gradients/) - Verified SVG filter technique, performance comparison with PNG
- **useState vs useRef for Performance**: [Medium](https://medium.com/@rrardian/usestate-vs-useref-optimizing-react-performance-by-preventing-unnecessary-re-renders-c8c9e4211cb2) - Verified React performance pattern
- **requestAnimationFrame for Debouncing**: [Go Make Things](https://gomakethings.com/debouncing-events-with-requestanimationframe-for-better-performance/) - Verified rAF throttling pattern

### Secondary (MEDIUM confidence)

- **Material Design Color Roles**: [Material Design 3](https://m3.material.io/styles/color/roles) - Color role system (primary, accent, on-primary), official Google documentation
- **UI Color Palette Best Practices**: [Interaction Design Foundation](https://www.interaction-design.org/literature/article/ui-color-palette) - 60-30-10 rule, WCAG contrast requirements, verified with multiple sources
- **CSS Filter Performance**: [F22 Labs](https://www.f22labs.com/blogs/how-css-properties-affect-website-performance/) - GPU acceleration notes, backdrop-filter warnings
- **Web Image Effects Performance Showdown**: [Smashing Magazine](https://www.smashingmagazine.com/2016/05/web-image-effects-performance-showdown/) - Canvas vs CSS filter benchmarks (2016, older but principles still valid)
- **React Hover Event Handling**: [Upmostly](https://upmostly.com/tutorials/react-onhover-event-handling-with-examples) - onMouseEnter/onMouseLeave pattern
- **Top 5 Drag-and-Drop Libraries for React**: [Puck Editor](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react) - react-dropzone comparison with alternatives

### Tertiary (LOW confidence)

- **Poline Color Palette Generator**: [Poline](https://meodai.github.io/poline/) - Algorithmic palette generation, not verified with project requirements
- **2026 Color Trends**: [Lounge Lizard](https://www.loungelizard.com/blog/web-design-color-trends/) - Warm/cool/muted palette trends, subjective design trends
- **Color Palette Generation Algorithms**: WebSearch results - HSL transformation techniques (hue shift, saturation multipliers), not verified with real-world testing
- **React Undo/Redo Libraries**: WebSearch results - use-undo, redux-undo - not needed for this phase (hover preview handles temporary state), marked for potential future use

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - react-colorful, color-contrast-checker, react-dropzone are verified industry standards with official documentation
- Architecture patterns: HIGH - requestAnimationFrame + useRef, CSS filters, duotone blend modes are verified techniques with performance testing
- Pitfalls: HIGH - Canvas performance, backdrop-filter issues, useState re-render overhead are documented problems with established solutions
- Color palette generation: MEDIUM - HSL transformation algorithms are theoretically sound but not verified with real brand colors
- Image treatment thumbnails: MEDIUM - On-demand generation is logical but optimal thumbnail size needs testing

**Research date:** 2026-02-07
**Valid until:** ~30 days (2026-03-09) - Color manipulation and image effects are stable domains. react-colorful, color-contrast-checker, react-dropzone are mature libraries with infrequent breaking changes. CSS filter and mix-blend-mode are established standards.
