/**
 * Card Tile Component
 *
 * Product card with image, title, subtitle, and price.
 * Stacks vertically in portrait, side-by-side in landscape.
 */

import { useState, useEffect } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { getAdaptiveTextColor } from '@/utils/color';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale, getHeadlineTracking, getBodyTracking, getHeadlineLineHeight, getBodyLineHeight, getHeadlineTransform } from '@/utils/typography';
import { getImageFilter } from '@/utils/imagery';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarTextInput,
  ToolbarDivider,
  ToolbarTileTypeGrid,
  ToolbarSurfaceSwatches,
  ToolbarLabel,
  getRandomShuffleImage,
} from './FloatingToolbar';

type TileShape = 'portrait' | 'square' | 'landscape';

interface CardTileProps {
  placementId?: string;
}

export function CardTile({ placementId }: CardTileProps) {
  const { colors, typography, imagery } = useBrandStore(
    useShallow((state: BrandStore) => ({
      colors: state.brand.colors,
      typography: state.brand.typography,
      imagery: state.brand.imagery,
    }))
  );
  const imageFilter = getImageFilter(imagery.style, imagery.overlay);
  const updateTile = useBrandStore((s) => s.updateTile);
  const swapTileType = useBrandStore((s) => s.swapTileType);
  const setTileSurface = useBrandStore((s) => s.setTileSurface);
  const fontPreview = useBrandStore((state) => state.fontPreview);
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

  const { bg, text, surfaces, primary } = colors;
  const surfaceBg = resolveSurfaceColor({
    placementId,
    tileSurfaceIndex,
    surfaces,
    bg,
    defaultIndex: 1,
  });
  const adaptiveText = getAdaptiveTextColor(surfaceBg, text, COLOR_DEFAULTS.TEXT_LIGHT);

  // Apply font preview if active
  const primaryFont = fontPreview?.target === "primary" ? fontPreview.font : typography.primary;
  const secondaryFont = fontPreview?.target === "secondary" ? fontPreview.font : typography.secondary;

  const { fontFamily: headlineFont } = useGoogleFonts(primaryFont, getFontCategory(primaryFont));
  const { fontFamily: bodyFont } = useGoogleFonts(secondaryFont, getFontCategory(secondaryFont));
  const typeScale = getTypeScale(typography);

  const content = tile?.content || {};
  const imageUrl = content.image;
  const title = content.label || 'The Classic';
  const subtitle = content.subcopy || 'Hand-finished acetate frame';
  const detail = content.price || '$128';

  const { isFocused, containerRef, anchorRect } = useTileToolbar(placementId);

  const [shape, setShape] = useState<TileShape>('landscape');

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      const ratio = width / height;
      if (ratio < 0.75) setShape('portrait');
      else if (ratio > 1.4) setShape('landscape');
      else setShape('square');
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isPortrait = shape === 'portrait';

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex transition-colors duration-300"
      style={{
        backgroundColor: surfaceBg,
        padding: 'clamp(10px, 4%, 20px)',
        gap: 'clamp(8px, 3%, 16px)',
        flexDirection: isPortrait ? 'column' : 'row',
      }}
    >
      <div
        className="relative overflow-hidden rounded-lg"
        style={{
          ...(isPortrait
            ? { width: '100%', height: '55%', flexShrink: 0 }
            : { width: '44%', minWidth: '36%', maxWidth: '50%' }),
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: imageFilter }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(145deg, ${primary || surfaceBg}dd, ${primary || surfaceBg}66)`,
            }}
          />
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center gap-2.5">
        <div className="flex flex-col gap-1.5">
          <div
            style={{
              color: adaptiveText,
              fontFamily: headlineFont,
              fontWeight: parseInt(typography.weightHeadline) || 700,
              letterSpacing: getHeadlineTracking(typography),
              fontSize: `${clampFontSize(typeScale.step1)}px`,
              textTransform: getHeadlineTransform(typography) as React.CSSProperties['textTransform'],
              lineHeight: getHeadlineLineHeight(typography),
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: adaptiveText,
              opacity: 0.55,
              fontFamily: bodyFont,
              fontSize: `${clampFontSize(typeScale.stepMinus1)}px`,
              lineHeight: getBodyLineHeight(typography),
              letterSpacing: getBodyTracking(typography),
            }}
          >
            {subtitle}
          </div>
        </div>
        <div
          style={{
            color: primary || adaptiveText,
            fontFamily: headlineFont,
            fontWeight: 600,
            letterSpacing: '0.02em',
            fontSize: `${clampFontSize(typeScale.base)}px`,
          }}
        >
          {detail}
        </div>
      </div>

      {isFocused && anchorRect && tile?.id && (
        <FloatingToolbar anchorRect={anchorRect}>
          <ToolbarActions
            onShuffle={() => {
              if (tile?.id && !content.imageLocked) {
                updateTile(tile.id, { image: getRandomShuffleImage(content.image) }, true);
              }
            }}
            hasImage
            imageLocked={!!content.imageLocked}
            onToggleLock={() => {
              if (tile?.id) updateTile(tile.id, { imageLocked: !content.imageLocked }, true);
            }}
            onImageUpload={(dataUrl) => {
              if (tile?.id) updateTile(tile.id, { image: dataUrl }, true);
            }}
          />
          <ToolbarDivider />
          <ToolbarTileTypeGrid
            currentType={tile?.type || 'product'}
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
            label="Title"
            value={content.label || ''}
            onChange={(v) => updateTile(tile!.id, { label: v }, false)}
            onCommit={(v) => updateTile(tile!.id, { label: v }, true)}
            placeholder="Product name"
          />
          <ToolbarTextInput
            label="Subtitle"
            value={content.subcopy || ''}
            onChange={(v) => updateTile(tile!.id, { subcopy: v }, false)}
            onCommit={(v) => updateTile(tile!.id, { subcopy: v }, true)}
            placeholder="Description"
          />
          <ToolbarTextInput
            label="Price"
            value={content.price || ''}
            onChange={(v) => updateTile(tile!.id, { price: v }, false)}
            onCommit={(v) => updateTile(tile!.id, { price: v }, true)}
            placeholder="$0.00"
          />
        </FloatingToolbar>
      )}
    </div>
  );
}
