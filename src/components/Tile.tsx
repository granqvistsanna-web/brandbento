import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface TileProps {
  children: React.ReactNode;
  isLoading?: boolean;
  isDefault?: boolean;
  label?: string;
  onClick?: () => void;
  className?: string;
}

export function Tile({
  children,
  isLoading = false,
  isDefault = false,
  label,
  onClick,
  className = ''
}: TileProps) {
  if (isLoading) {
    return (
      <div className={`tile tile-loading ${className}`}>
        <Skeleton
          height="100%"
          borderRadius={12}
          baseColor="#f0f0f0"
          highlightColor="#fafafa"
        />
      </div>
    );
  }

  return (
    <div
      className={`tile ${isDefault ? 'tile-default' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {isDefault && (
        <div className="tile-default-badge">
          Default - click to change
        </div>
      )}
      {label && <div className="tile-label">{label}</div>}
      <div className="tile-content">
        {children}
      </div>
    </div>
  );
}

// Specialized tile variants
export function ColorTile({
  colors,
  isLoading,
  isDefault,
  onClick
}: {
  colors: string[];
  isLoading?: boolean;
  isDefault?: boolean;
  onClick?: () => void;
}) {
  return (
    <Tile
      isLoading={isLoading}
      isDefault={isDefault}
      label="Colors"
      onClick={onClick}
      className="tile-colors"
    >
      <div className="color-swatches">
        {colors.map((color, i) => (
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

export function FontTile({
  fontName,
  variant,
  isLoading,
  isDefault,
  onClick
}: {
  fontName: string;
  variant: 'primary' | 'secondary';
  isLoading?: boolean;
  isDefault?: boolean;
  onClick?: () => void;
}) {
  return (
    <Tile
      isLoading={isLoading}
      isDefault={isDefault}
      label={variant === 'primary' ? 'Primary Type' : 'Secondary Type'}
      onClick={onClick}
      className={`tile-font tile-font-${variant}`}
    >
      <div className="font-specimen" style={{ fontFamily: fontName }}>
        <span className="font-name">{fontName}</span>
        <span className="font-sample">
          {variant === 'primary' ? 'Aa' : 'The quick brown fox'}
        </span>
      </div>
    </Tile>
  );
}

export function LogoTile({
  logo,
  isLoading,
  isDefault,
  onClick
}: {
  logo: string | null;
  isLoading?: boolean;
  isDefault?: boolean;
  onClick?: () => void;
}) {
  return (
    <Tile
      isLoading={isLoading}
      isDefault={isDefault}
      label="Logo"
      onClick={onClick}
      className="tile-logo"
    >
      {logo ? (
        <img src={logo} alt="Brand logo" className="logo-image" />
      ) : (
        <div className="logo-placeholder">No logo</div>
      )}
    </Tile>
  );
}

export function ImageTile({
  image,
  colors,
  isLoading,
  isDefault,
  onClick
}: {
  image: string | null;
  colors: string[];
  isLoading?: boolean;
  isDefault?: boolean;
  onClick?: () => void;
}) {
  // Generate gradient from colors if no image
  const gradient = colors.length >= 2
    ? `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`
    : 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)';

  return (
    <Tile
      isLoading={isLoading}
      isDefault={isDefault}
      label="Imagery"
      onClick={onClick}
      className="tile-imagery"
    >
      {image ? (
        <img src={image} alt="Brand imagery" className="imagery-image" />
      ) : (
        <div className="imagery-gradient" style={{ background: gradient }} />
      )}
    </Tile>
  );
}
