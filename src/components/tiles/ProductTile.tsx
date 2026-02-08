/**
 * Product Tile Component
 *
 * Simple product card with image, label, and price.
 */
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { getAdaptiveTextColor } from '@/utils/color';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale } from '@/utils/typography';

interface ProductTileProps {
  placementId?: string;
}

export function ProductTile({ placementId }: ProductTileProps) {
  const { colors, typography } = useBrandStore(
    useShallow((state: BrandStore) => ({
      colors: state.brand.colors,
      typography: state.brand.typography,
    }))
  );
  const placementTileId = getPlacementTileId(placementId);
  const placementTileType = getPlacementTileType(placementId);
  const tile = useBrandStore((state: BrandStore) => {
    if (placementTileId) {
      return state.tiles.find((t) => t.id === placementTileId);
    }
    if (placementTileType) {
      return state.tiles.find((t) => t.type === placementTileType);
    }
    return undefined;
  });
  const tileSurfaceIndex = useBrandStore((state: BrandStore) =>
    placementId ? state.tileSurfaces[placementId] : undefined
  );

  const { bg, text, surfaces, primary } = colors;
  const surfaceBg = resolveSurfaceColor({
    placementId,
    tileSurfaceIndex,
    surfaces,
    bg,
    defaultIndex: 1,
  });
  const adaptiveText = getAdaptiveTextColor(surfaceBg, text, COLOR_DEFAULTS.TEXT_LIGHT);
  const { fontFamily: headlineFont } = useGoogleFonts(typography.primary, getFontCategory(typography.primary));
  const { fontFamily: bodyFont } = useGoogleFonts(typography.secondary, getFontCategory(typography.secondary));
  const typeScale = getTypeScale(typography);

  const content = tile?.content || {};
  const imageUrl = content.image;
  const label = content.label || 'Product';
  const category = content.subcopy || 'Breakfast';
  const tag = content.body || 'Vegan';
  const price = content.price || '$0.00';

  return (
    <div
      className="w-full h-full p-4 flex gap-4 transition-colors duration-300"
      style={{ backgroundColor: surfaceBg }}
    >
      <div className="relative w-[46%] min-w-[46%] overflow-hidden rounded-lg">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(145deg, ${primary || surfaceBg}dd, ${primary || surfaceBg}66)`,
            }}
          />
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center gap-2">
        <div className="flex flex-col gap-1">
          <div
            className="text-14 uppercase tracking-wide"
            style={{
              color: adaptiveText,
              fontFamily: headlineFont,
              letterSpacing: '0.08em',
              fontSize: `${clampFontSize(typeScale.step1)}px`,
            }}
          >
            {label}
          </div>
          <div
            className="text-11 uppercase tracking-wide"
            style={{
              color: adaptiveText,
              opacity: 0.7,
              fontFamily: bodyFont,
              fontSize: `${clampFontSize(typeScale.stepMinus1)}px`,
            }}
          >
            {category}
          </div>
          <div
            className="text-11 uppercase tracking-wide"
            style={{
              color: adaptiveText,
              opacity: 0.7,
              fontFamily: bodyFont,
              fontSize: `${clampFontSize(typeScale.stepMinus1)}px`,
            }}
          >
            {tag}
          </div>
        </div>
        <div
          className="text-12 font-semibold"
          style={{
            color: primary || adaptiveText,
            fontFamily: headlineFont,
            letterSpacing: '0.02em',
            fontSize: `${clampFontSize(typeScale.base)}px`,
          }}
        >
          {price}
        </div>
      </div>
    </div>
  );
}
