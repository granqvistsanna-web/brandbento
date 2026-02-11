/**
 * Global brand controls shown when no tile is focused.
 * Handles Layout, Typography, Color Palettes, Colors, Industry Themes, and Logo sections.
 * Extracted from ControlPanel.jsx.
 */
import React from "react";
import { motion } from "motion/react";
import { RiShuffleLine } from "react-icons/ri";
import { useBrandStore } from "../store/useBrandStore";
import { Section, PropRow, Input, Slider, SegmentedControl } from "./controls";
import { FontSelector } from "./controls/FontSelector";
import { LayoutSelector, CanvasRatioPicker, CanvasBgPicker } from "./controls/LayoutControls";
import { ColorPalettePanel } from "./color/ColorPalettePanel";
import { getContrastRatio } from "../utils/colorMapping";
import ImageDropZone from "./ImageDropZone";
import { ImageCollections } from "./controls/ImageCollections";

const ShuffleButton = ({ onClick, shortcut }: { onClick: () => void; shortcut: string }) => (
  <motion.button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    title={`Shuffle (${shortcut})`}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    style={{
      background: "transparent",
      border: "none",
      cursor: "pointer",
      padding: 4,
      borderRadius: 6,
      color: "var(--sidebar-text-muted)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "color 0.15s, background 0.15s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = "var(--sidebar-text)";
      e.currentTarget.style.background = "var(--sidebar-bg-hover)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = "var(--sidebar-text-muted)";
      e.currentTarget.style.background = "transparent";
    }}
  >
    <RiShuffleLine size={14} />
  </motion.button>
);

// ============================================
// PRESET CARDS
// ============================================

const PRESET_OPTIONS = [
  { key: "default", name: "General Brand", tagline: "Clean & minimal", font: "Inter", word: "BENTO" },
  { key: "techStartup", name: "Tech SaaS", tagline: "Fast & precise", font: "Sora", word: "TECH" },
  { key: "luxuryRetail", name: "Luxury Retail", tagline: "Refined & timeless", font: "Playfair Display", word: "LUXE" },
  { key: "communityNonprofit", name: "Community", tagline: "Warm & inviting", font: "Plus Jakarta Sans", word: "UNITE" },
  { key: "creativeStudio", name: "Creative Studio", tagline: "Bold & expressive", font: "Bricolage Grotesque", word: "STUDIO" },
  { key: "spread", name: "Food & Drink", tagline: "Earthy & editorial", font: "Oswald", word: "FORAGE" },
];

const PRESET_BRANDS: Record<string, {
  colors: { bg: string; text: string; primary: string; accent: string };
  surfaces: string[];
}> = {
  default: {
    colors: { bg: "#FFFFFF", text: "#1A1A1A", primary: "#000000", accent: "#555555" },
    surfaces: ["#F5F5F5", "#EBEBEB", "#D4D4D4", "#000000", "#555555"],
  },
  techStartup: {
    colors: { bg: "#F5F7FA", text: "#0F172A", primary: "#3B82F6", accent: "#64748B" },
    surfaces: ["#FFFFFF", "#F1F5F9", "#E2E8F0", "#3B82F6", "#64748B"],
  },
  luxuryRetail: {
    colors: { bg: "#FDFCFA", text: "#1C1917", primary: "#78716C", accent: "#A8A29E" },
    surfaces: ["#F5F5F4", "#FAFAF9", "#E7E5E4", "#78716C", "#A8A29E"],
  },
  communityNonprofit: {
    colors: { bg: "#FFFFFF", text: "#0C4A6E", primary: "#0EA5E9", accent: "#7DD3FC" },
    surfaces: ["#F0F9FF", "#E0F2FE", "#BAE6FD", "#0EA5E9", "#7DD3FC"],
  },
  creativeStudio: {
    colors: { bg: "#FAFAFA", text: "#171717", primary: "#F97316", accent: "#D946EF" },
    surfaces: ["#FFFFFF", "#FFF7ED", "#FEFCE8", "#F97316", "#D946EF"],
  },
  spread: {
    colors: { bg: "#F7F2EA", text: "#1E1C2E", primary: "#2D2A57", accent: "#9A79E8" },
    surfaces: ["#E3DBC8", "#F2EDE4", "#2D2A57", "#9A79E8", "#E3DBC8"],
  },
};

const PresetCard = ({
  name,
  brand,
  isActive,
  onClick,
  font,
  word,
  tagline,
}: {
  name: string;
  brand: typeof PRESET_BRANDS[string];
  isActive: boolean;
  onClick: () => void;
  font: string;
  word: string;
  tagline: string;
}) => (
  <motion.button
    onClick={onClick}
    className="w-full text-left relative overflow-hidden"
    style={{
      borderRadius: 10,
      border: isActive ? "2px solid var(--accent)" : "1px solid var(--sidebar-border)",
      padding: 0,
      transition: "border-color 0.2s, box-shadow 0.2s",
      background: "transparent",
    }}
    whileHover={{
      borderColor: isActive ? undefined : "var(--sidebar-text-muted)",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    }}
  >
    <div
      style={{
        background: brand.colors.bg,
        padding: "14px 14px 12px",
        borderRadius: "9px 9px 0 0",
        position: "relative",
      }}
    >
      <div
        style={{
          fontFamily: `"${font}", sans-serif`,
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "0.02em",
          color: brand.colors.text,
          lineHeight: 1.1,
        }}
      >
        {word}
      </div>
      <div
        style={{
          fontFamily: `"${font}", sans-serif`,
          fontSize: 10,
          color: brand.colors.text,
          opacity: 0.45,
          marginTop: 3,
          letterSpacing: "0.06em",
        }}
      >
        {tagline}
      </div>
    </div>

    <div className="flex w-full" style={{ height: 4 }}>
      {brand.surfaces.map((color, i) => (
        <div key={i} className="flex-1" style={{ background: color }} />
      ))}
    </div>

    <div
      className="flex items-center justify-between"
      style={{
        padding: "7px 12px",
        background: "var(--sidebar-bg)",
      }}
    >
      <span
        className="text-[10px] uppercase tracking-wider"
        style={{
          color: isActive ? "var(--sidebar-text)" : "var(--sidebar-text-secondary)",
          fontWeight: 500,
        }}
      >
        {name}
      </span>
      <div className="flex items-center gap-0.5">
        {[brand.colors.primary, brand.colors.accent, brand.colors.text, brand.colors.bg].map(
          (color, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: color,
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            />
          )
        )}
      </div>
    </div>
  </motion.button>
);

// ============================================
// GLOBAL CONTROLS
// ============================================

const GlobalControls = React.memo(() => {
  const brand = useBrandStore((s) => s.brand);
  const updateBrand = useBrandStore((s) => s.updateBrand);
  const shuffleColors = useBrandStore((s) => s.shuffleColors);
  const shuffleTypography = useBrandStore((s) => s.shuffleTypography);
  const loadPreset = useBrandStore((s) => s.loadPreset);
  const activePreset = useBrandStore((s) => s.activePreset);

  const handleChange = (section: string, key: string, value: unknown, isCommit = false) => {
    updateBrand(
      {
        [section]: {
          ...(brand as unknown as Record<string, Record<string, unknown>>)[section],
          [key]: value,
        },
      },
      isCommit
    );
  };

  return (
    <>
      {/* Layout */}
      <Section title="Layout" defaultOpen>
        <LayoutSelector />
        <CanvasRatioPicker />
        <CanvasBgPicker />
      </Section>

      {/* Typography */}
      <Section title="Typography" action={<ShuffleButton onClick={shuffleTypography} shortcut="T" />}>
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

        <Slider
          label="Headline Weight"
          value={parseInt(brand.typography.weightHeadline) || 700}
          onChange={(val) =>
            handleChange("typography", "weightHeadline", String(Math.round(val / 100) * 100), false)
          }
          onBlur={() =>
            handleChange("typography", "weightHeadline", brand.typography.weightHeadline, true)
          }
          min={100}
          max={900}
          step={100}
        />

        <Slider
          label="Body Weight"
          value={parseInt(brand.typography.weightBody) || 400}
          onChange={(val) =>
            handleChange("typography", "weightBody", String(Math.round(val / 100) * 100), false)
          }
          onBlur={() =>
            handleChange("typography", "weightBody", brand.typography.weightBody, true)
          }
          min={100}
          max={900}
          step={100}
        />

        <Slider
          label="Headline Leading"
          value={brand.typography.lineHeightHeadline}
          onChange={(val) =>
            handleChange("typography", "lineHeightHeadline", val, false)
          }
          onBlur={() =>
            handleChange("typography", "lineHeightHeadline", brand.typography.lineHeightHeadline, true)
          }
          min={0.9}
          max={1.3}
          step={0.01}
        />

        <Slider
          label="Body Leading"
          value={brand.typography.lineHeightBody}
          onChange={(val) =>
            handleChange("typography", "lineHeightBody", val, false)
          }
          onBlur={() =>
            handleChange("typography", "lineHeightBody", brand.typography.lineHeightBody, true)
          }
          min={1.2}
          max={2.0}
          step={0.01}
        />

        <Slider
          label="Headline Tracking"
          value={brand.typography.trackingHeadline}
          onChange={(val) =>
            handleChange("typography", "trackingHeadline", Math.round(val * 1000) / 1000, false)
          }
          onBlur={() =>
            handleChange("typography", "trackingHeadline", brand.typography.trackingHeadline, true)
          }
          min={-0.05}
          max={0.1}
          step={0.005}
          unit="em"
        />

        <Slider
          label="Body Tracking"
          value={brand.typography.trackingBody}
          onChange={(val) =>
            handleChange("typography", "trackingBody", Math.round(val * 1000) / 1000, false)
          }
          onBlur={() =>
            handleChange("typography", "trackingBody", brand.typography.trackingBody, true)
          }
          min={-0.05}
          max={0.1}
          step={0.005}
          unit="em"
        />

        <PropRow label="Headline Case">
          <SegmentedControl
            options={[
              { value: "none", label: "None" },
              { value: "uppercase", label: "Upper" },
              { value: "capitalize", label: "Title" },
            ]}
            value={brand.typography.transformHeadline}
            onChange={(val) => handleChange("typography", "transformHeadline", val, true)}
          />
        </PropRow>
      </Section>

      {/* Color Palettes */}
      <Section title="Color Palettes" defaultOpen noPadding action={<ShuffleButton onClick={shuffleColors} shortcut="C" />}>
        <ColorPalettePanel />
      </Section>

      {/* Colors – compact swatch bar */}
      <Section title="Colors" badge={getContrastRatio(brand.colors.text, brand.colors.bg) >= 4.5 ? "AA" : null}>
        <div className="flex items-center gap-1.5">
          {[
            { key: "bg", label: "BG" },
            { key: "text", label: "Text" },
            { key: "primary", label: "Pri" },
            { key: "accent", label: "Acc" },
            { key: "surface", label: "Surf" },
          ].map(({ key, label }) => (
            <button
              key={key}
              title={`${label}: ${(brand.colors as unknown as Record<string, string>)[key] || brand.colors.bg}`}
              className="group flex flex-col items-center gap-0.5 cursor-pointer"
              onClick={() => {
                const section = document.querySelector('[data-section="Color Palettes"]');
                if (section && !(section as HTMLElement).dataset.open) section.querySelector('button')?.click();
              }}
            >
              <div
                className="w-7 h-7 rounded-md ring-1 ring-inset ring-white/10 transition-transform group-hover:scale-110"
                style={{ backgroundColor: (brand.colors as unknown as Record<string, string>)[key] || brand.colors.bg }}
              />
              <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--sidebar-text-muted)" }}>{label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Image Collections */}
      <ImageCollections />

      {/* Imagery Style */}
      <Section title="Imagery" defaultOpen={false}>
        <PropRow label="Style">
          <SegmentedControl
            options={[
              { value: "default", label: "Default" },
              { value: "grayscale", label: "B&W" },
              { value: "tint", label: "Tint" },
            ]}
            value={brand.imagery.style}
            onChange={(val) => handleChange("imagery", "style", val, true)}
          />
        </PropRow>

        <Slider
          label="Overlay"
          value={brand.imagery.overlay}
          onChange={(val) => handleChange("imagery", "overlay", Math.round(val), false)}
          onBlur={() => handleChange("imagery", "overlay", brand.imagery.overlay, true)}
          min={0}
          max={100}
          step={1}
          unit="%"
        />
      </Section>

      {/* Industry Themes */}
      <Section
        title="Industry Themes"
        defaultOpen={false}
      >
        <div className="flex flex-col gap-2">
          {PRESET_OPTIONS.map((preset) => (
            <PresetCard
              key={preset.key}
              name={preset.name}
              brand={PRESET_BRANDS[preset.key]}
              isActive={activePreset === preset.key}
              onClick={() => loadPreset(preset.key)}
              font={preset.font}
              word={preset.word}
              tagline={preset.tagline}
            />
          ))}
        </div>
      </Section>

      {/* Logo */}
      <Section title="Logo" defaultOpen={false}>
        <ImageDropZone
          value={brand.logo.image}
          onChange={(v) => handleChange("logo", "image", v, true)}
          accept="image/svg+xml,image/png"
          label="Drop logo (SVG/PNG)"
          compact
        />

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

export default GlobalControls;
