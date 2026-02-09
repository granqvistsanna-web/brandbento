/**
 * Control Panel Component
 *
 * Figma-inspired sidebar for editing brand assets. Provides comprehensive
 * controls for typography, colors, layout, and export functionality.
 *
 * ## Architecture
 *
 * The control panel is built from composable micro-components that follow
 * Figma's design patterns (collapsible sections, inline controls, tooltips).
 *
 * ## Sections
 *
 * 1. **Header** - Collapse toggle, theme switcher, share/reset actions
 * 2. **Typography** - Font selection, weights, scale, letter spacing
 * 3. **Colors** - Palette browser, color pickers, role assignment
 * 4. **Layout** - Grid preset selection, density toggle
 * 5. **Export** - CSS/JSON export with copy-to-clipboard
 *
 * ## Micro-Components
 *
 * - `Kbd` - Keyboard shortcut badge
 * - `Badge` - Status/info badge
 * - `Tooltip` - Hover tooltip with positioning
 * - `IconButton` - Icon-only button with tooltip
 * - `Section` - Collapsible section with header
 * - `Row` - Label + control layout
 * - `ColorSwatch` - Clickable color preview
 *
 * @component
 * @example
 * <ControlPanel />
 */
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  useBrandStore,
  selectFocusedTile,
} from "../store/useBrandStore";
import { useLayoutStore } from "../store/useLayoutStore";
import { BENTO_LAYOUTS } from "../config/bentoLayouts";
import {
  PALETTE_SECTIONS,
  ROLE_DESCRIPTIONS,
  TOTAL_PALETTE_COUNT,
  getPaletteById,
} from "../data/colorPalettes";
import { mapPaletteToBrand, enforceContrast } from "../utils/colorMapping";
import { COLOR_DEFAULTS } from "../utils/colorDefaults";
import {
  Download,
  ChevronRight,
  ChevronDown,
  Type,
  Droplet,
  Sparkles,
  Layers,
  Image,
  FileText,
  Box,
  List,
  LayoutGrid,
  Wand2,
  Check,
  X,
  Pipette,
  PanelLeftClose,
  PanelLeft,
  Palette,
  Settings,
  Sliders,
  Hash,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  MessageCircle,
  Minus,
  Plus,
  Info,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getPlacementKind, getPlacementTileType } from "../config/placements";
import { ColorPalettePanel } from "./color/ColorPalettePanel";
import { ColorRoleSlot } from "./color/ColorRoleSlot";
import { getContrastRatio } from "../utils/colorMapping";
import { GOOGLE_FONTS, GOOGLE_FONTS_MAP, CURATED_FONTS } from "../data/googleFontsMetadata";
import { loadFontWithFallback } from "../services/googleFonts";

// ============================================
// FIGMA-STYLE MICRO COMPONENTS
// ============================================

/** Keyboard shortcut display badge */
const Kbd = ({ children }) => <span className="kbd">{children}</span>;

/** Status/info badge with variant styling (muted, success, warning) */
const Badge = ({ children, variant = "muted" }) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);

/**
 * Animated tooltip with configurable positioning.
 * Shows on hover with fade-in animation.
 * @param {ReactNode} children - Trigger element
 * @param {string} content - Tooltip text content
 * @param {'top'|'right'|'bottom'|'left'} position - Tooltip placement
 */
const Tooltip = ({ children, content, position = "right" }) => {
  const [show, setShow] = useState(false);

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={`absolute ${positions[position]} tooltip z-50`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Icon-only button with tooltip.
 * Used for toolbar actions and compact controls.
 */
const IconButton = ({
  icon: Icon,
  onClick,
  active,
  tooltip,
  size = 14,
  disabled,
}) => (
  <Tooltip content={tooltip} position="right">
    <button
      onClick={onClick}
      disabled={disabled}
      className={`icon-btn ${active ? "active" : ""}`}
      style={{ opacity: disabled ? 0.3 : 1 }}
    >
      <Icon size={size} />
    </button>
  </Tooltip>
);

// ============================================
// COLLAPSIBLE SECTION
// ============================================

/**
 * Collapsible section with icon header.
 * Used for organizing control panel into logical groups.
 * @param {LucideIcon} icon - Section header icon
 * @param {string} title - Section title
 * @param {boolean} defaultOpen - Initial collapsed state
 * @param {ReactNode} actions - Optional header actions
 * @param {ReactNode} children - Section content
 */
const Section = ({
  title,
  icon: Icon,
  children,
  badge,
  defaultOpen = true,
  noPadding = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className="group"
      style={{
        borderBottom: "1px solid var(--sidebar-border-subtle)",
      }}
    >
      {/* Section Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 transition-colors hover:bg-[var(--sidebar-bg-hover)]"
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          style={{ color: "var(--sidebar-text-muted)" }}
        >
          <ChevronRight size={10} />
        </motion.div>

        <span
          className="flex-1 text-left text-12 font-medium select-none tracking-wide"
          style={{ color: "var(--sidebar-text)" }}
        >
          {title}
        </span>

        {badge && <div>{badge}</div>}
      </button>

      {/* Section Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className={noPadding ? "" : "px-4 pb-4 space-y-3"}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// FORM CONTROLS - FIGMA STYLE
// ============================================

const PropRow = ({ label, children, hint }) => (
  <div className="flex items-center gap-3 min-h-[32px]">
    <span className="text-11 min-w-[72px] flex-shrink-0" style={{ color: "var(--sidebar-text-muted)" }}>{label}</span>
    <div className="flex-1 flex items-center gap-1">{children}</div>
    {hint && (
      <span className="text-10" style={{ color: "var(--sidebar-text-muted)" }}>
        {hint}
      </span>
    )}
  </div>
);

const Input = ({ value, onChange, placeholder, type = "text", mono, ...props }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="input-figma flex-1"
    style={mono ? { fontFamily: "var(--font-mono)" } : undefined}
    {...props}
  />
);

const TextArea = ({ value, onChange, placeholder, rows = 3, ...props }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className="input-figma w-full resize-none"
    style={{ height: "auto", padding: "8px 10px" }}
    {...props}
  />
);

// Compact number input with +/- buttons
const NumberInput = ({
  value,
  onChange,
  onBlur,
  min,
  max,
  step = 1,
  unit = "",
  label,
}) => {
  const handleIncrement = () => {
    const newVal = Math.min(max, value + step);
    onChange(newVal);
    onBlur?.();
  };

  const handleDecrement = () => {
    const newVal = Math.max(min, value - step);
    onChange(newVal);
    onBlur?.();
  };

  return (
    <div className="flex items-center gap-1">
      {label && <span className="prop-label">{label}</span>}
      <div
        className="flex items-center rounded-md overflow-hidden"
        style={{
          background: "var(--sidebar-bg)",
          border: "1px solid var(--sidebar-border)",
        }}
      >
        <button
          onClick={handleDecrement}
          className="w-6 h-7 flex items-center justify-center transition-fast"
          style={{ color: "var(--sidebar-text-secondary)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--sidebar-bg-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <Minus size={12} />
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          onBlur={onBlur}
          min={min}
          max={max}
          step={step}
          className="w-10 h-7 text-center text-11 bg-transparent border-none font-mono"
          style={{ color: "var(--sidebar-text)" }}
        />
        <button
          onClick={handleIncrement}
          className="w-6 h-7 flex items-center justify-center transition-fast"
          style={{ color: "var(--sidebar-text-secondary)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--sidebar-bg-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <Plus size={12} />
        </button>
      </div>
      {unit && (
        <span className="text-10" style={{ color: "var(--sidebar-text-muted)" }}>
          {unit}
        </span>
      )}
    </div>
  );
};

// Slider with track fill
const Slider = ({ value, onChange, onBlur, min, max, step = 1, label, unit = "" }) => {
  const percentage = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2 py-1">
      <div className="flex items-center justify-between">
        <span className="text-11" style={{ color: "var(--sidebar-text-muted)" }}>
          {label}
        </span>
        <span
          className="text-11 font-mono"
          style={{ color: "var(--sidebar-text-secondary)" }}
        >
          {typeof value === "number" ? value.toFixed(step < 1 ? 2 : 0) : value}
          {unit}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        <div
          className="absolute h-[3px] rounded-full w-full"
          style={{ background: "var(--sidebar-bg-active)" }}
        />
        <div
          className="absolute h-[3px] rounded-full"
          style={{
            width: `${percentage}%`,
            background: "var(--accent)",
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onMouseUp={onBlur}
          onTouchEnd={onBlur}
          className="absolute w-full h-5 opacity-0 cursor-pointer"
        />
        <div
          className="absolute w-3.5 h-3.5 rounded-full border-2 pointer-events-none"
          style={{
            left: `calc(${percentage}% - 7px)`,
            background: "var(--sidebar-bg)",
            borderColor: "var(--accent)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        />
      </div>
    </div>
  );
};

// Segmented control
const SegmentedControl = ({ options, value, onChange }) => (
  <div
    className="flex flex-1 rounded-lg overflow-hidden"
    style={{
      background: "var(--sidebar-bg-hover)",
      padding: "3px",
      gap: "2px",
    }}
  >
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className="flex-1 h-7 text-11 font-medium transition-fast rounded-md"
        style={{
          background:
            value === opt.value ? "var(--sidebar-bg)" : "transparent",
          color:
            value === opt.value
              ? "var(--sidebar-text)"
              : "var(--sidebar-text-muted)",
          boxShadow:
            value === opt.value ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
        }}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

// ============================================
// FONT SELECTOR - SEARCHABLE DROPDOWN WITH CATEGORIES
// ============================================

const CATEGORY_FILTERS = [
  { value: "all", label: "All" },
  { value: "sans-serif", label: "Sans" },
  { value: "serif", label: "Serif" },
  { value: "display", label: "Display" },
  { value: "monospace", label: "Mono" },
];

const FontItem = ({ font, isSelected, onSelect, onHover }) => (
  <button
    onClick={onSelect}
    onMouseEnter={onHover}
    className="w-full px-3 py-1.5 flex items-center gap-2 text-left transition-fast group"
    style={{
      background: isSelected ? "var(--accent-muted)" : "transparent",
      color: isSelected ? "var(--accent)" : "var(--sidebar-text)",
    }}
    onMouseOver={(e) => {
      if (!isSelected) e.currentTarget.style.background = "var(--sidebar-bg-hover)";
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.background = isSelected ? "var(--accent-muted)" : "transparent";
    }}
  >
    <span
      className="text-13 truncate flex-1"
      style={{ fontFamily: `"${font.family}", ${font.category === 'serif' ? 'serif' : 'sans-serif'}` }}
    >
      {font.family}
    </span>
    {font.curated && !isSelected && (
      <Star size={9} style={{ color: "var(--sidebar-text-muted)", opacity: 0.4, flexShrink: 0 }} />
    )}
    {isSelected && <Check size={12} style={{ flexShrink: 0 }} />}
  </button>
);

const FontSelector = ({ label, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState("all");
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const dropdownRef = useRef(null);
  const loadedPreviewRef = useRef(new Set());

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        ref.current && !ref.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate position & focus search on open
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const maxHeight = 420;
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const spaceAbove = rect.top - 8;
      const openUp = spaceBelow < 200 && spaceAbove > spaceBelow;

      setDropdownPos({
        top: openUp ? Math.max(8, rect.top - Math.min(maxHeight, spaceAbove)) : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
      setTimeout(() => {
        if (listRef.current) {
          const selected = listRef.current.querySelector("[data-selected]");
          if (selected) selected.scrollIntoView({ block: "center" });
        }
      }, 80);
      setHighlightIdx(-1);
    }
  }, [isOpen]);

  // Build filtered font list
  const filteredFonts = useMemo(() => {
    let list = GOOGLE_FONTS;

    if (category !== "all") {
      list = list.filter((f) => f.category === category);
    }

    return [...list].sort((a, b) => {
      if (a.curated && !b.curated) return -1;
      if (!a.curated && b.curated) return 1;
      return a.family.localeCompare(b.family);
    });
  }, [category]);

  // Index of first non-curated font (for section divider)
  const firstNonCuratedIdx = useMemo(() => {
    return filteredFonts.findIndex((f) => !f.curated);
  }, [filteredFonts]);

  // Preload font on hover
  const handleFontHover = useCallback((family) => {
    if (!loadedPreviewRef.current.has(family)) {
      loadedPreviewRef.current.add(family);
      loadFontWithFallback(family, ["400"]);
    }
  }, []);

  // Keyboard nav
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIdx((i) => Math.min(i + 1, filteredFonts.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && highlightIdx >= 0) {
        e.preventDefault();
        onChange(filteredFonts[highlightIdx].family);
        setIsOpen(false);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    },
    [isOpen, highlightIdx, filteredFonts, onChange]
  );

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-font-item]");
      items[highlightIdx]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIdx]);

  return (
    <div ref={ref}>
      <PropRow label={label}>
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 h-8 px-3 rounded-lg flex items-center justify-between transition-fast"
          style={{
            background: isOpen ? "var(--sidebar-bg-hover)" : "transparent",
            border: `1px solid ${isOpen ? "var(--accent)" : "var(--sidebar-border)"}`,
            color: "var(--sidebar-text)",
          }}
        >
          <span
            className="text-12 truncate"
            style={{ fontFamily: `"${value}", sans-serif` }}
          >
            {value}
          </span>
          <ChevronDown
            size={12}
            style={{
              color: "var(--sidebar-text-muted)",
              transform: isOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.15s ease",
            }}
          />
        </button>
      </PropRow>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="rounded-lg flex flex-col"
            style={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              zIndex: 9999,
              background: "var(--sidebar-bg-elevated)",
              border: "1px solid var(--sidebar-border)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)",
              maxHeight: "min(420px, 60vh)",
            }}
            onKeyDown={handleKeyDown}
          >
            {/* Category pills */}
            <div
              className="px-2.5 pt-2.5 pb-1.5"
              style={{ borderBottom: "1px solid var(--sidebar-border)" }}
            >
              <div className="flex gap-1 pb-0.5">
                {CATEGORY_FILTERS.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      setCategory(cat.value);
                      setHighlightIdx(-1);
                    }}
                    className="px-2 py-0.5 rounded-md text-11 transition-fast"
                    style={{
                      background:
                        category === cat.value
                          ? "var(--accent)"
                          : "transparent",
                      color:
                        category === cat.value
                          ? "#fff"
                          : "var(--sidebar-text-muted)",
                      fontWeight: category === cat.value ? 600 : 400,
                    }}
                    onMouseOver={(e) => {
                      if (category !== cat.value)
                        e.currentTarget.style.background = "var(--sidebar-bg-hover)";
                    }}
                    onMouseOut={(e) => {
                      if (category !== cat.value)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font list */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto scrollbar-dark py-1"
              style={{ minHeight: 0 }}
            >
              {filteredFonts.length === 0 ? (
                <div
                  className="px-3 py-6 text-center text-12"
                  style={{ color: "var(--sidebar-text-muted)" }}
                >
                  No fonts in this category
                </div>
              ) : (
                filteredFonts.map((font, idx) => (
                  <React.Fragment key={font.family}>
                    {idx === 0 && font.curated && (
                      <div
                        className="px-3 pt-1.5 pb-1 text-10 font-semibold uppercase tracking-wider flex items-center gap-1.5"
                        style={{ color: "var(--sidebar-text-muted)" }}
                      >
                        <Star size={8} style={{ opacity: 0.5 }} />
                        Curated
                      </div>
                    )}
                    {idx === firstNonCuratedIdx && firstNonCuratedIdx > 0 && (
                      <>
                        <div
                          className="mx-3 my-1"
                          style={{
                            borderTop: "1px solid var(--sidebar-border)",
                          }}
                        />
                        <div
                          className="px-3 pt-0.5 pb-1 text-10 font-semibold uppercase tracking-wider"
                          style={{ color: "var(--sidebar-text-muted)" }}
                        >
                          More fonts
                        </div>
                      </>
                    )}
                    <div
                      data-font-item
                      {...(value === font.family ? { "data-selected": true } : {})}
                      style={{
                        background:
                          highlightIdx === idx
                            ? "var(--sidebar-bg-hover)"
                            : undefined,
                      }}
                    >
                      <FontItem
                        font={font}
                        isSelected={value === font.family}
                        onSelect={() => {
                          onChange(font.family);
                          setIsOpen(false);
                        }}
                        onHover={() => handleFontHover(font.family)}
                      />
                    </div>
                  </React.Fragment>
                ))
              )}
            </div>

            {/* Footer */}
            <div
              className="px-3 py-1.5 flex items-center justify-between text-10"
              style={{
                borderTop: "1px solid var(--sidebar-border)",
                color: "var(--sidebar-text-muted)",
              }}
            >
              <span>{filteredFonts.length} fonts</span>
              <span className="flex gap-2">
                <span><kbd className="kbd">↑↓</kbd> navigate</span>
                <span><kbd className="kbd">↵</kbd> select</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// COLOR ROLE GROUP - Groups colors by category
// ============================================

const COLOR_USAGE = {
  primary: {
    label: "Core Brand Color",
    uses: ["Logo", "Hero sections", "Primary CTAs", "Headlines"],
  },
  bg: {
    label: "Background",
    uses: ["Page backgrounds", "Large surfaces"],
  },
  text: {
    label: "Body Text",
    uses: ["Body copy", "Headings", "Labels"],
  },
  surface: {
    label: "Surface",
    uses: ["Cards", "Panels", "Modals"],
  },
  accent: {
    label: "Accent",
    uses: ["Highlights", "Badges", "Secondary CTAs"],
  },
};

const UsagePreview = ({ colorKey }) => {
  const usage = COLOR_USAGE[colorKey];
  if (!usage) return null;

  return (
    <div
      className="flex flex-wrap gap-1 mt-2 mb-1"
      style={{ marginLeft: "var(--space-1)" }}
    >
      {usage.uses.map((use, i) => (
        <span
          key={i}
          className="text-10 px-2 py-1 rounded"
          style={{
            background: "var(--sidebar-bg-active)",
            color: "var(--sidebar-text-muted)",
          }}
        >
          {use}
        </span>
      ))}
    </div>
  );
};

// ============================================
// PALETTE CARD - Shows color swatches for a palette
// ============================================

const PaletteCard = React.memo(({ palette, onSelectPalette }) => {
  const previewColors = palette.colors.slice(0, 6);

  return (
    <motion.button
      onClick={() => onSelectPalette(palette.id)}
      className="w-full p-2 rounded-md flex items-center gap-2 transition-fast group"
      style={{
        background: "var(--sidebar-bg)",
        border: "1px solid var(--sidebar-border)",
      }}
      whileHover={{
        borderColor: "var(--accent)",
        background: "var(--sidebar-bg-hover)",
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Color swatches preview */}
      <div className="flex -space-x-1">
        {previewColors.map((color, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full first:rounded-l last:rounded-r"
            style={{
              background: color,
              border: "1px solid var(--sidebar-border-subtle)",
              zIndex: previewColors.length - i,
            }}
          />
        ))}
        {palette.colors.length > 6 && (
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center text-10 font-medium"
            style={{
              background: "var(--sidebar-bg-active)",
              color: "var(--sidebar-text-muted)",
            }}
          >
            +{palette.colors.length - 6}
          </div>
        )}
      </div>
      <span
        className="text-10 flex-1 text-left truncate group-hover:text-accent transition-fast"
        style={{ color: "var(--sidebar-text-secondary)" }}
      >
        {palette.name}
      </span>
    </motion.button>
  );
});

PaletteCard.displayName = 'PaletteCard';

// ============================================
// PALETTE SECTION - Collapsible group by mood
// ============================================

const PaletteSection = React.memo(({ section, onSelectPalette }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        borderBottom: "1px solid var(--sidebar-border-subtle)",
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center gap-2 transition-fast"
        style={{
          background: isOpen ? "var(--sidebar-bg-hover)" : "transparent",
        }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          style={{ color: "var(--sidebar-text-muted)" }}
        >
          <ChevronRight size={12} />
        </motion.div>
        <span
          className="text-11 font-medium flex-1 text-left"
          style={{ color: "var(--sidebar-text)" }}
        >
          {section.name}
        </span>
        <span
          className="text-10 px-2 py-1 rounded"
          style={{
            background: "var(--sidebar-bg-active)",
            color: "var(--sidebar-text-muted)",
          }}
        >
          {section.palettes.length}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2 space-y-1">
              {/* Personality tag */}
              <div
                className="text-10 italic mb-2"
                style={{ color: "var(--sidebar-text-muted)" }}
              >
                {section.personality}
              </div>
              {/* Palette cards */}
              {section.palettes.map((palette) => (
                <PaletteCard
                  key={palette.id}
                  palette={palette}
                  onSelectPalette={onSelectPalette}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

PaletteSection.displayName = 'PaletteSection';

// ============================================
// PALETTE COMPLEXITY SELECTOR
// ============================================

const COMPLEXITY_OPTIONS = [
  {
    value: 'simple',
    label: 'Simple',
    description: 'One core color + neutral foundation',
  },
  {
    value: 'curated',
    label: 'Curated',
    description: 'Core + accent colors',
  },
  {
    value: 'full',
    label: 'Full',
    description: 'Complete palette control',
  },
];

const ComplexitySelector = ({ value, onChange }) => (
  <div
    className="px-3 py-3 space-y-2"
    style={{ borderBottom: "1px solid var(--sidebar-border-subtle)" }}
  >
    <div className="flex items-center justify-between">
      <span
        className="text-10 font-medium"
        style={{ color: "var(--sidebar-text-secondary)" }}
      >
        Palette Complexity
      </span>
      <Tooltip
        content="Controls how many colors are extracted from the palette"
        position="left"
      >
        <Info
          size={12}
          style={{ color: "var(--sidebar-text-muted)", cursor: "help" }}
        />
      </Tooltip>
    </div>
    <div className="grid grid-cols-3 gap-1">
      {COMPLEXITY_OPTIONS.map((option) => {
        const isActive = value === option.value;
        return (
          <Tooltip key={option.value} content={option.description} position="bottom">
            <motion.button
              onClick={() => onChange(option.value)}
              className="flex flex-col items-center gap-1 p-2 rounded-md transition-fast"
              style={{
                background: isActive ? "var(--accent-muted)" : "var(--sidebar-bg)",
                border: `1px solid ${isActive ? "var(--accent)" : "var(--sidebar-border)"}`,
              }}
              whileHover={{ borderColor: isActive ? "var(--accent)" : "var(--sidebar-border-hover)" }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Visual indicator */}
              <div className="flex gap-1">
                {option.value === 'simple' && (
                  <>
                    <div className="w-3 h-3 rounded-full" style={{ background: isActive ? "var(--accent)" : "var(--sidebar-text-muted)" }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: "var(--sidebar-bg-active)" }} />
                  </>
                )}
                {option.value === 'curated' && (
                  <>
                    <div className="w-3 h-3 rounded-sm" style={{ background: isActive ? "var(--accent)" : "var(--sidebar-text-muted)" }} />
                    <div className="w-3 h-3 rounded-sm" style={{ background: isActive ? "var(--accent)" : "var(--sidebar-text-muted)", opacity: 0.6 }} />
                    <div className="w-3 h-3 rounded-sm" style={{ background: "var(--sidebar-bg-active)" }} />
                  </>
                )}
                {option.value === 'full' && (
                  <>
                    <div className="w-2 h-3 rounded-sm" style={{ background: isActive ? "var(--accent)" : "var(--sidebar-text-muted)" }} />
                    <div className="w-2 h-3 rounded-sm" style={{ background: isActive ? "var(--accent)" : "var(--sidebar-text-muted)", opacity: 0.8 }} />
                    <div className="w-2 h-3 rounded-sm" style={{ background: isActive ? "var(--accent)" : "var(--sidebar-text-muted)", opacity: 0.6 }} />
                    <div className="w-2 h-3 rounded-sm" style={{ background: isActive ? "var(--accent)" : "var(--sidebar-text-muted)", opacity: 0.4 }} />
                  </>
                )}
              </div>
              <span
                className="text-10 font-medium"
                style={{ color: isActive ? "var(--accent)" : "var(--sidebar-text-secondary)" }}
              >
                {option.label}
              </span>
            </motion.button>
          </Tooltip>
        );
      })}
    </div>
  </div>
);

// ============================================
// PALETTE CUSTOMIZER - Subtract & Role Assignment modes
// ============================================

const ROLE_CONFIG = [
  { key: 'primary', label: 'Primary', description: 'Core brand color', icon: Sparkles },
  { key: 'accent', label: 'Accent', description: 'Supporting emphasis', icon: Droplet },
  { key: 'bg', label: 'Background', description: 'Page backgrounds', icon: Layers },
  { key: 'text', label: 'Text', description: 'Body copy', icon: Type },
  { key: 'surface', label: 'Surface', description: 'Cards & panels', icon: Box },
];

const PaletteCustomizer = ({
  palette,
  mode,
  onModeChange,
  // Subtract mode props
  includedColors,
  onToggleColor,
  // Role assignment props
  roleAssignments,
  selectedRole,
  onSelectRole,
  onAssignColor,
  onClearRole,
  // Common props
  onApply,
  onClear,
}) => {
  if (!palette) return null;

  const includedCount = includedColors.filter(Boolean).length;
  const assignedCount = Object.values(roleAssignments).filter(Boolean).length;

  return (
    <div
      className="px-3 py-3 space-y-2"
      style={{ borderBottom: "1px solid var(--sidebar-border-subtle)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-10 font-medium"
            style={{ color: "var(--sidebar-text)" }}
          >
            {palette.name}
          </span>
        </div>
        <button
          onClick={onClear}
          className="p-1 rounded transition-fast"
          style={{ color: "var(--sidebar-text-muted)" }}
          onMouseEnter={(e) => e.currentTarget.style.color = "var(--sidebar-text)"}
          onMouseLeave={(e) => e.currentTarget.style.color = "var(--sidebar-text-muted)"}
        >
          <X size={12} />
        </button>
      </div>

      {/* Mode Toggle */}
      <div
        className="flex rounded-md overflow-hidden"
        style={{
          background: "var(--sidebar-bg)",
          border: "1px solid var(--sidebar-border)",
        }}
      >
        <button
          onClick={() => onModeChange('subtract')}
          className="flex-1 h-7 text-10 font-medium transition-fast flex items-center justify-center gap-1"
          style={{
            background: mode === 'subtract' ? "var(--accent-muted)" : "transparent",
            color: mode === 'subtract' ? "var(--accent)" : "var(--sidebar-text-secondary)",
          }}
        >
          <Minus size={12} />
          Subtract
        </button>
        <button
          onClick={() => onModeChange('assign')}
          className="flex-1 h-7 text-10 font-medium transition-fast flex items-center justify-center gap-1"
          style={{
            background: mode === 'assign' ? "var(--accent-muted)" : "transparent",
            color: mode === 'assign' ? "var(--accent)" : "var(--sidebar-text-secondary)",
          }}
        >
          <Sliders size={12} />
          Assign Roles
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'subtract' ? (
          <motion.div
            key="subtract"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-2"
          >
            {/* Color grid with toggles */}
            <div className="grid grid-cols-6 gap-2">
              {palette.colors.map((color, index) => {
                const isIncluded = includedColors[index];
                return (
                  <motion.button
                    key={`${color}-${index}`}
                    onClick={() => onToggleColor(index)}
                    className="relative aspect-square rounded-md transition-fast"
                    style={{
                      background: color,
                      boxShadow: isIncluded
                        ? "inset 0 0 0 2px var(--accent), 0 0 0 1px var(--sidebar-border-subtle)"
                        : "inset 0 0 0 1px var(--sidebar-border-subtle)",
                      opacity: isIncluded ? 1 : 0.4,
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {!isIncluded && (
                      <div className="absolute inset-0 flex items-center justify-center" style={{ color: "var(--sidebar-text-muted)" }}>
                        <X size={12} />
                      </div>
                    )}
                    {isIncluded && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center"
                        style={{ background: "var(--accent)", boxShadow: "var(--shadow-sm)" }}
                      >
                        <Check size={8} style={{ color: "white" }} />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
            <p className="text-10" style={{ color: "var(--sidebar-text-muted)" }}>
              Click colors to include/exclude
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="assign"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-2"
          >
            {/* Available Colors */}
            <div>
              <p className="text-10 mb-2" style={{ color: "var(--sidebar-text-muted)" }}>
                Available Colors
              </p>
              <div className="flex flex-wrap gap-1">
                {palette.colors.map((color, index) => {
                  // Check if this color is already assigned
                  const assignedTo = Object.entries(roleAssignments).find(([_, c]) => c === color)?.[0];
                  const isAssigned = !!assignedTo;

                  return (
                    <motion.button
                      key={`avail-${color}-${index}`}
                      onClick={() => !isAssigned && selectedRole && onAssignColor(color)}
                      className="w-6 h-6 rounded-md transition-fast relative"
                      style={{
                        background: color,
                        boxShadow: "inset 0 0 0 1px var(--sidebar-border-subtle)",
                        opacity: isAssigned ? 0.3 : 1,
                        cursor: isAssigned ? "not-allowed" : selectedRole ? "pointer" : "default",
                        outline: !isAssigned && selectedRole ? "2px dashed var(--accent)" : "none",
                        outlineOffset: "2px",
                      }}
                      whileHover={!isAssigned && selectedRole ? { scale: 1.15 } : {}}
                      whileTap={!isAssigned && selectedRole ? { scale: 0.95 } : {}}
                    >
                      {isAssigned && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check size={12} style={{ color: "var(--sidebar-text-muted)" }} />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Role Slots */}
            <div>
              <p className="text-10 mb-2" style={{ color: "var(--sidebar-text-muted)" }}>
                Assign to Roles {selectedRole && <span style={{ color: "var(--accent)" }}>• Select a color above</span>}
              </p>
              <div className="space-y-1">
                {ROLE_CONFIG.map((role) => {
                  const RoleIcon = role.icon;
                  const assignedColor = roleAssignments[role.key];
                  const isSelected = selectedRole === role.key;

                  return (
                    <motion.div
                      key={role.key}
                      className="flex items-center gap-2 p-2 rounded-md transition-fast"
                      style={{
                        background: isSelected ? "var(--accent-muted)" : "var(--sidebar-bg)",
                        border: `1px solid ${isSelected ? "var(--accent)" : "var(--sidebar-border)"}`,
                      }}
                    >
                      <button
                        onClick={() => onSelectRole(isSelected ? null : role.key)}
                        className="flex items-center gap-2 flex-1"
                      >
                        <RoleIcon
                          size={12}
                          style={{ color: isSelected ? "var(--accent)" : "var(--sidebar-text-muted)" }}
                        />
                        <span
                          className="text-10 font-medium"
                          style={{ color: isSelected ? "var(--accent)" : "var(--sidebar-text)" }}
                        >
                          {role.label}
                        </span>
                      </button>

                      {/* Color slot */}
                      <div className="flex items-center gap-1">
                        {assignedColor ? (
                          <>
                            <div
                              className="w-5 h-5 rounded"
                              style={{
                                background: assignedColor,
                                boxShadow: "inset 0 0 0 1px var(--sidebar-border-subtle)",
                              }}
                            />
                            <button
                              onClick={() => onClearRole(role.key)}
                              className="p-1 rounded transition-fast"
                              style={{ color: "var(--sidebar-text-muted)" }}
                            >
                              <X size={12} />
                            </button>
                          </>
                        ) : (
                          <div
                            className="w-5 h-5 rounded border-2 border-dashed flex items-center justify-center"
                            style={{
                              borderColor: isSelected ? "var(--accent)" : "var(--sidebar-border)",
                            }}
                          >
                            {isSelected && (
                              <Plus size={12} style={{ color: "var(--accent)" }} />
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apply button */}
      <motion.button
        onClick={onApply}
        disabled={mode === 'subtract' ? includedCount === 0 : assignedCount < 2}
        className="w-full h-7 rounded-md text-10 font-medium transition-fast flex items-center justify-center gap-2"
        style={{
          background: (mode === 'subtract' ? includedCount > 0 : assignedCount >= 2) ? "var(--accent)" : "var(--sidebar-bg-active)",
          color: (mode === 'subtract' ? includedCount > 0 : assignedCount >= 2) ? "white" : "var(--sidebar-text-muted)",
          cursor: (mode === 'subtract' ? includedCount > 0 : assignedCount >= 2) ? "pointer" : "not-allowed",
        }}
        whileHover={(mode === 'subtract' ? includedCount > 0 : assignedCount >= 2) ? { scale: 1.02 } : {}}
        whileTap={(mode === 'subtract' ? includedCount > 0 : assignedCount >= 2) ? { scale: 0.98 } : {}}
      >
        <Check size={12} />
        {mode === 'subtract' ? `Apply ${includedCount} colors` : `Apply ${assignedCount} assigned roles`}
      </motion.button>
    </div>
  );
};

// ============================================
// PALETTE BROWSER - Full browser section
// ============================================

const DEFAULT_ROLE_ASSIGNMENTS = {
  primary: null,
  accent: null,
  bg: null,
  text: null,
  surface: null,
};

const EMPTY_PLACEMENT_CONTENT = {};

const PaletteBrowser = React.memo(() => {
  const applyPalette = useBrandStore((s) => s.applyPalette);
  const updateBrand = useBrandStore((s) => s.updateBrand);

  // Complexity mode
  const [complexity, setComplexity] = useState('full');

  // Palette customizer state
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [customizerMode, setCustomizerMode] = useState('subtract'); // 'subtract' | 'assign'

  // Subtract mode state
  const [includedColors, setIncludedColors] = useState([]);

  // Role assignment state
  const [roleAssignments, setRoleAssignments] = useState(DEFAULT_ROLE_ASSIGNMENTS);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleSelectPalette = useCallback((paletteId) => {
    const palette = getPaletteById(paletteId);
    if (!palette) return;

    // If complexity is 'full', show customizer UI; otherwise apply directly
    if (complexity === 'full') {
      setSelectedPalette(palette);
      setIncludedColors(palette.colors.map(() => true));
      setRoleAssignments(DEFAULT_ROLE_ASSIGNMENTS);
      setSelectedRole(null);
      setCustomizerMode('subtract');
    } else {
      applyPalette(paletteId, complexity);
    }
  }, [applyPalette, complexity]);

  // Subtract mode handlers
  const handleToggleColor = useCallback((index) => {
    setIncludedColors(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);

  // Role assignment handlers
  const handleAssignColor = useCallback((color) => {
    if (!selectedRole) return;
    setRoleAssignments(prev => ({
      ...prev,
      [selectedRole]: color,
    }));
    setSelectedRole(null); // Deselect after assignment
  }, [selectedRole]);

  const handleClearRole = useCallback((roleKey) => {
    setRoleAssignments(prev => ({
      ...prev,
      [roleKey]: null,
    }));
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedPalette(null);
    setIncludedColors([]);
    setRoleAssignments(DEFAULT_ROLE_ASSIGNMENTS);
    setSelectedRole(null);
  }, []);

  // Apply handlers
  const handleApply = useCallback(() => {
    if (!selectedPalette) return;

    if (customizerMode === 'subtract') {
      // Filter to only included colors and auto-map
      const filteredColors = selectedPalette.colors.filter((_, i) => includedColors[i]);
      if (filteredColors.length === 0) return;

      const rawMapping = mapPaletteToBrand(filteredColors);
      const colorMapping = enforceContrast(rawMapping);
      updateBrand({ colors: colorMapping }, true);
    } else {
      // Use manual role assignments
      const assignments = roleAssignments;

      // Build color mapping from assignments, filling in defaults
      const rawMapping = {
        primary: assignments.primary || COLOR_DEFAULTS.PRIMARY,
        accent: assignments.accent || assignments.primary || COLOR_DEFAULTS.ACCENT,
        bg: assignments.bg || COLOR_DEFAULTS.BG,
        text: assignments.text || COLOR_DEFAULTS.TEXT_DARK,
        surface: assignments.surface || assignments.bg || COLOR_DEFAULTS.SURFACE,
        surfaces: [
          assignments.bg || COLOR_DEFAULTS.BG,
          assignments.surface || COLOR_DEFAULTS.SURFACE,
          COLOR_DEFAULTS.WHITE,
        ].filter(Boolean),
        paletteColors: selectedPalette.colors,
      };
      const colorMapping = enforceContrast(rawMapping);

      updateBrand({ colors: colorMapping }, true);
    }

    // Clear selection
    handleClearSelection();
  }, [
    customizerMode,
    handleClearSelection,
    includedColors,
    roleAssignments,
    selectedPalette,
    updateBrand,
  ]);

  return (
    <Section
      title="Color Palettes"
      defaultOpen={false}
      badge={<Badge variant="accent">{TOTAL_PALETTE_COUNT}</Badge>}
      noPadding
    >
      {/* Complexity Selector */}
      <ComplexitySelector value={complexity} onChange={setComplexity} />

      {/* Palette Customizer (when palette selected in full mode) */}
      {selectedPalette && (
        <PaletteCustomizer
          palette={selectedPalette}
          mode={customizerMode}
          onModeChange={setCustomizerMode}
          // Subtract mode props
          includedColors={includedColors}
          onToggleColor={handleToggleColor}
          // Role assignment props
          roleAssignments={roleAssignments}
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
          onAssignColor={handleAssignColor}
          onClearRole={handleClearRole}
          // Common props
          onApply={handleApply}
          onClear={handleClearSelection}
        />
      )}

      {/* Palette Sections */}
      <div
        className="max-h-64 overflow-y-auto scrollbar-dark"
      >
        {PALETTE_SECTIONS.map((section) => (
          <PaletteSection
            key={section.id}
            section={section}
            onSelectPalette={handleSelectPalette}
          />
        ))}
      </div>
    </Section>
  );
});

PaletteBrowser.displayName = 'PaletteBrowser';

// ============================================
// PRESET CARDS
// ============================================

const PresetCard = ({ name, brand, isActive, onClick }) => (
  <motion.button
    onClick={onClick}
    className="w-full flex items-center justify-between"
    style={{
      height: "var(--control-height-md)",
      padding: "0 var(--space-2)",
      borderRadius: "var(--radius-sm)",
      background: isActive ? "var(--accent-subtle)" : "transparent",
      border: "none",
    }}
    whileHover={{ background: isActive ? "var(--accent-muted)" : "var(--sidebar-bg-hover)" }}
  >
    <span
      className="text-11 text-left truncate flex-1"
      style={{
        color: isActive ? "var(--sidebar-text)" : "var(--sidebar-text-secondary)",
        transition: "color var(--transition-fast)",
      }}
    >
      {name}
    </span>
    <div className="flex shrink-0">
      {[brand.colors.primary, brand.colors.text, brand.colors.bg].map(
        (color, i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: 10,
              height: 10,
              background: color,
              border: "1px solid var(--sidebar-bg)",
              marginLeft: i > 0 ? -3 : 0,
            }}
          />
        )
      )}
    </div>
  </motion.button>
);

// ============================================
// LAYOUT PREVIEW - Mini bento grid visualization
// ============================================

const LayoutPreview = ({ preset, isActive, displaySize = 32 }) => {
  const config = BENTO_LAYOUTS[preset]?.desktop;
  if (!config) return null;

  const { columns, rows, placements } = config;
  const padding = 3;
  const gap = 2;

  // Calculate cell size to fit within fixed dimensions
  const availableWidth = displaySize - padding * 2;
  const availableHeight = displaySize - padding * 2;
  const cellWidth = (availableWidth - (columns - 1) * gap) / columns;
  const cellHeight = (availableHeight - (rows - 1) * gap) / rows;

  // Find the hero/largest tile for visual emphasis
  const heroId = placements.reduce((largest, p) => {
    const area = p.colSpan * p.rowSpan;
    const largestArea = largest ? largest.colSpan * largest.rowSpan : 0;
    return area > largestArea ? p : largest;
  }, null)?.id;

  return (
    <svg
      width={displaySize}
      height={displaySize}
      viewBox={`0 0 ${displaySize} ${displaySize}`}
      className="transition-transform duration-150"
      style={{ filter: isActive ? 'none' : 'saturate(0)' }}
    >
      {/* Subtle background */}
      <rect
        x={0}
        y={0}
        width={displaySize}
        height={displaySize}
        rx={4}
        fill={isActive ? 'var(--accent-muted)' : 'var(--sidebar-bg-active)'}
        opacity={0.4}
      />
      {placements.map((p) => {
        const x = padding + (p.colStart - 1) * (cellWidth + gap);
        const y = padding + (p.rowStart - 1) * (cellHeight + gap);
        const w = p.colSpan * cellWidth + (p.colSpan - 1) * gap;
        const h = p.rowSpan * cellHeight + (p.rowSpan - 1) * gap;
        const isHero = p.id === heroId;

        return (
          <g key={p.id}>
            {/* Tile fill */}
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx={2}
              fill={isActive
                ? 'var(--accent)'
                : (isHero ? 'var(--sidebar-text-secondary)' : 'var(--sidebar-text-muted)')}
              opacity={isHero ? (isActive ? 0.85 : 0.45) : (isActive ? 0.45 : 0.25)}
            />
            {/* Subtle inner highlight for depth */}
            <rect
              x={x + 0.5}
              y={y + 0.5}
              width={w - 1}
              height={h - 1}
              rx={1.5}
              fill="none"
              stroke="white"
              strokeWidth={0.5}
              opacity={isActive ? 0.15 : 0.08}
            />
          </g>
        );
      })}
    </svg>
  );
};

// ============================================
// LAYOUT SELECTOR - Top section with preview buttons
// ============================================

const LAYOUT_PRESETS_CONFIG = [
  { key: "minimal", label: "Minimal" },
  { key: "duo", label: "Duo" },
  { key: "balanced", label: "Classic" },
  { key: "heroLeft", label: "Left" },
  { key: "heroCenter", label: "Center" },
  { key: "stacked", label: "Stack" },
  { key: "foodDrink", label: "Food & Drink" },
];

const LayoutSelector = () => {
  const { preset } = useLayoutStore(
    useShallow((s) => ({ preset: s.preset }))
  );
  const setPreset = useLayoutStore((s) => s.setPreset);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1.5">
        {LAYOUT_PRESETS_CONFIG.map((p) => {
          const isActive = preset === p.key;
          return (
            <motion.button
              key={p.key}
              onClick={() => setPreset(p.key)}
              className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-lg transition-fast relative overflow-hidden"
              style={{
                background: isActive
                  ? "var(--sidebar-bg-hover)"
                  : "transparent",
                border: `1px solid ${isActive ? "var(--accent)" : "var(--sidebar-border-subtle)"}`,
              }}
              whileHover={{
                background: "var(--sidebar-bg-hover)",
              }}
              whileTap={{ scale: 0.96 }}
            >
              <LayoutPreview preset={p.key} isActive={isActive} displaySize={32} />
              <span
                className="text-10 font-medium"
                style={{
                  color: isActive ? "var(--accent)" : "var(--sidebar-text-muted)",
                }}
              >
                {p.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

const CanvasBgPicker = () => {
  const canvasBg = useLayoutStore((s) => s.canvasBg);
  const setCanvasBg = useLayoutStore((s) => s.setCanvasBg);

  return (
    <div className="pt-2 border-t" style={{ borderColor: "var(--sidebar-border-subtle)" }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-10 font-semibold uppercase tracking-widest" style={{ color: "var(--sidebar-text-muted)" }}>Canvas Background</span>
        {canvasBg && (
          <button
            type="button"
            className="text-10 font-medium px-1.5 py-0.5 rounded hover:opacity-80 transition-fast"
            style={{ color: "var(--sidebar-text-muted)" }}
            onClick={() => setCanvasBg(null)}
          >
            Reset
          </button>
        )}
      </div>
      <ColorRoleSlot
        label={canvasBg ? "Custom" : "Default"}
        color={canvasBg || (document.documentElement.classList.contains("dark") ? "#0D0D0D" : "#F5F5F5")}
        onChange={(hex) => setCanvasBg(hex)}
      />
    </div>
  );
};

// ============================================
// GLOBAL CONTROLS
// ============================================

const PRESET_OPTIONS = [
  { key: "default", name: "General Brand" },
  { key: "techStartup", name: "Tech SaaS" },
  { key: "luxuryRetail", name: "Luxury Retail" },
  { key: "communityNonprofit", name: "Community Nonprofit" },
  { key: "creativeStudio", name: "Creative Studio" },
  { key: "foodDrink", name: "Food & Drink" },
];

const PRESET_BRANDS = {
  default: {
    colors: { bg: "#FFFFFF", text: "#1A1A1A", primary: "#000000" },
  },
  techStartup: {
    colors: { bg: "#F5F7FA", text: "#0F172A", primary: "#3B82F6" },
  },
  luxuryRetail: {
    colors: { bg: "#FDFCFA", text: "#1C1917", primary: "#78716C" },
  },
  communityNonprofit: {
    colors: { bg: "#FFFFFF", text: "#0C4A6E", primary: "#0EA5E9" },
  },
  creativeStudio: {
    colors: { bg: "#FAFAFA", text: "#171717", primary: "#F97316" },
  },
  foodDrink: {
    colors: { bg: "#F7F2EA", text: "#1E1C2E", primary: "#2D2A57" },
  },
};

const GlobalControls = React.memo(() => {
  const brand = useBrandStore((s) => s.brand);
  const updateBrand = useBrandStore((s) => s.updateBrand);
  const loadPreset = useBrandStore((s) => s.loadPreset);
  const activePreset = useBrandStore((s) => s.activePreset);

  const handleChange = (section, key, value, isCommit = false) => {
    updateBrand(
      {
        [section]: {
          ...brand[section],
          [key]: value,
        },
      },
      isCommit
    );
  };
  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (result) {
        handleChange("logo", "image", result, true);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <>
      {/* Layout */}
      <Section title="Layout" defaultOpen>
        <LayoutSelector />
        <CanvasBgPicker />
      </Section>

      {/* Industry Themes */}
      <Section
        title="Industry Themes"
        defaultOpen={false}
      >
        <div className="flex flex-col gap-1">
          {PRESET_OPTIONS.map((preset) => (
            <PresetCard
              key={preset.key}
              name={preset.name}
              brand={PRESET_BRANDS[preset.key]}
              isActive={activePreset === preset.key}
              onClick={() => loadPreset(preset.key)}
            />
          ))}
        </div>
      </Section>

      {/* Color Palettes */}
      <Section title="Color Palettes" defaultOpen={false} noPadding>
        <ColorPalettePanel />
      </Section>

      {/* Typography */}
      <Section title="Typography">
        <FontSelector
          label="Headline"
          value={brand.typography.primary}
          onChange={(font) => handleChange("typography", "primary", font, true)}
        />

        <FontSelector
          label="Body"
          value={brand.typography.secondary}
          onChange={(font) => handleChange("typography", "secondary", font, true)}
        />

        <PropRow label="Spacing">
          <SegmentedControl
            options={[
              { value: "tight", label: "Tight" },
              { value: "normal", label: "Normal" },
              { value: "wide", label: "Wide" },
            ]}
            value={brand.typography.letterSpacing}
            onChange={(val) => handleChange("typography", "letterSpacing", val, true)}
          />
        </PropRow>

        <Slider
          label="Scale"
          value={brand.typography.scale}
          onChange={(val) => handleChange("typography", "scale", val, false)}
          onBlur={() =>
            handleChange("typography", "scale", brand.typography.scale, true)
          }
          min={1.1}
          max={1.5}
          step={0.01}
        />

        <Slider
          label="Base Size"
          value={brand.typography.baseSize}
          onChange={(val) =>
            handleChange("typography", "baseSize", Math.round(val), false)
          }
          onBlur={() =>
            handleChange("typography", "baseSize", brand.typography.baseSize, true)
          }
          min={14}
          max={20}
          step={1}
          unit="px"
        />
      </Section>

      {/* Colors */}
      <Section title="Colors" badge={getContrastRatio(brand.colors.text, brand.colors.bg) >= 4.5 ? "AA" : null}>
        <div className="space-y-0.5">
          <span className="text-10 font-semibold uppercase tracking-widest block pb-1" style={{ color: "var(--sidebar-text-muted)" }}>Core</span>
          <ColorRoleSlot label="Primary" color={brand.colors.primary} onChange={(hex) => handleChange("colors", "primary", hex, true)} contrastWith={brand.colors.bg} />
        </div>
        <div className="space-y-0.5">
          <span className="text-10 font-semibold uppercase tracking-widest block pb-1" style={{ color: "var(--sidebar-text-muted)" }}>Neutral</span>
          <ColorRoleSlot label="Background" color={brand.colors.bg} onChange={(hex) => handleChange("colors", "bg", hex, true)} />
          <ColorRoleSlot label="Text" color={brand.colors.text} onChange={(hex) => handleChange("colors", "text", hex, true)} contrastWith={brand.colors.bg} />
          <ColorRoleSlot label="Surface" color={brand.colors.surface || brand.colors.bg} onChange={(hex) => handleChange("colors", "surface", hex, true)} />
        </div>
        <div className="space-y-0.5">
          <span className="text-10 font-semibold uppercase tracking-widest block pb-1" style={{ color: "var(--sidebar-text-muted)" }}>Accent</span>
          <ColorRoleSlot label="Accent" color={brand.colors.accent || brand.colors.primary} onChange={(hex) => handleChange("colors", "accent", hex, true)} />
        </div>
      </Section>

      {/* Buttons */}
      <Section title="Buttons" defaultOpen={false}>
        <Slider
          label="Radius"
          value={brand.ui?.buttonRadius ?? 10}
          onChange={(val) => handleChange("ui", "buttonRadius", Math.round(val), false)}
          onBlur={() => handleChange("ui", "buttonRadius", brand.ui?.buttonRadius ?? 10, true)}
          min={0}
          max={24}
          step={1}
          unit="px"
        />
        <PropRow label="Style">
          <SegmentedControl
            options={[
              { value: "filled", label: "Filled" },
              { value: "outline", label: "Outline" },
              { value: "soft", label: "Soft" },
            ]}
            value={brand.ui?.buttonStyle ?? "filled"}
            onChange={(val) => handleChange("ui", "buttonStyle", val, true)}
          />
        </PropRow>
        <div className="space-y-0.5">
          <ColorRoleSlot
            label="Button Color"
            color={brand.ui?.buttonColor || brand.colors.primary}
            onChange={(hex) => handleChange("ui", "buttonColor", hex, true)}
          />
        </div>
      </Section>

      {/* Logo */}
      <Section title="Logo" defaultOpen={false}>
        <PropRow label="Image">
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/svg+xml,image/png"
              className="hidden"
              onChange={handleLogoUpload}
              id="logo-upload-input"
            />
            <button
              type="button"
              className="btn-figma btn-figma-ghost"
              onClick={() => document.getElementById("logo-upload-input")?.click()}
            >
              Upload SVG/PNG
            </button>
            {brand.logo.image && (
              <button
                type="button"
                className="btn-figma btn-figma-ghost"
                onClick={() => handleChange("logo", "image", null, true)}
              >
                Clear
              </button>
            )}
          </div>
        </PropRow>

        <PropRow label="Text">
          <Input
            value={brand.logo.text}
            onChange={(e) => handleChange("logo", "text", e.target.value, true)}
            placeholder="BRAND"
          />
        </PropRow>

        <Slider
          label="Size"
          value={brand.logo.size}
          onChange={(val) =>
            handleChange("logo", "size", Math.round(val), false)
          }
          onBlur={() => handleChange("logo", "size", brand.logo.size, true)}
          min={16}
          max={36}
          step={1}
          unit="px"
        />

        <Slider
          label="Padding"
          value={brand.logo.padding}
          onChange={(val) =>
            handleChange("logo", "padding", Math.round(val), false)
          }
          onBlur={() =>
            handleChange("logo", "padding", brand.logo.padding, true)
          }
          min={8}
          max={28}
          step={1}
          unit="px"
        />

        {/* Logo preview */}
        <div
          className="p-4 rounded-md flex items-center justify-center"
          style={{ background: "var(--sidebar-bg-active)" }}
        >
          {brand.logo.image ? (
            <div
              className="rounded-md flex items-center justify-center"
              style={{
                backgroundColor: brand.colors.surfaces?.[1] || brand.colors.bg,
                padding: `${brand.logo.padding}px`,
              }}
            >
              <img
                src={brand.logo.image}
                alt={brand.logo.text || "Logo"}
                className="max-h-16 max-w-[160px] object-contain"
              />
            </div>
          ) : (
            <div
              style={{
                fontFamily: brand.typography.primary,
                fontSize: `${brand.logo.size}px`,
                padding: `${brand.logo.padding}px`,
                backgroundColor: brand.colors.surfaces?.[1] || brand.colors.bg,
                color: brand.colors.primary,
                letterSpacing: "0.04em",
                fontWeight: parseInt(brand.typography.weightHeadline) || 700,
                borderRadius: "var(--radius-sm)",
              }}
            >
              {brand.logo.text}
            </div>
          )}
        </div>
      </Section>
    </>
  );
});

GlobalControls.displayName = 'GlobalControls';

// ============================================
// TILE CONTROLS
// ============================================

const TileControls = ({ tile, placementId }) => {
  const updateTile = useBrandStore((s) => s.updateTile);
  const setFocusedTile = useBrandStore((s) => s.setFocusedTile);
  const swapTileType = useBrandStore((s) => s.swapTileType);
  const brand = useBrandStore((s) => s.brand);
  const updateBrand = useBrandStore((s) => s.updateBrand);
  const surfaces = useBrandStore((s) => s.brand.colors.surfaces);
  const bg = useBrandStore((s) => s.brand.colors.bg);
  const tileSurfaceIndex = useBrandStore((s) =>
    placementId ? s.tileSurfaces[placementId] : undefined
  );
  const setTileSurface = useBrandStore((s) => s.setTileSurface);
  const placementContent = useBrandStore(
    (s) => s.placementContent?.[placementId] ?? EMPTY_PLACEMENT_CONTENT
  );
  const setPlacementContent = useBrandStore((s) => s.setPlacementContent);
  const imageInputRef = useRef(null);
  const placementImageInputRef = useRef(null);

  // Get current surface index for this placement
  const currentSurfaceIndex = tileSurfaceIndex;

  const handleChange = (key, value) => {
    if (tile) {
      updateTile(tile.id, { [key]: value }, false);
    }
  };

  const handleCommit = (key) => {
    if (tile) {
      updateTile(tile.id, { [key]: tile.content[key] }, true);
    }
  };

  const handleSurfaceChange = (index) => {
    setTileSurface(placementId, index);
  };

  const placementKind = getPlacementKind(placementId);
  const isIdentityPlacement = placementKind === 'identity';
  const isSocialPlacement = placementKind === 'social';

  const handleLogoChange = (key, value, isCommit = false) => {
    updateBrand({ logo: { ...brand.logo, [key]: value } }, isCommit);
  };
  const handleLogoUploadInTile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (result) handleLogoChange("image", result, true);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  const handlePlacementChange = (key, value, isCommit = false) => {
    setPlacementContent(placementId, { [key]: value }, isCommit);
  };

  const handlePlacementCommit = (key, fallback = '') => {
    const value =
      placementContent && Object.prototype.hasOwnProperty.call(placementContent, key)
        ? placementContent[key]
        : fallback;
    setPlacementContent(placementId, { [key]: value }, true);
  };
  const handleImageUpload = (event) => {
    if (!tile) return;
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (result) {
        updateTile(tile.id, { image: result }, true);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  const handlePlacementImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (result) {
        setPlacementContent(placementId, { image: result }, true);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const tileTypes = [
    { value: "hero", label: "Hero", icon: Layers },
    { value: "editorial", label: "Editorial", icon: FileText },
    { value: "product", label: "Product", icon: Box },
    { value: "menu", label: "Menu", icon: List },
    { value: "ui-preview", label: "UI", icon: LayoutGrid },
    { value: "image", label: "Image", icon: Image },
    { value: "utility", label: "Utility", icon: Hash },
    { value: "logo", label: "Logo", icon: Sparkles },
  ];

  // Get tile type from placement ID mapping (fallback for when tile object is undefined)
  const currentTileType = tile?.type || getPlacementTileType(placementId) || 'hero';
  const currentType = tileTypes.find((t) => t.value === currentTileType);
  const CurrentIcon = currentType?.icon || Layers;

  return (
    <>
      {/* Tile header */}
      <div
        className="px-4 py-3.5 flex items-center gap-3"
        style={{ borderBottom: "1px solid var(--sidebar-border-subtle)" }}
      >
        <div className="flex-1">
          <h2
            className="text-12 font-semibold capitalize tracking-wide"
            style={{ color: "var(--sidebar-text)" }}
          >
            {currentTileType.replace("-", " ")}
          </h2>
        </div>
        <motion.button
          onClick={() => setFocusedTile(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-11 font-medium transition-fast"
          style={{
            background: "var(--sidebar-bg-hover)",
            color: "var(--sidebar-text-secondary)",
          }}
          whileHover={{ background: "var(--sidebar-bg-active)" }}
          whileTap={{ scale: 0.98 }}
        >
          Done
        </motion.button>
      </div>

      {/* Tile type - only show if tile exists */}
      {tile && (
        <Section title="Type" defaultOpen={true}>
          <div className="grid grid-cols-4 gap-1.5">
            {tileTypes.map((type) => {
              const TypeIcon = type.icon;
              const isSelected = tile.type === type.value;

              return (
                <button
                  key={type.value}
                  onClick={() => swapTileType(tile.id, type.value)}
                  className="flex flex-col items-center gap-1.5 py-2 rounded-lg transition-fast"
                  style={{
                    background: isSelected
                      ? "var(--sidebar-bg-hover)"
                      : "transparent",
                    border: `1px solid ${isSelected ? "var(--accent)" : "var(--sidebar-border-subtle)"}`,
                    color: isSelected ? "var(--accent)" : "var(--sidebar-text-muted)",
                  }}
                >
                  <TypeIcon size={14} />
                  <span className="text-10">{type.label}</span>
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {/* Surface Color */}
      <Section title="Surface" defaultOpen={true}>
        <div className="flex flex-wrap gap-2">
          {/* Auto option */}
          <button
            onClick={() => handleSurfaceChange(undefined)}
            className="flex flex-col items-center gap-1.5 p-2 rounded-lg transition-fast"
            style={{
              background: currentSurfaceIndex === undefined
                ? "var(--sidebar-bg-hover)"
                : "transparent",
              border: `1px solid ${currentSurfaceIndex === undefined ? "var(--accent)" : "var(--sidebar-border-subtle)"}`,
              minWidth: "52px",
            }}
          >
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-10 font-medium"
              style={{
                background: `linear-gradient(135deg, ${surfaces?.[0] || bg} 50%, ${surfaces?.[1] || bg} 50%)`,
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
              }}
            >
              <span style={{ color: "var(--sidebar-text-muted)", fontSize: "9px" }}>A</span>
            </div>
            <span
              className="text-10"
              style={{
                color: currentSurfaceIndex === undefined
                  ? "var(--accent)"
                  : "var(--sidebar-text-muted)",
              }}
            >
              Auto
            </span>
          </button>

          {/* Surface options */}
          {(surfaces || []).slice(0, 7).map((surface, index) => {
            const isSelected = currentSurfaceIndex === index;
            return (
              <button
                key={index}
                onClick={() => handleSurfaceChange(index)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-lg transition-fast"
                style={{
                  background: isSelected
                    ? "var(--sidebar-bg-hover)"
                    : "transparent",
                  border: `1px solid ${isSelected ? "var(--accent)" : "var(--sidebar-border-subtle)"}`,
                  minWidth: "52px",
                }}
              >
                <div
                  className="w-7 h-7 rounded-md"
                  style={{
                    backgroundColor: surface,
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
                  }}
                />
                <span
                  className="text-10"
                  style={{
                    color: isSelected
                      ? "var(--accent)"
                      : "var(--sidebar-text-muted)",
                  }}
                >
                  {index + 1}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Identity Logo controls */}
      {isIdentityPlacement && (
        <Section title="Logo" defaultOpen={true}>
          <PropRow label="Image">
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/svg+xml,image/png"
                className="hidden"
                onChange={handleLogoUploadInTile}
                id="tile-logo-upload-input"
              />
              <button
                type="button"
                className="btn-figma btn-figma-ghost"
                onClick={() => document.getElementById("tile-logo-upload-input")?.click()}
              >
                Upload SVG/PNG
              </button>
              {brand.logo.image && (
                <button
                  type="button"
                  className="btn-figma btn-figma-ghost"
                  onClick={() => handleLogoChange("image", null, true)}
                >
                  Clear
                </button>
              )}
            </div>
          </PropRow>

          <PropRow label="Text">
            <Input
              value={brand.logo.text}
              onChange={(e) => handleLogoChange("text", e.target.value, true)}
              placeholder="BRAND"
            />
          </PropRow>

          <Slider
            label="Size"
            value={brand.logo.size}
            onChange={(val) => handleLogoChange("size", Math.round(val), false)}
            onBlur={() => handleLogoChange("size", brand.logo.size, true)}
            min={16}
            max={36}
            step={1}
            unit="px"
          />

          <Slider
            label="Padding"
            value={brand.logo.padding}
            onChange={(val) => handleLogoChange("padding", Math.round(val), false)}
            onBlur={() => handleLogoChange("padding", brand.logo.padding, true)}
            min={8}
            max={28}
            step={1}
            unit="px"
          />
        </Section>
      )}

      {/* Social Post */}
      {isSocialPlacement && (
        <Section title="Social" defaultOpen={true}>
          <PropRow label="Aspect">
            <SegmentedControl
              options={[
                { value: "4:5", label: "4:5" },
                { value: "1:1", label: "1:1" },
                { value: "1.91:1", label: "Wide" },
              ]}
              value={placementContent.socialAspect || "4:5"}
              onChange={(val) => handlePlacementChange("socialAspect", val, true)}
            />
          </PropRow>

          <PropRow label="Handle">
            <Input
              value={placementContent.socialHandle || ""}
              onChange={(e) => handlePlacementChange("socialHandle", e.target.value, false)}
              onBlur={() => handlePlacementCommit("socialHandle", "")}
              placeholder="brandname"
            />
          </PropRow>

          <PropRow label="Likes">
            <Input
              value={placementContent.socialLikes || ""}
              onChange={(e) => handlePlacementChange("socialLikes", e.target.value, false)}
              onBlur={() => handlePlacementCommit("socialLikes", "")}
              placeholder="1,204 likes"
            />
          </PropRow>

          <PropRow label="Sponsored">
            <Input
              value={placementContent.socialSponsored || ""}
              onChange={(e) => handlePlacementChange("socialSponsored", e.target.value, false)}
              onBlur={() => handlePlacementCommit("socialSponsored", "")}
              placeholder="Sponsored"
            />
          </PropRow>

          <div>
            <span
              className="text-11 block mb-2"
              style={{ color: "var(--sidebar-text-secondary)" }}
            >
              Caption
            </span>
            <TextArea
              value={placementContent.socialCaption || ""}
              onChange={(e) => handlePlacementChange("socialCaption", e.target.value, false)}
              onBlur={() => handlePlacementCommit("socialCaption", "")}
              placeholder="Write a short caption..."
            />
          </div>

          <div>
            <span
              className="text-11 block mb-2"
              style={{ color: "var(--sidebar-text-secondary)" }}
            >
              Image URL
            </span>
            <Input
              value={placementContent.image || ""}
              onChange={(e) => handlePlacementChange("image", e.target.value, false)}
              onBlur={() => handlePlacementCommit("image", "")}
              placeholder="https://images.unsplash.com/..."
            />
            <input
              ref={placementImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePlacementImageUpload}
            />
            <button
              type="button"
              className="btn-figma btn-figma-ghost mt-2 w-full justify-center"
              onClick={() => placementImageInputRef.current?.click()}
            >
              Upload Image
            </button>
            {placementContent.image && (
              <div
                className="mt-2 h-20 rounded-md overflow-hidden"
                style={{ background: "var(--sidebar-bg-active)" }}
              >
                <img
                  src={placementContent.image}
                  alt=""
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Content - only show if tile exists */}
      {tile && (
      <Section title="Content">
        {tile.content.headline !== undefined && (
          <PropRow label="Headline">
            <Input
              value={tile.content.headline}
              onChange={(e) => handleChange("headline", e.target.value)}
              onBlur={() => handleCommit("headline")}
              placeholder="Enter headline..."
            />
          </PropRow>
        )}

        {tile.content.subcopy !== undefined && (
          <PropRow label="Subcopy">
            <Input
              value={tile.content.subcopy}
              onChange={(e) => handleChange("subcopy", e.target.value)}
              onBlur={() => handleCommit("subcopy")}
              placeholder="Supporting text..."
            />
          </PropRow>
        )}

        {tile.content.body !== undefined && (
          <div>
            <span
              className="text-11 block mb-2"
              style={{ color: "var(--sidebar-text-secondary)" }}
            >
              Body
            </span>
            <TextArea
              value={tile.content.body}
              onChange={(e) => handleChange("body", e.target.value)}
              onBlur={() => handleCommit("body")}
              placeholder="Body content..."
            />
          </div>
        )}

        {tile.content.cta !== undefined && (
          <PropRow label="Button">
            <Input
              value={tile.content.cta}
              onChange={(e) => handleChange("cta", e.target.value)}
              onBlur={() => handleCommit("cta")}
              placeholder="Call to action..."
            />
          </PropRow>
        )}

        {tile.content.label !== undefined && (
          <PropRow label="Label">
            <Input
              value={tile.content.label}
              onChange={(e) => handleChange("label", e.target.value)}
              onBlur={() => handleCommit("label")}
              placeholder="Label..."
            />
          </PropRow>
        )}

        {tile.content.price !== undefined && (
          <PropRow label="Price">
            <Input
              value={tile.content.price}
              onChange={(e) => handleChange("price", e.target.value)}
              onBlur={() => handleCommit("price")}
              placeholder="$99"
            />
          </PropRow>
        )}

        {tile.content.image !== undefined && (
          <div>
            <span
              className="text-11 block mb-2"
              style={{ color: "var(--sidebar-text-secondary)" }}
            >
              Image URL
            </span>
            <Input
              value={tile.content.image}
              onChange={(e) => handleChange("image", e.target.value)}
              onBlur={() => handleCommit("image")}
              placeholder="https://images.unsplash.com/..."
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              type="button"
              className="btn-figma btn-figma-ghost mt-2 w-full justify-center"
              onClick={() => imageInputRef.current?.click()}
            >
              Upload Image
            </button>
            {tile.content.image && (
              <div
                className="mt-2 h-20 rounded-md overflow-hidden"
                style={{ background: "var(--sidebar-bg-active)" }}
              >
                <img
                  src={tile.content.image}
                  alt=""
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
            )}
          </div>
        )}

        {tile.content.overlayText !== undefined && (
          <PropRow label="Overlay">
            <Input
              value={tile.content.overlayText}
              onChange={(e) => handleChange("overlayText", e.target.value)}
              onBlur={() => handleCommit("overlayText")}
              placeholder="Overlay text..."
            />
          </PropRow>
        )}

        {tile.content.items !== undefined && (
          <div>
            <span
              className="text-11 block mb-2"
              style={{ color: "var(--sidebar-text-secondary)" }}
            >
              List Items
            </span>
            <TextArea
              value={tile.content.items.join(", ")}
              onChange={(e) =>
                handleChange(
                  "items",
                  e.target.value.split(",").map((s) => s.trim())
                )
              }
              onBlur={() => handleCommit("items")}
              placeholder="Item 1, Item 2, Item 3"
            />
          </div>
        )}

        {tile.content.buttonLabel !== undefined && (
          <PropRow label="Primary">
            <Input
              value={tile.content.buttonLabel}
              onChange={(e) => handleChange("buttonLabel", e.target.value)}
              onBlur={() => handleCommit("buttonLabel")}
              placeholder="Get Started"
            />
          </PropRow>
        )}

        {tile.content.headerTitle !== undefined && (
          <PropRow label="Secondary">
            <Input
              value={tile.content.headerTitle}
              onChange={(e) => handleChange("headerTitle", e.target.value)}
              onBlur={() => handleCommit("headerTitle")}
              placeholder="Learn More"
            />
          </PropRow>
        )}

        {tile.content.inputPlaceholder !== undefined && (
          <PropRow label="Tertiary">
            <Input
              value={tile.content.inputPlaceholder}
              onChange={(e) =>
                handleChange("inputPlaceholder", e.target.value)
              }
              onBlur={() => handleCommit("inputPlaceholder")}
              placeholder="View Details"
            />
          </PropRow>
        )}
      </Section>
      )}

      {/* Spacer at bottom */}
      <div className="h-4" />
    </>
  );
};

// ============================================
// MAIN CONTROL PANEL
// ============================================

const ControlPanel = () => {
  // Selective subscriptions - only re-render when these specific values change
  const focusedTileId = useBrandStore((s) => s.focusedTileId);
  const history = useBrandStore((s) => s.history);
  const focusedTile = useBrandStore(selectFocusedTile);

  // Actions don't change, so select them individually (stable references)
  const undo = useBrandStore((s) => s.undo);
  const redo = useBrandStore((s) => s.redo);
  const setFocusedTile = useBrandStore((s) => s.setFocusedTile);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.metaKey || e.ctrlKey) &&
        ((e.key === "z" && e.shiftKey) || e.key === "Z")
      ) {
        e.preventDefault();
        redo();
      } else if (e.key === "Escape" && focusedTileId) {
        setFocusedTile(null);
      } else if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, focusedTileId, setFocusedTile]);

  return (
    <motion.div
      data-export-exclude="true"
      className="h-full flex flex-col flex-shrink-0 relative"
      style={{
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
      initial={false}
      animate={{ width: isCollapsed ? 48 : 300 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Collapse toggle - positioned inside panel edge */}
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-2 top-3 z-50 w-6 h-6 rounded flex items-center justify-center"
        style={{
          background: "var(--sidebar-bg-hover)",
          color: "var(--sidebar-text-muted)",
        }}
        whileHover={{
          background: "var(--sidebar-bg-active)",
          color: "var(--sidebar-text)"
        }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isCollapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
        </motion.div>
      </motion.button>

      {isCollapsed ? (
        /* Collapsed state - toggle button handles expand */
        <div className="flex flex-col items-center pt-12 gap-2" />
      ) : (
        /* Expanded state */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Panel header */}
          <div
            className="px-4 py-3.5 flex items-center justify-between flex-shrink-0"
            style={{ borderBottom: "1px solid var(--sidebar-border-subtle)" }}
          >
            <span
              className="text-12 font-semibold tracking-wide"
              style={{ color: "var(--sidebar-text)" }}
            >
              {focusedTileId ? "Tile" : "Design"}
            </span>
            <div className="flex items-center gap-2 mr-8">
              {history.past.length > 0 && (
                <span
                  className="text-10 px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--sidebar-bg-hover)",
                    color: "var(--sidebar-text-muted)",
                  }}
                >
                  {history.past.length}
                </span>
              )}
            </div>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto scrollbar-dark">
            <AnimatePresence mode="wait">
              {focusedTileId ? (
                <motion.div
                  key="tile"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <TileControls tile={focusedTile} placementId={focusedTileId} />
                </motion.div>
              ) : (
                <motion.div
                  key="global"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <GlobalControls />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Panel footer */}
          <div
            className="px-4 py-2.5 flex items-center gap-3 flex-shrink-0"
            style={{
              borderTop: "1px solid var(--sidebar-border-subtle)",
            }}
          >
            <div className="flex items-center gap-1.5">
              <Kbd>⌘Z</Kbd>
              <span className="text-10" style={{ color: "var(--sidebar-text-muted)" }}>Undo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Kbd>⌘\</Kbd>
              <span className="text-10" style={{ color: "var(--sidebar-text-muted)" }}>Toggle</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ControlPanel;
