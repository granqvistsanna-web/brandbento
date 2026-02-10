/**
 * Card Tile Component
 *
 * Versatile card with image, title, subtitle, badge, and detail.
 * Works for products, services, features, or any branded content.
 */
import { useCallback } from 'react';
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
  getRandomShuffleImage,
} from './FloatingToolbar';

interface CardTileProps {
  placementId?: string;
}

export function CardTile({ placementId }: CardTileProps) {
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

  const { bg, text, surfaces, primary } = colors;
  const surfaceBg = resolveSurfaceColor({
    placementId,
    tileSurfaceIndex,
    surfaces,
    bg,
    defaultIndex: 1,
  });
  const adaptiveText = getAdaptiveTextColor(surfaceBg, text, COLOR_DEFAULTS.TEXT_LIGHT);
  const { fontFamily: headlineFont } = useGoogleFonts(typography.primary, getFontCategory(typography.primary));
  const { fontFamily: bodyFont } = useGoogleFonts(typography.secondary, getFontCategory(typography.secondary));
  const typeScale = getTypeScale(typography);

  const content = tile?.content || {};
  const imageUrl = content.image;
  const title = content.label || 'Title';
  const subtitle = content.subcopy || 'Subtitle';
  const badge = content.body || 'Badge';
  const detail = content.price || 'Detail';

  const { isFocused, containerRef, anchorRect } = useTileToolbar(placementId);

  const handleChange = useCallback((key: string, value: string) => {
    if (tile?.id) updateTile(tile.id, { [key]: value }, false);
  }, [updateTile, tile?.id]);

  const handleCommit = useCallback((key: string, value: string) => {
    if (tile?.id) updateTile(tile.id, { [key]: value }, true);
  }, [updateTile, tile?.id]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex transition-colors duration-300"
      style={{ backgroundColor: surfaceBg, padding: 'clamp(10px, 4%, 20px)', gap: 'clamp(8px, 3%, 16px)' }}
    >
      <div className="relative w-[44%] min-w-[36%] max-w-[50%] overflow-hidden rounded-lg">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
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
              letterSpacing: '0.06em',
              fontSize: `${clampFontSize(typeScale.step1)}px`,
              textTransform: 'uppercase' as const,
              lineHeight: 1.15,
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
              lineHeight: 1.3,
            }}
          >
            {subtitle}
          </div>
          <span
            className="self-start rounded-full"
            style={{
              backgroundColor: `color-mix(in srgb, ${primary} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${primary} 20%, transparent)`,
              color: primary,
              fontFamily: bodyFont,
              fontWeight: 600,
              fontSize: `${clampFontSize(typeScale.stepMinus2, 9, 12)}px`,
              padding: 'clamp(1px, 0.5%, 3px) clamp(6px, 2%, 12px)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase' as const,
            }}
          >
            {badge}
          </span>
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

      {isFocused && anchorRect && (
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
          <ToolbarLabel>Card</ToolbarLabel>
          <ToolbarTextInput
            label="Title"
            value={title}
            onChange={(v) => handleChange('label', v)}
            onCommit={(v) => handleCommit('label', v)}
            placeholder="Title"
          />
          <ToolbarTextInput
            label="Subtitle"
            value={subtitle}
            onChange={(v) => handleChange('subcopy', v)}
            onCommit={(v) => handleCommit('subcopy', v)}
          />
          <ToolbarTextInput
            label="Badge"
            value={badge}
            onChange={(v) => handleChange('body', v)}
            onCommit={(v) => handleCommit('body', v)}
          />
          <ToolbarTextInput
            label="Detail"
            value={detail}
            onChange={(v) => handleChange('price', v)}
            onCommit={(v) => handleCommit('price', v)}
            placeholder="Detail"
          />
        </FloatingToolbar>
      )}
    </div>
  );
}
