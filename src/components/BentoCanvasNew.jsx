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
 * - a → LogoTile (logo/wordmark)
 * - editorial/b → EditorialTile (typography showcase)
 * - social/d → SocialPostTile (social media mockup)
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
import { useLayoutStore } from "../store/useLayoutStore";
import { getPlacementKind } from "../config/placements";

// Tile Imports
import { IconsTile } from "./tiles/IconsTile";
import { LogoTile } from "./tiles/LogoTile";
import { LogoSymbolTile } from "./tiles/LogoSymbolTile";
import { HeroTile } from "./tiles/HeroTile";
import { EditorialTile } from "./tiles/EditorialTile";
import { SocialPostTile } from "./tiles/SocialPostTile";
import { ImageTile } from "./tiles/ImageTile";
import { InterfaceTile } from "./tiles/InterfaceTile";
import { CardTile } from "./tiles/CardTile";
import { ListTile } from "./tiles/ListTile";
import { SwatchTile } from "./tiles/SwatchTile";
import { SplitHeroTile } from "./tiles/SplitHeroTile";
import { PatternTile } from "./tiles/PatternTile";
import { StatsTile } from "./tiles/StatsTile";
import { AppScreenTile } from "./tiles/AppScreenTile";
import { getPlacementTileId, getPlacementTileType } from "../config/placements";
const BentoCanvasNew = React.forwardRef((props, ref) => {
  const setFocusedTile = useBrandStore((s) => s.setFocusedTile);
  const focusedTileId = useBrandStore((s) => s.focusedTileId);
  const colors = useBrandStore((s) => s.brand.colors);
  const tiles = useBrandStore((s) => s.tiles);
  const activePreset = useBrandStore((s) => s.activePreset);
  const canvasBg = useLayoutStore((s) => s.canvasBg);
  const zoom = typeof props.zoom === 'number' ? props.zoom : 100;
  const zoomScale = Math.max(25, Math.min(200, zoom)) / 100;

  const getPlaceholderMeta = (id) => {
    switch (id) {
      case 'hero':
        return { label: 'Hero', hint: 'Add headline' };
      case 'a':
      case 'logo':
        return { label: 'Logo', hint: 'Upload logo' };
      case 'e':
        return { label: 'Icons', hint: 'Add icons' };
      case 'b':
      case 'editorial':
        return { label: 'Editorial', hint: 'Add copy' };
      case 'c':
      case 'buttons':
        return { label: 'Interface', hint: 'Add UI elements' };
      case 'd':
      case 'social':
        return { label: 'Social', hint: 'Add social post' };
      case 'f':
      case 'colors':
        return { label: 'List', hint: 'Add items' };
      default:
        return { label: id, hint: 'Add content' };
    }
  };

  const getTileForPlacement = (id) => {
    // Each placement maps to a unique tile ID via placements.ts
    const placementTileId = getPlacementTileId(id);
    if (placementTileId) {
      const byId = tiles.find((t) => t.id === placementTileId);
      if (byId) return byId;
    }
    // Fallback: match by expected tile type for this placement
    const placementTileType = getPlacementTileType(id);
    if (placementTileType) {
      const byType = tiles.find((t) => t.type === placementTileType);
      if (byType) return byType;
    }
    return undefined;
  };

  const renderTileByType = (tileType, id) => {
    switch (tileType) {
      case 'hero':
        return <HeroTile placementId={id} />;
      case 'logo':
        return <LogoTile placementId={id} />;
      case 'logo-symbol':
        return <LogoSymbolTile placementId={id} />;
      case 'editorial':
        return <EditorialTile placementId={id} />;
      case 'social':
        return activePreset === 'spread'
          ? <ImageTile placementId={id} />
          : <SocialPostTile placementId={id} />;
      case 'ui-preview':
        return <InterfaceTile placementId={id} />;
      case 'card':
      case 'product':
        return <CardTile placementId={id} />;
      case 'menu':
      case 'utility':
        return <ListTile placementId={id} />;
      case 'split-hero':
        return <SplitHeroTile placementId={id} />;
      case 'overlay':
        return <HeroTile placementId={id} variant="overlay" />;
      case 'split-list':
        return <ListTile placementId={id} variant="split" />;
      case 'swatch':
        return <SwatchTile placementId={id} />;
      case 'icons':
        return <IconsTile placementId={id} />;
      case 'pattern':
        return <PatternTile placementId={id} />;
      case 'stats':
        return <StatsTile placementId={id} />;
      case 'app-screen':
        return <AppScreenTile placementId={id} />;
      case 'colors':
        return activePreset === 'spread'
          ? <SwatchTile placementId={id} />
          : <SwatchTile placementId={id} variant="bars" />;
      default:
        return null;
    }
  };

  const renderTile = (id) => {
    // 1. Resolve the tile for this placement (each placement has a unique tile ID)
    const tile = getTileForPlacement(id);
    if (tile) {
      const rendered = renderTileByType(tile.type, id);
      if (rendered) return rendered;
    }

    // 2. Fall back to placement kind (for placements without a matching tile)
    const kind = getPlacementKind(id);
    switch (kind) {
      case 'identity':
        return <LogoTile placementId={id} />;
      case 'editorial':
        return <EditorialTile placementId={id} />;
      case 'social':
        return <SocialPostTile placementId={id} />;
      case 'interface':
        return <InterfaceTile placementId={id} />;
      case 'icons':
      case 'colors':
        return <SwatchTile placementId={id} />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={ref}
      className="flex-1 h-full min-h-0 overflow-auto transition-fast relative bento-canvas"
      style={{
        backgroundColor: canvasBg || "var(--canvas-bg)",
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
            const isFocused = placement.id === focusedTileId;
            return content ? (
              <div
                className={`w-full h-full rounded-xl overflow-hidden transition-shadow duration-150 relative ${
                  isFocused
                    ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--canvas-bg)]'
                    : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setFocusedTile(placement.id);
                }}
              >
                {content}

              </div>
            ) : (
              <div className="w-full h-full relative">
                <BentoTileEmpty
                  slotId={placement.id}
                  {...getPlaceholderMeta(placement.id)}
                  isFocused={isFocused}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFocusedTile(placement.id);
                  }}
                />

              </div>
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
