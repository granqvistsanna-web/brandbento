/**
 * Personality / Brand Voice Tile Component
 *
 * V3: EXPRESSIVE / EDITORIAL — Magazine-style typographic poster.
 * Dramatic scale contrast: one hero word at display size, two at
 * medium, rest at small body. Asymmetric, left-aligned composition
 * that feels like a design studio manifesto.
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { getAdaptiveTextColor } from '@/utils/color';
import { hexToHSL } from '@/utils/colorMapping';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { usePlacementTile } from '@/hooks/usePlacementTile';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale, getHeadlineTracking, getHeadlineLineHeight } from '@/utils/typography';
import { getPresetContent } from '@/data/tilePresetContent';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarDivider,
  ToolbarTileTypeGrid,
  ToolbarSurfaceSwatches,
  ToolbarItemList,
  ToolbarLabel,
} from './FloatingToolbar';

/* ─── Shuffle presets ─── */

const PERSONALITY_PRESETS = [
  ['Friendly', 'Witty', 'Confident', 'Playful', 'Human', 'Enthusiastic', 'Energetic', 'Curious'],
  ['Bold', 'Minimal', 'Precise', 'Elegant', 'Refined', 'Timeless', 'Restrained', 'Intentional'],
  ['Warm', 'Inclusive', 'Joyful', 'Authentic', 'Caring', 'Approachable', 'Honest', 'Grounded'],
  ['Disruptive', 'Fearless', 'Innovative', 'Direct', 'Ambitious', 'Progressive', 'Edgy', 'Sharp'],
  ['Calm', 'Thoughtful', 'Considered', 'Gentle', 'Patient', 'Wise', 'Subtle', 'Understated'],
];

/* ─── Types ─── */

interface PersonalityTileProps {
  placementId?: string;
}

/* ─── Component ─── */

export function PersonalityTile({ placementId }: PersonalityTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;
      if (!width) return;
      setScale(Math.max(0.6, Math.min(1.4, width / 340)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ─── Store ─── */
  const { colors, typography } = useBrandStore(
    useShallow((state: BrandStore) => ({
      colors: state.brand.colors,
      typography: state.brand.typography,
    }))
  );
  const activePreset = useBrandStore((s) => s.activePreset);
  const updateTile = useBrandStore((s) => s.updateTile);
  const swapTileType = useBrandStore((s) => s.swapTileType);
  const setTileSurface = useBrandStore((s) => s.setTileSurface);
  const { tileId: placementTileId, tileType: placementTileType } = usePlacementTile(placementId);
  const tile = useBrandStore((state: BrandStore) => {
    if (placementTileId) return state.tiles.find((t) => t.id === placementTileId);
    if (placementTileType) return state.tiles.find((t) => t.type === placementTileType);
    return undefined;
  });
  const tileSurfaceIndex = useBrandStore((state: BrandStore) =>
    placementId ? state.tileSurfaces[placementId] : undefined
  );

  /* ─── Colors ─── */
  const { bg, text: textColor, primary, accent, surfaces } = colors;
  const surfaceBg = resolveSurfaceColor({ placementId, tileSurfaceIndex, surfaces, bg, defaultIndex: 1 });
  const adaptiveText = getAdaptiveTextColor(surfaceBg, textColor, COLOR_DEFAULTS.TEXT_LIGHT);
  const { l: surfaceL } = hexToHSL(surfaceBg);
  const isLight = surfaceL > 55;
  const fontPreview = useBrandStore((state) => state.fontPreview);

  /* ─── Typography ─── */
  const primaryFontChoice = fontPreview?.target === "primary" ? fontPreview.font : typography.primary;
  const secondaryFontChoice = fontPreview?.target === "secondary" ? fontPreview.font : typography.secondary;
  const { fontFamily: headlineFont } = useGoogleFonts(primaryFontChoice, getFontCategory(primaryFontChoice));
  const { fontFamily: bodyFont } = useGoogleFonts(secondaryFontChoice, getFontCategory(secondaryFontChoice));
  const typeScale = getTypeScale(typography);

  /* ─── Content ─── */
  const presetCopy = getPresetContent(activePreset).personality;
  const tileContent = tile?.content || {};
  const items: string[] = tileContent.items || presetCopy.items;
  const label = tileContent.label || 'Personality';

  /* ─── Toolbar ─── */
  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);

  const handleShuffle = useCallback(() => {
    if (!tile?.id) return;
    const currentKey = items.join(',');
    const candidates = PERSONALITY_PRESETS.filter((p) => p.join(',') !== currentKey);
    const preset = candidates[Math.floor(Math.random() * candidates.length)];
    updateTile(tile.id, { items: preset }, true);
  }, [tile?.id, items, updateTile]);

  const toolbar = isFocused && anchorRect && (
    <FloatingToolbar anchorRect={anchorRect}>
      <ToolbarActions onShuffle={handleShuffle} />
      <ToolbarDivider />
      <ToolbarTileTypeGrid
        currentType={tile?.type || 'personality'}
        onTypeChange={(type) => tile?.id && swapTileType(tile.id, type)}
      />
      <ToolbarDivider />
      <ToolbarSurfaceSwatches
        surfaces={surfaces}
        bgColor={bg}
        currentIndex={tileSurfaceIndex}
        onSurfaceChange={(idx) => placementId && setTileSurface(placementId, idx)}
      />
      <ToolbarDivider />
      <ToolbarLabel>Traits</ToolbarLabel>
      <ToolbarItemList
        label="Words"
        items={items}
        maxItems={10}
        onChange={(newItems) => tile?.id && updateTile(tile.id, { items: newItems }, false)}
        onCommit={(newItems) => tile?.id && updateTile(tile.id, { items: newItems }, true)}
      />
    </FloatingToolbar>
  );

  /* ─── Layout tiers ─── */
  const heroWord = items[0];
  const midWords = items.slice(1, 3);
  const smallWords = items.slice(3);

  const heroSize = clampFontSize(typeScale.step3 * scale, 28, 56);
  const midSize = clampFontSize(typeScale.step1 * scale, 16, 28);
  const smallSize = clampFontSize(typeScale.stepMinus1 * scale, 11, 15);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col justify-end transition-colors duration-300 relative overflow-hidden"
      style={{
        backgroundColor: surfaceBg,
        padding: 'clamp(20px, 8%, 40px)',
      }}
    >
      {/* Typographic composition — stacked, left-aligned */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Hero word — massive display type */}
        <span
          style={{
            fontFamily: headlineFont,
            fontWeight: parseInt(typography.weightHeadline) || 700,
            fontSize: `${heroSize}px`,
            lineHeight: 1.0,
            letterSpacing: getHeadlineTracking(typography),
            color: adaptiveText,
          }}
        >
          {heroWord}
        </span>

        {/* Mid-tier words — medium scale, stacked */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${clampFontSize(1 * scale, 0, 2)}px`,
            marginTop: `${clampFontSize(4 * scale, 2, 8)}px`,
          }}
        >
          {midWords.map((word, i) => (
            <span
              key={i}
              style={{
                fontFamily: headlineFont,
                fontWeight: parseInt(typography.weightHeadline) || 700,
                fontSize: `${midSize}px`,
                lineHeight: getHeadlineLineHeight(typography),
                letterSpacing: getHeadlineTracking(typography),
                color: adaptiveText,
                opacity: 0.65,
              }}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Small words — body scale, flowing inline */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: `${clampFontSize(3 * scale, 2, 6)}px ${clampFontSize(10 * scale, 6, 16)}px`,
            marginTop: `${clampFontSize(10 * scale, 6, 18)}px`,
          }}
        >
          {smallWords.map((word, i) => (
            <span
              key={i}
              style={{
                fontFamily: bodyFont,
                fontWeight: parseInt(typography.weightBody) || 400,
                fontSize: `${smallSize}px`,
                letterSpacing: '0.02em',
                color: adaptiveText,
                opacity: 0.4,
                lineHeight: 1.4,
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* Corner label */}
      <span
        className="absolute select-none"
        style={{
          bottom: 'clamp(16px, 6%, 28px)',
          left: 'clamp(16px, 6%, 28px)',
          fontFamily: bodyFont,
          fontWeight: parseInt(typography.weightBody) || 400,
          fontSize: `${clampFontSize(typeScale.stepMinus2, 9, 12)}px`,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: adaptiveText,
          opacity: 0.35,
        }}
      >
        {label}
      </span>

      {toolbar}
    </div>
  );
}
