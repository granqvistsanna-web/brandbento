/**
 * Color Blocks Tile Component
 *
 * Abstract Mondrian-inspired geometric composition built from the
 * brand's color palette. Each block is a different palette color,
 * arranged in an asymmetric CSS grid. The featured color (primary)
 * gets a subtle highlight border.
 */
import { useRef, useState, useEffect } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { getAdaptiveTextColor } from '@/utils/color';
import { hexToHSL } from '@/utils/colorMapping';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { usePlacementTile } from '@/hooks/usePlacementTile';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale } from '@/utils/typography';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarDivider,
  ToolbarTileTypeGrid,
  ToolbarSurfaceSwatches,
} from './FloatingToolbar';

/* ─── Types ─── */

interface ColorBlocksTileProps {
  placementId?: string;
}

type TileShape = 'portrait' | 'square' | 'landscape';

/* ─── Component ─── */

export function ColorBlocksTile({ placementId }: ColorBlocksTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shape, setShape] = useState<TileShape>('square');

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      const ratio = width / height;
      if (ratio > 1.6) setShape('landscape');
      else if (ratio < 0.7) setShape('portrait');
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
  const surfaceBg = resolveSurfaceColor({ placementId, tileSurfaceIndex, surfaces, bg, defaultIndex: 0 });
  const adaptiveText = getAdaptiveTextColor(surfaceBg, textColor, COLOR_DEFAULTS.TEXT_LIGHT);
  const fontPreview = useBrandStore((state) => state.fontPreview);

  /* ─── Typography (for label) ─── */
  // Apply font preview if active
  const secondaryFontChoice = fontPreview?.target === "secondary" ? fontPreview.font : typography.secondary;

  const { fontFamily: bodyFont } = useGoogleFonts(secondaryFontChoice, getFontCategory(secondaryFontChoice));
  const typeScale = getTypeScale(typography);

  /* ─── Content ─── */
  const tileContent = tile?.content || {};
  const label = tileContent.label || 'Colour';

  /* ─── Build color blocks ─── */
  const blockColors = [
    primary,
    accent,
    surfaces?.[0] || bg,
    surfaces?.[1] || bg,
    surfaces?.[2] || primary,
    surfaces?.[3] || accent,
    bg,
    textColor,
  ];

  /* ─── Grid areas per shape ─── */
  const getGridStyle = (): React.CSSProperties => {
    const gap = 'clamp(3px, 0.8%, 6px)';

    if (shape === 'landscape') {
      return {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1.5fr 1fr',
        gridTemplateRows: '1.5fr 1fr 1fr',
        gap,
        width: '100%',
        height: '100%',
      };
    }
    if (shape === 'portrait') {
      return {
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr 1fr',
        gridTemplateRows: '1fr 1.5fr 1fr 1fr',
        gap,
        width: '100%',
        height: '100%',
      };
    }
    // Square
    return {
      display: 'grid',
      gridTemplateColumns: '1.5fr 1fr 1fr',
      gridTemplateRows: '1fr 1.5fr 1fr',
      gap,
      width: '100%',
      height: '100%',
    };
  };

  /* Grid area assignments — deterministic Mondrian-style placement */
  const getBlockAreas = (): { gridArea: string; color: string; featured?: boolean }[] => {
    if (shape === 'landscape') {
      return [
        { gridArea: '1 / 1 / 3 / 2', color: blockColors[0], featured: true }, // primary — tall left
        { gridArea: '1 / 2 / 2 / 3', color: blockColors[1] },                  // accent — top middle
        { gridArea: '1 / 3 / 2 / 5', color: blockColors[2] },                  // surface — top right wide
        { gridArea: '2 / 2 / 3 / 3', color: blockColors[3] },                  // surface2 — mid
        { gridArea: '2 / 3 / 4 / 4', color: blockColors[4] },                  // surface3 — mid-bottom
        { gridArea: '2 / 4 / 4 / 5', color: blockColors[5] },                  // surface4 — right col
        { gridArea: '3 / 1 / 4 / 2', color: blockColors[6] },                  // bg — bottom left
        { gridArea: '3 / 2 / 4 / 3', color: blockColors[7] },                  // text — bottom mid
      ];
    }
    if (shape === 'portrait') {
      return [
        { gridArea: '1 / 1 / 2 / 2', color: blockColors[2] },                  // surface — top left
        { gridArea: '1 / 2 / 2 / 4', color: blockColors[3] },                  // surface2 — top right wide
        { gridArea: '2 / 1 / 3 / 3', color: blockColors[0], featured: true }, // primary — big center
        { gridArea: '2 / 3 / 3 / 4', color: blockColors[1] },                  // accent — mid right
        { gridArea: '3 / 1 / 4 / 2', color: blockColors[4] },                  // surface3
        { gridArea: '3 / 2 / 5 / 3', color: blockColors[5] },                  // surface4 — tall
        { gridArea: '3 / 3 / 4 / 4', color: blockColors[7] },                  // text
        { gridArea: '4 / 1 / 5 / 2', color: blockColors[6] },                  // bg — bottom left
        { gridArea: '4 / 3 / 5 / 4', color: blockColors[1] },                  // accent repeat
      ];
    }
    // Square
    return [
      { gridArea: '1 / 1 / 2 / 2', color: blockColors[2] },                  // surface — top left
      { gridArea: '1 / 2 / 2 / 4', color: blockColors[3] },                  // surface2 — top right wide
      { gridArea: '2 / 1 / 3 / 3', color: blockColors[0], featured: true }, // primary — big center-left
      { gridArea: '2 / 3 / 3 / 4', color: blockColors[1] },                  // accent — mid right
      { gridArea: '3 / 1 / 4 / 2', color: blockColors[6] },                  // bg — bottom left
      { gridArea: '3 / 2 / 4 / 3', color: blockColors[7] },                  // text — bottom mid
      { gridArea: '3 / 3 / 4 / 4', color: blockColors[5] },                  // surface4 — bottom right
    ];
  };

  /* ─── Toolbar ─── */
  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);

  const toolbar = isFocused && anchorRect && (
    <FloatingToolbar anchorRect={anchorRect}>
      <ToolbarTileTypeGrid
        currentType={tile?.type || 'color-blocks'}
        onTypeChange={(type) => tile?.id && swapTileType(tile.id, type)}
      />
      <ToolbarDivider />
      <ToolbarSurfaceSwatches
        surfaces={surfaces}
        bgColor={bg}
        currentIndex={tileSurfaceIndex}
        onSurfaceChange={(idx) => placementId && setTileSurface(placementId, idx)}
      />
    </FloatingToolbar>
  );

  const blocks = getBlockAreas();
  const radius = 'clamp(3px, 1%, 8px)';

  return (
    <div
      ref={containerRef}
      className="w-full h-full transition-colors duration-300 relative overflow-hidden"
      style={{
        backgroundColor: surfaceBg,
        padding: 'clamp(12px, 4%, 24px)',
      }}
    >
      <div style={getGridStyle()}>
        {blocks.map((block, i) => {
          const { l } = hexToHSL(block.color);
          return (
            <div
              key={i}
              style={{
                gridArea: block.gridArea,
                backgroundColor: block.color,
                borderRadius: radius,
                transition: 'background-color 0.3s ease',
                ...(block.featured
                  ? {
                      boxShadow: `inset 0 0 0 3px ${l > 55 ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.25)'}`,
                    }
                  : {}),
              }}
            />
          );
        })}
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
