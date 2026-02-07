import React, { useState, useRef, useEffect } from "react";
import {
  useBrandStore,
  getContrastRatio,
  getColorHarmony,
  exportAsCSS,
  exportAsJSON,
} from "../store/useBrandStore";
import { Download, Palette, Moon, Sun, Pipette, X, Check } from "lucide-react";
import { HexColorPicker } from "react-colorful";

const ControlSection = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="text-[11px] font-semibold tracking-[0.15em] text-[#999] uppercase mb-4">
      {title}
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const Label = ({ children }) => (
  <label className="block text-[13px] font-medium text-[#333] mb-2">
    {children}
  </label>
);

const Input = ({ ...props }) => (
  <input
    {...props}
    className="w-full bg-white border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
  />
);

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full bg-white border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23999%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10"
  >
    {children}
  </select>
);

const ColorInput = ({
  label,
  value,
  onChange,
  onBlur,
  showContrast,
  contrastWith,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const pickerRef = useRef(null);

  const contrast =
    showContrast && contrastWith ? getContrastRatio(value, contrastWith) : null;
  const passesAA = contrast >= 4.5;
  const passesAAA = contrast >= 7;

  // Color presets
  const presets = [
    "#000000",
    "#FFFFFF",
    "#EF4444",
    "#F97316",
    "#F59E0B",
    "#84CC16",
    "#10B981",
    "#06B6D4",
    "#3B82F6",
    "#6366F1",
    "#8B5CF6",
    "#EC4899",
  ];

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
        if (localValue !== value) {
          onChange({ target: { value: localValue } });
          onBlur();
        }
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPicker, localValue, value, onChange, onBlur]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handlePickerChange = (newColor) => {
    setLocalValue(newColor);
    onChange({ target: { value: newColor } });
  };

  const handleInputChange = (e) => {
    setLocalValue(e.target.value);
    onChange(e);
  };

  const handlePresetClick = (color) => {
    setLocalValue(color);
    onChange({ target: { value: color } });
    onBlur();
  };

  return (
    <div className="space-y-2.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="w-12 h-12 rounded-xl border-2 border-[#E5E5E5] hover:border-black transition-all relative group shadow-sm"
            style={{ backgroundColor: value }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-[10px]">
              <Pipette size={18} className="text-white drop-shadow-lg" />
            </div>
          </button>

          {showPicker && (
            <div className="absolute left-0 top-16 z-50 bg-white rounded-2xl shadow-2xl border border-[#E5E5E5] p-5 space-y-4 w-[240px]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-semibold text-[#666] uppercase tracking-wider">
                  Color Picker
                </span>
                <button
                  onClick={() => setShowPicker(false)}
                  className="text-[#999] hover:text-black transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <HexColorPicker
                color={localValue}
                onChange={handlePickerChange}
                style={{ width: "100%", height: "160px" }}
              />

              {/* Preset swatches */}
              <div className="pt-4 border-t border-[#F0F0F0]">
                <div className="text-[11px] font-semibold text-[#999] tracking-wider uppercase mb-3">
                  Quick Colors
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handlePresetClick(preset)}
                      className="w-8 h-8 rounded-lg border-2 border-[#E5E5E5] hover:scale-110 hover:border-black transition-all shadow-sm"
                      style={{ backgroundColor: preset }}
                      title={preset}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1">
          <Input
            value={localValue}
            onChange={handleInputChange}
            onBlur={onBlur}
            placeholder="#000000"
          />
        </div>
      </div>

      {showContrast && contrast && (
        <div className="flex items-center gap-2 text-[11px] pt-1">
          <span className="text-[#666] font-medium">
            Contrast: {contrast.toFixed(2)}:1
          </span>
          {passesAAA && (
            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
              <Check size={12} />
              AAA
            </span>
          )}
          {passesAA && !passesAAA && (
            <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
              <Check size={12} />
              AA
            </span>
          )}
          {!passesAA && (
            <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-semibold">
              Fail
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const GlobalControls = () => {
  const {
    brand,
    updateBrand,
    loadPreset,
    darkModePreview,
    toggleDarkMode,
    setFontPreview,
  } = useBrandStore();
  const [showColorHarmony, setShowColorHarmony] = useState(false);

  const handleChange = (section, key, value, isCommit = false) => {
    updateBrand(
      {
        [section]: {
          ...brand[section],
          [key]: value,
        },
      },
      isCommit,
    );
  };

  const handleExport = (type) => {
    const content = type === "css" ? exportAsCSS(brand) : exportAsJSON(brand);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brand-tokens.${type === "css" ? "css" : "json"}`;
    a.click();
    URL.revokeObjectURL(url);
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

  const harmony = getColorHarmony(brand.colors.primary);

  return (
    <>
      <ControlSection title="Quick Actions">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={toggleDarkMode}
            className="flex flex-col items-center justify-center gap-2 px-4 py-3.5 text-[12px] font-semibold border-2 border-[#E5E5E5] rounded-xl hover:bg-[#FAFAFA] hover:border-black transition-all"
          >
            {darkModePreview ? <Sun size={18} /> : <Moon size={18} />}
            <span className="text-[11px]">
              {darkModePreview ? "Light" : "Dark"}
            </span>
          </button>
          <button
            onClick={() => handleExport("css")}
            className="flex flex-col items-center justify-center gap-2 px-4 py-3.5 text-[12px] font-semibold border-2 border-[#E5E5E5] rounded-xl hover:bg-[#FAFAFA] hover:border-black transition-all"
          >
            <Download size={18} />
            <span className="text-[11px]">CSS</span>
          </button>
          <button
            onClick={() => handleExport("json")}
            className="flex flex-col items-center justify-center gap-2 px-4 py-3.5 text-[12px] font-semibold border-2 border-[#E5E5E5] rounded-xl hover:bg-[#FAFAFA] hover:border-black transition-all"
          >
            <Download size={18} />
            <span className="text-[11px]">JSON</span>
          </button>
        </div>
      </ControlSection>

      <ControlSection title="Brand Presets">
        <Select onChange={(e) => loadPreset(e.target.value)} defaultValue="">
          <option value="" disabled>
            Select a preset...
          </option>
          <option value="default">Clean & Minimal</option>
          <option value="techStartup">Tech Startup</option>
          <option value="luxuryRetail">Luxury Retail</option>
          <option value="communityNonprofit">Community Nonprofit</option>
          <option value="creativeStudio">Creative Studio</option>
        </Select>
      </ControlSection>

      <ControlSection title="Typography">
        <div>
          <Label>Primary Font (Headline)</Label>
          <Select
            value={brand.typography.primary}
            onChange={(e) =>
              handleChange("typography", "primary", e.target.value, true)
            }
          >
            {fonts.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Secondary Font (Body)</Label>
          <Select
            value={brand.typography.secondary}
            onChange={(e) =>
              handleChange("typography", "secondary", e.target.value, true)
            }
          >
            {fonts.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Letter Spacing</Label>
          <Select
            value={brand.typography.letterSpacing}
            onChange={(e) =>
              handleChange("typography", "letterSpacing", e.target.value, true)
            }
          >
            <option value="tight">Tight (-0.02em)</option>
            <option value="normal">Normal (0)</option>
            <option value="wide">Wide (0.05em)</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Scale Ratio</Label>
            <Input
              type="number"
              step="0.05"
              value={brand.typography.scale}
              onChange={(e) =>
                handleChange(
                  "typography",
                  "scale",
                  parseFloat(e.target.value),
                  false,
                )
              }
              onBlur={() =>
                handleChange(
                  "typography",
                  "scale",
                  brand.typography.scale,
                  true,
                )
              }
            />
          </div>
          <div>
            <Label>Base Size</Label>
            <Input
              type="number"
              value={brand.typography.baseSize}
              onChange={(e) =>
                handleChange(
                  "typography",
                  "baseSize",
                  parseInt(e.target.value),
                  false,
                )
              }
              onBlur={() =>
                handleChange(
                  "typography",
                  "baseSize",
                  brand.typography.baseSize,
                  true,
                )
              }
            />
          </div>
        </div>
      </ControlSection>

      <ControlSection title="Colors">
        <ColorInput
          label="Background"
          value={brand.colors.bg}
          onChange={(e) => handleChange("colors", "bg", e.target.value, false)}
          onBlur={() => handleChange("colors", "bg", brand.colors.bg, true)}
        />
        <ColorInput
          label="Text"
          value={brand.colors.text}
          onChange={(e) =>
            handleChange("colors", "text", e.target.value, false)
          }
          onBlur={() => handleChange("colors", "text", brand.colors.text, true)}
          showContrast={true}
          contrastWith={brand.colors.bg}
        />
        <ColorInput
          label="Primary"
          value={brand.colors.primary}
          onChange={(e) =>
            handleChange("colors", "primary", e.target.value, false)
          }
          onBlur={() =>
            handleChange("colors", "primary", brand.colors.primary, true)
          }
          showContrast={true}
          contrastWith={brand.colors.bg}
        />
        <ColorInput
          label="Surface / Accents"
          value={brand.colors.surface}
          onChange={(e) =>
            handleChange("colors", "surface", e.target.value, false)
          }
          onBlur={() =>
            handleChange("colors", "surface", brand.colors.surface, true)
          }
        />

        <button
          onClick={() => setShowColorHarmony(!showColorHarmony)}
          className="flex items-center gap-2 text-[13px] font-semibold text-[#666] hover:text-black transition-colors mt-2 py-2"
        >
          <Palette size={16} />
          {showColorHarmony ? "Hide" : "Show"} Color Harmony
        </button>

        {showColorHarmony && (
          <div className="space-y-4 mt-2 p-4 bg-[#FAFAFA] rounded-xl border border-[#F0F0F0]">
            <div>
              <Label>Analogous Colors</Label>
              <div className="flex gap-2">
                {harmony.analogous.map((color, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      handleChange("colors", "accent", color, true)
                    }
                    className="flex-1 h-10 rounded-lg border-2 border-[#E5E5E5] hover:scale-105 hover:border-black transition-all shadow-sm"
                    style={{ backgroundColor: color }}
                    title={`Use ${color}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Complementary</Label>
              <button
                onClick={() =>
                  handleChange("colors", "accent", harmony.complementary, true)
                }
                className="w-full h-10 rounded-lg border-2 border-[#E5E5E5] hover:scale-105 hover:border-black transition-all shadow-sm"
                style={{ backgroundColor: harmony.complementary }}
                title={`Use ${harmony.complementary}`}
              />
            </div>
            <div>
              <Label>Triadic Colors</Label>
              <div className="flex gap-2">
                {harmony.triadic.map((color, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      handleChange("colors", "accent", color, true)
                    }
                    className="flex-1 h-10 rounded-lg border-2 border-[#E5E5E5] hover:scale-105 hover:border-black transition-all shadow-sm"
                    style={{ backgroundColor: color }}
                    title={`Use ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </ControlSection>

      <ControlSection title="Logo System">
        <div>
          <Label>Mark Text</Label>
          <Input
            value={brand.logo.text}
            onChange={(e) => handleChange("logo", "text", e.target.value, true)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Mark Padding</Label>
            <Input
              type="number"
              value={brand.logo.padding}
              onChange={(e) =>
                handleChange("logo", "padding", parseInt(e.target.value), false)
              }
              onBlur={() =>
                handleChange("logo", "padding", brand.logo.padding, true)
              }
            />
          </div>
          <div>
            <Label>Mark Size</Label>
            <Input
              type="number"
              value={brand.logo.size}
              onChange={(e) =>
                handleChange("logo", "size", parseInt(e.target.value), false)
              }
              onBlur={() => handleChange("logo", "size", brand.logo.size, true)}
            />
          </div>
        </div>
      </ControlSection>
    </>
  );
};

const TileControls = ({ tile }) => {
  const { updateTile, setFocusedTile, swapTileType } = useBrandStore();

  const handleChange = (key, value) => {
    updateTile(tile.id, { [key]: value });
  };

  const tileTypes = [
    { value: "hero", label: "Hero" },
    { value: "editorial", label: "Editorial" },
    { value: "product", label: "Product" },
    { value: "ui-preview", label: "UI Preview" },
    { value: "image", label: "Image" },
    { value: "utility", label: "Utility" },
    { value: "logo", label: "Logo" },
  ];

  return (
    <>
      <div className="mb-8 flex items-center justify-between pb-4 border-b border-[#F0F0F0]">
        <div>
          <h2 className="text-[16px] font-bold text-black capitalize">
            {tile.type}
          </h2>
          <p className="text-[12px] text-[#999] mt-0.5">Tile Editor</p>
        </div>
        <button
          onClick={() => setFocusedTile(null)}
          className="text-[#999] hover:text-black transition-colors p-1"
        >
          <X size={20} />
        </button>
      </div>

      <ControlSection title="Tile Type">
        <Select
          value={tile.type}
          onChange={(e) => swapTileType(tile.id, e.target.value)}
        >
          {tileTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
        <p className="text-[11px] text-[#999] italic leading-relaxed bg-amber-50 border border-amber-100 rounded-lg p-3">
          Changing tile type will reset its content to defaults.
        </p>
      </ControlSection>

      <ControlSection title="Content Editor">
        {tile.content.headline !== undefined && (
          <div>
            <Label>Headline</Label>
            <Input
              value={tile.content.headline}
              onChange={(e) => handleChange("headline", e.target.value)}
            />
          </div>
        )}
        {tile.content.subcopy !== undefined && (
          <div>
            <Label>Subcopy</Label>
            <Input
              value={tile.content.subcopy}
              onChange={(e) => handleChange("subcopy", e.target.value)}
            />
          </div>
        )}
        {tile.content.body !== undefined && (
          <div>
            <Label>Body Paragraph</Label>
            <textarea
              value={tile.content.body}
              onChange={(e) => handleChange("body", e.target.value)}
              className="w-full bg-white border border-[#E5E5E5] rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all min-h-[120px] resize-none"
            />
          </div>
        )}
        {tile.content.cta !== undefined && (
          <div>
            <Label>CTA Label</Label>
            <Input
              value={tile.content.cta}
              onChange={(e) => handleChange("cta", e.target.value)}
            />
          </div>
        )}
        {tile.content.image !== undefined && (
          <div>
            <Label>Image URL</Label>
            <Input
              value={tile.content.image}
              onChange={(e) => handleChange("image", e.target.value)}
              placeholder="https://..."
            />
          </div>
        )}
        {tile.content.items !== undefined && (
          <div>
            <Label>List Items (comma separated)</Label>
            <Input
              value={tile.content.items.join(", ")}
              onChange={(e) =>
                handleChange(
                  "items",
                  e.target.value.split(",").map((s) => s.trim()),
                )
              }
            />
          </div>
        )}
      </ControlSection>

      <div className="pt-6 border-t border-[#F0F0F0]">
        <p className="text-[11px] text-[#999] leading-relaxed italic bg-blue-50 border border-blue-100 rounded-lg p-3">
          Styles are currently governed by the global brand system. Per-tile
          overrides are disabled for MVP.
        </p>
      </div>
    </>
  );
};

const ControlPanel = () => {
  const { focusedTileId, tiles, undo, redo, history } = useBrandStore();
  const focusedTile = tiles.find((t) => t.id === focusedTileId);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "Z") {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="w-[360px] h-full bg-[#FAFAFA] border-l border-[#E5E5E5] flex flex-col flex-shrink-0">
      <div className="h-20 flex items-center justify-between px-6 border-b border-[#E5E5E5] bg-white">
        <div>
          <span className="text-[13px] font-bold tracking-[0.1em] uppercase text-black">
            Bento Controls
          </span>
          <p className="text-[11px] text-[#999] mt-0.5">Design System</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={undo}
            disabled={history.past.length === 0}
            className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
              history.past.length === 0
                ? "text-[#CCC] bg-[#F5F5F5]"
                : "text-black bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA]"
            }`}
            title="Undo (Cmd+Z)"
          >
            Undo
          </button>
          <button
            onClick={redo}
            disabled={history.future.length === 0}
            className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
              history.future.length === 0
                ? "text-[#CCC] bg-[#F5F5F5]"
                : "text-black bg-white border border-[#E5E5E5] hover:bg-[#FAFAFA]"
            }`}
            title="Redo (Cmd+Shift+Z)"
          >
            Redo
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
        {focusedTile ? <TileControls tile={focusedTile} /> : <GlobalControls />}
      </div>
    </div>
  );
};

export default ControlPanel;
