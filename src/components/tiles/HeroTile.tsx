/**
 * Hero Tile Component
 *
 * Image-led hero with a dark overlay and light title text.
 * Pulls image/headline/subcopy/cta from the hero tile content.
 */
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { motion } from 'motion/react';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';

interface HeroTileProps {
  placementId?: string;
}

export function HeroTile({ placementId }: HeroTileProps) {
  const { typography } = useBrandStore(
    useShallow((state: BrandStore) => ({
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
  const placementContent = useBrandStore((state: BrandStore) =>
    placementId ? state.placementContent?.[placementId] : undefined
  );

  const content = { ...tile?.content, ...(placementContent || {}) };
  const imageUrl = content.image;
  const headline = content.headline || 'Brand stories, made bold.';
  const subcopy = content.subcopy || 'Design a cohesive world in minutes.';

  const spacingMap = {
    tight: '-0.02em',
    normal: '0',
    wide: '0.05em',
  };
  const spacing = spacingMap[typography.letterSpacing] || '0';

  return (
    <div className="relative w-full h-full overflow-hidden">
      {imageUrl ? (
        <motion.img
          src={imageUrl}
          alt={headline}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(10,10,10,0.95), rgba(35,35,35,0.9))',
          }}
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      <div className="relative h-full w-full p-6 flex flex-col justify-end gap-3">
        <h1
          className="leading-tight"
          style={{
            fontFamily: typography.primary,
            fontWeight: parseInt(typography.weightHeadline) || 700,
            fontSize: 'clamp(24px, 4vw, 40px)',
            letterSpacing: spacing,
            color: '#F7F4EF',
          }}
        >
          {headline}
        </h1>

        {subcopy && (
          <p
            className="leading-relaxed max-w-[32ch]"
            style={{
              fontFamily: typography.secondary,
              fontWeight: parseInt(typography.weightBody) || 400,
              fontSize: 'clamp(12px, 2vw, 16px)',
              letterSpacing: spacing,
              color: 'rgba(247, 244, 239, 0.85)',
            }}
          >
            {subcopy}
          </p>
        )}

      </div>
    </div>
  );
}
