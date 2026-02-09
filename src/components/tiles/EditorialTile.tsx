/**
 * Editorial Tile Component
 *
 * Typography showcase that makes font pairings feel alive.
 * Uses scale contrast, generous whitespace, and asymmetric
 * composition to frame type like a magazine spread. No decorative
 * elements — hierarchy comes purely from type.
 *
 * Adapts layout based on tile shape:
 * - Portrait/tall: bottom-aligned magazine composition
 * - Landscape/compact: centered, tighter spacing
 */
import { useRef, useState, useEffect } from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { getAdaptiveTextColor } from '@/utils/color';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getLetterSpacing, getTypeScale } from '@/utils/typography';

interface EditorialTileProps {
  placementId?: string;
}

type TileShape = 'portrait' | 'square' | 'landscape';

export function EditorialTile({ placementId }: EditorialTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shape, setShape] = useState<TileShape>('square');

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      const ratio = width / height;
      if (ratio > 1.8) setShape('landscape');
      else if (ratio < 0.75) setShape('portrait');
      else setShape('square');
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { typography, colors } = useBrandStore(
    useShallow((state) => ({
      typography: state.brand.typography,
      colors: state.brand.colors,
    }))
  );
  const activePreset = useBrandStore((state) => state.activePreset);
  const tileSurfaceIndex = useBrandStore((state) =>
    placementId ? state.tileSurfaces[placementId] : undefined
  );
  const { primary, secondary, weightHeadline, weightBody, letterSpacing } = typography;
  const { text: textColor, bg, surfaces } = colors;
  const { fontFamily: headlineFont } = useGoogleFonts(primary, getFontCategory(primary));
  const { fontFamily: bodyFont } = useGoogleFonts(secondary, getFontCategory(secondary));

  const surfaceBg = resolveSurfaceColor({
    placementId,
    tileSurfaceIndex,
    surfaces,
    bg,
    defaultIndex: 0,
  });

  const adaptiveTextColor = getAdaptiveTextColor(surfaceBg, textColor, COLOR_DEFAULTS.TEXT_LIGHT);
  const typeScale = getTypeScale(typography);
  const spacing = getLetterSpacing(letterSpacing);

  const isLandscape = shape === 'landscape';

  const copyByPreset: Record<string, { pretitle: string; title: string; body: string; detail: string }> = {
    default: {
      pretitle: 'Studio Notes',
      title: "Make the thing you wish existed.",
      body: "A clear brand system for ideas that are ready to ship.",
      detail: 'No. 01',
    },
    techStartup: {
      pretitle: 'Product',
      title: "Ship smarter updates, faster.",
      body: "Turn complex product news into crisp, confident stories.",
      detail: 'Vol. II',
    },
    luxuryRetail: {
      pretitle: 'Atelier',
      title: "Elevate the everyday.",
      body: "An understated brand system with room for the extraordinary.",
      detail: 'SS 26',
    },
    communityNonprofit: {
      pretitle: 'Mission',
      title: "Bring people into the story.",
      body: "Warm, human-first design that makes the mission easy to join.",
      detail: 'Ch. 01',
    },
    creativeStudio: {
      pretitle: 'Manifesto',
      title: "Make bold work feel effortless.",
      body: "A flexible system for briefs, pitches, and launches.",
      detail: 'Issue 04',
    },
    foodDrink: {
      pretitle: 'Cuisine',
      title: "Samba sweetness.",
      body: "Succulent and bold, a dessert that captures bite.",
      detail: 'Pg. 12',
    },
  };

  const copy = copyByPreset[activePreset] ?? copyByPreset.default;

  // Landscape: two-column layout with pretitle+headline left, body right
  if (isLandscape) {
    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center transition-colors duration-300 relative overflow-hidden"
        style={{
          backgroundColor: surfaceBg,
          padding: 'clamp(16px, 5%, 32px)',
        }}
      >
        {/* Corner detail — top-right */}
        <span
          className="absolute select-none"
          style={{
            top: 'clamp(12px, 4%, 20px)',
            right: 'clamp(12px, 4%, 20px)',
            fontFamily: bodyFont,
            fontWeight: parseInt(weightBody) || 400,
            fontSize: `${clampFontSize(typeScale.stepMinus2, 9, 11)}px`,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: adaptiveTextColor,
            opacity: 0.32,
          }}
        >
          {copy.detail}
        </span>

        {/* Two-column editorial spread */}
        <div className="flex items-end gap-[clamp(16px,4%,40px)] w-full">
          {/* Left: pretitle + headline */}
          <div className="flex flex-col shrink-0" style={{ maxWidth: '55%' }}>
            <span
              style={{
                fontFamily: bodyFont,
                fontWeight: parseInt(weightBody) || 400,
                fontSize: `${clampFontSize(typeScale.stepMinus2, 9, 12)}px`,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: adaptiveTextColor,
                opacity: 0.45,
                marginBottom: `${clampFontSize(typeScale.base * 0.35, 4, 10)}px`,
              }}
            >
              {copy.pretitle}
            </span>
            <h1
              className="leading-[1.08]"
              style={{
                fontFamily: headlineFont,
                fontWeight: parseInt(weightHeadline) || 700,
                fontSize: `${clampFontSize(typeScale.step2)}px`,
                letterSpacing: spacing,
                color: adaptiveTextColor,
                textWrap: 'balance',
              }}
            >
              {copy.title}
            </h1>
          </div>

          {/* Right: body text */}
          <p
            className="leading-[1.5]"
            style={{
              fontFamily: bodyFont,
              fontWeight: parseInt(weightBody) || 400,
              fontSize: `${clampFontSize(typeScale.stepMinus1, 11, 15)}px`,
              letterSpacing: spacing,
              color: adaptiveTextColor,
              opacity: 0.5,
              maxWidth: '26ch',
            }}
          >
            {copy.body}
          </p>
        </div>
      </div>
    );
  }

  // Portrait / square: bottom-aligned magazine composition
  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col justify-end transition-colors duration-300 relative overflow-hidden"
      style={{
        backgroundColor: surfaceBg,
        padding: 'clamp(20px, 8%, 40px)',
      }}
    >
      {/* Corner detail — tiny metadata anchored top-right */}
      <span
        className="absolute select-none"
        style={{
          top: 'clamp(16px, 6%, 28px)',
          right: 'clamp(16px, 6%, 28px)',
          fontFamily: bodyFont,
          fontWeight: parseInt(weightBody) || 400,
          fontSize: `${clampFontSize(typeScale.stepMinus2, 9, 12)}px`,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: adaptiveTextColor,
          opacity: 0.32,
        }}
      >
        {copy.detail}
      </span>

      {/* Editorial content — bottom-aligned, magazine composition */}
      <div className="flex flex-col gap-0 mt-auto">
        {/* Pretitle / Section label */}
        <span
          className="block"
          style={{
            fontFamily: bodyFont,
            fontWeight: parseInt(weightBody) || 400,
            fontSize: `${clampFontSize(typeScale.stepMinus2, 9, 13)}px`,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: adaptiveTextColor,
            opacity: 0.45,
            marginBottom: `${clampFontSize(typeScale.base * 0.6, 8, 16)}px`,
          }}
        >
          {copy.pretitle}
        </span>

        {/* Headline — the star */}
        <h1
          className="leading-[1.08]"
          style={{
            fontFamily: headlineFont,
            fontWeight: parseInt(weightHeadline) || 700,
            fontSize: `${clampFontSize(typeScale.step2)}px`,
            letterSpacing: spacing,
            color: adaptiveTextColor,
            textWrap: 'balance',
            marginBottom: `${clampFontSize(typeScale.base * 0.55, 6, 14)}px`,
          }}
        >
          {copy.title}
        </h1>

        {/* Body — restrained, with limited measure */}
        <p
          className="leading-[1.55]"
          style={{
            fontFamily: bodyFont,
            fontWeight: parseInt(weightBody) || 400,
            fontSize: `${clampFontSize(typeScale.stepMinus1, 11, 16)}px`,
            letterSpacing: spacing,
            color: adaptiveTextColor,
            opacity: 0.55,
            maxWidth: '28ch',
          }}
        >
          {copy.body}
        </p>
      </div>
    </div>
  );
}
