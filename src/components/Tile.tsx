import { useCanvasStore } from '@/state/canvasState';

interface TileProps {
  id: string;
  children: React.ReactNode;
  isLoading?: boolean;
  isDefault?: boolean;
  label: string;
  className?: string;
}

export function Tile({
  id,
  children,
  isLoading = false,
  isDefault = false,
  label,
  className = ''
}: TileProps) {
  const editingTileId = useCanvasStore((state) => state.editingTileId);
  const setEditingTile = useCanvasStore((state) => state.setEditingTile);

  const isEditing = editingTileId === id;
  const isDimmed = editingTileId !== null && !isEditing;

  const handleClick = () => {
    // Toggle: if already editing, close; otherwise open
    setEditingTile(isEditing ? null : id);
  };

  return (
    <div
      className={`tile ${isLoading ? 'tile-loading' : ''} ${isDimmed ? 'tile-dimmed' : ''} ${isEditing ? 'tile-editing' : ''} ${className}`}
      onClick={handleClick}
    >
      <div className="tile-header">
        <span className="tile-label">{label}</span>
        {isDefault && <span className="tile-status">default</span>}
      </div>
      <div className="tile-content">
        {!isLoading && children}
      </div>

      {/* Frosted glass overlay - only show on hover when not editing */}
      {!isEditing && !isLoading && (
        <div className="tile-overlay">
          <span className="tile-overlay-label">{label}</span>
          <span className="tile-overlay-icon">Edit</span>
        </div>
      )}
    </div>
  );
}

// Logo Tile
export function LogoTile({
  logo,
  isLoading,
  isDefault,
}: {
  logo: string | null;
  isLoading?: boolean;
  isDefault?: boolean;
}) {
  return (
    <Tile
      id="logo"
      isLoading={isLoading}
      isDefault={isDefault}
      label="Logo"
      className="tile-logo"
    >
      {logo ? (
        <img src={logo} alt="Logo" className="logo-display" />
      ) : (
        <span className="logo-empty">No logo</span>
      )}
    </Tile>
  );
}

// Primary Type Tile
export function FontTile({
  fontName,
  variant,
  isLoading,
  isDefault,
}: {
  fontName: string;
  variant: 'primary' | 'secondary';
  isLoading?: boolean;
  isDefault?: boolean;
}) {
  const isPrimary = variant === 'primary';

  return (
    <Tile
      id={isPrimary ? 'primary-font' : 'secondary-font'}
      isLoading={isLoading}
      isDefault={isDefault}
      label={isPrimary ? 'Primary Type' : 'Secondary Type'}
      className={isPrimary ? 'tile-primary-type' : 'tile-secondary-type'}
    >
      <div className="font-display" style={{ fontFamily: fontName }}>
        <span className="font-name">{fontName}</span>
        <span className="font-specimen">
          {isPrimary ? 'Aa' : 'The quick brown fox jumps over the lazy dog'}
        </span>
      </div>
    </Tile>
  );
}

// Color Tile
export function ColorTile({
  colors,
  isLoading,
  isDefault,
}: {
  colors: string[];
  isLoading?: boolean;
  isDefault?: boolean;
}) {
  return (
    <Tile
      id="colors"
      isLoading={isLoading}
      isDefault={isDefault}
      label="Colors"
      className="tile-colors"
    >
      <div className="color-display">
        {colors.slice(0, 5).map((color, i) => (
          <div
            key={i}
            className="color-swatch"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </Tile>
  );
}

// Imagery Tile
export function ImageTile({
  image,
  colors,
  isLoading,
  isDefault,
}: {
  image: string | null;
  colors: string[];
  isLoading?: boolean;
  isDefault?: boolean;
}) {
  // Subtle gradient from first two colors when no image
  const gradient = colors.length >= 2
    ? `linear-gradient(180deg, ${colors[0]}20 0%, ${colors[1]}20 100%)`
    : 'linear-gradient(180deg, #f5f5f5 0%, #e5e5e5 100%)';

  return (
    <Tile
      id="imagery"
      isLoading={isLoading}
      isDefault={isDefault}
      label="Imagery"
      className="tile-imagery"
    >
      {image ? (
        <img src={image} alt="Brand imagery" className="imagery-display" />
      ) : (
        <div className="imagery-gradient" style={{ background: gradient }} />
      )}
    </Tile>
  );
}
