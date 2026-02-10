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
import { clampFontSize, getFontCategory, getTypeScale } from '@/utils/typography';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarLabel,
  ToolbarTextInput,
  ToolbarDivider,
} from './FloatingToolbar';

/* ─── Shuffle presets ─── */

const STAT_PRESETS = [
  { headline: '12M+', label: 'Active Users', body: 'Growing 23% year over year' },
  { headline: 'Est. 2019', label: 'Founded', body: 'Stockholm, Sweden' },
  { headline: '$4.2B', label: 'Revenue', body: 'FY 2025 annual report' },
  { headline: '99.9%', label: 'Uptime', body: 'Enterprise reliability guarantee' },
  { headline: '340+', label: 'Clients Worldwide', body: 'Across 40 countries' },
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
  const { bg, text, surfaces, primary } = colors;
  const surfaceBg = resolveSurfaceColor({ placementId, tileSurfaceIndex, surfaces, bg, defaultIndex: 0 });
  const adaptiveText = getAdaptiveTextColor(surfaceBg, text, COLOR_DEFAULTS.TEXT_LIGHT);

  /* ─── Typography ─── */
  const { fontFamily: headlineFont } = useGoogleFonts(typography.primary, getFontCategory(typography.primary));
  const { fontFamily: bodyFont } = useGoogleFonts(typography.secondary, getFontCategory(typography.secondary));
  const typeScale = getTypeScale(typography);

  /* ─── Content (with defaults) ─── */
  const tileContent = tile?.content || {};
  const statValue = tileContent.headline || '12M+';
  const statLabel = tileContent.label || 'Active Users';
  const detail = tileContent.body || 'Growing 23% year over year';

  /* ─── Toolbar ─── */
  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);

  const handleChange = useCallback((key: string, value: string) => {
    if (tile?.id) updateTile(tile.id, { [key]: value }, false);
  }, [updateTile, tile?.id]);

  const handleCommit = useCallback((key: string, value: string) => {
    if (tile?.id) updateTile(tile.id, { [key]: value }, true);
  }, [updateTile, tile?.id]);

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
    lineHeight: 1,
    letterSpacing: '-0.03em',
    color: adaptiveText,
    textWrap: 'balance',
  };

  const detailStyle: React.CSSProperties = {
    fontFamily: bodyFont,
    fontWeight: parseInt(typography.weightBody) || 400,
    fontSize: `${clampFontSize(typeScale.stepMinus2, 9, 14)}px`,
    color: adaptiveText,
    opacity: 0.38,
    lineHeight: 1.4,
  };

  /* ─── Toolbar JSX (shared between layouts) ─── */
  const toolbar = isFocused && anchorRect && (
    <FloatingToolbar anchorRect={anchorRect}>
      <ToolbarActions onShuffle={handleShuffle} />
      <ToolbarDivider />
      <ToolbarLabel>Stat</ToolbarLabel>
      <ToolbarTextInput
        label="Value"
        value={statValue}
        onChange={(v) => handleChange('headline', v)}
        onCommit={(v) => handleCommit('headline', v)}
      />
      <ToolbarTextInput
        label="Label"
        value={statLabel}
        onChange={(v) => handleChange('label', v)}
        onCommit={(v) => handleCommit('label', v)}
      />
      <ToolbarTextInput
        label="Detail"
        value={detail}
        onChange={(v) => handleChange('body', v)}
        onCommit={(v) => handleCommit('body', v)}
      />
    </FloatingToolbar>
  );

  /* ─── Landscape: side-by-side with accent bar ─── */
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
        {/* Vertical accent bar */}
        <div
          style={{
            width: 3,
            height: 32,
            backgroundColor: primary,
            borderRadius: 1.5,
            flexShrink: 0,
            marginRight: `clamp(14px, 4%, 28px)`,
          }}
        />

        <div className="flex items-center gap-[clamp(16px,6%,48px)] w-full">
          {/* Left: massive stat number */}
          <span style={{ ...statStyle, flexShrink: 0, whiteSpace: 'nowrap' }}>
            {statValue}
          </span>

          {/* Right: label + detail stacked */}
          <div className="flex flex-col" style={{ gap: `${clampFontSize(typeScale.base * 0.3, 3, 8)}px` }}>
            <span style={labelStyle}>{statLabel}</span>
            <span style={detailStyle}>{detail}</span>
          </div>
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
      {/* Accent bar — editorial signal */}
      <div
        style={{
          width: 28,
          height: 3,
          backgroundColor: primary,
          borderRadius: 1.5,
          marginBottom: `${clampFontSize(typeScale.base * 1, 12, 24)}px`,
        }}
      />

      {/* Label */}
      <span style={labelStyle}>{statLabel}</span>

      {/* Stat number — the star */}
      <span
        style={{
          ...statStyle,
          marginTop: `${clampFontSize(typeScale.base * 0.4, 4, 10)}px`,
        }}
      >
        {statValue}
      </span>

      {/* Thin rule — editorial separator */}
      <div
        style={{
          width: 20,
          height: 1,
          backgroundColor: adaptiveText,
          opacity: 0.12,
          marginTop: `${clampFontSize(typeScale.base * 0.8, 8, 20)}px`,
          marginBottom: `${clampFontSize(typeScale.base * 0.4, 4, 10)}px`,
        }}
      />

      {/* Detail line */}
      <span style={detailStyle}>{detail}</span>

      {toolbar}
    </div>
  );
}
