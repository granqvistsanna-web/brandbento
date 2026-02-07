import { useCanvasStore } from '@/state/canvasState';
import { useImageLuminance } from '@/hooks/useImageLuminance';
import { EditPanel } from '../EditPanel';
import { LogoEditPanel } from '../panels/LogoEditPanel';

/**
 * Get CSS filter for logo variant.
 * Original: no filter
 * Dark: invert and reduce brightness for dark version
 * Light: invert for light version
 */
function getVariantFilter(variant: 'original' | 'dark' | 'light'): string {
  switch (variant) {
    case 'dark':
      return 'invert(1) brightness(0.2)';
    case 'light':
      return 'invert(1) brightness(1)';
    default:
      return 'none';
  }
}

/**
 * Get background color based on setting and adaptive luminance.
 */
function getBackgroundColor(
  setting: 'white' | 'dark' | 'primary' | 'auto',
  adaptiveBackground: 'light' | 'dark',
  primaryColor: string | undefined
): string {
  switch (setting) {
    case 'white':
      return '#ffffff';
    case 'dark':
      return '#171717';
    case 'primary':
      return primaryColor || '#737373';
    case 'auto':
      // Auto uses luminance detection
      return adaptiveBackground === 'dark' ? '#171717' : '#ffffff';
    default:
      return '#ffffff';
  }
}

export function LogoTile() {
  const logo = useCanvasStore((state) => state.assets.logo);
  const logoSource = useCanvasStore((state) => state.assets.logoSource);
  const primaryColor = useCanvasStore((state) => state.assets.colors[0]);
  const tileSettings = useCanvasStore((state) => state.tileSettings.logo);
  const editingTileId = useCanvasStore((state) => state.editingTileId);
  const setEditingTile = useCanvasStore((state) => state.setEditingTile);
  const extractionStage = useCanvasStore((state) => state.extractionStage);

  // Luminance detection for adaptive background
  const { background: adaptiveBackground, loading: luminanceLoading } =
    useImageLuminance(tileSettings.background === 'auto' ? logo : null);

  const isEditing = editingTileId === 'logo';
  const isDimmed = editingTileId !== null && !isEditing;
  const isLoading =
    extractionStage === 'fetching' || extractionStage === 'logo';
  const isDefault = logoSource === 'default';

  const handleClick = () => {
    setEditingTile(isEditing ? null : 'logo');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setEditingTile(isEditing ? null : 'logo');
    }
    if (e.key === 'Escape' && isEditing) {
      e.preventDefault();
      setEditingTile(null);
    }
  };

  const backgroundColor = getBackgroundColor(
    tileSettings.background,
    adaptiveBackground,
    primaryColor
  );
  const filter = getVariantFilter(tileSettings.variant);
  const scale = tileSettings.scale / 100;

  return (
    <div
      className={`tile tile-logo ${isLoading ? 'tile-loading' : ''} ${
        isDimmed ? 'tile-dimmed' : ''
      } ${isEditing ? 'tile-editing' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isDimmed ? -1 : 0}
      role="button"
      aria-label={`Logo tile - ${
        isEditing ? 'press Enter or Escape to close' : 'press Enter to edit'
      }`}
      aria-pressed={isEditing}
    >
      <div className="tile-header">
        <span className="tile-label">Logo</span>
        {isDefault && <span className="tile-status">default</span>}
      </div>

      <div
        className="tile-content logo-tile-content"
        style={{ backgroundColor }}
      >
        {!isLoading && logo && (
          <div className="logo-container">
            <img
              src={logo}
              alt="Logo"
              className="logo-display-adaptive"
              style={{
                filter,
                transform: `scale(${scale})`,
              }}
            />
          </div>
        )}
        {!isLoading && !logo && (
          <span className="logo-empty">No logo</span>
        )}
        {luminanceLoading && tileSettings.background === 'auto' && (
          <div className="logo-luminance-loading" />
        )}
      </div>

      {/* Frosted glass overlay - only show on hover when not editing */}
      {!isEditing && !isLoading && (
        <div className="tile-overlay">
          <span className="tile-overlay-label">Logo</span>
          <span className="tile-overlay-icon">Edit</span>
        </div>
      )}

      {/* Edit panel - inline when editing */}
      {isEditing && (
        <EditPanel title="Logo" onClose={() => setEditingTile(null)}>
          <LogoEditPanel />
        </EditPanel>
      )}
    </div>
  );
}
