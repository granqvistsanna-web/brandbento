import { useCanvasStore } from '@/state/canvasState';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { GOOGLE_FONTS } from '@/data/googleFontsMetadata';

interface PrimaryFontTileProps {
  onClick?: () => void;
  isEditing?: boolean;
  previewFont?: string | null;  // For hover preview
}

// Character set to display
const CHAR_SET_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CHAR_SET_LOWER = 'abcdefghijklmnopqrstuvwxyz';
const CHAR_SET_NUMBERS = '0123456789';
const CHAR_SET_SYMBOLS = '!@#$%&*(),.?';

export function PrimaryFontTile({
  onClick,
  isEditing,
  previewFont
}: PrimaryFontTileProps) {
  const primaryFont = useCanvasStore(state => state.assets.primaryFont);
  const fontsSource = useCanvasStore(state => state.assets.fontsSource);
  const { weight, sizeScale, lineHeight } = useCanvasStore(
    state => state.tileSettings.primaryFont
  );
  const editingTileId = useCanvasStore(state => state.editingTileId);
  const setEditingTile = useCanvasStore(state => state.setEditingTile);
  const extractionStage = useCanvasStore(state => state.extractionStage);

  // Determine which font to display (preview or committed)
  const displayFont = previewFont || primaryFont;

  // Get font metadata
  const fontMeta = GOOGLE_FONTS.find(f => f.family === displayFont);
  const category = fontMeta?.category || 'sans-serif';

  // Load font
  const { fontFamily, loading, error } = useGoogleFonts(displayFont, category);

  // Format weight for display
  const displayWeight = weight === 'regular' ? '400' : weight;
  const numericWeight = parseInt(displayWeight) || 400;

  const isEditingThis = editingTileId === 'primary-font';
  const isDimmed = editingTileId !== null && !isEditingThis;
  const isLoading = extractionStage === 'fetching' || extractionStage === 'fonts';
  const isDefault = fontsSource === 'default';

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setEditingTile(isEditingThis ? null : 'primary-font');
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
      className={`tile tile-primary-type ${isLoading ? 'tile-loading' : ''} ${
        isDimmed ? 'tile-dimmed' : ''
      } ${isEditingThis || isEditing ? 'tile-editing' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isDimmed ? -1 : 0}
      role="button"
      aria-label={`Primary typography tile - ${
        isEditingThis ? 'press Enter or Escape to close' : 'press Enter to edit'
      }`}
      aria-pressed={isEditingThis}
    >
      <div className="tile-header">
        <span className="tile-label">Primary</span>
        {isDefault && <span className="tile-status">default</span>}
      </div>

      <div className="tile-content primary-font-content">
        <div className="primary-font-specimen">
          {/* Large Aa glyph */}
          <div
            className="specimen-glyph"
            style={{
              fontFamily,
              fontWeight: numericWeight,
              fontSize: `${3.5 * sizeScale}rem`,
              lineHeight: lineHeight,
            }}
          >
            Aa
          </div>

          {/* Font name and weight */}
          <div className="specimen-info">
            <span
              className="specimen-name"
              style={{ fontFamily, fontWeight: numericWeight }}
            >
              {displayFont}
            </span>
            <span className="specimen-weight">{displayWeight}</span>
            {loading && <span className="specimen-loading">Loading...</span>}
            {error && <span className="specimen-error">Fallback</span>}
          </div>

          {/* Sample heading */}
          <p
            className="specimen-heading"
            style={{
              fontFamily,
              fontWeight: numericWeight,
              fontSize: `${1.1 * sizeScale}rem`,
              lineHeight: lineHeight,
            }}
          >
            The quick brown fox jumps over the lazy dog
          </p>

          {/* Character set */}
          <div
            className="specimen-charset"
            style={{
              fontFamily,
              fontWeight: numericWeight,
              fontSize: `${0.65 * sizeScale}rem`,
              lineHeight: 1.5,
            }}
          >
            <div className="charset-row">{CHAR_SET_UPPER}</div>
            <div className="charset-row">{CHAR_SET_LOWER}</div>
            <div className="charset-row">{CHAR_SET_NUMBERS} {CHAR_SET_SYMBOLS}</div>
          </div>
        </div>
      </div>

      {/* Frosted glass overlay - only show on hover when not editing */}
      {!isEditingThis && !isLoading && (
        <div className="tile-overlay">
          <span className="tile-overlay-label">Primary</span>
          <span className="tile-overlay-icon">Edit</span>
        </div>
      )}
    </div>
  );
}
