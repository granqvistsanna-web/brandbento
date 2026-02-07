import { useCanvasStore } from '@/state/canvasState';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { GOOGLE_FONTS } from '@/data/googleFontsMetadata';

interface SecondaryFontTileProps {
  onClick?: () => void;
  isEditing?: boolean;
  previewFont?: string | null;  // For hover preview
}

// Body text samples - typography-themed paragraphs
const BODY_TEXT_SAMPLES = [
  "Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed.",
  "Good typography establishes a visual hierarchy, provides graphic balance, and sets the product's overall tone.",
];

export function SecondaryFontTile({
  onClick,
  isEditing,
  previewFont
}: SecondaryFontTileProps) {
  const secondaryFont = useCanvasStore(state => state.assets.secondaryFont);
  const fontsSource = useCanvasStore(state => state.assets.fontsSource);
  const { weight, sizeScale, lineHeight } = useCanvasStore(
    state => state.tileSettings.secondaryFont
  );
  const editingTileId = useCanvasStore(state => state.editingTileId);
  const setEditingTile = useCanvasStore(state => state.setEditingTile);
  const extractionStage = useCanvasStore(state => state.extractionStage);

  // Determine which font to display (preview or committed)
  const displayFont = previewFont || secondaryFont;

  // Get font metadata
  const fontMeta = GOOGLE_FONTS.find(f => f.family === displayFont);
  const category = fontMeta?.category || 'serif';

  // Load font
  const { fontFamily, loading, error } = useGoogleFonts(displayFont, category);

  // Format weight for display
  const displayWeight = weight === 'regular' ? '400' : weight;
  const numericWeight = parseInt(displayWeight) || 400;

  const isEditingThis = editingTileId === 'secondary-font';
  const isDimmed = editingTileId !== null && !isEditingThis;
  const isLoading = extractionStage === 'fetching' || extractionStage === 'fonts';
  const isDefault = fontsSource === 'default';

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setEditingTile(isEditingThis ? null : 'secondary-font');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
    if (e.key === 'Escape' && isEditingThis) {
      e.preventDefault();
      setEditingTile(null);
    }
  };

  return (
    <div
      className={`tile tile-secondary-type ${isLoading ? 'tile-loading' : ''} ${
        isDimmed ? 'tile-dimmed' : ''
      } ${isEditingThis || isEditing ? 'tile-editing' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isDimmed ? -1 : 0}
      role="button"
      aria-label={`Secondary typography tile - ${
        isEditingThis ? 'press Enter or Escape to close' : 'press Enter to edit'
      }`}
      aria-pressed={isEditingThis}
    >
      <div className="tile-header">
        <span className="tile-label">Secondary</span>
        {isDefault && <span className="tile-status">default</span>}
      </div>

      <div className="tile-content secondary-font-content">
        <div className="secondary-font-specimen">
          {/* Font info header */}
          <div className="body-header">
            <span
              className="body-font-name"
              style={{ fontFamily, fontWeight: numericWeight }}
            >
              {displayFont}
            </span>
            <span className="body-meta">
              {displayWeight}
              {loading && ' · Loading...'}
              {error && ' · Fallback'}
            </span>
          </div>

          {/* Body text samples */}
          <div className="body-content">
            {BODY_TEXT_SAMPLES.map((text, index) => (
              <p
                key={index}
                className="body-paragraph"
                style={{
                  fontFamily,
                  fontWeight: numericWeight,
                  fontSize: `${0.85 * sizeScale}rem`,
                  lineHeight: lineHeight,
                }}
              >
                {text}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Frosted glass overlay - only show on hover when not editing */}
      {!isEditingThis && !isLoading && (
        <div className="tile-overlay">
          <span className="tile-overlay-label">Secondary</span>
          <span className="tile-overlay-icon">Edit</span>
        </div>
      )}
    </div>
  );
}
