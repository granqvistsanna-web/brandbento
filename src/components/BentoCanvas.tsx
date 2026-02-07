import { useCanvasStore } from '@/state/canvasState';
import { LogoTile } from './tiles/LogoTile';
import { ColorTile } from './tiles/ColorTile';
import { ImageryTile } from './tiles/ImageryTile';
import { UIPreviewTile } from './tiles/UIPreviewTile';
import { TypographyTileWithPanel } from './TypographyTileWithPanel';

/**
 * BentoCanvas - Main canvas grid layout for brand tiles
 *
 * Grid layout (3 columns):
 *   [Logo]     [Primary]  [Imagery ]
 *   [Colors]   [Secondary][Imagery ]
 *   [         UI Preview          ]
 *
 * CSS grid placement is handled in App.css via:
 * - .tile-logo: column 1, row 1
 * - .tile-primary-type: column 2, row 1
 * - .tile-imagery: column 3, row 1-2 (spans 2 rows)
 * - .tile-colors: column 1, row 2
 * - .tile-secondary-type: column 2, row 2
 * - .tile-ui-preview: spans all 3 columns, row 3
 */
export function BentoCanvas() {
  const editingTileId = useCanvasStore((state) => state.editingTileId);
  const setEditingTile = useCanvasStore((state) => state.setEditingTile);
  const extractionStage = useCanvasStore((state) => state.extractionStage);

  const isLoading = extractionStage === 'fetching';

  // Handle clicking on canvas background to deselect tile
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking on the canvas itself, not a tile
    if (e.target === e.currentTarget) {
      setEditingTile(null);
    }
  };

  // Imagery tile edit state management
  const isImageryEditing = editingTileId === 'imagery';

  const handleImageryEditToggle = (editing: boolean) => {
    setEditingTile(editing ? 'imagery' : null);
  };

  return (
    <div className="canvas" onClick={handleCanvasClick}>
      <div className="bento-grid">
        {/* Row 1 */}
        <LogoTile />
        <TypographyTileWithPanel role="primary" />

        {/* Imagery tile - spans 2 rows */}
        <div
          className={`tile tile-imagery ${isImageryEditing ? 'tile-editing' : ''} ${
            editingTileId && !isImageryEditing ? 'tile-dimmed' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleImageryEditToggle(!isImageryEditing);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleImageryEditToggle(!isImageryEditing);
            }
            if (e.key === 'Escape' && isImageryEditing) {
              e.preventDefault();
              handleImageryEditToggle(false);
            }
          }}
          tabIndex={editingTileId && !isImageryEditing ? -1 : 0}
          role="button"
          aria-label={`Imagery tile - ${
            isImageryEditing ? 'press Enter or Escape to close' : 'press Enter to edit'
          }`}
          aria-pressed={isImageryEditing}
        >
          <div className="tile-header">
            <span className="tile-label">Imagery</span>
          </div>
          <div className="tile-content">
            <ImageryTile
              isEditing={isImageryEditing}
              onEditToggle={handleImageryEditToggle}
            />
          </div>

          {/* Frosted glass overlay - only show on hover when not editing */}
          {!isImageryEditing && !isLoading && (
            <div className="tile-overlay">
              <span className="tile-overlay-label">Imagery</span>
              <span className="tile-overlay-icon">Edit</span>
            </div>
          )}
        </div>

        {/* Row 2 */}
        <ColorTile />
        <TypographyTileWithPanel role="secondary" />

        {/* Row 3 - UI Preview spans all columns */}
        <UIPreviewTile isLoading={isLoading} />
      </div>
    </div>
  );
}

export default BentoCanvas;
