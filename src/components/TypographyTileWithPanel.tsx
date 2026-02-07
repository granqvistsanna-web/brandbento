import { useState } from 'react';
import { useCanvasStore } from '@/state/canvasState';
import { PrimaryFontTile } from './tiles/PrimaryFontTile';
import { SecondaryFontTile } from './tiles/SecondaryFontTile';
import { FontEditPanel } from './panels/FontEditPanel';

type FontRole = 'primary' | 'secondary';

interface TypographyTileWithPanelProps {
  role: FontRole;
}

/**
 * TypographyTileWithPanel - Container wiring typography tile to FontEditPanel
 *
 * Manages:
 * - Preview font state for hover preview
 * - Renders appropriate tile component with preview prop
 * - Renders FontEditPanel when tile is editing
 * - Passes onPreviewChange to panel for hover coordination
 */
export function TypographyTileWithPanel({ role }: TypographyTileWithPanelProps) {
  const [previewFont, setPreviewFont] = useState<string | null>(null);

  const editingTileId = useCanvasStore((state) => state.editingTileId);
  const setEditingTile = useCanvasStore((state) => state.setEditingTile);

  const tileId = role === 'primary' ? 'primary-font' : 'secondary-font';
  const isEditing = editingTileId === tileId;

  const handleClose = () => {
    setPreviewFont(null); // Clear preview on close
    setEditingTile(null);
  };

  const handlePreviewChange = (family: string | null) => {
    setPreviewFont(family);
  };

  return (
    <div className="typography-tile-with-panel">
      {role === 'primary' ? (
        <PrimaryFontTile previewFont={previewFont} isEditing={isEditing} />
      ) : (
        <SecondaryFontTile previewFont={previewFont} isEditing={isEditing} />
      )}

      {isEditing && (
        <div className="edit-panel-container">
          <div className="edit-panel">
            <div className="edit-panel-header">
              <h3 className="edit-panel-title">
                {role === 'primary' ? 'Primary' : 'Secondary'} Font
              </h3>
              <button
                type="button"
                className="edit-panel-close"
                onClick={handleClose}
                aria-label="Close panel"
              >
                x
              </button>
            </div>
            <FontEditPanel role={role} onPreviewChange={handlePreviewChange} />
          </div>
        </div>
      )}
    </div>
  );
}
