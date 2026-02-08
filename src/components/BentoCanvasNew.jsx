/**
 * Bento Canvas Component
 *
 * Main canvas container for the brand moodboard. Renders a responsive
 * bento grid with theme-aware styling and tile selection handling.
 *
 * ## Features
 *
 * - Responsive grid that adapts to breakpoints
 * - Theme-aware background (light/dark mode via CSS variables)
 * - Click-to-focus tile selection (clicking canvas clears selection)
 * - Debug grid overlay for development
 * - forwardRef support for screenshot/export functionality
 *
 * ## Tile Mapping
 *
 * Maps placement IDs to tile components:
 * - hero → HeroTile (image-led hero)
 * - a → IdentityTile (logo/wordmark)
 * - editorial/b → EditorialTile (typography showcase)
 * - image/d → SocialPostTile (social media mockup)
 * - buttons/c → InterfaceTile (UI components)
 * - colors/f → ColorTile (color palette)
 *
 * @component
 * @example
 * <BentoCanvasNew ref={canvasRef} />
 */
import React from "react";
import { BentoGridNew } from "./BentoGridNew";
import { BentoTileEmpty } from "./BentoTileEmpty";
import { DebugGrid } from "./DebugGrid";
import { useBrandStore } from "../store/useBrandStore";
import { getPlacementKind } from "../config/placements";

// Tile Imports
import { IdentityTile } from "./tiles/IdentityTile";
import { HeroTile } from "./tiles/HeroTile";
import { EditorialTile } from "./tiles/EditorialTile";
import { SocialPostTile } from "./tiles/SocialPostTile";
import { ImageTile } from "./tiles/ImageTile";
import { InterfaceTile } from "./tiles/InterfaceTile";
import { ColorTile } from "./tiles/ColorTile";
import { ProductTile } from "./tiles/ProductTile";
import { MenuTile } from "./tiles/MenuTile";
import { IconTile } from "./tiles/IconTile";
import { getPlacementTileId, getPlacementTileType } from "../config/placements";
const BentoCanvasNew = React.forwardRef((props, ref) => {
  const setFocusedTile = useBrandStore((s) => s.setFocusedTile);
  const focusedTileId = useBrandStore((s) => s.focusedTileId);
  const colors = useBrandStore((s) => s.brand.colors);
  const tiles = useBrandStore((s) => s.tiles);
  const activePreset = useBrandStore((s) => s.activePreset);
  const zoom = typeof props.zoom === 'number' ? props.zoom : 100;
  const zoomScale = Math.max(25, Math.min(200, zoom)) / 100;

  const getPlaceholderMeta = (id) => {
    switch (id) {
      case 'hero':
        return { label: 'Hero', hint: 'Add headline' };
      case 'a':
        return { label: 'Identity', hint: 'Add wordmark' };
      case 'e':
        return { label: 'Logo', hint: 'Upload logo' };
      case 'b':
      case 'editorial':
        return { label: 'Editorial', hint: 'Add copy' };
      case 'c':
      case 'buttons':
        return { label: 'UI Preview', hint: 'Add UI elements' };
      case 'd':
      case 'image':
        return { label: 'Social Post', hint: 'Add image' };
      case 'f':
      case 'colors':
        return { label: 'Colors', hint: 'Add palette' };
      default:
        return { label: id, hint: 'Add content' };
    }
  };

  const getTileForPlacement = (id) => {
    const placementTileId = getPlacementTileId(id);
    if (placementTileId) {
      return tiles.find((t) => t.id === placementTileId);
    }
    const placementTileType = getPlacementTileType(id);
    if (placementTileType) {
      return tiles.find((t) => t.type === placementTileType);
    }
    return undefined;
  };

  const renderTile = (id) => {
    const kind = getPlacementKind(id);
    if (kind === 'colors') {
      return activePreset === 'foodDrink'
        ? <IconTile placementId={id} />
        : <ColorTile />;
    }
    const tile = getTileForPlacement(id);
    const tileType = tile?.type;
    if (tileType) {
      switch (tileType) {
        case 'hero':
          return <HeroTile placementId={id} />;
        case 'logo':
          return <IdentityTile placementId={id} />;
        case 'editorial':
          return <EditorialTile placementId={id} />;
        case 'image':
          return activePreset === 'foodDrink'
            ? <ImageTile placementId={id} />
            : <SocialPostTile placementId={id} />;
        case 'ui-preview':
          return <InterfaceTile placementId={id} />;
        case 'product':
          return <ProductTile placementId={id} />;
        case 'menu':
        case 'utility':
          return <MenuTile placementId={id} />;
        case 'colors':
          return activePreset === 'foodDrink'
            ? <IconTile placementId={id} />
            : <ColorTile />;
        default:
          break;
      }
    }
    switch (kind) {
      case 'identity':
        return <IdentityTile placementId={id} />;
      case 'editorial':
        return <EditorialTile placementId={id} />;
      case 'social':
        return <SocialPostTile placementId={id} />;
      case 'interface':
        return <InterfaceTile placementId={id} />;
      case 'colors':
        return activePreset === 'foodDrink'
          ? <IconTile placementId={id} />
          : <ColorTile />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={ref}
      className="flex-1 h-full min-h-0 overflow-auto transition-fast relative"
      style={{
        backgroundColor: "var(--canvas-bg)",
        "--canvas-bg": colors.bg,
        "--canvas-surface": colors.surface,
        "--canvas-text": colors.text,
        "--canvas-text-secondary": `color-mix(in srgb, ${colors.text} 70%, ${colors.bg})`,
        "--canvas-border": `color-mix(in srgb, ${colors.text} 18%, ${colors.bg})`,
      }}
      onClick={() => setFocusedTile(null)}
    >
      <div className="h-full w-full" style={{ zoom: zoomScale }}>
        <BentoGridNew
          renderSlot={(placement) => {
            const content = renderTile(placement.id);
            return content ? (
              <div
                className="w-full h-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setFocusedTile(placement.id);
                }}
              >
                {content}
              </div>
            ) : (
              <BentoTileEmpty
                slotId={placement.id}
                {...getPlaceholderMeta(placement.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  setFocusedTile(placement.id);
                }}
              />
            );
          }}
        />
        {/* Debug overlay - shows grid boundaries when enabled */}
        <DebugGrid />
      </div>
    </div>
  );
});

BentoCanvasNew.displayName = 'BentoCanvasNew';

export default BentoCanvasNew;
