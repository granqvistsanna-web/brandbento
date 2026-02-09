/**
 * Split Hero Tile Component
 *
 * Editorial split layout: image on one side, branded surface
 * with headline, body copy, and CTA on the other.
 * Inspired by fashion editorial spreads — image-led but balanced.
 *
 * Adapts layout based on tile shape:
 * - Landscape/square: side-by-side (image left, copy right)
 * - Portrait/narrow: stacked (image top, copy bottom)
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

interface SplitHeroTileProps {
  placementId?: string;
}

type TileShape = 'portrait' | 'square' | 'landscape';

const INDUSTRY_COPY: Record<string, { headline: string; body: string; cta: string }> = {
  default: {
    headline: 'Defining Style',
    body: 'A fusion of creativity and craftsmanship. We bring timeless pieces that elevate everyday design.',
    cta: 'Read More',
  },
  techStartup: {
    headline: 'Built Different',
    body: 'Engineering meets design. Products that redefine what users expect from modern software.',
    cta: 'Explore',
  },
  luxuryRetail: {
    headline: 'Defining Style',
    body: 'A fusion of creativity and craftsmanship. We bring timeless pieces that elevate everyday fashion.',
    cta: 'Read More',
  },
  communityNonprofit: {
    headline: 'Stronger Together',
    body: 'Community-driven impact that creates lasting change. Every voice matters, every action counts.',
    cta: 'Join Us',
  },
  creativeStudio: {
    headline: 'Make It Real',
    body: 'From concept to craft. We shape ideas into work that moves people and shifts culture.',
    cta: 'See Work',
  },
  foodDrink: {
    headline: 'Pure Flavor',
    body: 'Seasonal ingredients, bold combinations. Every dish is a story of origin and craft.',
    cta: 'Our Menu',
  },
};

export function SplitHeroTile({ placementId }: SplitHeroTileProps) {
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

  const content = { ...tile?.content, ...(placementContent || {}) };
  const industryCopy = INDUSTRY_COPY[activePreset] ?? INDUSTRY_COPY.default;
  const imageUrl = content.image;
  const headline = content.headline || industryCopy.headline;
  const body = content.body || content.subcopy || industryCopy.body;
  const cta = content.cta || content.buttonLabel || industryCopy.cta;

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
      {/* Image half */}
      <div
        className="relative overflow-hidden"
        style={{
          [isPortrait ? 'height' : 'width']: '50%',
          flexShrink: 0,
        }}
      >
        {imageUrl ? (
          <motion.img
            src={imageUrl}
            alt={headline}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(145deg, ${colors.primary}dd, ${colors.accent || colors.primary}88)`,
            }}
          />
        )}
      </div>

      {/* Copy half */}
      <div
        className="flex flex-col justify-center overflow-hidden"
        style={{
          flex: 1,
          backgroundColor: surfaceBg,
          padding: 'clamp(16px, 6%, 32px)',
        }}
      >
        <h2
          className="leading-[1.08]"
          style={{
            fontFamily: headlineFont,
            fontWeight: parseInt(typography.weightHeadline) || 700,
            fontSize: `${clampFontSize(typeScale.step2)}px`,
            letterSpacing: spacing,
            color: adaptiveText,
            textWrap: 'balance',
            marginBottom: `${clampFontSize(typeScale.base * 0.6, 8, 18)}px`,
          }}
        >
          {headline}
        </h2>

        <p
          className="leading-[1.5]"
          style={{
            fontFamily: bodyFont,
            fontWeight: parseInt(typography.weightBody) || 400,
            fontSize: `${clampFontSize(typeScale.stepMinus1, 11, 15)}px`,
            letterSpacing: spacing,
            color: adaptiveText,
            opacity: 0.6,
            maxWidth: '32ch',
            marginBottom: `${clampFontSize(typeScale.base * 0.8, 10, 24)}px`,
          }}
        >
          {body}
        </p>

        <span
          className="uppercase tracking-widest self-start"
          style={{
            fontFamily: bodyFont,
            fontWeight: 500,
            fontSize: `${clampFontSize(typeScale.stepMinus2, 9, 12)}px`,
            letterSpacing: '0.14em',
            color: adaptiveText,
            opacity: 0.55,
          }}
        >
          {cta}
        </span>
      </div>
    </div>
  );
}
