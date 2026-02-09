/**
 * Overlay Tile Component
 *
 * Full-bleed image with typographic overlay — label, large headline,
 * and body text layered over a gradient scrim. Designed for
 * cinematic, full-width editorial moments.
 *
 * Content sits centered or bottom-aligned depending on tile shape.
 */
import { useRef, useState, useEffect } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { motion } from 'motion/react';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getLetterSpacing, getTypeScale } from '@/utils/typography';

interface OverlayTileProps {
  placementId?: string;
}

type TileShape = 'portrait' | 'square' | 'landscape';

const INDUSTRY_COPY: Record<string, { label: string; headline: string; body: string }> = {
  default: {
    label: 'About Us',
    headline: 'The Winter Collection',
    body: 'Garments and products so essential that they merge into the wholeness of our lives.',
  },
  techStartup: {
    label: 'Product Launch',
    headline: 'Next Generation Platform',
    body: 'Infrastructure designed for the teams that move fastest.',
  },
  luxuryRetail: {
    label: 'New Season',
    headline: 'The Winter Collection',
    body: 'Garments and products so essential that they merge into the wholeness of our lives.',
  },
  communityNonprofit: {
    label: 'Our Mission',
    headline: 'Building Bridges',
    body: 'Creating spaces where every community member can thrive and grow together.',
  },
  creativeStudio: {
    label: 'Case Study',
    headline: 'The Creative Process',
    body: 'Behind every great project is a story of obsession, revision, and breakthrough.',
  },
  foodDrink: {
    label: 'The Kitchen',
    headline: 'Farm to Table',
    body: 'Sourced with intention, prepared with care. Every plate tells a story of provenance.',
  },
};

export function OverlayTile({ placementId }: OverlayTileProps) {
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
      else if (ratio > 1.6) setShape('landscape');
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

  const content = { ...tile?.content, ...(placementContent || {}) };
  const industryCopy = INDUSTRY_COPY[activePreset] ?? INDUSTRY_COPY.default;
  const imageUrl = content.image;
  const label = content.label || content.subcopy || industryCopy.label;
  const headline = content.headline || industryCopy.headline;
  const body = content.body || industryCopy.body;

  const { fontFamily: headlineFont } = useGoogleFonts(typography.primary, getFontCategory(typography.primary));
  const { fontFamily: bodyFont } = useGoogleFonts(typography.secondary, getFontCategory(typography.secondary));
  const typeScale = getTypeScale(typography);
  const spacing = getLetterSpacing(typography.letterSpacing);

  const isLandscape = shape === 'landscape';

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* Background image */}
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
            background: `linear-gradient(160deg, ${colors.primary}ee, ${colors.accent || colors.primary}99)`,
          }}
        />
      )}

      {/* Gradient scrim — stronger at center/bottom for text legibility */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            'linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.65) 100%)',
          ].join(', '),
        }}
      />

      {/* Content overlay — centered for impact */}
      <div
        className="relative h-full w-full flex flex-col items-center"
        style={{
          padding: 'clamp(16px, 6%, 36px)',
          justifyContent: isLandscape ? 'center' : 'flex-end',
          textAlign: 'center',
        }}
      >
        {/* Top label */}
        <span
          className="uppercase tracking-widest"
          style={{
            fontFamily: bodyFont,
            fontWeight: parseInt(typography.weightBody) || 400,
            fontSize: `${clampFontSize(typeScale.stepMinus2, 9, 12)}px`,
            letterSpacing: '0.16em',
            color: 'rgba(248, 246, 241, 0.65)',
            marginBottom: `${clampFontSize(typeScale.base * 0.5, 6, 16)}px`,
          }}
        >
          {label}
        </span>

        {/* Large headline */}
        <h1
          className="leading-[1.02]"
          style={{
            fontFamily: headlineFont,
            fontWeight: parseInt(typography.weightHeadline) || 700,
            fontSize: `clamp(${clampFontSize(typeScale.step2)}px, 5vw, ${clampFontSize(typeScale.step3 * 1.2)}px)`,
            letterSpacing: spacing,
            color: '#F8F6F1',
            textWrap: 'balance',
            maxWidth: '16ch',
            marginBottom: `${clampFontSize(typeScale.base * 0.6, 8, 20)}px`,
          }}
        >
          {headline}
        </h1>

        {/* Body text */}
        <p
          className="leading-[1.45]"
          style={{
            fontFamily: bodyFont,
            fontWeight: parseInt(typography.weightBody) || 400,
            fontSize: `${clampFontSize(typeScale.stepMinus1, 11, 15)}px`,
            letterSpacing: spacing,
            color: 'rgba(248, 246, 241, 0.6)',
            maxWidth: '38ch',
          }}
        >
          {body}
        </p>
      </div>
    </div>
  );
}
