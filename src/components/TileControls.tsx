/**
 * Tile-specific controls shown when a tile is focused.
 * Handles Type, Surface, Logo, Social, and Content sections.
 * Extracted from ControlPanel.jsx.
 */
import {
  RiStackFill as Layers,
  RiImageFill as Image,
  RiFileTextFill as FileText,
  RiBox3Fill as Box,
  RiListUnordered as List,
  RiLayoutGridFill as LayoutGrid,
  RiSparklingFill as Sparkles,
  RiHashtag as Hash,
  RiLayoutColumnFill as Columns,
  RiCheckboxBlankFill as Square,
  RiLayoutRowFill as Rows,
  RiCloseFill as X,
  RiAddFill as Plus,
  RiFingerprintFill as Fingerprint,
  RiGridFill as Grid2X2,
  RiLineChartFill as TrendingUp,
  RiLayoutGrid2Fill as Grid3X3,
} from "react-icons/ri";
import { motion } from "motion/react";
import { useBrandStore } from "../store/useBrandStore";
import { getPlacementKind, getPlacementTileType } from "../config/placements";
import { Section, PropRow, Input, TextArea, Slider } from "./controls";
import ImageDropZone from "./ImageDropZone";

const EMPTY_PLACEMENT_CONTENT: Record<string, unknown> = {};

const tileTypes = [
  { value: "hero", label: "Hero", icon: Layers, desc: "Full-width hero with image, headline and CTA" },
  { value: "editorial", label: "Editorial", icon: FileText, desc: "Long-form content with headline and body text" },
  { value: "product", label: "Product", icon: Box, desc: "Product card with image, price and details" },
  { value: "menu", label: "Menu", icon: List, desc: "Navigation menu with link items" },
  { value: "ui-preview", label: "Interface", icon: LayoutGrid, desc: "UI component showcase with buttons and inputs" },
  { value: "social", label: "Social Post", icon: Image, desc: "Social media post card" },
  { value: "utility", label: "List", icon: Hash, desc: "Feature list with labeled items" },
  { value: "logo", label: "Logo", icon: Sparkles, desc: "Brand logo with wordmark" },
  { value: "logo-symbol", label: "Symbol", icon: Fingerprint, desc: "Logo mark without text" },
  { value: "icons", label: "Icons", icon: Grid2X2, desc: "Brand icon grid" },
  { value: "split-hero", label: "Split Hero", icon: Columns, desc: "Hero split into image and text halves" },
  { value: "overlay", label: "Overlay", icon: Square, desc: "Image with text overlay" },
  { value: "split-list", label: "Split List", icon: Rows, desc: "Split layout with list content" },
  { value: "pattern", label: "Pattern", icon: Grid3X3, desc: "Geometric pattern from brand colors" },
  { value: "stats", label: "Stats", icon: TrendingUp, desc: "Big number with label and detail" },
];

interface TileControlsProps {
  tile: { id: string; type: string; content: Record<string, unknown> } | null;
  placementId: string;
}

const TileControls = ({ tile, placementId }: TileControlsProps) => {
  const updateTile = useBrandStore((s) => s.updateTile);
  const setFocusedTile = useBrandStore((s) => s.setFocusedTile);
  const swapTileType = useBrandStore((s) => s.swapTileType);
  const brand = useBrandStore((s) => s.brand);
  const updateBrand = useBrandStore((s) => s.updateBrand);
  const surfaces = useBrandStore((s) => s.brand.colors.surfaces);
  const bg = useBrandStore((s) => s.brand.colors.bg);
  const tileSurfaceIndex = useBrandStore((s) =>
    placementId ? (s.tileSurfaces as Record<string, number | undefined>)[placementId] : undefined
  );
  const setTileSurface = useBrandStore((s) => s.setTileSurface);
  const placementContent = useBrandStore(
    (s) => (s.placementContent as Record<string, Record<string, unknown>>)?.[placementId] ?? EMPTY_PLACEMENT_CONTENT
  );
  const setPlacementContent = useBrandStore((s) => s.setPlacementContent);

  const currentSurfaceIndex = tileSurfaceIndex;

  const handleChange = (key: string, value: unknown) => {
    if (tile) {
      updateTile(tile.id, { [key]: value }, false);
    }
  };

  const handleCommit = (key: string) => {
    if (tile) {
      updateTile(tile.id, { [key]: tile.content[key] }, true);
    }
  };

  const handleSurfaceChange = (index: number | undefined) => {
    setTileSurface(placementId, index);
  };

  const placementKind = getPlacementKind(placementId);
  const isIdentityPlacement = placementKind === 'identity';
  const isSocialPlacement = placementKind === 'social';

  const handleLogoChange = (key: string, value: unknown, isCommit = false) => {
    updateBrand({ logo: { ...brand.logo, [key]: value } }, isCommit);
  };
  const handlePlacementChange = (key: string, value: unknown, isCommit = false) => {
    setPlacementContent(placementId, { [key]: value }, isCommit);
  };

  const handlePlacementCommit = (key: string, fallback = '') => {
    const value =
      placementContent && Object.prototype.hasOwnProperty.call(placementContent, key)
        ? placementContent[key]
        : fallback;
    setPlacementContent(placementId, { [key]: value }, true);
  };

  const currentTileType = tile?.type || getPlacementTileType(placementId) || 'hero';
  const currentType = tileTypes.find((t) => t.value === currentTileType);

  return (
    <>
      {/* Tile header */}
      <div
        className="px-4 py-3.5 flex items-center gap-3"
        style={{ borderBottom: "1px solid var(--sidebar-border-subtle)" }}
      >
        <div className="flex-1">
          <h2
            className="text-12 font-semibold tracking-wide"
            style={{ color: "var(--sidebar-text)" }}
          >
            {currentType?.label || currentTileType.replace("-", " ")}
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
          <div className="grid grid-cols-2 gap-0.5">
            {tileTypes.map((type) => {
              const TypeIcon = type.icon;
              const isSelected = tile.type === type.value;

              return (
                <button
                  key={type.value}
                  onClick={() => swapTileType(tile.id, type.value)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-fast text-left"
                  style={{
                    background: isSelected
                      ? "var(--sidebar-bg-hover)"
                      : "transparent",
                    color: isSelected ? "var(--sidebar-text)" : "var(--sidebar-text-muted)",
                  }}
                >
                  <TypeIcon size={13} style={{ flexShrink: 0 }} />
                  <span className="text-11 truncate">{type.label}</span>
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {/* Surface Color — hidden for full-image-bg tiles where surface is invisible */}
      {!['hero', 'overlay', 'image'].includes(currentTileType) && <Section title="Surface" defaultOpen={true}>
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
              className="w-7 h-7 rounded-md flex items-center justify-center text-11 font-medium"
              style={{
                background: `linear-gradient(135deg, ${surfaces?.[0] || bg} 50%, ${surfaces?.[1] || bg} 50%)`,
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
              }}
            >
              <span style={{ color: "var(--sidebar-text-muted)", fontSize: "9px" }}>A</span>
            </div>
            <span
              className="text-11"
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
          {(surfaces || []).slice(0, 7).map((surface: string, index: number) => {
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
                  className="text-11"
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
      </Section>}

      {/* Identity Logo controls */}
      {isIdentityPlacement && (
        <Section title="Logo" defaultOpen={true}>
          <ImageDropZone
            value={brand.logo.image}
            onChange={(v) => handleLogoChange("image", v, true)}
            accept="image/svg+xml,image/png"
            label="Drop logo (SVG/PNG)"
            compact
          />

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
      {isSocialPlacement && (() => {
        const posts = (placementContent.socialPosts as Array<{ caption?: string; likes?: string; image?: string }>) || [
          { caption: (placementContent.socialCaption as string) || '', likes: (placementContent.socialLikes as string) || '', image: (placementContent.image as string) || '' },
        ];
        const updatePost = (index: number, field: string, value: string, isCommit = false) => {
          const next = posts.map((p, i) => i === index ? { ...p, [field]: value } : p);
          setPlacementContent(placementId, { socialPosts: next }, isCommit);
        };
        const addPost = () => {
          if (posts.length >= 3) return;
          const next = [...posts, { caption: '', likes: '', image: '' }];
          setPlacementContent(placementId, { socialPosts: next }, true);
        };
        const removePost = (index: number) => {
          if (posts.length <= 1) return;
          const next = posts.filter((_: unknown, i: number) => i !== index);
          setPlacementContent(placementId, { socialPosts: next }, true);
        };
        return (
          <Section title="Social" defaultOpen={true}>
            <PropRow label="Handle">
              <Input
                value={(placementContent.socialHandle as string) || ""}
                onChange={(e) => handlePlacementChange("socialHandle", e.target.value, false)}
                onBlur={() => handlePlacementCommit("socialHandle", "")}
                placeholder="brandname"
              />
            </PropRow>

            <PropRow label="Sponsored">
              <Input
                value={(placementContent.socialSponsored as string) || ""}
                onChange={(e) => handlePlacementChange("socialSponsored", e.target.value, false)}
                onBlur={() => handlePlacementCommit("socialSponsored", "")}
                placeholder="Sponsored"
              />
            </PropRow>

            {/* Per-post editing */}
            <div className="flex items-center justify-between mt-1 mb-1">
              <span className="text-12 font-medium" style={{ color: "var(--sidebar-text-secondary)" }}>
                Posts ({posts.length})
              </span>
              {posts.length < 3 && (
                <button
                  type="button"
                  className="btn-figma btn-figma-ghost"
                  style={{ padding: '2px 6px', fontSize: 11 }}
                  onClick={addPost}
                >
                  <Plus size={12} /> Add
                </button>
              )}
            </div>

            {posts.map((post, idx) => (
              <div
                key={idx}
                className="rounded-md mb-2"
                style={{
                  padding: '8px',
                  background: 'var(--sidebar-bg-hover)',
                  border: '1px solid var(--sidebar-border)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-11 font-medium" style={{ color: "var(--sidebar-text)" }}>
                    Post {idx + 1}
                  </span>
                  {posts.length > 1 && (
                    <button
                      type="button"
                      className="btn-figma btn-figma-ghost"
                      style={{ padding: '1px 4px' }}
                      onClick={() => removePost(idx)}
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <TextArea
                    value={post.caption || ""}
                    onChange={(e) => updatePost(idx, 'caption', e.target.value, false)}
                    onBlur={() => updatePost(idx, 'caption', post.caption || '', true)}
                    placeholder="Caption..."
                    style={{ fontSize: 11, minHeight: 48 }}
                  />
                  <Input
                    value={post.likes || ""}
                    onChange={(e) => updatePost(idx, 'likes', e.target.value, false)}
                    onBlur={() => updatePost(idx, 'likes', post.likes || '', true)}
                    placeholder="1,204 likes"
                  />
                  <Input
                    value={post.image || ""}
                    onChange={(e) => updatePost(idx, 'image', e.target.value, false)}
                    onBlur={() => updatePost(idx, 'image', post.image || '', true)}
                    placeholder="Image URL..."
                  />
                  {post.image && (
                    <div
                      className="h-16 rounded overflow-hidden"
                      style={{ background: "var(--sidebar-bg-active)" }}
                    >
                      <img src={post.image} alt="" className="w-full h-full object-cover opacity-80" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </Section>
        );
      })()}

      {/* Content - only show if tile exists */}
      {tile && (
      <Section title="Content">
        {tile.content.headline !== undefined && (
          <PropRow label="Headline">
            <Input
              value={tile.content.headline as string}
              onChange={(e) => handleChange("headline", e.target.value)}
              onBlur={() => handleCommit("headline")}
              placeholder="Enter headline..."
            />
          </PropRow>
        )}

        {tile.content.subcopy !== undefined && (
          <PropRow label="Subcopy">
            <Input
              value={tile.content.subcopy as string}
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
              value={tile.content.body as string}
              onChange={(e) => handleChange("body", e.target.value)}
              onBlur={() => handleCommit("body")}
              placeholder="Body content..."
            />
          </div>
        )}

        {tile.content.cta !== undefined && (
          <PropRow label="Button">
            <Input
              value={tile.content.cta as string}
              onChange={(e) => handleChange("cta", e.target.value)}
              onBlur={() => handleCommit("cta")}
              placeholder="Call to action..."
            />
          </PropRow>
        )}

        {tile.content.label !== undefined && (
          <PropRow label="Label">
            <Input
              value={tile.content.label as string}
              onChange={(e) => handleChange("label", e.target.value)}
              onBlur={() => handleCommit("label")}
              placeholder="Label..."
            />
          </PropRow>
        )}

        {tile.content.price !== undefined && (
          <PropRow label="Price">
            <Input
              value={tile.content.price as string}
              onChange={(e) => handleChange("price", e.target.value)}
              onBlur={() => handleCommit("price")}
              placeholder="$99"
            />
          </PropRow>
        )}

        {(tile.content.image !== undefined || placementContent.image !== undefined) && (
          <div>
            <span
              className="text-11 block mb-2"
              style={{ color: "var(--sidebar-text-secondary)" }}
            >
              Image
            </span>
            <ImageDropZone
              value={(placementContent.image ?? tile.content.image ?? undefined) as string | undefined}
              onChange={(v: string | null) => {
                const val = v ?? undefined;
                if (placementId) {
                  setPlacementContent(placementId, { image: val }, true);
                } else if (tile) {
                  updateTile(tile.id, { image: val }, true);
                }
              }}
            />
            <Input
              value={((placementContent.image ?? tile.content.image ?? "") as string)}
              onChange={(e) => placementId
                ? handlePlacementChange("image", e.target.value, false)
                : handleChange("image", e.target.value)
              }
              onBlur={() => placementId
                ? handlePlacementCommit("image", "")
                : handleCommit("image")
              }
              placeholder="or paste URL..."
            />
          </div>
        )}

        {tile.content.overlayText !== undefined && (
          <PropRow label="Overlay">
            <Input
              value={tile.content.overlayText as string}
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
              value={(tile.content.items as string[]).join(", ")}
              onChange={(e) =>
                handleChange(
                  "items",
                  e.target.value.split(",").map((s: string) => s.trim())
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
              value={tile.content.buttonLabel as string}
              onChange={(e) => handleChange("buttonLabel", e.target.value)}
              onBlur={() => handleCommit("buttonLabel")}
              placeholder="Get Started"
            />
          </PropRow>
        )}

        {tile.content.headerTitle !== undefined && (
          <PropRow label="Secondary">
            <Input
              value={tile.content.headerTitle as string}
              onChange={(e) => handleChange("headerTitle", e.target.value)}
              onBlur={() => handleCommit("headerTitle")}
              placeholder="Learn More"
            />
          </PropRow>
        )}

        {tile.content.inputPlaceholder !== undefined && (
          <PropRow label="Tertiary">
            <Input
              value={tile.content.inputPlaceholder as string}
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

export default TileControls;
