/**
 * Menu Tile Component
 *
 * List-style tile for menus or feature groups.
 */
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { getAdaptiveTextColor } from '@/utils/color';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale } from '@/utils/typography';

interface MenuTileProps {
  placementId?: string;
}

export function MenuTile({ placementId }: MenuTileProps) {
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
    defaultIndex: 0,
  });
  const adaptiveText = getAdaptiveTextColor(surfaceBg, text, COLOR_DEFAULTS.TEXT_LIGHT);
  const { fontFamily: headlineFont } = useGoogleFonts(typography.primary, getFontCategory(typography.primary));
  const { fontFamily: bodyFont } = useGoogleFonts(typography.secondary, getFontCategory(typography.secondary));
  const typeScale = getTypeScale(typography);

  const content = tile?.content || {};
  const title = content.headline || 'Menu';
  const subcopy = content.subcopy || 'Look what we are currently serving:';
  const items = content.items || ['Menu', 'Wines', 'Brunch'];
  const actionLabel = (content.buttonLabel || 'See PDF').toUpperCase();

  return (
    <div
      className="w-full h-full p-5 flex flex-col gap-3 transition-colors duration-300"
      style={{ backgroundColor: surfaceBg }}
    >
      <div
        className="uppercase tracking-widest"
        style={{
          color: adaptiveText,
          fontFamily: bodyFont,
          opacity: 0.5,
          fontSize: `${clampFontSize(typeScale.stepMinus2)}px`,
        }}
      >
        {subcopy}
      </div>

      <div className="flex-1 flex flex-col">
        {items.slice(0, 4).map((item, index) => (
          <div key={`${item}-${index}`}>
            {index === 0 && (
              <div className="h-px w-full" style={{ backgroundColor: `color-mix(in srgb, ${adaptiveText} 15%, transparent)` }} />
            )}
            <div className="flex items-center justify-between gap-3 py-3">
              <span
                className="uppercase"
                style={{
                  color: adaptiveText,
                  fontFamily: headlineFont,
                  letterSpacing: '0.08em',
                  fontSize: `${clampFontSize(typeScale.step1)}px`,
                }}
              >
                {item}
              </span>
              <span
                className="uppercase tracking-wider"
                style={{
                  color: adaptiveText,
                  opacity: 0.45,
                  fontFamily: bodyFont,
                  fontSize: `${clampFontSize(typeScale.stepMinus2)}px`,
                }}
              >
                {actionLabel}
              </span>
            </div>
            <div className="h-px w-full" style={{ backgroundColor: `color-mix(in srgb, ${adaptiveText} 15%, transparent)` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
