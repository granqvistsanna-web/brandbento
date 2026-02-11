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
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { getAdaptiveTextColor } from '@/utils/color';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { usePlacementTile } from '@/hooks/usePlacementTile';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale, getHeadlineTracking, getBodyTracking, getHeadlineLineHeight, getBodyLineHeight } from '@/utils/typography';
import { getPresetContent } from '@/data/tilePresetContent';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarDivider,
  ToolbarTileTypeGrid,
  ToolbarSurfaceSwatches,
  ToolbarTextInput,
  ToolbarTextArea,
  ToolbarLabel,
} from './FloatingToolbar';

interface EditorialTileProps {
  /** Grid placement ID — determines tile content and surface color */
  placementId?: string;
}

type TileShape = 'portrait' | 'square' | 'landscape';

export function EditorialTile({ placementId }: EditorialTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shape, setShape] = useState<TileShape>('square');

  // Shape detection — adapts layout between magazine compositions.
  // Ratio thresholds: > 1.8 = landscape (triggers two-column spread),
  // < 0.75 = portrait (tall, bottom-aligned), else square-ish.
  // Uses a higher landscape threshold (1.8 vs 1.4–1.6 in other tiles)
  // because the two-column editorial layout needs more horizontal room.
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
  const updateTile = useBrandStore((s) => s.updateTile);
  const swapTileType = useBrandStore((s) => s.swapTileType);
  const setTileSurface = useBrandStore((s) => s.setTileSurface);
  const fontPreview = useBrandStore((state) => state.fontPreview);
  const { tileId: placementTileId, tileType: placementTileType } = usePlacementTile(placementId);
  const tile = useBrandStore((state: BrandStore) => {
    if (placementTileId) return state.tiles.find((t) => t.id === placementTileId);
    if (placementTileType) return state.tiles.find((t) => t.type === placementTileType);
    return undefined;
  });
  const tileSurfaceIndex = useBrandStore((state) =>
    placementId ? state.tileSurfaces[placementId] : undefined
  );
  const { primary, secondary, weightHeadline, weightBody } = typography;
  const { text: textColor, bg, surfaces } = colors;

  // Apply font preview if active
  const primaryFont = fontPreview?.target === "primary" ? fontPreview.font : primary;
  const secondaryFont = fontPreview?.target === "secondary" ? fontPreview.font : secondary;

  const { fontFamily: headlineFont } = useGoogleFonts(primaryFont, getFontCategory(primaryFont));
  const { fontFamily: bodyFont } = useGoogleFonts(secondaryFont, getFontCategory(secondaryFont));

  const surfaceBg = resolveSurfaceColor({
    placementId,
    tileSurfaceIndex,
    surfaces,
    bg,
    defaultIndex: 1,
  });

  const adaptiveTextColor = getAdaptiveTextColor(surfaceBg, textColor, COLOR_DEFAULTS.TEXT_LIGHT);
  const typeScale = getTypeScale(typography);

  const isLandscape = shape === 'landscape';

  const presetCopy = getPresetContent(activePreset).editorial;

  // Merge tile content with preset defaults as fallback
  const tileContent = tile?.content || {};
  const pretitle = tileContent.subcopy || presetCopy.pretitle;
  const title = tileContent.headline || presetCopy.title;
  const body = tileContent.body || presetCopy.body;
  const copy = { ...presetCopy, pretitle, title, body };

  // Floating toolbar
  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);

  const toolbar = isFocused && anchorRect && (
    <FloatingToolbar anchorRect={anchorRect}>
      <ToolbarActions onShuffle={() => {}} />
      <ToolbarDivider />
      <ToolbarTileTypeGrid
        currentType={tile?.type || 'editorial'}
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
      <ToolbarTextInput
        label="Pretitle"
        value={pretitle as string}
        onChange={(v) => tile?.id && updateTile(tile.id, { subcopy: v }, false)}
        onCommit={(v) => tile?.id && updateTile(tile.id, { subcopy: v }, true)}
        placeholder="Category..."
      />
      <ToolbarTextInput
        label="Headline"
        value={title as string}
        onChange={(v) => tile?.id && updateTile(tile.id, { headline: v }, false)}
        onCommit={(v) => tile?.id && updateTile(tile.id, { headline: v }, true)}
        placeholder="Headline..."
      />
      <ToolbarTextArea
        label="Body"
        value={body as string}
        onChange={(v) => tile?.id && updateTile(tile.id, { body: v }, false)}
        onCommit={(v) => tile?.id && updateTile(tile.id, { body: v }, true)}
        placeholder="Body text..."
      />
    </FloatingToolbar>
  );

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
              style={{
                fontFamily: headlineFont,
                fontWeight: parseInt(weightHeadline) || 700,
                fontSize: `${clampFontSize(typeScale.step2)}px`,
                lineHeight: getHeadlineLineHeight(typography),
                letterSpacing: getHeadlineTracking(typography),
                color: adaptiveTextColor,
                textWrap: 'balance',
              }}
            >
              {copy.title}
            </h1>
          </div>

          {/* Right: body text */}
          <p
            style={{
              fontFamily: bodyFont,
              fontWeight: parseInt(weightBody) || 400,
              fontSize: `${clampFontSize(typeScale.stepMinus1, 11, 15)}px`,
              lineHeight: getBodyLineHeight(typography),
              letterSpacing: getBodyTracking(typography),
              color: adaptiveTextColor,
              opacity: 0.5,
              maxWidth: '26ch',
            }}
          >
            {copy.body}
          </p>
        </div>

        {toolbar}
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
          style={{
            fontFamily: headlineFont,
            fontWeight: parseInt(weightHeadline) || 700,
            fontSize: `${clampFontSize(typeScale.step2)}px`,
            lineHeight: getHeadlineLineHeight(typography),
            letterSpacing: getHeadlineTracking(typography),
            color: adaptiveTextColor,
            textWrap: 'balance',
            marginBottom: `${clampFontSize(typeScale.base * 0.55, 6, 14)}px`,
          }}
        >
          {copy.title}
        </h1>

        {/* Body — restrained, with limited measure */}
        <p
          style={{
            fontFamily: bodyFont,
            fontWeight: parseInt(weightBody) || 400,
            fontSize: `${clampFontSize(typeScale.stepMinus1, 11, 16)}px`,
            lineHeight: getBodyLineHeight(typography),
            letterSpacing: getBodyTracking(typography),
            color: adaptiveTextColor,
            opacity: 0.55,
            maxWidth: '28ch',
          }}
        >
          {copy.body}
        </p>
      </div>

      {toolbar}
    </div>
  );
}
