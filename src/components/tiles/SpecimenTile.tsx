/**
 * Typography Specimen Tile Component
 *
 * Classic type specimen sheet — the full alphabet rendered in the
 * brand's primary font. The kind of thing you see in type foundry
 * catalogs or brand guideline books.
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { getAdaptiveTextColor } from '@/utils/color';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { usePlacementTile } from '@/hooks/usePlacementTile';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale, getHeadlineTracking, getHeadlineLineHeight } from '@/utils/typography';
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

const SPECIMEN_PRESETS = [
  'AäBbCcĐdEè\nFfGgHhIiJjKkLl\nMmNnØoPp\nQqRrSsTtŨuVv\nWwXxYyZż',
  'ABCDEFGHIJ\nKLMNOPQRST\nUVWXYZ',
  'abcdefghij\nklmnopqrst\nuvwxyz',
  '0123456789\n!@#$%&*()?\n€£¥¢§±×÷',
  'Aa Bb Cc Dd\nEe Ff Gg Hh\nIi Jj Kk Ll\nMm Nn Oo Pp',
];

/* ─── Types ─── */

interface SpecimenTileProps {
  placementId?: string;
}

/* ─── Component ─── */

export function SpecimenTile({ placementId }: SpecimenTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      setScale(Math.min(width, height) / 300);
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
  const { bg, text: textColor, surfaces } = colors;
  const surfaceBg = resolveSurfaceColor({ placementId, tileSurfaceIndex, surfaces, bg, defaultIndex: 0 });
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
  const tileContent = tile?.content || {};
  const characters = tileContent.headline || SPECIMEN_PRESETS[0];
  const label = tileContent.label || 'Typography';

  /* ─── Toolbar ─── */
  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);

  const handleShuffle = useCallback(() => {
    if (!tile?.id) return;
    const candidates = SPECIMEN_PRESETS.filter((p) => p !== characters);
    const preset = candidates[Math.floor(Math.random() * candidates.length)];
    updateTile(tile.id, { headline: preset }, true);
  }, [tile?.id, characters, updateTile]);

  const specimenSize = clampFontSize(typeScale.step3 * 1.2 * Math.min(scale, 1.5), 18, 64);

  const toolbar = isFocused && anchorRect && (
    <FloatingToolbar anchorRect={anchorRect}>
      <ToolbarActions onShuffle={handleShuffle} />
      <ToolbarDivider />
      <ToolbarTileTypeGrid
        currentType={tile?.type || 'specimen'}
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
        label="Characters"
        value={characters}
        onChange={(v) => tile?.id && updateTile(tile.id, { headline: v }, false)}
        onCommit={(v) => tile?.id && updateTile(tile.id, { headline: v }, true)}
        placeholder="AaBbCcDd..."
      />
    </FloatingToolbar>
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center justify-center transition-colors duration-300 relative overflow-hidden"
      style={{
        backgroundColor: surfaceBg,
        padding: 'clamp(20px, 8%, 40px)',
      }}
    >
      {/* Font name — small meta label */}
      <span
        className="absolute select-none"
        style={{
          top: 'clamp(16px, 6%, 28px)',
          right: 'clamp(16px, 6%, 28px)',
          fontFamily: bodyFont,
          fontWeight: parseInt(typography.weightBody) || 400,
          fontSize: `${clampFontSize(typeScale.stepMinus2, 9, 11)}px`,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: adaptiveText,
          opacity: 0.3,
        }}
      >
        {typography.primary}
      </span>

      {/* Alphabet specimen */}
      <div
        style={{
          fontFamily: headlineFont,
          fontWeight: parseInt(typography.weightHeadline) || 700,
          fontSize: `${specimenSize}px`,
          lineHeight: getHeadlineLineHeight(typography),
          letterSpacing: getHeadlineTracking(typography),
          color: adaptiveText,
          textAlign: 'center',
          whiteSpace: 'pre-line',
          textWrap: 'balance',
        }}
      >
        {characters}
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
