import React, { useState, useRef, useEffect } from "react";
import {
  useBrandStore,
  getContrastRatio,
  getColorHarmony,
  exportAsCSS,
  exportAsJSON,
} from "../store/useBrandStore";
import { useLayoutStore } from "../store/useLayoutStore";
import { BENTO_LAYOUTS } from "../config/bentoLayouts";
import {
  PALETTE_SECTIONS,
  ROLE_DESCRIPTIONS,
  TOTAL_PALETTE_COUNT,
} from "../data/colorPalettes";
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
  LayoutGrid,
  Wand2,
  Copy,
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
  Minus,
  Plus,
  Info,
} from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { motion, AnimatePresence } from "motion/react";

// ============================================
// FIGMA-STYLE MICRO COMPONENTS
// ============================================

const Kbd = ({ children }) => <span className="kbd">{children}</span>;

const Badge = ({ children, variant = "muted" }) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);

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
        borderBottom: isOpen ? "1px solid var(--sidebar-border-subtle)" : "none",
        borderTop: "1px solid transparent",
      }}
    >
      {/* Section Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full collapse-header transition-colors hover:bg-[var(--sidebar-bg-hover)]"
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          style={{ color: "var(--sidebar-text-muted)" }}
        >
          <ChevronRight size={12} />
        </motion.div>

        {Icon && (
          <Icon
            size={14}
            style={{
              color: isOpen
                ? "var(--accent)"
                : "var(--sidebar-text-secondary)",
            }}
          />
        )}

        <span
          className="flex-1 text-left text-11 font-medium select-none"
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
            <div className={noPadding ? "" : "px-3 pb-3 space-y-3"}>
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
  <div className="prop-row">
    <span className="prop-label">{label}</span>
    <div className="prop-value">{children}</div>
    {hint && (
      <span className="text-[10px]" style={{ color: "var(--sidebar-text-muted)" }}>
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
    style={{ fontFamily: mono ? "var(--font-mono)" : "inherit" }}
    {...props}
  />
);

const TextArea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className="input-figma w-full resize-none"
    style={{ height: "auto", padding: "8px 10px" }}
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
          <Minus size={10} />
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
          <Plus size={10} />
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-11" style={{ color: "var(--sidebar-text-secondary)" }}>
          {label}
        </span>
        <span
          className="text-11 font-mono"
          style={{ color: "var(--sidebar-text)" }}
        >
          {typeof value === "number" ? value.toFixed(step < 1 ? 2 : 0) : value}
          {unit}
        </span>
      </div>
      <div className="relative h-4 flex items-center">
        <div
          className="absolute h-1 rounded-full w-full"
          style={{ background: "var(--sidebar-bg-active)" }}
        />
        <div
          className="absolute h-1 rounded-full"
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
          className="absolute w-full h-4 opacity-0 cursor-pointer"
        />
        <div
          className="absolute w-3 h-3 rounded-full border-2 pointer-events-none"
          style={{
            left: `calc(${percentage}% - 6px)`,
            background: "var(--sidebar-bg-elevated)",
            borderColor: "var(--accent)",
          }}
        />
      </div>
    </div>
  );
};

// Segmented control
const SegmentedControl = ({ options, value, onChange }) => (
  <div
    className="flex rounded-md overflow-hidden"
    style={{
      background: "var(--sidebar-bg)",
      border: "1px solid var(--sidebar-border)",
    }}
  >
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className="flex-1 h-7 text-10 font-medium transition-fast"
        style={{
          background:
            value === opt.value ? "var(--accent-muted)" : "transparent",
          color:
            value === opt.value
              ? "var(--accent)"
              : "var(--sidebar-text-secondary)",
        }}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

// ============================================
// FONT SELECTOR - COMPACT DROPDOWN
// ============================================

const FontSelector = ({ label, value, onChange, fonts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <PropRow label={label}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 h-8 px-2 rounded-md flex items-center justify-between transition-fast"
          style={{
            background: "var(--sidebar-bg)",
            border: `1px solid ${isOpen ? "var(--accent)" : "var(--sidebar-border)"}`,
            color: "var(--sidebar-text)",
          }}
        >
          <span className="text-11 truncate" style={{ fontFamily: value }}>
            {value}
          </span>
          <ChevronDown
            size={12}
            style={{ color: "var(--sidebar-text-muted)" }}
          />
        </button>
      </PropRow>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 right-0 top-full mt-1 py-1 rounded-lg z-50 max-h-48 overflow-y-auto scrollbar-dark"
            style={{
              background: "var(--sidebar-bg-elevated)",
              border: "1px solid var(--sidebar-border)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            {fonts.map((font) => (
              <button
                key={font}
                onClick={() => {
                  onChange(font);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 flex items-center gap-2 text-left transition-fast"
                style={{
                  background: value === font ? "var(--accent-muted)" : "transparent",
                  color: value === font ? "var(--accent)" : "var(--sidebar-text)",
                }}
                onMouseEnter={(e) => {
                  if (value !== font) {
                    e.currentTarget.style.background = "var(--sidebar-bg-hover)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    value === font ? "var(--accent-muted)" : "transparent";
                }}
              >
                <span className="text-11" style={{ fontFamily: font }}>
                  {font}
                </span>
                {value === font && (
                  <Check size={12} style={{ marginLeft: "auto" }} />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// COLOR SWATCH - COMPACT WITH PICKER
// ============================================

const ColorSwatch = ({
  label,
  value,
  onChange,
  onBlur,
  showContrast,
  contrastWith,
  hint,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const ref = useRef(null);

  const contrast =
    showContrast && contrastWith ? getContrastRatio(value, contrastWith) : null;
  const passesAA = contrast >= 4.5;
  const passesAAA = contrast >= 7;

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowPicker(false);
        onBlur?.();
      }
    };
    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPicker, onBlur]);

  const handlePickerChange = (newColor) => {
    setLocalValue(newColor);
    onChange({ target: { value: newColor } });
  };

  const presets = [
    "#000000", "#FFFFFF", "#F24822", "#FF7262",
    "#FFCD29", "#14AE5C", "#0D99FF", "#A259FF",
    "#1E1E1E", "#9D9D9D", "#E5E5E5", "#F5F5F5",
  ];

  return (
    <div className="relative" ref={ref}>
      <div className="prop-row">
        <span className="prop-label flex items-center gap-1">
          {label}
          {hint && (
            <Tooltip content={hint} position="right">
              <Info
                size={10}
                style={{ color: "var(--sidebar-text-muted)", cursor: "help" }}
              />
            </Tooltip>
          )}
        </span>
        <div className="prop-value">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-2 flex-1 h-8 px-2 rounded-md transition-fast"
            style={{
              background: "var(--sidebar-bg)",
              border: `1px solid ${showPicker ? "var(--accent)" : "var(--sidebar-border)"}`,
            }}
          >
            <div
              className="w-5 h-5 rounded"
              style={{
                background: value,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
              }}
            />
            <span
              className="text-11 font-mono uppercase flex-1 text-left"
              style={{ color: "var(--sidebar-text)" }}
            >
              {value}
            </span>
            {showContrast && contrast && (
              <span
                className={`badge badge-${passesAAA ? "success" : passesAA ? "warning" : "error"}`}
              >
                {contrast.toFixed(1)}
              </span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 right-0 top-full mt-1 p-3 rounded-lg z-50"
            style={{
              background: "var(--sidebar-bg-elevated)",
              border: "1px solid var(--sidebar-border)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            {/* Hex input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={localValue}
                onChange={(e) => handlePickerChange(e.target.value)}
                className="input-figma flex-1 font-mono uppercase"
              />
              <button
                onClick={() => navigator.clipboard.writeText(localValue)}
                className="icon-btn"
              >
                <Copy size={12} />
              </button>
            </div>

            {/* Color picker */}
            <div className="rounded-md overflow-hidden mb-3">
              <HexColorPicker
                color={localValue}
                onChange={handlePickerChange}
                style={{ width: "100%", height: "140px" }}
              />
            </div>

            {/* Presets */}
            <div className="grid grid-cols-6 gap-1.5">
              {presets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    handlePickerChange(preset);
                    onBlur?.();
                  }}
                  className="aspect-square rounded transition-fast"
                  style={{
                    background: preset,
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// PALETTE CARD - Shows color swatches for a palette
// ============================================

const PaletteCard = ({ palette, onClick }) => {
  // Show up to 6 colors in the preview
  const previewColors = palette.colors.slice(0, 6);

  return (
    <motion.button
      onClick={onClick}
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
      <div className="flex -space-x-0.5">
        {previewColors.map((color, i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full first:rounded-l last:rounded-r"
            style={{
              background: color,
              border: "1px solid rgba(0,0,0,0.1)",
              zIndex: previewColors.length - i,
            }}
          />
        ))}
        {palette.colors.length > 6 && (
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-medium"
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
};

// ============================================
// PALETTE SECTION - Collapsible group by mood
// ============================================

const PaletteSection = ({ section, onSelectPalette }) => {
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
          <ChevronRight size={10} />
        </motion.div>
        <span
          className="text-11 font-medium flex-1 text-left"
          style={{ color: "var(--sidebar-text)" }}
        >
          {section.name}
        </span>
        <span
          className="text-[9px] px-1.5 py-0.5 rounded"
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
                className="text-[9px] italic mb-2"
                style={{ color: "var(--sidebar-text-muted)" }}
              >
                {section.personality}
              </div>
              {/* Palette cards */}
              {section.palettes.map((palette) => (
                <PaletteCard
                  key={palette.id}
                  palette={palette}
                  onClick={() => onSelectPalette(palette.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// PALETTE BROWSER - Full browser section
// ============================================

const PaletteBrowser = () => {
  const { applyPalette } = useBrandStore();

  return (
    <Section
      title="Color Palettes"
      icon={Palette}
      defaultOpen={false}
      badge={<Badge variant="accent">{TOTAL_PALETTE_COUNT}</Badge>}
      noPadding
    >
      <div
        className="max-h-64 overflow-y-auto scrollbar-dark"
        style={{ marginTop: "-4px" }}
      >
        {PALETTE_SECTIONS.map((section) => (
          <PaletteSection
            key={section.id}
            section={section}
            onSelectPalette={applyPalette}
          />
        ))}
      </div>
    </Section>
  );
};

// ============================================
// PRESET CARDS
// ============================================

const PresetCard = ({ name, brand, isActive, onClick }) => (
  <motion.button
    onClick={onClick}
    className="w-full p-2.5 rounded-lg flex items-center gap-2.5 transition-all group relative overflow-hidden"
    style={{
      background: isActive ? "var(--accent-muted)" : "var(--sidebar-bg)",
      border: `1px solid ${isActive ? "var(--accent)" : "var(--sidebar-border)"}`,
    }}
    whileHover={{
      borderColor: isActive ? "var(--accent)" : "var(--sidebar-border-hover)",
      y: -1,
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    }}
    whileTap={{ scale: 0.98, y: 0 }}
  >
    {/* Color preview */}
    <div className="flex -space-x-1.5 shrink-0">
      {[brand.colors.bg, brand.colors.text, brand.colors.primary].map(
        (color, i) => (
          <div
            key={i}
            className="w-5 h-5 rounded-full shadow-sm"
            style={{
              background: color,
              border: "2px solid var(--sidebar-bg-elevated)",
              zIndex: 3 - i,
            }}
          />
        )
      )}
    </div>
    <span className="text-11 font-medium flex-1 text-left truncate" style={{ color: "var(--sidebar-text)" }}>
      {name}
    </span>
    {isActive && (
      <div className="w-4 h-4 rounded-full flex items-center justify-center bg-[var(--accent)] text-white shadow-sm">
        <Check size={10} strokeWidth={3} />
      </div>
    )}
  </motion.button>
);

// ============================================
// LAYOUT PREVIEW - Mini bento grid visualization
// ============================================

const LayoutPreview = ({ preset, isActive }) => {
  const config = BENTO_LAYOUTS[preset]?.desktop;
  if (!config) return null;

  const { columns, rows, placements } = config;

  // Fixed display size for all previews
  const displaySize = 44;
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
];

const LayoutSelector = () => {
  const { preset, setPreset, density, setDensity, debugMode, toggleDebug } = useLayoutStore();

  return (
    <div
      className="px-3 py-3 space-y-3"
      style={{ borderBottom: "1px solid var(--sidebar-border-subtle)" }}
    >
      {/* Layout label */}
      <div className="flex items-center gap-2">
        <LayoutGrid size={14} style={{ color: "var(--accent)" }} />
        <span
          className="text-11 font-medium"
          style={{ color: "var(--sidebar-text)" }}
        >
          Layout
        </span>
      </div>

      {/* Layout preset buttons */}
      <div className="grid grid-cols-3 gap-1.5">
        {LAYOUT_PRESETS_CONFIG.map((p) => {
          const isActive = preset === p.key;
          return (
            <motion.button
              key={p.key}
              onClick={() => setPreset(p.key)}
              className="flex flex-col items-center gap-2 p-2.5 rounded-lg transition-all relative overflow-hidden"
              style={{
                background: isActive
                  ? "linear-gradient(135deg, var(--accent-muted) 0%, transparent 100%)"
                  : "var(--sidebar-bg)",
                border: `1.5px solid ${isActive ? "var(--accent)" : "var(--sidebar-border)"}`,
                boxShadow: isActive
                  ? "0 2px 8px -2px var(--accent-muted), inset 0 1px 0 rgba(255,255,255,0.1)"
                  : "inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
              whileHover={{
                borderColor: isActive ? "var(--accent)" : "var(--sidebar-text-muted)",
                y: -2,
                boxShadow: isActive
                  ? "0 4px 12px -2px var(--accent-muted)"
                  : "0 2px 8px -2px rgba(0,0,0,0.1)",
              }}
              whileTap={{ scale: 0.96, y: 0 }}
            >
              <LayoutPreview preset={p.key} isActive={isActive} />
              <span
                className="text-[10px] font-semibold tracking-wide"
                style={{
                  color: isActive ? "var(--accent)" : "var(--sidebar-text-secondary)",
                  textShadow: isActive ? "0 0 20px var(--accent-muted)" : "none",
                }}
              >
                {p.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeLayoutIndicator"
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{
                    border: "1.5px solid var(--accent)",
                    boxShadow: "inset 0 0 12px -4px var(--accent)",
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Density toggle */}
      <div className="flex items-center gap-2">
        <span className="text-10" style={{ color: "var(--sidebar-text-secondary)" }}>
          Density
        </span>
        <div className="flex-1">
          <SegmentedControl
            options={[
              { value: "cozy", label: "Cozy" },
              { value: "dense", label: "Dense" },
            ]}
            value={density}
            onChange={setDensity}
          />
        </div>
      </div>

      {/* Debug toggle */}
      <div className="flex items-center gap-2">
        <span className="text-10" style={{ color: "var(--sidebar-text-secondary)" }}>
          Debug
        </span>
        <div className="flex-1">
          <motion.button
            onClick={toggleDebug}
            className="w-full h-7 px-3 rounded-md text-10 font-medium transition-fast flex items-center justify-center gap-1.5"
            style={{
              background: debugMode ? "var(--accent-muted)" : "var(--sidebar-bg)",
              border: `1px solid ${debugMode ? "var(--accent)" : "var(--sidebar-border)"}`,
              color: debugMode ? "var(--accent)" : "var(--sidebar-text-secondary)",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: debugMode ? "var(--accent)" : "var(--sidebar-text-muted)",
              }}
            />
            {debugMode ? "Grid Visible" : "Show Grid"}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// GLOBAL CONTROLS
// ============================================

const GlobalControls = () => {
  const { brand, updateBrand, loadPreset } = useBrandStore();

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

  const fonts = [
    "Inter",
    "Plus Jakarta Sans",
    "Sora",
    "Montserrat",
    "Poppins",
    "Bricolage Grotesque",
    "JetBrains Mono",
    "Playfair Display",
  ];

  const presets = [
    { key: "default", name: "Minimal" },
    { key: "techStartup", name: "Tech" },
    { key: "luxuryRetail", name: "Luxury" },
    { key: "communityNonprofit", name: "Community" },
    { key: "creativeStudio", name: "Creative" },
  ];

  const presetBrands = {
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
  };

  return (
    <>
      {/* Layout Selector at top */}
      <LayoutSelector />

      {/* Quick Start */}
      <Section
        title="Quick Start"
        icon={Wand2}
        defaultOpen={false}
        badge={<Badge variant="accent">{presets.length}</Badge>}
      >
        <div className="grid grid-cols-1 gap-2">
          {presets.map((preset) => (
            <PresetCard
              key={preset.key}
              name={preset.name}
              brand={presetBrands[preset.key]}
              isActive={false}
              onClick={() => loadPreset(preset.key)}
            />
          ))}
        </div>
      </Section>

      {/* Color Palettes */}
      <PaletteBrowser />

      {/* Typography */}
      <Section title="Typography" icon={Type}>
        <FontSelector
          label="Headline"
          value={brand.typography.primary}
          onChange={(font) => handleChange("typography", "primary", font, true)}
          fonts={fonts}
        />

        <FontSelector
          label="Body"
          value={brand.typography.secondary}
          onChange={(font) => handleChange("typography", "secondary", font, true)}
          fonts={fonts}
        />

        <PropRow label="Spacing">
          <div
            className="flex rounded-md overflow-hidden"
            style={{
              background: "var(--sidebar-bg)",
              border: "1px solid var(--sidebar-border)",
            }}
          >
            {[
              { value: "tight", label: "Tight" },
              { value: "normal", label: "Normal" },
              { value: "wide", label: "Wide" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleChange("typography", "letterSpacing", opt.value, true)}
                className="flex-1 h-8 px-3 text-11 font-medium transition-fast"
                style={{
                  background:
                    brand.typography.letterSpacing === opt.value
                      ? "var(--accent-muted)"
                      : "transparent",
                  color:
                    brand.typography.letterSpacing === opt.value
                      ? "var(--accent)"
                      : "var(--sidebar-text-secondary)",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
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
      <Section
        title="Colors"
        icon={Droplet}
        badge={
          getContrastRatio(brand.colors.text, brand.colors.bg) >= 4.5 ? (
            <Badge variant="success">AA</Badge>
          ) : (
            <Badge variant="error">Low</Badge>
          )
        }
      >
        <ColorSwatch
          label="Background"
          value={brand.colors.bg}
          onChange={(e) => handleChange("colors", "bg", e.target.value, false)}
          onBlur={() => handleChange("colors", "bg", brand.colors.bg, true)}
          hint={ROLE_DESCRIPTIONS.bg}
        />

        <ColorSwatch
          label="Text"
          value={brand.colors.text}
          onChange={(e) => handleChange("colors", "text", e.target.value, false)}
          onBlur={() => handleChange("colors", "text", brand.colors.text, true)}
          showContrast
          contrastWith={brand.colors.bg}
          hint={ROLE_DESCRIPTIONS.text}
        />

        <ColorSwatch
          label="Primary"
          value={brand.colors.primary}
          onChange={(e) =>
            handleChange("colors", "primary", e.target.value, false)
          }
          onBlur={() =>
            handleChange("colors", "primary", brand.colors.primary, true)
          }
          showContrast
          contrastWith={brand.colors.bg}
          hint={ROLE_DESCRIPTIONS.primary}
        />

        <ColorSwatch
          label="Accent"
          value={brand.colors.accent}
          onChange={(e) =>
            handleChange("colors", "accent", e.target.value, false)
          }
          onBlur={() =>
            handleChange("colors", "accent", brand.colors.accent, true)
          }
          hint={ROLE_DESCRIPTIONS.accent}
        />

        <ColorSwatch
          label="Surface"
          value={brand.colors.surface}
          onChange={(e) =>
            handleChange("colors", "surface", e.target.value, false)
          }
          onBlur={() =>
            handleChange("colors", "surface", brand.colors.surface, true)
          }
          hint={ROLE_DESCRIPTIONS.surface}
        />
      </Section>

      {/* Logo */}
      <Section title="Logo" icon={Sparkles} defaultOpen={false}>
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
          <div
            style={{
              fontFamily: brand.typography.primary,
              fontSize: `${brand.logo.size}px`,
              padding: `${brand.logo.padding}px`,
              backgroundColor: brand.colors.bg,
              color: brand.colors.primary,
              letterSpacing: "0.15em",
              fontWeight: "800",
              borderRadius: "6px",
            }}
          >
            {brand.logo.text}
          </div>
        </div>
      </Section>
    </>
  );
};

// ============================================
// TILE CONTROLS
// ============================================

const TileControls = ({ tile }) => {
  const { updateTile, setFocusedTile, swapTileType } = useBrandStore();

  const handleChange = (key, value) => {
    updateTile(tile.id, { [key]: value });
  };

  const tileTypes = [
    { value: "hero", label: "Hero", icon: Layers },
    { value: "editorial", label: "Editorial", icon: FileText },
    { value: "product", label: "Product", icon: Box },
    { value: "ui-preview", label: "UI", icon: LayoutGrid },
    { value: "image", label: "Image", icon: Image },
    { value: "utility", label: "Utility", icon: Hash },
    { value: "logo", label: "Logo", icon: Sparkles },
  ];

  const currentType = tileTypes.find((t) => t.value === tile.type);
  const CurrentIcon = currentType?.icon || Layers;

  return (
    <>
      {/* Tile header */}
      <div
        className="px-3 py-3 flex items-center gap-3"
        style={{ borderBottom: "1px solid var(--sidebar-border-subtle)" }}
      >
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center"
          style={{ background: "var(--accent-muted)", color: "var(--accent)" }}
        >
          <CurrentIcon size={14} />
        </div>
        <div className="flex-1">
          <h2
            className="text-12 font-medium capitalize"
            style={{ color: "var(--sidebar-text)" }}
          >
            {tile.type.replace("-", " ")} Tile
          </h2>
          <p className="text-10" style={{ color: "var(--sidebar-text-muted)" }}>
            Edit content
          </p>
        </div>
        <motion.button
          onClick={() => setFocusedTile(null)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-11 font-medium transition-fast"
          style={{
            background: "var(--accent-muted)",
            color: "var(--accent)",
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Check size={12} />
          Done
        </motion.button>
      </div>

      {/* Tile type */}
      <Section title="Type" icon={LayoutGrid} defaultOpen={false}>
        <div className="grid grid-cols-4 gap-1">
          {tileTypes.map((type) => {
            const TypeIcon = type.icon;
            const isSelected = tile.type === type.value;

            return (
              <button
                key={type.value}
                onClick={() => swapTileType(tile.id, type.value)}
                className="flex flex-col items-center gap-1 p-2 rounded-md transition-fast"
                style={{
                  background: isSelected
                    ? "var(--accent-muted)"
                    : "var(--sidebar-bg)",
                  border: `1px solid ${isSelected ? "var(--accent)" : "var(--sidebar-border)"}`,
                  color: isSelected ? "var(--accent)" : "var(--sidebar-text-secondary)",
                }}
              >
                <TypeIcon size={14} />
                <span className="text-[9px]">{type.label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Content */}
      <Section title="Content" icon={FileText}>
        {tile.content.headline !== undefined && (
          <PropRow label="Headline">
            <Input
              value={tile.content.headline}
              onChange={(e) => handleChange("headline", e.target.value)}
              placeholder="Enter headline..."
            />
          </PropRow>
        )}

        {tile.content.subcopy !== undefined && (
          <PropRow label="Subcopy">
            <Input
              value={tile.content.subcopy}
              onChange={(e) => handleChange("subcopy", e.target.value)}
              placeholder="Supporting text..."
            />
          </PropRow>
        )}

        {tile.content.body !== undefined && (
          <div>
            <span
              className="text-11 block mb-1.5"
              style={{ color: "var(--sidebar-text-secondary)" }}
            >
              Body
            </span>
            <TextArea
              value={tile.content.body}
              onChange={(e) => handleChange("body", e.target.value)}
              placeholder="Body content..."
            />
          </div>
        )}

        {tile.content.cta !== undefined && (
          <PropRow label="Button">
            <Input
              value={tile.content.cta}
              onChange={(e) => handleChange("cta", e.target.value)}
              placeholder="Call to action..."
            />
          </PropRow>
        )}

        {tile.content.label !== undefined && (
          <PropRow label="Label">
            <Input
              value={tile.content.label}
              onChange={(e) => handleChange("label", e.target.value)}
              placeholder="Label..."
            />
          </PropRow>
        )}

        {tile.content.price !== undefined && (
          <PropRow label="Price">
            <Input
              value={tile.content.price}
              onChange={(e) => handleChange("price", e.target.value)}
              placeholder="$99"
            />
          </PropRow>
        )}

        {tile.content.image !== undefined && (
          <div>
            <span
              className="text-11 block mb-1.5"
              style={{ color: "var(--sidebar-text-secondary)" }}
            >
              Image URL
            </span>
            <Input
              value={tile.content.image}
              onChange={(e) => handleChange("image", e.target.value)}
              placeholder="https://images.unsplash.com/..."
            />
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
              placeholder="Overlay text..."
            />
          </PropRow>
        )}

        {tile.content.items !== undefined && (
          <div>
            <span
              className="text-11 block mb-1.5"
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
              placeholder="Item 1, Item 2, Item 3"
            />
          </div>
        )}

        {tile.content.headerTitle !== undefined && (
          <PropRow label="Header">
            <Input
              value={tile.content.headerTitle}
              onChange={(e) => handleChange("headerTitle", e.target.value)}
              placeholder="Header..."
            />
          </PropRow>
        )}

        {tile.content.buttonLabel !== undefined && (
          <PropRow label="Button">
            <Input
              value={tile.content.buttonLabel}
              onChange={(e) => handleChange("buttonLabel", e.target.value)}
              placeholder="Submit"
            />
          </PropRow>
        )}

        {tile.content.inputPlaceholder !== undefined && (
          <PropRow label="Placeholder">
            <Input
              value={tile.content.inputPlaceholder}
              onChange={(e) =>
                handleChange("inputPlaceholder", e.target.value)
              }
              placeholder="Search..."
            />
          </PropRow>
        )}
      </Section>

      {/* Footer note */}
      <div
        className="px-3 py-3 flex items-center gap-2"
        style={{ borderTop: "1px solid var(--sidebar-border-subtle)" }}
      >
        <Palette size={12} style={{ color: "var(--sidebar-text-muted)" }} />
        <span className="text-10" style={{ color: "var(--sidebar-text-muted)" }}>
          Styles controlled by brand settings
        </span>
      </div>
    </>
  );
};

// ============================================
// MAIN CONTROL PANEL
// ============================================

const ControlPanel = () => {
  const { focusedTileId, tiles, undo, redo, history, setFocusedTile } = useBrandStore();
  const focusedTile = tiles.find((t) => t.id === focusedTileId);
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
      className="h-full flex flex-col flex-shrink-0 relative overflow-hidden"
      style={{
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
      initial={false}
      animate={{ width: isCollapsed ? 48 : 300 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Collapse toggle */}
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-50 w-6 h-12 rounded-full flex items-center justify-center"
        style={{
          background: "var(--sidebar-bg-elevated)",
          border: "1px solid var(--sidebar-border)",
          boxShadow: "var(--shadow-md)",
          color: "var(--sidebar-text-secondary)",
        }}
        whileHover={{ scale: 1.1, color: "var(--sidebar-text)" }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight size={12} />
        </motion.div>
      </motion.button>

      {isCollapsed ? (
        /* Collapsed state */
        <div className="flex flex-col items-center py-3 gap-1">
          <IconButton
            icon={PanelLeft}
            tooltip="Expand"
            onClick={() => setIsCollapsed(false)}
          />
          <div className="divider-h w-6 my-1" />
          <IconButton icon={Sliders} tooltip="Brand" />
          <IconButton icon={Type} tooltip="Typography" />
          <IconButton icon={Droplet} tooltip="Colors" />
          <IconButton icon={Sparkles} tooltip="Logo" />
        </div>
      ) : (
        /* Expanded state */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Panel header */}
          <div
            className="px-3 py-2 flex items-center justify-between flex-shrink-0"
            style={{ borderBottom: "1px solid var(--sidebar-border-subtle)" }}
          >
            <span
              className="text-11 font-medium"
              style={{ color: "var(--sidebar-text)" }}
            >
              {focusedTile ? "Tile Properties" : "Design"}
            </span>
            <div className="flex items-center gap-1">
              <span
                className="text-10 px-2 py-0.5 rounded"
                style={{
                  background: "var(--sidebar-bg-hover)",
                  color: "var(--sidebar-text-muted)",
                }}
              >
                {history.past.length} edits
              </span>
            </div>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto scrollbar-dark">
            <AnimatePresence mode="wait">
              {focusedTile ? (
                <motion.div
                  key="tile"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <TileControls tile={focusedTile} />
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
            className="px-3 py-2 flex items-center justify-between flex-shrink-0"
            style={{
              borderTop: "1px solid var(--sidebar-border-subtle)",
              background: "var(--sidebar-bg-elevated)",
            }}
          >
            <div className="flex items-center gap-1">
              <Kbd>⌘</Kbd>
              <Kbd>Z</Kbd>
            </div>
            <span className="text-10" style={{ color: "var(--sidebar-text-muted)" }}>
              Undo/Redo
            </span>
            <div className="flex items-center gap-1">
              <Kbd>⌘</Kbd>
              <Kbd>\</Kbd>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ControlPanel;
