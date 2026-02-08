/**
 * Hero Tile Component
 *
 * Image-led hero with refined typographic overlay.
 * Uses a subtle gradient vignette and elegant type hierarchy.
 */
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { motion } from 'motion/react';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getLetterSpacing, getTypeScale } from '@/utils/typography';

interface HeroTileProps {
  placementId?: string;
}

export function HeroTile({ placementId }: HeroTileProps) {
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
    if (placementTileId) {
      return state.tiles.find((t) => t.id === placementTileId);
    }
    if (placementTileType) {
      return state.tiles.find((t) => t.type === placementTileType);
    }
    return undefined;
  });
  const placementContent = useBrandStore((state: BrandStore) =>
    placementId ? state.placementContent?.[placementId] : undefined
  );

  const content = { ...tile?.content, ...(placementContent || {}) };
  const imageUrl = content.image;
  const headline = content.headline || 'Brand stories, made bold.';
  const subcopy = content.subcopy || 'Design a cohesive world in minutes.';

  const spacing = getLetterSpacing(typography.letterSpacing);
  const { fontFamily: headlineFont } = useGoogleFonts(typography.primary, getFontCategory(typography.primary));
  const { fontFamily: bodyFont } = useGoogleFonts(typography.secondary, getFontCategory(typography.secondary));
  const typeScale = getTypeScale(typography);

  const isFoodDrink = activePreset === 'foodDrink';

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background image or gradient fallback */}
      {imageUrl ? (
        <motion.img
          src={imageUrl}
          alt={headline}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(145deg, ${colors.primary}dd, ${colors.accent || colors.primary}88)`,
          }}
        />
      )}

      {/* Refined gradient overlay — heavier at bottom for text legibility */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.72) 100%)',
          ].join(', '),
        }}
      />

      {/* Content — pinned to bottom with generous breathing room */}
      <div className="relative h-full w-full p-6 flex flex-col justify-end gap-2">
        <h1
          className="leading-[1.08]"
          style={{
            fontFamily: headlineFont,
            fontWeight: parseInt(typography.weightHeadline) || 700,
            fontSize: `clamp(${clampFontSize(typeScale.step2)}px, 4vw, ${clampFontSize(typeScale.step3)}px)`,
            letterSpacing: isFoodDrink ? '0.06em' : spacing,
            color: '#F7F4EF',
            textTransform: isFoodDrink ? 'uppercase' : 'none',
            textWrap: 'balance',
          }}
        >
          {headline}
        </h1>

        {subcopy && (
          <p
            className="leading-relaxed max-w-[34ch]"
            style={{
              fontFamily: bodyFont,
              fontWeight: parseInt(typography.weightBody) || 400,
              fontSize: isFoodDrink
                ? `clamp(${clampFontSize(typeScale.stepMinus1)}px, 1.6vw, ${clampFontSize(typeScale.step1)}px)`
                : `clamp(${clampFontSize(typeScale.stepMinus1)}px, 2vw, ${clampFontSize(typeScale.step1)}px)`,
              letterSpacing: isFoodDrink ? '0.04em' : spacing,
              color: 'rgba(247, 244, 239, 0.72)',
              textTransform: isFoodDrink ? 'uppercase' : 'none',
            }}
          >
            {subcopy}
          </p>
        )}
      </div>
    </div>
  );
}
