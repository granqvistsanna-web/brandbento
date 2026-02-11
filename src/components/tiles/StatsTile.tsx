/**
 * Stats Tile Component
 *
 * A single hero stat — the kind you see on annual report covers,
 * landing page hero sections, or brand deck slides. One massive
 * number with a label and supporting detail line.
 *
 * Adapts layout based on tile shape:
 * - Portrait/Square: stacked, vertically centered
 * - Landscape: side-by-side, number left, label + detail right
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { getAdaptiveTextColor } from '@/utils/color';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale, getHeadlineTracking, getBodyTracking, getHeadlineLineHeight, getBodyLineHeight } from '@/utils/typography';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarDivider,
  ToolbarTileTypeGrid,
  ToolbarSurfaceSwatches,
  ToolbarTextInput,
  ToolbarLabel,
} from './FloatingToolbar';

/* ─── Shuffle presets ─── */

const STAT_PRESETS = [
  { headline: '12M+', label: 'Happy Humans', body: 'And counting, every single day' },
  { headline: 'Est. 2019', label: 'Founded', body: 'Started in a coffee shop. Stayed for the wifi.' },
  { headline: '$4.2B', label: 'Revenue', body: 'Not bad for a team that still argues about fonts' },
  { headline: '99.9%', label: 'Uptime', body: 'The 0.1% was a really long lunch' },
  { headline: '340+', label: 'Clients Worldwide', body: 'Six continents and one very loyal penguin' },
];

/* ─── Types ─── */

interface StatsTileProps {
  /** Grid placement ID — determines tile content and surface color */
  placementId?: string;
}

type TileShape = 'portrait' | 'square' | 'landscape';

/* ─── Component ─── */

export function StatsTile({ placementId }: StatsTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shape, setShape] = useState<TileShape>('square');

  /* Shape detection */
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

  /* ─── Store subscriptions ─── */
  const { colors, typography } = useBrandStore(
    useShallow((state: BrandStore) => ({
      colors: state.brand.colors,
      typography: state.brand.typography,
    }))
  );
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

  /* ─── Surface + text color ─── */
  const { bg, text, surfaces } = colors;
  const surfaceBg = resolveSurfaceColor({ placementId, tileSurfaceIndex, surfaces, bg, defaultIndex: 0 });
  const adaptiveText = getAdaptiveTextColor(surfaceBg, text, COLOR_DEFAULTS.TEXT_LIGHT);
  const fontPreview = useBrandStore((state) => state.fontPreview);

  /* ─── Typography ─── */
  // Apply font preview if active
  const primaryFont = fontPreview?.target === "primary" ? fontPreview.font : typography.primary;
  const secondaryFont = fontPreview?.target === "secondary" ? fontPreview.font : typography.secondary;

  const { fontFamily: headlineFont } = useGoogleFonts(primaryFont, getFontCategory(primaryFont));
  const { fontFamily: bodyFont } = useGoogleFonts(secondaryFont, getFontCategory(secondaryFont));
  const typeScale = getTypeScale(typography);

  /* ─── Content (with defaults) ─── */
  const tileContent = tile?.content || {};
  const statValue = tileContent.headline || '12M+';
  const statLabel = tileContent.label || 'Happy Humans';
  const detail = tileContent.body || 'And counting, every single day';

  /* ─── Toolbar ─── */
  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);

  const handleShuffle = useCallback(() => {
    if (!tile?.id) return;
    const candidates = STAT_PRESETS.filter((p) => p.headline !== statValue);
    const preset = candidates[Math.floor(Math.random() * candidates.length)];
    updateTile(tile.id, { headline: preset.headline, label: preset.label, body: preset.body }, true);
  }, [tile?.id, statValue, updateTile]);

  /* ─── Shared text styles ─── */
  const labelStyle: React.CSSProperties = {
    fontFamily: bodyFont,
    fontWeight: parseInt(typography.weightBody) || 400,
    fontSize: `${clampFontSize(typeScale.stepMinus1, 10, 16)}px`,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: adaptiveText,
    opacity: 0.45,
    lineHeight: 1.3,
  };

  const statStyle: React.CSSProperties = {
    fontFamily: headlineFont,
    fontWeight: parseInt(typography.weightHeadline) || 700,
    fontSize: `${clampFontSize(typeScale.step3 * 2, 36, 140)}px`,
    lineHeight: getHeadlineLineHeight(typography),
    letterSpacing: getHeadlineTracking(typography),
    color: adaptiveText,
    textWrap: 'balance',
  };

  const detailStyle: React.CSSProperties = {
    fontFamily: bodyFont,
    fontWeight: parseInt(typography.weightBody) || 400,
    fontSize: `${clampFontSize(typeScale.stepMinus2, 9, 14)}px`,
    color: adaptiveText,
    opacity: 0.38,
    lineHeight: getBodyLineHeight(typography),
    letterSpacing: getBodyTracking(typography),
  };

  /* ─── Toolbar JSX (shared between layouts) ─── */
  const toolbar = isFocused && anchorRect && (
    <FloatingToolbar anchorRect={anchorRect}>
      <ToolbarActions onShuffle={handleShuffle} />
      <ToolbarDivider />
      <ToolbarTileTypeGrid
        currentType={tile?.type || 'stats'}
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
        label="Stat"
        value={statValue}
        onChange={(v) => tile?.id && updateTile(tile.id, { headline: v }, false)}
        onCommit={(v) => tile?.id && updateTile(tile.id, { headline: v }, true)}
        placeholder="12M+"
      />
      <ToolbarTextInput
        label="Label"
        value={statLabel}
        onChange={(v) => tile?.id && updateTile(tile.id, { label: v }, false)}
        onCommit={(v) => tile?.id && updateTile(tile.id, { label: v }, true)}
        placeholder="Happy Humans"
      />
      <ToolbarTextInput
        label="Detail"
        value={detail}
        onChange={(v) => tile?.id && updateTile(tile.id, { body: v }, false)}
        onCommit={(v) => tile?.id && updateTile(tile.id, { body: v }, true)}
        placeholder="Supporting detail..."
      />
    </FloatingToolbar>
  );

  /* ─── Corner index — anchors the empty upper space ─── */
  const cornerIndex = (
    <span
      className="absolute select-none"
      style={{
        top: 'clamp(16px, 6%, 28px)',
        right: 'clamp(16px, 6%, 28px)',
        fontFamily: bodyFont,
        fontWeight: parseInt(typography.weightBody) || 400,
        fontSize: `${clampFontSize(typeScale.stepMinus2, 9, 11)}px`,
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
        color: adaptiveText,
        opacity: 0.25,
      }}
    >
      {'\u2014'}
    </span>
  );

  /* ─── Landscape: side-by-side ─── */
  if (shape === 'landscape') {
    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center transition-colors duration-300 relative overflow-hidden"
        style={{
          backgroundColor: surfaceBg,
          padding: 'clamp(20px, 8%, 40px)',
        }}
      >
        {/* Stat number */}
        <span style={{ ...statStyle, flexShrink: 0, whiteSpace: 'nowrap' }}>
          {statValue}
        </span>

        {/* Label + detail — separated from stat by generous gap */}
        <div
          className="flex flex-col"
          style={{
            gap: `${clampFontSize(typeScale.base * 0.3, 3, 8)}px`,
            marginLeft: 'clamp(16px, 5%, 40px)',
          }}
        >
          <span style={labelStyle}>{statLabel}</span>
          <span style={detailStyle}>{detail}</span>
        </div>

        {toolbar}
      </div>
    );
  }

  /* ─── Portrait / Square: bottom-weighted editorial composition ─── */
  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-start justify-end transition-colors duration-300 relative overflow-hidden"
      style={{
        backgroundColor: surfaceBg,
        padding: 'clamp(24px, 8%, 48px)',
        paddingBottom: 'clamp(28px, 12%, 56px)',
      }}
    >
      {cornerIndex}

      {/* Label */}
      <span style={labelStyle}>{statLabel}</span>

      {/* Stat number — the star. Generous top gap to separate from label. */}
      <span
        style={{
          ...statStyle,
          marginTop: `${clampFontSize(typeScale.base * 0.5, 5, 12)}px`,
        }}
      >
        {statValue}
      </span>

      {/* Detail line — generous pause after the number */}
      <span
        style={{
          ...detailStyle,
          marginTop: `${clampFontSize(typeScale.base * 1, 10, 24)}px`,
        }}
      >
        {detail}
      </span>

      {toolbar}
    </div>
  );
}
