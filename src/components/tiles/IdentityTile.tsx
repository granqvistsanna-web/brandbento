/**
 * Identity Tile Component
 *
 * Brand mark showcase with three placement variants:
 * - Logo tile (placement 'a'): Bold wordmark on primary color
 * - Hero identity: Large centered wordmark
 * - Default: 2x2 brand icon grid with subtle wordmark watermark
 */
import { memo } from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { hexToHSL } from '@/utils/colorMapping';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { getFontCategory, clampFontSize } from '@/utils/typography';
import {
  Palette,
  Type,
  Layers,
  Diamond,
} from 'lucide-react';

interface IdentityTileProps {
  placementId?: string;
}

const ICONS = [Palette, Type, Layers, Diamond];

const adaptiveColor = (bgHex: string, lightChoice: string, darkChoice: string, threshold = 55) =>
  hexToHSL(bgHex).l > threshold ? lightChoice : darkChoice;

export const IdentityTile = memo(function IdentityTile({ placementId }: IdentityTileProps) {
  const { logo, colors, typography } = useBrandStore(
    useShallow((state) => ({
      logo: state.brand.logo,
      colors: state.brand.colors,
      typography: state.brand.typography,
    }))
  );
  const tileSurfaceIndex = useBrandStore((state) =>
    placementId ? state.tileSurfaces[placementId] : undefined
  );
  const { padding, size: logoSize, text: logoText, image: logoImage } = logo;
  const { primary, bg, surfaces } = colors;

  const surfaceBg = resolveSurfaceColor({
    placementId,
    tileSurfaceIndex,
    surfaces,
    bg,
    defaultIndex: 1,
  });

  const isHero = placementId === 'hero';
  const isLogoTile = placementId === 'a';
  const showWordmark = Boolean(logoText && logoText.trim().length > 0);
  const headlineWeight = parseInt(typography.weightHeadline) || 700;

  // Compute lightness for contrast decisions
  const surfaceL = hexToHSL(surfaceBg).l;
  const surfaceLight = surfaceL > 55;
  const wordmarkColor = surfaceLight ? primary : COLOR_DEFAULTS.WHITE;
  // Ensure icon color has sufficient contrast against surface
  const primaryL = primary ? hexToHSL(primary).l : 50;
  const primaryContrast = Math.abs(surfaceL - primaryL);
  const iconColor = primaryContrast > 25 ? primary : (surfaceLight ? COLOR_DEFAULTS.TEXT_DARK : COLOR_DEFAULTS.WHITE);

  const { fontFamily: primaryFont } = useGoogleFonts(typography.primary, getFontCategory(typography.primary));

  // ─── LOGO TILE (placement 'a') ─────────────────────────────────
  if (isLogoTile) {
    const logoBg = primary || surfaceBg;
    const logoFg = adaptiveColor(logoBg, COLOR_DEFAULTS.TEXT_DARK, COLOR_DEFAULTS.WHITE);

    return (
      <div className="w-full h-full relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundColor: logoBg }} />
        <div
          className="relative h-full w-full flex items-center justify-center text-center"
          style={{ padding: `${padding}px` }}
        >
          {logoImage ? (
            <img
              src={logoImage}
              alt={showWordmark ? logoText : 'Brand logo'}
              className="max-w-full max-h-full object-contain"
              style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.18))' }}
            />
          ) : (
            <span
              style={{
                fontFamily: primaryFont,
                fontSize: `${clampFontSize(logoSize * 1.6, 24, 120)}px`,
                fontWeight: headlineWeight,
                letterSpacing: '0.04em',
                color: logoFg,
                lineHeight: 1,
              }}
            >
              {showWordmark ? logoText : 'BRAND'}
            </span>
          )}
        </div>
      </div>
    );
  }

  // ─── HERO IDENTITY ─────────────────────────────────────────────
  if (isHero) {
    const heroFontSize = clampFontSize(logoSize * 2, 32, 160);

    return (
      <div className="w-full h-full relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundColor: surfaceBg }} />
        <div
          className="relative h-full w-full flex items-center justify-center text-center"
          style={{ padding: `${padding}px` }}
        >
          {showWordmark ? (
            <span
              style={{
                fontFamily: primaryFont,
                fontSize: `${heroFontSize}px`,
                fontWeight: headlineWeight,
                letterSpacing: '0.04em',
                color: wordmarkColor,
              }}
            >
              {logoText}
            </span>
          ) : logoImage ? (
            <img
              src={logoImage}
              alt="Brand logo"
              className="max-w-full max-h-full object-contain"
              style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.18))' }}
            />
          ) : (
            <span
              style={{
                fontFamily: primaryFont,
                fontSize: `${heroFontSize}px`,
                fontWeight: headlineWeight,
                letterSpacing: '0.04em',
                color: wordmarkColor,
              }}
            >
              BRAND
            </span>
          )}
        </div>
      </div>
    );
  }

  // ─── DEFAULT: ICON GRID with brand watermark ─────────────────
  return (
    <div className="w-full h-full relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundColor: surfaceBg }} />

      <div
        className="relative h-full w-full grid grid-cols-2 grid-rows-2 gap-3"
        style={{ padding: `${Math.max(padding, 16)}px` }}
      >
        {ICONS.map((Icon, i) => (
          <div
            key={i}
            className="rounded-2xl flex items-center justify-center"
            style={{
              background: `color-mix(in srgb, ${iconColor} 10%, transparent)`,
              border: `1px solid color-mix(in srgb, ${iconColor} 16%, transparent)`,
            }}
          >
            <Icon
              size={22}
              strokeWidth={1.5}
              color={iconColor}
            />
          </div>
        ))}
      </div>

    </div>
  );
});
