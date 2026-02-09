/**
 * Split List Tile Component
 *
 * Two-panel layout: image with overlaid brand name + large heading
 * on the left, surface-colored panel with heading and numbered
 * list items on the right. Editorial/industrial feel.
 *
 * Adapts layout:
 * - Landscape/square: side-by-side split
 * - Portrait: stacked vertically
 */
import { useRef, useState, useEffect } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { motion } from 'motion/react';
import { getAdaptiveTextColor } from '@/utils/color';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getLetterSpacing, getTypeScale } from '@/utils/typography';

interface SplitListTileProps {
  placementId?: string;
}

type TileShape = 'portrait' | 'square' | 'landscape';

const INDUSTRY_COPY: Record<string, {
  brandLabel: string;
  headline: string;
  listHeading: string;
  items: string[];
}> = {
  default: {
    brandLabel: 'Studio',
    headline: 'Design\nParadigm',
    listHeading: 'Core Services',
    items: ['Brand Identity Systems', 'Digital Experience Design', 'Creative Direction'],
  },
  techStartup: {
    brandLabel: 'Platform',
    headline: 'Tech\nForward',
    listHeading: 'Core Stack',
    items: ['Distributed Computing', 'Real-time Analytics', 'Edge Deployment'],
  },
  luxuryRetail: {
    brandLabel: 'Atelier',
    headline: 'Fashion\nParadigm',
    listHeading: 'Textiles Production',
    items: ['Automated Fabric Cutting', 'Eco-Friendly Dyeing', 'Supply Chain Optimization'],
  },
  communityNonprofit: {
    brandLabel: 'Foundation',
    headline: 'Impact\nReport',
    listHeading: 'Key Programs',
    items: ['Youth Development', 'Community Health', 'Education Access'],
  },
  creativeStudio: {
    brandLabel: 'Studio',
    headline: 'Creative\nProcess',
    listHeading: 'Disciplines',
    items: ['Brand Strategy', 'Motion Design', 'Art Direction'],
  },
  foodDrink: {
    brandLabel: 'Kitchen',
    headline: 'Seasonal\nMenu',
    listHeading: 'Sourcing',
    items: ['Local Partnerships', 'Organic Produce', 'Zero-Waste Kitchen'],
  },
};

export function SplitListTile({ placementId }: SplitListTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shape, setShape] = useState<TileShape>('landscape');

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      const ratio = width / height;
      if (ratio < 0.75) setShape('portrait');
      else if (ratio > 1.4) setShape('landscape');
      else setShape('square');
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { typography, colors } = useBrandStore(
    useShallow((state: BrandStore) => ({
      typography: state.brand.typography,
      colors: state.brand.colors,
    }))
  );
  const activePreset = useBrandStore((state: BrandStore) => state.activePreset);
  const placementTileId = getPlacementTileId(placementId);
  const placementTileType = getPlacementTileType(placementId);
  const tile = useBrandStore((state: BrandStore) => {
    if (placementTileId) return state.tiles.find((t) => t.id === placementTileId);
    if (placementTileType) return state.tiles.find((t) => t.type === placementTileType);
    return undefined;
  });
  const placementContent = useBrandStore((state: BrandStore) =>
    placementId ? state.placementContent?.[placementId] : undefined
  );
  const tileSurfaceIndex = useBrandStore((state: BrandStore) =>
    placementId ? state.tileSurfaces[placementId] : undefined
  );
  const logoText = useBrandStore((state: BrandStore) => state.brand.logo?.text);

  const content = { ...tile?.content, ...(placementContent || {}) };
  const industryCopy = INDUSTRY_COPY[activePreset] ?? INDUSTRY_COPY.default;
  const imageUrl = content.image;
  const brandLabel = logoText || content.label || industryCopy.brandLabel;
  const headline = content.headline || industryCopy.headline;
  const listHeading = content.overlayText || industryCopy.listHeading;
  const items = content.items || industryCopy.items;

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
  const spacing = getLetterSpacing(typography.letterSpacing);

  const isPortrait = shape === 'portrait';

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden transition-colors duration-300"
      style={{
        display: 'flex',
        flexDirection: isPortrait ? 'column' : 'row',
      }}
    >
      {/* Image panel with overlaid text */}
      <div
        className="relative overflow-hidden"
        style={{
          [isPortrait ? 'height' : 'width']: isPortrait ? '55%' : '58%',
          flexShrink: 0,
        }}
      >
        {imageUrl ? (
          <motion.img
            src={imageUrl}
            alt={headline}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(160deg, ${colors.primary}dd, ${colors.accent || colors.primary}88)`,
            }}
          />
        )}

        {/* Gradient scrim for text */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.60) 100%)',
          }}
        />

        {/* Overlaid brand label + headline */}
        <div
          className="relative h-full w-full flex flex-col justify-end"
          style={{ padding: 'clamp(14px, 5%, 28px)' }}
        >
          <span
            className="uppercase tracking-widest"
            style={{
              fontFamily: bodyFont,
              fontWeight: parseInt(typography.weightBody) || 400,
              fontSize: `${clampFontSize(typeScale.stepMinus2, 8, 11)}px`,
              letterSpacing: '0.14em',
              color: 'rgba(248, 246, 241, 0.6)',
              marginBottom: `${clampFontSize(typeScale.base * 0.3, 4, 10)}px`,
            }}
          >
            {brandLabel}
          </span>
          <h2
            className="leading-[1.02]"
            style={{
              fontFamily: headlineFont,
              fontWeight: parseInt(typography.weightHeadline) || 700,
              fontSize: `clamp(${clampFontSize(typeScale.step1)}px, 3.5vw, ${clampFontSize(typeScale.step3)}px)`,
              letterSpacing: spacing,
              color: '#F8F6F1',
              whiteSpace: 'pre-line',
            }}
          >
            {headline}
          </h2>
        </div>
      </div>

      {/* List panel */}
      <div
        className="flex flex-col justify-center overflow-hidden"
        style={{
          flex: 1,
          backgroundColor: surfaceBg,
          padding: 'clamp(14px, 5%, 28px)',
        }}
      >
        <h3
          className="leading-[1.1]"
          style={{
            fontFamily: headlineFont,
            fontWeight: parseInt(typography.weightHeadline) || 700,
            fontSize: `${clampFontSize(typeScale.step1)}px`,
            letterSpacing: spacing,
            color: adaptiveText,
            marginBottom: `${clampFontSize(typeScale.base * 0.8, 10, 24)}px`,
          }}
        >
          {listHeading}
        </h3>

        <div className="flex flex-col" style={{ gap: `${clampFontSize(typeScale.base * 0.45, 6, 12)}px` }}>
          {items.slice(0, 4).map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-baseline"
              style={{ gap: `${clampFontSize(typeScale.base * 0.4, 6, 12)}px` }}
            >
              <span
                style={{
                  fontFamily: bodyFont,
                  fontWeight: 500,
                  fontSize: `${clampFontSize(typeScale.stepMinus2, 9, 12)}px`,
                  color: adaptiveText,
                  opacity: 0.4,
                  flexShrink: 0,
                }}
              >
                [{index + 1}]
              </span>
              <span
                className="uppercase"
                style={{
                  fontFamily: bodyFont,
                  fontWeight: parseInt(typography.weightBody) || 400,
                  fontSize: `${clampFontSize(typeScale.stepMinus1, 10, 14)}px`,
                  letterSpacing: '0.06em',
                  color: adaptiveText,
                  opacity: 0.7,
                }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
