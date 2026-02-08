/**
 * Icon Tile Component
 *
 * Compact icon grid for category cues (Food & Drink).
 */
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { getAdaptiveTextColor } from '@/utils/color';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { Coffee, Leaf, LeafyGreen, Utensils, UtensilsCrossed, Wine } from 'lucide-react';

interface IconTileProps {
  placementId?: string;
}

const ICONS = [Utensils, Coffee, Leaf, Wine, UtensilsCrossed, LeafyGreen];

export function IconTile({ placementId }: IconTileProps) {
  const { colors } = useBrandStore(
    useShallow((state: BrandStore) => ({
      colors: state.brand.colors,
    }))
  );
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

  const iconColor = primary || adaptiveText;

  return (
    <div
      className="w-full h-full p-5 flex items-center justify-center transition-colors duration-300"
      style={{ backgroundColor: surfaceBg }}
    >
      <div className="grid grid-cols-3 gap-3">
        {ICONS.map((Icon, index) => (
          <div
            key={`icon-${index}`}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: `color-mix(in srgb, ${iconColor} 8%, transparent)`,
              border: `1px solid color-mix(in srgb, ${iconColor} 14%, transparent)`,
              color: iconColor,
            }}
          >
            <Icon size={16} strokeWidth={1.5} />
          </div>
        ))}
      </div>
    </div>
  );
}
