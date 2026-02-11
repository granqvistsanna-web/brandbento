/**
 * Messaging Tile Component
 *
 * A single bold statement on a full-color surface — the kind you see
 * on brand decks, billboards, or manifesto pages. One sentence,
 * maximum typographic impact. No body copy, no CTA, just color + type.
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { getAdaptiveTextColor } from '@/utils/color';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale, getHeadlineTracking, getHeadlineLineHeight, getHeadlineTransform } from '@/utils/typography';
import { getPresetContent } from '@/data/tilePresetContent';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarDivider,
  ToolbarTileTypeGrid,
  ToolbarSurfaceSwatches,
  ToolbarTextArea,
  ToolbarLabel,
} from './FloatingToolbar';

/* ─── Shuffle presets ─── */

const MESSAGING_PRESETS = [
  'Making ordering ahead effortless for everyone, everywhere.',
  'We believe good design is a right, not a luxury.',
  'The future belongs to those who build it with intention.',
  'Less noise. More signal. Always.',
  'Every detail is a decision. We make them count.',
  'Built for the ones who notice the difference.',
];

/* ─── Types ─── */

interface MessagingTileProps {
  placementId?: string;
}

type TileShape = 'portrait' | 'square' | 'landscape';

/* ─── Component ─── */

export function MessagingTile({ placementId }: MessagingTileProps) {
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

  /* ─── Colors ─── */
  const { bg, text: textColor, surfaces } = colors;
  const surfaceBg = resolveSurfaceColor({ placementId, tileSurfaceIndex, surfaces, bg, defaultIndex: 2 });
  const adaptiveText = getAdaptiveTextColor(surfaceBg, textColor, COLOR_DEFAULTS.TEXT_LIGHT);
  const fontPreview = useBrandStore((state) => state.fontPreview);

  /* ─── Typography ─── */
  // Apply font preview if active
  const primaryFont = fontPreview?.target === "primary" ? fontPreview.font : typography.primary;
  const secondaryFont = fontPreview?.target === "secondary" ? fontPreview.font : typography.secondary;

  const { fontFamily: headlineFont } = useGoogleFonts(primaryFont, getFontCategory(primaryFont));
  const { fontFamily: bodyFont } = useGoogleFonts(secondaryFont, getFontCategory(secondaryFont));
  const typeScale = getTypeScale(typography);

  /* ─── Content ─── */
  const presetCopy = getPresetContent(activePreset).messaging;
  const tileContent = tile?.content || {};
  const statement = tileContent.headline || presetCopy.headline;
  const label = tileContent.label || 'Messaging';

  /* ─── Toolbar ─── */
  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);

  const handleShuffle = useCallback(() => {
    if (!tile?.id) return;
    const candidates = MESSAGING_PRESETS.filter((p) => p !== statement);
    const preset = candidates[Math.floor(Math.random() * candidates.length)];
    updateTile(tile.id, { headline: preset }, true);
  }, [tile?.id, statement, updateTile]);

  /* ─── Font size — scale with shape ─── */
  const headlineSize = shape === 'landscape'
    ? clampFontSize(typeScale.step3 * 1.4, 22, 56)
    : shape === 'portrait'
      ? clampFontSize(typeScale.step3 * 1.2, 20, 48)
      : clampFontSize(typeScale.step3 * 1.4, 22, 56);

  const toolbar = isFocused && anchorRect && (
    <FloatingToolbar anchorRect={anchorRect}>
      <ToolbarActions onShuffle={handleShuffle} />
      <ToolbarDivider />
      <ToolbarTileTypeGrid
        currentType={tile?.type || 'messaging'}
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
      <ToolbarLabel>Content</ToolbarLabel>
      <ToolbarTextArea
        label="Statement"
        value={statement}
        onChange={(v) => tile?.id && updateTile(tile.id, { headline: v }, false)}
        onCommit={(v) => tile?.id && updateTile(tile.id, { headline: v }, true)}
        placeholder="Your brand statement..."
      />
    </FloatingToolbar>
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col justify-end transition-colors duration-300 relative overflow-hidden"
      style={{
        backgroundColor: surfaceBg,
        padding: 'clamp(24px, 8%, 48px)',
        paddingBottom: 'clamp(28px, 10%, 52px)',
      }}
    >
      {/* Statement */}
      <h1
        style={{
          fontFamily: headlineFont,
          fontWeight: parseInt(typography.weightHeadline) || 700,
          fontSize: `${headlineSize}px`,
          lineHeight: getHeadlineLineHeight(typography),
          letterSpacing: getHeadlineTracking(typography),
          textTransform: getHeadlineTransform(typography) as React.CSSProperties['textTransform'],
          color: adaptiveText,
          textWrap: 'balance',
          maxWidth: shape === 'landscape' ? '38ch' : '22ch',
        }}
      >
        {statement}
      </h1>

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
