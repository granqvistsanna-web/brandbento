/**
 * Interface Tile Component
 *
 * Simple button specimens showcasing primary, secondary, and tertiary
 * button styles in the brand's palette. Scales to fit any tile size.
 */
import { useRef, useState, useEffect } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { ArrowRight } from 'lucide-react';
import { getAdaptiveTextColor } from '@/utils/color';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { getFontCategory } from '@/utils/typography';
import { hexToHSL } from '@/utils/colorMapping';

const CARD_W = 240;
const CARD_H = 200;

interface InterfaceTileProps {
  placementId?: string;
}

export function InterfaceTile({ placementId }: InterfaceTileProps) {
  const { colors, bodyFont, ui } = useBrandStore(
    useShallow((state: BrandStore) => ({
      colors: state.brand.colors,
      bodyFont: state.brand.typography.secondary,
      ui: state.brand.ui,
    }))
  );
  const placementTileId = getPlacementTileId(placementId);
  const placementTileType = getPlacementTileType(placementId);
  const tile = useBrandStore((state: BrandStore) => {
    if (placementTileId) return state.tiles.find((t) => t.id === placementTileId);
    if (placementTileType) return state.tiles.find((t) => t.type === placementTileType);
    return undefined;
  });
  const tileSurfaceIndex = useBrandStore((state: BrandStore) =>
    placementId ? state.tileSurfaces[placementId] : undefined
  );

  const { primary, text, bg, surfaces } = colors;
  const btnColor = ui?.buttonColor || primary;
  const btnRadius = ui?.buttonRadius ?? 10;
  const btnStyle = ui?.buttonStyle ?? 'filled';
  const content = tile?.content || {};
  const primaryLabel = content.buttonLabel || 'Get Started';
  const secondaryLabel = content.headerTitle || 'Learn More';


  const { fontFamily: uiFont } = useGoogleFonts(bodyFont, getFontCategory(bodyFont));

  const tileBg = resolveSurfaceColor({
    placementId,
    tileSurfaceIndex,
    surfaces,
    bg,
    defaultIndex: 2,
  });

  const tileBgL = hexToHSL(tileBg).l;
  const isLight = tileBgL > 55;

  const cardText = isLight
    ? `color-mix(in srgb, ${text} 80%, transparent)`
    : `color-mix(in srgb, ${text} 75%, transparent)`;

  const btnTextOnFilled = getAdaptiveTextColor(
    btnColor,
    COLOR_DEFAULTS.TEXT_DARK,
    COLOR_DEFAULTS.WHITE
  );

  // Primary button styles based on buttonStyle
  const primaryBtnStyles = (() => {
    switch (btnStyle) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: btnColor,
          border: `1.5px solid ${btnColor}`,
          boxShadow: 'none',
        };
      case 'soft':
        return {
          backgroundColor: `color-mix(in srgb, ${btnColor} 12%, transparent)`,
          color: btnColor,
          border: 'none',
          boxShadow: 'none',
        };
      default: // filled
        return {
          backgroundColor: btnColor,
          color: btnTextOnFilled,
          border: 'none',
          boxShadow: `0 2px 8px ${btnColor}25`,
        };
    }
  })();

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const pad = Math.min(width, height) * 0.08;
      const s = Math.min((width - pad * 2) / CARD_W, (height - pad * 2) / CARD_H);
      setScale(s);
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: tileBg }}
    >
      <div
        className="flex flex-col"
        style={{
          width: CARD_W,
          height: CARD_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
          fontFamily: uiFont,
          gap: 10,
          justifyContent: 'center',
        }}
      >
        {/* Primary */}
        <button
          className="flex items-center justify-center"
          style={{
            width: '100%',
            height: 46,
            borderRadius: btnRadius,
            fontFamily: uiFont,
            fontWeight: 600,
            fontSize: 14,
            cursor: 'default',
            gap: 6,
            ...primaryBtnStyles,
          }}
        >
          <span>{primaryLabel}</span>
          <ArrowRight size={14} strokeWidth={2.2} />
        </button>

        {/* Secondary — outline */}
        <button
          className="flex items-center justify-center"
          style={{
            width: '100%',
            height: 46,
            borderRadius: btnRadius,
            backgroundColor: 'transparent',
            color: cardText,
            fontFamily: uiFont,
            fontWeight: 500,
            fontSize: 14,
            border: `1.5px solid ${isLight
              ? `color-mix(in srgb, ${text} 18%, transparent)`
              : `color-mix(in srgb, ${text} 14%, transparent)`
            }`,
            cursor: 'default',
          }}
        >
          <span>{secondaryLabel}</span>
        </button>
      </div>
    </div>
  );
}
