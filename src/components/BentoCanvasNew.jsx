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
 * - colors/f → SwatchTile (color palette)
 *
 * @component
 * @example
 * <BentoCanvasNew ref={canvasRef} />
 */
import React, { useEffect, useCallback, useRef, useState } from "react";
import { BentoGridNew } from "./BentoGridNew";
import { BentoTileEmpty } from "./BentoTileEmpty";
import { ErrorBoundary } from "./ErrorBoundary";
import { DebugGrid } from "./DebugGrid";
import { useBrandStore } from "../store/useBrandStore";
import { useLayoutStore } from "../store/useLayoutStore";
import { getPlacementKind } from "../config/placements";
import { BENTO_LAYOUTS } from "../config/bentoLayouts";

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
import { MessagingTile } from "./tiles/MessagingTile";
import { SpecimenTile } from "./tiles/SpecimenTile";

import { ColorBlocksTile } from "./tiles/ColorBlocksTile";
import { BusinessCardTile } from "./tiles/BusinessCardTile";
import { AppIconTile } from "./tiles/AppIconTile";
import { StoryTile } from "./tiles/StoryTile";
import { getPlacementTileId, getPlacementTileType, resolveSwappedId } from "../config/placements";
const BentoCanvasNew = React.forwardRef((props, ref) => {
  const setFocusedTile = useBrandStore((s) => s.setFocusedTile);
  const focusedTileId = useBrandStore((s) => s.focusedTileId);
  const colors = useBrandStore((s) => s.brand.colors);
  const tiles = useBrandStore((s) => s.tiles);
  const activePreset = useBrandStore((s) => s.activePreset);
  const canvasBg = useLayoutStore((s) => s.canvasBg);
  const preset = useLayoutStore((s) => s.preset);
  const placementSwaps = useLayoutStore((s) => s.placementSwaps);
  const swapPlacements = useLayoutStore((s) => s.swapPlacements);
  const zoom = typeof props.zoom === 'number' ? props.zoom : 100;
  const zoomScale = Math.max(25, Math.min(200, zoom)) / 100;

  // Drag-and-drop state
  const dragSourceRef = useRef(null);
  const [dropTarget, setDropTarget] = useState(null);

  // Keyboard tile navigation
  const getPlacementIds = useCallback(() => {
    const config = BENTO_LAYOUTS[preset]?.desktop ?? BENTO_LAYOUTS.balanced.desktop;
    return config.placements.map((p) => p.id);
  }, [preset]);

  useEffect(() => {
    const handleKey = (e) => {
      // Only arrow/tab nav when a tile is focused
      if (!focusedTileId) return;

      const ids = getPlacementIds();
      const idx = ids.indexOf(focusedTileId);
      if (idx === -1) return;

      const config = BENTO_LAYOUTS[preset]?.desktop ?? BENTO_LAYOUTS.balanced.desktop;
      const cols = config.columns;
      let next = idx;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          next = (idx + 1) % ids.length;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          next = (idx - 1 + ids.length) % ids.length;
          break;
        case 'ArrowDown':
          e.preventDefault();
          next = Math.min(idx + cols, ids.length - 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          next = Math.max(idx - cols, 0);
          break;
        case 'Tab':
          e.preventDefault();
          next = e.shiftKey
            ? (idx - 1 + ids.length) % ids.length
            : (idx + 1) % ids.length;
          break;
        default:
          return;
      }

      setFocusedTile(ids[next]);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [focusedTileId, preset, setFocusedTile, getPlacementIds]);

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
    // Resolve through swaps: find which placement's tile should render here
    const effectiveId = resolveSwappedId(id, placementSwaps);
    // Each placement maps to a unique tile ID via placements.ts
    const placementTileId = getPlacementTileId(effectiveId);
    if (placementTileId) {
      const byId = tiles.find((t) => t.id === placementTileId);
      if (byId) return byId;
    }
    // Fallback: match by expected tile type for this placement
    const placementTileType = getPlacementTileType(effectiveId);
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
      case 'messaging':
        return <MessagingTile placementId={id} />;
      case 'specimen':
        return <SpecimenTile placementId={id} />;

      case 'color-blocks':
        return <ColorBlocksTile placementId={id} />;
      case 'business-card':
        return <BusinessCardTile placementId={id} />;
      case 'app-icon':
        return <AppIconTile placementId={id} />;
      case 'story':
        return <StoryTile placementId={id} />;
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
    const effectiveId = resolveSwappedId(id, placementSwaps);
    const kind = getPlacementKind(effectiveId);
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
      className="flex-1 h-full min-h-0 overflow-auto transition-fast relative bento-canvas canvas-dots"
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
            const isDropTarget = placement.id === dropTarget;
            const isDragSource = dragSourceRef.current === placement.id;

            // Shared drag-and-drop handlers for both filled and empty tiles
            const dragHandlers = {
              draggable: true,
              onDragStart: (e) => {
                dragSourceRef.current = placement.id;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', placement.id);
              },
              onDragOver: (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dragSourceRef.current && dragSourceRef.current !== placement.id) {
                  setDropTarget(placement.id);
                }
              },
              onDragLeave: (e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setDropTarget(null);
                }
              },
              onDrop: (e) => {
                e.preventDefault();
                const sourceId = dragSourceRef.current;
                if (sourceId && sourceId !== placement.id) {
                  swapPlacements(sourceId, placement.id);
                }
                dragSourceRef.current = null;
                setDropTarget(null);
              },
              onDragEnd: () => {
                dragSourceRef.current = null;
                setDropTarget(null);
              },
            };

            return content ? (
              <div
                tabIndex={0}
                role="gridcell"
                className="w-full h-full rounded-xl overflow-hidden relative"
                style={{
                  boxShadow: isFocused
                    ? '0 0 0 1.5px var(--accent), 0 0 0 4px var(--accent-muted)'
                    : isDropTarget
                      ? '0 0 0 2px var(--accent), 0 0 0 5px var(--accent-muted)'
                      : 'var(--shadow-tile)',
                  opacity: isDragSource ? 0.5 : 1,
                  transition: 'box-shadow 150ms ease, opacity 150ms ease',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setFocusedTile(placement.id);
                }}
                onFocus={() => setFocusedTile(placement.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setFocusedTile(placement.id);
                  }
                }}
                {...dragHandlers}
              >
                <ErrorBoundary>
                  {content}
                </ErrorBoundary>
              </div>
            ) : (
              <div
                className="w-full h-full relative"
                style={{
                  opacity: isDragSource ? 0.5 : 1,
                  transition: 'opacity 150ms ease',
                }}
                {...dragHandlers}
              >
                <BentoTileEmpty
                  slotId={placement.id}
                  {...getPlaceholderMeta(placement.id)}
                  isFocused={isFocused || isDropTarget}
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
