import React from "react";
import { BentoGridNew } from "./BentoGridNew";
import { BentoTileEmpty } from "./BentoTileEmpty";
import { DebugGrid } from "./DebugGrid";
import { useBrandStore } from "../store/useBrandStore";

// Tile Imports
import { IdentityTile } from "./tiles/IdentityTile";
import { EditorialTile } from "./tiles/EditorialTile";
import { SocialPostTile } from "./tiles/SocialPostTile";
import { InterfaceTile } from "./tiles/InterfaceTile";
import { ColorTile } from "./tiles/ColorTile"; // Keeping for 'colors' slot momentarily or replacing?

/**
 * Canvas with responsive bento grid – filled rectangle, no holes.
 * Uses theme-aware background (var(--canvas-bg)) for light/dark mode.
 */
const BentoCanvasNew = React.forwardRef((props, ref) => {
  const setFocusedTile = useBrandStore((s) => s.setFocusedTile);

  const renderTile = (id) => {
    switch (id) {
      case 'hero':
      case 'a': // Balanced layout
        return <IdentityTile placementId={id} />;
      case 'editorial':
      case 'b': // Balanced layout
        return <EditorialTile placementId={id} />;
      case 'image':
      case 'd': // Balanced Layout
        return <SocialPostTile placementId={id} />;
      case 'buttons':
      case 'c':
        return <InterfaceTile placementId={id} />;
      // Fallback for others
      case 'logo':
      case 'e':
        return <IdentityTile placementId={id} />;
      case 'colors':
      case 'f':
        return <ColorTile />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={ref}
      className="flex-1 h-full overflow-hidden transition-colors duration-200 relative"
      style={{ backgroundColor: "var(--canvas-bg)" }}
      onClick={() => setFocusedTile(null)}
    >
      <BentoGridNew
        renderSlot={(placement) => {
          const content = renderTile(placement.id);
          return content ? (
            <div className="w-full h-full" onClick={(e) => {
              e.stopPropagation();
              setFocusedTile(placement.id);
            }}>
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
  );
});

BentoCanvasNew.displayName = 'BentoCanvasNew';

export default BentoCanvasNew;
