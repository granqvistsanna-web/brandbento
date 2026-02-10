/**
 * Pattern Tile Component
 *
 * Displays a repeating geometric pattern or custom tiled image from brand colors.
 * Think textile swatch, wallpaper sample, brand pattern asset.
 *
 * Five SVG pattern variants: stripes, dots, grid, chevrons, waves.
 * Plus custom image mode: upload any image and tile it as a repeating pattern.
 * Pattern color and scale derive from the brand store — never hardcoded.
 */
import { useRef, useState, useEffect, useCallback, useId } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { resolveSurfaceColor } from '@/utils/surface';
import { hexToHSL } from '@/utils/colorMapping';

import { getPlacementTileId, getPlacementTileType } from '@/config/placements';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarSlider,
  ToolbarLabel,
  ToolbarDivider,
} from './FloatingToolbar';

/* ─── Types ─── */

type PatternVariant = 'stripes' | 'dots' | 'grid' | 'chevrons' | 'waves';

const PATTERN_VARIANTS: PatternVariant[] = ['stripes', 'dots', 'grid', 'chevrons', 'waves'];

interface PatternTileProps {
  placementId?: string;
}

/* ─── Pattern renderers ─── */

function renderPatternContent(
  variant: PatternVariant,
  patternColor: string,
  unitSize: number,
) {
  switch (variant) {
    case 'stripes':
      return (
        <>
          <line
            x1="0"
            y1={unitSize}
            x2={unitSize}
            y2="0"
            stroke={patternColor}
            strokeWidth={unitSize * 0.12}
          />
          <line
            x1={-unitSize * 0.5}
            y1={unitSize * 0.5}
            x2={unitSize * 0.5}
            y2={-unitSize * 0.5}
            stroke={patternColor}
            strokeWidth={unitSize * 0.12}
          />
          <line
            x1={unitSize * 0.5}
            y1={unitSize * 1.5}
            x2={unitSize * 1.5}
            y2={unitSize * 0.5}
            stroke={patternColor}
            strokeWidth={unitSize * 0.12}
          />
        </>
      );

    case 'dots':
      return (
        <circle
          cx={unitSize / 2}
          cy={unitSize / 2}
          r={unitSize * 0.18}
          fill={patternColor}
        />
      );

    case 'grid':
      return (
        <>
          <line
            x1="0"
            y1="0"
            x2={unitSize}
            y2="0"
            stroke={patternColor}
            strokeWidth={1}
          />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2={unitSize}
            stroke={patternColor}
            strokeWidth={1}
          />
        </>
      );

    case 'chevrons':
      return (
        <polyline
          points={`0,${unitSize * 0.6} ${unitSize / 2},${unitSize * 0.25} ${unitSize},${unitSize * 0.6}`}
          fill="none"
          stroke={patternColor}
          strokeWidth={unitSize * 0.08}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );

    case 'waves':
      return (
        <path
          d={`M0,${unitSize * 0.5} Q${unitSize * 0.25},0 ${unitSize * 0.5},${unitSize * 0.5} Q${unitSize * 0.75},${unitSize} ${unitSize},${unitSize * 0.5}`}
          fill="none"
          stroke={patternColor}
          strokeWidth={unitSize * 0.08}
        />
      );
  }
}

/* ─── Mini pattern preview for toolbar swatch ─── */

function MiniPatternSwatch({
  variant,
  color,
  isActive,
  onClick,
}: {
  variant: PatternVariant;
  color: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const size = 20;
  const id = `mini-${variant}`;
  return (
    <button
      onClick={onClick}
      title={variant.charAt(0).toUpperCase() + variant.slice(1)}
      style={{
        width: 36,
        height: 32,
        borderRadius: 6,
        border: isActive ? '2px solid var(--accent)' : '1px solid var(--sidebar-border)',
        background: isActive ? 'var(--sidebar-bg)' : 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        transition: 'all 0.15s ease',
      }}
    >
      <svg width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={id} patternUnits="userSpaceOnUse" width={size / 2} height={size / 2}>
            {renderPatternContent(variant, color, size / 2)}
          </pattern>
        </defs>
        <rect width={size} height={size} fill={`url(#${id})`} rx={2} />
      </svg>
    </button>
  );
}

/* ─── Component ─── */

export function PatternTile({ placementId }: PatternTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [unitSize, setUnitSize] = useState(24);
  const patternUniqueId = useId();

  /* ── Brand store subscriptions ── */

  const { colors } = useBrandStore(
    useShallow((state: BrandStore) => ({
      colors: state.brand.colors,
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

  /* ── Derived values ── */

  const { bg, primary, surfaces } = colors;
  const surfaceBg = resolveSurfaceColor({
    placementId,
    tileSurfaceIndex,
    surfaces,
    bg,
    defaultIndex: 0,
  });

  const currentVariant: PatternVariant =
    (tile?.content?.patternVariant as PatternVariant) || 'stripes';
  const patternScale: number = tile?.content?.patternScale ?? 1;
  const patternImage: string | undefined = tile?.content?.patternImage;
  const patternImageLocked: boolean = tile?.content?.patternImageLocked ?? false;

  const primaryHsl = hexToHSL(primary || '#333333');
  const patternColor = `hsla(${primaryHsl.h}, ${primaryHsl.s}%, ${primaryHsl.l}%, 0.3)`;

  // Toolbar swatch preview color — slightly more opaque for visibility
  const swatchColor = `hsla(${primaryHsl.h}, ${primaryHsl.s}%, ${primaryHsl.l}%, 0.55)`;

  const scaledUnit = unitSize * patternScale;

  // Sanitised ID for SVG pattern ref
  const pid = `pattern-${patternUniqueId.replace(/:/g, '')}`;

  // Image tile size in px (controlled by zoom)
  const imageTileSize = Math.round(60 * patternScale);

  /* ── Toolbar ── */

  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);

  /* ── Responsive unit scaling via ResizeObserver ── */

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      const size = Math.max(16, Math.min(width, height) * 0.06);
      setUnitSize(size);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── Handlers ── */

  const handleShuffle = useCallback(() => {
    if (patternImage && !patternImageLocked) {
      // Clear custom image and cycle SVG variant
      const currentIdx = PATTERN_VARIANTS.indexOf(currentVariant);
      const next = PATTERN_VARIANTS[(currentIdx + 1) % PATTERN_VARIANTS.length];
      if (tile?.id) updateTile(tile.id, { patternVariant: next, patternImage: undefined }, true);
    } else if (!patternImage) {
      const currentIdx = PATTERN_VARIANTS.indexOf(currentVariant);
      const next = PATTERN_VARIANTS[(currentIdx + 1) % PATTERN_VARIANTS.length];
      if (tile?.id) updateTile(tile.id, { patternVariant: next }, true);
    }
  }, [currentVariant, patternImage, patternImageLocked, tile?.id, updateTile]);

  const handleVariantChange = useCallback(
    (v: string) => {
      // Switching to an SVG variant clears custom image
      if (tile?.id) updateTile(tile.id, { patternVariant: v, patternImage: undefined }, true);
    },
    [tile?.id, updateTile],
  );

  const handleScaleChange = useCallback(
    (v: number) => {
      if (tile?.id) updateTile(tile.id, { patternScale: v }, false);
    },
    [tile?.id, updateTile],
  );

  const handleScaleCommit = useCallback(
    (v: number) => {
      if (tile?.id) updateTile(tile.id, { patternScale: v }, true);
    },
    [tile?.id, updateTile],
  );

  const handleImageUpload = useCallback(
    (dataUrl: string) => {
      if (tile?.id) updateTile(tile.id, { patternImage: dataUrl }, true);
    },
    [tile?.id, updateTile],
  );

  const handleToggleLock = useCallback(() => {
    if (tile?.id) updateTile(tile.id, { patternImageLocked: !patternImageLocked }, true);
  }, [tile?.id, patternImageLocked, updateTile]);

  /* ── Render ── */

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
    >
      {/* Surface background */}
      <div className="absolute inset-0" style={{ backgroundColor: surfaceBg }} />

      {/* Custom image pattern */}
      {patternImage ? (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${patternImage})`,
            backgroundRepeat: 'repeat',
            backgroundSize: `${imageTileSize}px ${imageTileSize}px`,
            imageRendering: patternScale < 0.8 ? 'auto' : undefined,
          }}
        />
      ) : (
        /* SVG pattern overlay */
        <svg
          width="100%"
          height="100%"
          className="absolute inset-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id={pid}
              patternUnits="userSpaceOnUse"
              width={scaledUnit}
              height={scaledUnit}
            >
              {renderPatternContent(currentVariant, patternColor, scaledUnit)}
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${pid})`} />
        </svg>
      )}

      {/* Floating toolbar */}
      {isFocused && anchorRect && (
        <FloatingToolbar anchorRect={anchorRect} width={240}>
          <ToolbarActions
            onShuffle={handleShuffle}
            hasImage
            imageLocked={patternImageLocked}
            onToggleLock={handleToggleLock}
            onImageUpload={handleImageUpload}
          />
          <ToolbarDivider />

          {/* Pattern variant swatches */}
          <ToolbarLabel>Pattern</ToolbarLabel>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {PATTERN_VARIANTS.map((v) => (
              <MiniPatternSwatch
                key={v}
                variant={v}
                color={swatchColor}
                isActive={!patternImage && currentVariant === v}
                onClick={() => handleVariantChange(v)}
              />
            ))}
          </div>

          <ToolbarDivider />

          {/* Zoom slider */}
          <ToolbarSlider
            label="Zoom"
            value={patternScale}
            min={0.3}
            max={4}
            step={0.1}
            displayValue={`${Math.round(patternScale * 100)}%`}
            onChange={handleScaleChange}
            onCommit={handleScaleCommit}
          />
        </FloatingToolbar>
      )}
    </div>
  );
}
