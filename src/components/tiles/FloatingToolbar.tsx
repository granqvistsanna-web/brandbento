/**
 * Floating Toolbar System
 *
 * Portal-rendered toolbar that appears beside a focused tile for
 * content editing. Renders outside the tile DOM via `createPortal`
 * so it isn't clipped by `overflow: hidden` tile containers.
 *
 * Architecture:
 * - **FloatingToolbar** — Positions a panel to the right (or left if
 *   no room) of the tile's bounding rect. Rendered into `document.body`.
 * - **ToolbarActions** — Shuffle / upload / lock row for image tiles.
 * - **ToolbarTextInput** — Inline label + text field with live preview
 *   (`onChange`) and committed save (`onCommit` on blur).
 * - **ToolbarSlider** — Range input with custom track/thumb styling.
 * - **ToolbarSegmented** — Pill-style option switcher.
 * - **ToolbarItemList** — Editable numbered list (e.g. menu items).
 * - **ToolbarLabel** — Section heading.
 * - **ToolbarDivider** — Horizontal 1px rule.
 *
 * @module FloatingToolbar
 */
import { useRef, useCallback, useState, useEffect, useLayoutEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  RiShuffleFill as Shuffle,
  RiImageAddFill as ImagePlus,
  RiLockFill as Lock,
  RiLockUnlockFill as Unlock,
  RiStackFill,
  RiFileTextFill,
  RiBox3Fill,
  RiListUnordered,
  RiLayoutGridFill,
  RiImageFill,
  RiHashtag,
  RiLayoutColumnFill,
  RiCheckboxBlankFill,
  RiLayoutRowFill,
  RiSparklingFill,
  RiFingerprintFill,
  RiGridFill,
  RiLineChartFill,
  RiLayoutGrid2Fill,
  RiChatQuoteFill,
  RiFontSize2,

  RiLayoutMasonryFill,
  RiBankCardFill,
  RiSmartphoneFill,
  RiCameraFill,
} from 'react-icons/ri';
import { HexColorPicker } from 'react-colorful';
import { useBrandStore } from '@/store/useBrandStore';

/* ─── Image pool for shuffle ───
 * Curated stock images used when the user clicks "Shuffle" on an
 * image-bearing tile. Each call picks a random entry, excluding the
 * currently displayed image to guarantee a visible change.
 */

const SHUFFLE_IMAGES = [
  '/images/visualelectric-1740659731603.png',
  '/images/visualelectric-1740667020762.png',
  '/images/visualelectric-1740667024491.png',
  '/images/visualelectric-1740667228398.png',
  '/images/visualelectric-1748892547439.png',
  '/images/visualelectric-1748892590850.png',
  '/images/visualelectric-1748892595834.png',
  '/images/visualelectric-1750703676698.png',
  '/images/visualelectric-1751915506477.png',
  '/images/visualelectric-1751979354132.png',
  '/images/visualelectric-1751999916329.png',
  '/images/visualelectric-1751999926710.png',
  '/images/visualelectric-1753860116187.png',
  '/images/visualelectric-1753860123700.png',
  '/images/visualelectric-1753860134138.png',
  '/images/visualelectric-1756715861881.png',
  '/images/visualelectric-1760212068804.png',
  '/images/visualelectric-2.png',
  '/images/visualelectric-3.png',
  '/images/visualelectric-4.png',
  '/images/45b37659-584b-4acf-a8ac-fb95ece3a47e-cloud-redefine-realistic-2x.png',
  '/images/55dae30b-bb97-44dc-b771-d3b2711ccb6d-cloud-redefine-realistic-2x.png',
  '/images/56e84307-f1bb-4833-a598-c955b362fd80-cloud-redefine-realistic-2x.png',
];

/** Pick a random image from the active pool, excluding `current` to avoid no-ops.
 *  Uses Lummi collection pool when active, falls back to local SHUFFLE_IMAGES. */
export function getRandomShuffleImage(current?: string): string {
  const { collectionImagePool } = useBrandStore.getState();
  const source = collectionImagePool.length > 0 ? collectionImagePool : SHUFFLE_IMAGES;
  const pool = current ? source.filter((img) => img !== current) : source;
  if (pool.length === 0) return source[0] ?? SHUFFLE_IMAGES[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ─── Wrapper ─── */

interface FloatingToolbarProps {
  /** Bounding rect of the tile that owns this toolbar (used for positioning) */
  anchorRect: DOMRect;
  children: ReactNode;
  /** Panel width in px — defaults to 220 */
  width?: number;
}

/**
 * Portal-rendered toolbar panel positioned beside the focused tile.
 *
 * Positioning algorithm:
 * 1. Try placing to the RIGHT of the tile with an 8px gap.
 * 2. If not enough viewport space on the right, flip to the LEFT.
 * 3. Clamp `left` to >= 8px so the panel never overflows off-screen.
 * 4. Clamp `top` between 8px and (viewport height - 400px) to keep
 *    the panel visible even for tiles near the bottom edge.
 */
export function FloatingToolbar({ anchorRect, children, width = 260 }: FloatingToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // Close toolbar on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        useBrandStore.getState().setFocusedTile(null);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    const gap = 8;
    const margin = 8;
    const spaceRight = window.innerWidth - anchorRect.right;
    // Prefer right side; fall back to left if insufficient space
    const left = spaceRight >= width + gap
      ? anchorRect.right + gap
      : anchorRect.left - width - gap;
    // Initial top — align with tile, will be refined in useLayoutEffect
    const top = Math.max(margin, anchorRect.top);
    setPos({ top, left: Math.max(margin, left) });
  }, [anchorRect, width]);

  // After content renders, measure actual height and shift up if it clips
  // the bottom of the viewport. Runs before paint so no flicker.
  useLayoutEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;
    const margin = 8;
    const rect = el.getBoundingClientRect();
    if (rect.bottom > window.innerHeight - margin) {
      setPos((prev) => ({
        ...prev,
        top: Math.max(margin, window.innerHeight - rect.height - margin),
      }));
    }
  });

  return createPortal(
    <div
      ref={toolbarRef}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width,
        maxHeight: 'min(calc(100vh - 32px), 600px)',
        overflowY: 'auto' as const,
        zIndex: 50,
        background: 'var(--sidebar-bg)',
        border: '1px solid var(--sidebar-border-subtle)',
        borderRadius: 14,
        padding: 14,
        boxShadow: 'var(--shadow-toolbar)',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 10,
      }}
    >
      {children}
    </div>,
    document.body,
  );
}

/* ─── Action Bar (shuffle / upload / lock) ───
 * Row of icon buttons shown at the top of every toolbar.
 * - Shuffle is always visible (cycles preset content or images).
 * - Upload and Lock appear only when `hasImage` is true.
 */

const iconBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 30,
  height: 30,
  borderRadius: 7,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

interface ToolbarActionsProps {
  /** Called when user clicks the shuffle button */
  onShuffle: () => void;
  /** Show image upload + lock controls (image-bearing tiles only) */
  hasImage?: boolean;
  /** When true, shuffle is a no-op and lock icon is highlighted */
  imageLocked?: boolean;
  /** Toggle image lock state */
  onToggleLock?: () => void;
  /** Receives base64 data URL after user picks a file */
  onImageUpload?: (dataUrl: string) => void;
}

export function ToolbarActions({
  onShuffle,
  hasImage,
  imageLocked,
  onToggleLock,
  onImageUpload,
}: ToolbarActionsProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onImageUpload) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') onImageUpload(reader.result);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [onImageUpload],
  );

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {/* Shuffle */}
      <button
        onClick={onShuffle}
        aria-label="Shuffle content"
        style={{
          ...iconBtnStyle,
          background: 'var(--sidebar-bg-hover)',
          color: 'var(--sidebar-text-muted)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--sidebar-bg-active)';
          e.currentTarget.style.color = 'var(--sidebar-text)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--sidebar-bg-hover)';
          e.currentTarget.style.color = 'var(--sidebar-text-muted)';
        }}
      >
        <Shuffle size={14} />
      </button>

      {/* Image upload */}
      {hasImage && onImageUpload && (
        <>
          <button
            onClick={() => fileRef.current?.click()}
            aria-label="Upload image"
            style={{
              ...iconBtnStyle,
              background: 'var(--sidebar-bg-hover)',
              color: 'var(--sidebar-text-muted)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--sidebar-bg-active)';
              e.currentTarget.style.color = 'var(--sidebar-text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--sidebar-bg-hover)';
              e.currentTarget.style.color = 'var(--sidebar-text-muted)';
            }}
          >
            <ImagePlus size={14} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
        </>
      )}

      {/* Lock toggle */}
      {hasImage && onToggleLock && (
        <button
          onClick={onToggleLock}
          aria-label={imageLocked ? 'Unlock image' : 'Lock image'}
          style={{
            ...iconBtnStyle,
            background: imageLocked ? 'var(--accent)' : 'var(--sidebar-bg-hover)',
            color: imageLocked ? '#fff' : 'var(--sidebar-text-muted)',
          }}
          onMouseEnter={(e) => {
            if (!imageLocked) {
              e.currentTarget.style.background = 'var(--sidebar-bg-active)';
              e.currentTarget.style.color = 'var(--sidebar-text)';
            }
          }}
          onMouseLeave={(e) => {
            if (!imageLocked) {
              e.currentTarget.style.background = 'var(--sidebar-bg-hover)';
              e.currentTarget.style.color = 'var(--sidebar-text-muted)';
            }
          }}
        >
          {imageLocked ? <Lock size={14} /> : <Unlock size={14} />}
        </button>
      )}
    </div>
  );
}

/* ─── Label ─── */

/** Section heading inside the toolbar (e.g. "Content", "Icons"). */
export function ToolbarLabel({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 500,
        color: 'var(--sidebar-text-muted)',
        display: 'block',
        marginBottom: -4,
      }}
    >
      {children}
    </span>
  );
}

/* ─── Text Input ─── */

interface ToolbarTextInputProps {
  /** Optional inline label (e.g. "Headline", "Body") */
  label?: string;
  /** Fixed label width in px — aligns inputs when stacked */
  labelWidth?: number;
  /** Current text (live-updated as user types) */
  value: string;
  /** Fires on every keystroke — used for live preview without history */
  onChange: (value: string) => void;
  /** Fires on blur — commits the edit to the undo/redo history */
  onCommit: (value: string) => void;
  placeholder?: string;
}

export function ToolbarTextInput({
  label,
  labelWidth = 52,
  value,
  onChange,
  onCommit,
  placeholder,
}: ToolbarTextInputProps) {
  const input = (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => onCommit(e.target.value)}
      placeholder={placeholder}
      style={{
        flex: 1,
        fontSize: 11,
        padding: '4px 8px',
        borderRadius: 6,
        background: 'transparent',
        color: 'var(--sidebar-text)',
        border: '1px solid var(--sidebar-border)',
        minWidth: 0,
      }}
    />
  );

  if (!label) return input;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 10, color: 'var(--sidebar-text-muted)', width: labelWidth, flexShrink: 0 }}>
        {label}
      </span>
      {input}
    </div>
  );
}

/* ─── Slider ─── */

interface ToolbarSliderProps {
  /** Uppercase label shown above the track */
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  /** Formatted display text (e.g. "12px") — defaults to raw `value` */
  displayValue?: string;
  /** Fires on drag — used for live preview without history */
  onChange: (value: number) => void;
  /** Fires on mouseUp/touchEnd — commits the value to history */
  onCommit: (value: number) => void;
}

export function ToolbarSlider({
  label,
  value,
  min,
  max,
  step = 1,
  displayValue,
  onChange,
  onCommit,
}: ToolbarSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--sidebar-text-muted)' }}>
          {label}
        </span>
        <span style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace', color: 'var(--sidebar-text-secondary)' }}>
          {displayValue ?? value}
        </span>
      </div>
      <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', height: 3, borderRadius: 2, width: '100%', background: 'var(--sidebar-bg-active)' }} />
        <div style={{ position: 'absolute', height: 3, borderRadius: 2, width: `${pct}%`, background: 'var(--accent)' }} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onMouseUp={() => onCommit(value)}
          onTouchEnd={() => onCommit(value)}
          style={{ position: 'absolute', width: '100%', height: 20, opacity: 0, cursor: 'pointer' }}
        />
        <div
          style={{
            position: 'absolute',
            left: `calc(${pct}% - 7px)`,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'var(--sidebar-bg)',
            border: '2px solid var(--accent)',
            boxShadow: 'var(--shadow-sm)',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}

/* ─── Segmented ─── */

interface ToolbarSegmentedProps {
  /** Uppercase label shown above the control */
  label: string;
  /** Available options — rendered as equally-spaced pills */
  options: { value: string; label: string }[];
  /** Currently selected option value */
  value: string;
  /** Fires on click — immediately commits (no live/commit split) */
  onChange: (value: string) => void;
}

export function ToolbarSegmented({ label, options, value, onChange }: ToolbarSegmentedProps) {
  return (
    <div>
      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--sidebar-text-muted)', display: 'block', marginBottom: 6 }}>
        {label}
      </span>
      <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', background: 'var(--sidebar-bg-hover)', padding: 3, gap: 2 }}>
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            style={{
              flex: 1,
              height: 26,
              fontSize: 11,
              fontWeight: 500,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              background: value === o.value ? 'var(--sidebar-bg)' : 'transparent',
              color: value === o.value ? 'var(--sidebar-text)' : 'var(--sidebar-text-muted)',
              boxShadow: value === o.value ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Divider ─── */

/** Horizontal 1px separator between toolbar sections. */
export function ToolbarDivider() {
  return <div style={{ height: 1, background: 'var(--sidebar-border)' }} />;
}

/* ─── Item List ─── */

interface ToolbarItemListProps {
  /** Uppercase label (e.g. "Items", "Menu") */
  label: string;
  /** Current list entries */
  items: string[];
  /** Max visible rows — excess items are hidden (default 4) */
  maxItems?: number;
  /** Fires on keystroke — live preview without history */
  onChange: (items: string[]) => void;
  /** Fires on blur — commits to history */
  onCommit: (items: string[]) => void;
}

export function ToolbarItemList({ label, items, maxItems = 4, onChange, onCommit }: ToolbarItemListProps) {
  const displayed = items.slice(0, maxItems);

  const handleItemChange = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const handleItemCommit = () => {
    onCommit(items);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--sidebar-text-muted)' }}>
        {label}
      </span>
      {displayed.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--sidebar-text-muted)', width: 16, flexShrink: 0, textAlign: 'right' }}>
            {i + 1}
          </span>
          <input
            type="text"
            value={item}
            onChange={(e) => handleItemChange(i, e.target.value)}
            onBlur={handleItemCommit}
            style={{
              flex: 1,
              fontSize: 11,
              padding: '4px 8px',
              borderRadius: 6,
              background: 'transparent',
              color: 'var(--sidebar-text)',
              border: '1px solid var(--sidebar-border)',
              minWidth: 0,
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ─── Text Area ─── */

interface ToolbarTextAreaProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onCommit: (value: string) => void;
  placeholder?: string;
  maxRows?: number;
}

export function ToolbarTextArea({
  label,
  value,
  onChange,
  onCommit,
  placeholder,
  maxRows = 3,
}: ToolbarTextAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const autoGrow = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = 16;
    el.style.height = `${Math.min(el.scrollHeight, lineHeight * maxRows + 10)}px`;
  }, [maxRows]);

  useEffect(() => { autoGrow(); }, [value, autoGrow]);

  return (
    <div>
      {label && (
        <span style={{ fontSize: 10, color: 'var(--sidebar-text-muted)', display: 'block', marginBottom: 4 }}>
          {label}
        </span>
      )}
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => { onChange(e.target.value); }}
        onBlur={(e) => onCommit(e.target.value)}
        placeholder={placeholder}
        rows={1}
        style={{
          width: '100%',
          fontSize: 11,
          lineHeight: '16px',
          padding: '4px 8px',
          borderRadius: 6,
          background: 'transparent',
          color: 'var(--sidebar-text)',
          border: '1px solid var(--sidebar-border)',
          resize: 'none',
          minWidth: 0,
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

/* ─── Surface Swatches ─── */

interface ToolbarSurfaceSwatchesProps {
  surfaces: string[];
  bgColor: string;
  currentIndex: number | undefined;
  onSurfaceChange: (index: number | undefined) => void;
}

export function ToolbarSurfaceSwatches({ surfaces, bgColor, currentIndex, onSurfaceChange }: ToolbarSurfaceSwatchesProps) {
  const swatchSize = 20;

  return (
    <div>
      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--sidebar-text-muted)', display: 'block', marginBottom: 6 }}>
        Surface
      </span>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {/* Auto option */}
        <button
          onClick={() => onSurfaceChange(undefined)}
          aria-label="Auto surface"
          style={{
            width: swatchSize,
            height: swatchSize,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            background: `linear-gradient(135deg, ${surfaces?.[0] || bgColor} 50%, ${surfaces?.[1] || bgColor} 50%)`,
            boxShadow: currentIndex === undefined
              ? `0 0 0 2px var(--sidebar-bg), 0 0 0 4px var(--accent)`
              : 'inset 0 0 0 1px rgba(0,0,0,0.08)',
            transition: 'box-shadow 0.15s ease',
          }}
        />

        {/* Surface options */}
        {(surfaces || []).slice(0, 7).map((surface: string, index: number) => (
          <button
            key={index}
            onClick={() => onSurfaceChange(index)}
            aria-label={`Surface ${index + 1}`}
            style={{
              width: swatchSize,
              height: swatchSize,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: surface,
              boxShadow: currentIndex === index
                ? `0 0 0 2px var(--sidebar-bg), 0 0 0 4px var(--accent)`
                : 'inset 0 0 0 1px rgba(0,0,0,0.08)',
              transition: 'box-shadow 0.15s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Tile Type Grid ─── */

const TILE_TYPES = [
  { value: 'hero', label: 'Hero', icon: RiStackFill },
  { value: 'editorial', label: 'Editorial', icon: RiFileTextFill },
  { value: 'product', label: 'Product', icon: RiBox3Fill },
  { value: 'menu', label: 'Menu', icon: RiListUnordered },
  { value: 'ui-preview', label: 'Interface', icon: RiLayoutGridFill },
  { value: 'social', label: 'Social', icon: RiImageFill },
  { value: 'utility', label: 'List', icon: RiHashtag },
  { value: 'logo', label: 'Logo', icon: RiSparklingFill },
  { value: 'logo-symbol', label: 'Symbol', icon: RiFingerprintFill },
  { value: 'icons', label: 'Icons', icon: RiGridFill },
  { value: 'split-hero', label: 'Split', icon: RiLayoutColumnFill },
  { value: 'overlay', label: 'Overlay', icon: RiCheckboxBlankFill },
  { value: 'split-list', label: 'Split List', icon: RiLayoutRowFill },
  { value: 'pattern', label: 'Pattern', icon: RiLayoutGrid2Fill },
  { value: 'stats', label: 'Stats', icon: RiLineChartFill },
  { value: 'messaging', label: 'Message', icon: RiChatQuoteFill },
  { value: 'specimen', label: 'Specimen', icon: RiFontSize2 },

  { value: 'color-blocks', label: 'Blocks', icon: RiLayoutMasonryFill },
  { value: 'business-card', label: 'Card', icon: RiBankCardFill },
  { value: 'app-icon', label: 'App', icon: RiSmartphoneFill },
  { value: 'story', label: 'Story', icon: RiCameraFill },
];

interface ToolbarTileTypeGridProps {
  currentType: string;
  onTypeChange: (type: string) => void;
}

export function ToolbarTileTypeGrid({ currentType, onTypeChange }: ToolbarTileTypeGridProps) {
  return (
    <div>
      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--sidebar-text-muted)', display: 'block', marginBottom: 6 }}>
        Type
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
        {TILE_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = currentType === type.value;
          return (
            <button
              key={type.value}
              onClick={() => onTypeChange(type.value)}
              title={type.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 6px',
                borderRadius: 5,
                border: 'none',
                cursor: 'pointer',
                background: isSelected ? 'var(--sidebar-bg-active)' : 'transparent',
                color: isSelected ? 'var(--sidebar-text)' : 'var(--sidebar-text-muted)',
                fontWeight: isSelected ? 500 : 400,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'var(--sidebar-bg-hover)';
                  e.currentTarget.style.color = 'var(--sidebar-text)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--sidebar-text-muted)';
                }
              }}
            >
              <Icon size={11} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 10, lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {type.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Color Picker ─── */

interface ToolbarColorPickerProps {
  label: string;
  color: string;
  autoColor: string;
  paletteColors?: string[];
  onChange: (hex: string | undefined) => void;
  onCommit?: () => void;
}

export function ToolbarColorPicker({ label, color, autoColor, paletteColors = [], onChange, onCommit }: ToolbarColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [hexInput, setHexInput] = useState(color.toUpperCase());
  const isAuto = color === autoColor;
  const swatchSize = 20;

  // Keep hex input in sync with external color changes
  useEffect(() => {
    setHexInput(color.toUpperCase());
  }, [color]);

  return (
    <div>
      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--sidebar-text-muted)', display: 'block', marginBottom: 6 }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {/* Auto button */}
        <button
          onClick={() => { onChange(undefined); setOpen(false); onCommit?.(); }}
          style={{
            fontSize: 10,
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: 4,
            border: 'none',
            cursor: 'pointer',
            background: isAuto ? 'var(--accent)' : 'var(--sidebar-bg-hover)',
            color: isAuto ? '#fff' : 'var(--sidebar-text-muted)',
            transition: 'all 0.15s ease',
          }}
        >
          Auto
        </button>

        {/* Current color swatch — toggles picker */}
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: swatchSize,
            height: swatchSize,
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: color,
            boxShadow: open
              ? `0 0 0 2px var(--sidebar-bg), 0 0 0 4px var(--accent)`
              : 'inset 0 0 0 1px rgba(0,0,0,0.12)',
            transition: 'box-shadow 0.15s ease',
          }}
        />

        {/* Palette quick-picks */}
        {paletteColors.filter(c => c !== color).slice(0, 5).map((c, i) => (
          <button
            key={i}
            onClick={() => { onChange(c); onCommit?.(); }}
            style={{
              width: swatchSize - 4,
              height: swatchSize - 4,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: c,
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
              transition: 'box-shadow 0.15s ease',
            }}
          />
        ))}
      </div>

      {open && (
        <div style={{ marginTop: 8 }}>
          <HexColorPicker
            color={color}
            onChange={(hex) => onChange(hex)}
          />
          <input
            type="text"
            value={hexInput}
            onChange={(e) => {
              const raw = e.target.value.toUpperCase();
              setHexInput(raw);
              const cleaned = raw.replace('#', '');
              if (/^[0-9A-F]{6}$/.test(cleaned)) {
                onChange('#' + cleaned);
              }
            }}
            onBlur={() => onCommit?.()}
            style={{
              marginTop: 6,
              width: '100%',
              fontSize: 10,
              fontFamily: 'ui-monospace, monospace',
              fontWeight: 500,
              padding: '3px 6px',
              borderRadius: 4,
              border: '1px solid var(--sidebar-border)',
              background: 'transparent',
              color: 'var(--sidebar-text)',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Toggle ─── */

interface ToolbarToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToolbarToggle({ label, checked, onChange }: ToolbarToggleProps) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--sidebar-text-muted)' }}>
        {label}
      </span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: 28,
          height: 16,
          borderRadius: 8,
          border: 'none',
          cursor: 'pointer',
          backgroundColor: checked ? 'var(--accent)' : 'var(--sidebar-bg-hover)',
          position: 'relative',
          transition: 'background-color 0.15s ease',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: checked ? 14 : 2,
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: '#fff',
            transition: 'left 0.15s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          }}
        />
      </button>
    </label>
  );
}
