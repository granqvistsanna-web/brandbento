import React from "react";
import { BentoGridNew } from "./BentoGridNew";
import { BentoTileEmpty } from "./BentoTileEmpty";
import { useBrandStore } from "../store/useBrandStore";

/**
 * Canvas with responsive bento grid – filled rectangle, no holes.
 * Uses theme-aware background (var(--canvas-bg)) for light/dark mode.
 * Starts with empty tiles; content can be wired in later.
 */
const BentoCanvasNew = () => {
  const setFocusedTile = useBrandStore((s) => s.setFocusedTile);

  return (
    <div
      className="flex-1 h-full overflow-hidden transition-colors duration-200"
      style={{ backgroundColor: "var(--canvas-bg)" }}
      onClick={() => setFocusedTile(null)}
    >
      <BentoGridNew
        renderSlot={(placement) => (
          <BentoTileEmpty
            slotId={placement.id}
            onClick={(e) => {
              e.stopPropagation();
              setFocusedTile(placement.id);
            }}
          />
        )}
      />
    </div>
  );
};

export default BentoCanvasNew;
