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
 * - hero/a → IdentityTile (logo/wordmark)
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
import { EditorialTile } from "./tiles/EditorialTile";
import { ImageTile } from "./tiles/ImageTile";
import { SocialPostTile } from "./tiles/SocialPostTile";
import { InterfaceTile } from "./tiles/InterfaceTile";
import { ColorTile } from "./tiles/ColorTile";
const BentoCanvasNew = React.forwardRef((props, ref) => {
  const setFocusedTile = useBrandStore((s) => s.setFocusedTile);
  const zoom = typeof props.zoom === 'number' ? props.zoom : 100;
  const zoomScale = Math.max(25, Math.min(200, zoom)) / 100;
  let identityRendered = false;

  const renderTile = (id) => {
    const kind = getPlacementKind(id);
    if (kind === 'identity') {
      if (identityRendered) return null;
      identityRendered = true;
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
        return <ColorTile />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={ref}
      className="flex-1 h-full overflow-auto transition-fast relative"
      style={{ backgroundColor: "var(--canvas-bg)" }}
      onClick={() => setFocusedTile(null)}
    >
      <div style={{ zoom: zoomScale }}>
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
