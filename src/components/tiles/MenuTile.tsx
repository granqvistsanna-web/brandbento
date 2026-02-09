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

const INDUSTRY_DEFAULTS: Record<string, { subcopy: string; items: string[]; action: string }> = {
  foodDrink: { subcopy: 'Currently featuring', items: ['Breakfast', 'Brunch', 'Seasonal'], action: 'View' },
  techStartup: { subcopy: 'Explore', items: ['Platform', 'Pricing', 'Docs'], action: 'View' },
  luxuryRetail: { subcopy: 'Discover', items: ['Collection', 'Lookbook', 'Atelier'], action: 'View' },
  communityNonprofit: { subcopy: 'Our work', items: ['Programs', 'Impact', 'Get Involved'], action: 'View' },
  creativeStudio: { subcopy: 'Selected', items: ['Work', 'Process', 'Studio'], action: 'View' },
};
const GENERIC_DEFAULTS = { subcopy: 'Explore', items: ['Services', 'Portfolio', 'Contact'], action: 'View' };

export function MenuTile({ placementId }: MenuTileProps) {
  const { colors, typography, activePreset } = useBrandStore(
    useShallow((state: BrandStore) => ({
      colors: state.brand.colors,
      typography: state.brand.typography,
      activePreset: state.activePreset,
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

  const { bg, text, surfaces } = colors;
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

  const industryDefaults = INDUSTRY_DEFAULTS[activePreset] || GENERIC_DEFAULTS;
  const content = tile?.content || {};
  const subcopy = content.subcopy || industryDefaults.subcopy;
  const items = content.items || industryDefaults.items;
  const actionLabel = (content.buttonLabel || industryDefaults.action).toUpperCase();

  return (
    <div
      className="w-full h-full flex flex-col transition-colors duration-300 overflow-hidden"
      style={{ backgroundColor: surfaceBg, padding: 'clamp(12px, 6%, 20px)' }}
    >
      <div
        className="uppercase tracking-widest shrink-0"
        style={{
          color: adaptiveText,
          fontFamily: bodyFont,
          opacity: 0.5,
          fontSize: `${clampFontSize(typeScale.stepMinus2)}px`,
          marginBottom: 'clamp(6px, 3%, 12px)',
        }}
      >
        {subcopy}
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {items.slice(0, 4).map((item, index) => (
          <div key={`${item}-${index}`} className="min-h-0" style={{ flex: '1 1 0' }}>
            {index === 0 && (
              <div className="h-px w-full" style={{ backgroundColor: `color-mix(in srgb, ${adaptiveText} 15%, transparent)` }} />
            )}
            <div
              className="flex items-center justify-between gap-2 h-full"
              style={{ padding: 'clamp(4px, 2%, 12px) 0' }}
            >
              <span
                className="uppercase truncate"
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
                className="uppercase tracking-wider shrink-0"
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
