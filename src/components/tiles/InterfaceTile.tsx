/**
 * Interface Tile Component
 *
 * Button showcase in a realistic UI snippet context.
 * Shows primary + secondary buttons with a small label above,
 * giving the feel of a real product card rather than a wireframe.
 */
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { ArrowRight } from 'lucide-react';
import { getAdaptiveTextColor } from '@/utils/color';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale } from '@/utils/typography';

interface InterfaceTileProps {
  placementId?: string;
}

export function InterfaceTile({ placementId }: InterfaceTileProps) {
  const { colors, bodyFont, typography } = useBrandStore(
    useShallow((state: BrandStore) => ({
      colors: state.brand.colors,
      bodyFont: state.brand.typography.secondary,
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
  const { primary, text, bg, surfaces } = colors;
  const content = tile?.content || {};
  const primaryLabel = content.buttonLabel || 'Submit';
  const secondaryLabel = content.headerTitle || 'Dashboard';
  const { fontFamily: uiFont } = useGoogleFonts(bodyFont, getFontCategory(bodyFont));
  const typeScale = getTypeScale(typography);

  const bgColor = resolveSurfaceColor({
    placementId,
    tileSurfaceIndex,
    surfaces,
    bg,
    defaultIndex: 2,
  });

  const adaptiveText = getAdaptiveTextColor(bgColor, text, COLOR_DEFAULTS.TEXT_LIGHT);
  const buttonTextColor = getAdaptiveTextColor(primary, COLOR_DEFAULTS.WHITE, COLOR_DEFAULTS.TEXT_DARK);

  return (
    <div
      className="w-full h-full p-6 flex flex-col justify-center gap-3 relative overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: bgColor }}
    >
      {/* Primary — filled, full-width feel */}
      <button
        className="w-full py-3 px-5 rounded-lg flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98]"
        style={{
          backgroundColor: primary,
          color: buttonTextColor,
          fontFamily: uiFont,
          fontWeight: 600,
                        fontSize: `${clampFontSize(typeScale.base)}px`,
          boxShadow: `0 1px 3px ${primary}33`,
        }}
      >
        <span>{primaryLabel}</span>
        <ArrowRight size={14} strokeWidth={2} />
      </button>

      {/* Secondary — outline/ghost style */}
      <button
        className="w-full py-3 px-5 rounded-lg flex items-center justify-center gap-2 border transition-all duration-150 active:scale-[0.98]"
        style={{
          borderColor: `color-mix(in srgb, ${adaptiveText} 25%, transparent)`,
          color: adaptiveText,
          fontFamily: uiFont,
          fontWeight: 500,
                        fontSize: `${clampFontSize(typeScale.stepMinus1)}px`,
          backgroundColor: 'transparent',
        }}
      >
        <span>{secondaryLabel}</span>
      </button>
    </div>
  );
}
