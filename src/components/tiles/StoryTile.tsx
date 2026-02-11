/**
 * Story Tile Component
 *
 * Full-bleed image tile with centered text overlay and dark gradient scrim.
 * Designed to feel like a cinematic story frame — one image, one message.
 */
import { useRef, useCallback } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { usePlacementTile } from '@/hooks/usePlacementTile';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale, getHeadlineTracking, getBodyTracking, getHeadlineLineHeight, getBodyLineHeight } from '@/utils/typography';
import { getPresetContent } from '@/data/tilePresetContent';
import { getImageFilter } from '@/utils/imagery';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarDivider,
  ToolbarTileTypeGrid,
  ToolbarTextInput,
  ToolbarTextArea,
  ToolbarLabel,
  getRandomShuffleImage,
} from './FloatingToolbar';

/* ─── Types ─── */

interface StoryTileProps {
  placementId?: string;
}

/* ─── Component ─── */

export function StoryTile({ placementId }: StoryTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  /* ─── Store ─── */
  const { typography, imagery } = useBrandStore(
    useShallow((state: BrandStore) => ({
      typography: state.brand.typography,
      imagery: state.brand.imagery,
    }))
  );
  const activePreset = useBrandStore((s) => s.activePreset);
  const updateTile = useBrandStore((s) => s.updateTile);
  const swapTileType = useBrandStore((s) => s.swapTileType);
  const setPlacementContent = useBrandStore((s) => s.setPlacementContent);
  const { tileId: placementTileId, tileType: placementTileType } = usePlacementTile(placementId);
  const tile = useBrandStore((state: BrandStore) => {
    if (placementTileId) return state.tiles.find((t) => t.id === placementTileId);
    if (placementTileType) return state.tiles.find((t) => t.type === placementTileType);
    return undefined;
  });
  const placementContent = useBrandStore((state: BrandStore) =>
    placementId ? state.placementContent?.[placementId] : undefined
  );
  const fontPreview = useBrandStore((state) => state.fontPreview);
  const imageFilter = getImageFilter(imagery.style, imagery.overlay);

  /* ─── Typography ─── */
  const primaryFont = fontPreview?.target === "primary" ? fontPreview.font : typography.primary;
  const secondaryFont = fontPreview?.target === "secondary" ? fontPreview.font : typography.secondary;

  const { fontFamily: headlineFont } = useGoogleFonts(primaryFont, getFontCategory(primaryFont));
  const { fontFamily: bodyFont } = useGoogleFonts(secondaryFont, getFontCategory(secondaryFont));
  const typeScale = getTypeScale(typography);

  /* ─── Content ─── */
  const presetCopy = getPresetContent(activePreset).story;
  const tileContent = tile?.content || {};
  const imageUrl = placementContent?.image || tileContent.image || '/images/visualelectric-1740667020762.png';
  const isLocked = placementContent?.imageLocked ?? tileContent.imageLocked ?? false;
  const headline = tileContent.headline || presetCopy.headline;
  const body = tileContent.body || presetCopy.body;

  /* ─── Image handling ─── */
  const handleShuffle = useCallback(() => {
    const newImage = getRandomShuffleImage(imageUrl);
    if (placementId) {
      setPlacementContent(placementId, { image: newImage }, true);
    } else if (tile?.id) {
      updateTile(tile.id, { image: newImage }, true);
    }
  }, [placementId, imageUrl, tile?.id, setPlacementContent, updateTile]);

  const handleImageUpload = useCallback((dataUrl: string) => {
    if (placementId) {
      setPlacementContent(placementId, { image: dataUrl }, true);
    } else if (tile?.id) {
      updateTile(tile.id, { image: dataUrl }, true);
    }
  }, [placementId, tile?.id, setPlacementContent, updateTile]);

  const handleToggleLock = useCallback(() => {
    if (placementId) {
      setPlacementContent(placementId, { imageLocked: !isLocked }, true);
    } else if (tile?.id) {
      updateTile(tile.id, { imageLocked: !isLocked }, true);
    }
  }, [placementId, isLocked, tile?.id, setPlacementContent, updateTile]);

  /* ─── Toolbar ─── */
  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);

  const toolbar = isFocused && anchorRect && (
    <FloatingToolbar anchorRect={anchorRect}>
      <ToolbarActions
        onShuffle={handleShuffle}
        hasImage
        onImageUpload={handleImageUpload}
        imageLocked={isLocked}
        onToggleLock={handleToggleLock}
      />
      <ToolbarDivider />
      <ToolbarTileTypeGrid
        currentType={tile?.type || 'story'}
        onTypeChange={(type) => tile?.id && swapTileType(tile.id, type)}
      />
      <ToolbarDivider />
      <ToolbarLabel>Content</ToolbarLabel>
      <ToolbarTextInput
        label="Headline"
        value={headline}
        onChange={(v) => tile?.id && updateTile(tile.id, { headline: v }, false)}
        onCommit={(v) => tile?.id && updateTile(tile.id, { headline: v }, true)}
        placeholder="Story headline..."
      />
      <ToolbarTextArea
        label="Body"
        value={body}
        onChange={(v) => tile?.id && updateTile(tile.id, { body: v }, false)}
        onCommit={(v) => tile?.id && updateTile(tile.id, { body: v }, true)}
        placeholder="Story body text..."
      />
    </FloatingToolbar>
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
    >
      {/* Full-bleed background image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: imageFilter,
          transition: 'filter 0.3s ease',
        }}
      />

      {/* Dark gradient scrim */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 100%)',
        }}
      />

      {/* Centered text overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(20px, 8%, 48px)',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: headlineFont,
            fontWeight: parseInt(typography.weightHeadline) || 700,
            fontSize: `${clampFontSize(typeScale.step3, 18, 36)}px`,
            lineHeight: getHeadlineLineHeight(typography),
            letterSpacing: getHeadlineTracking(typography),
            color: '#fff',
            textWrap: 'balance',
            textShadow: '0 1px 8px rgba(0,0,0,0.3)',
            marginBottom: 'clamp(6px, 2%, 14px)',
            maxWidth: '20ch',
          }}
        >
          {headline}
        </h2>

        <p
          style={{
            fontFamily: bodyFont,
            fontWeight: parseInt(typography.weightBody) || 400,
            fontSize: `${clampFontSize(typeScale.stepMinus1, 10, 15)}px`,
            lineHeight: getBodyLineHeight(typography),
            letterSpacing: getBodyTracking(typography),
            color: 'rgba(255,255,255,0.75)',
            textShadow: '0 1px 4px rgba(0,0,0,0.2)',
            maxWidth: '28ch',
          }}
        >
          {body}
        </p>
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
          color: 'rgba(255,255,255,0.4)',
        }}
      >
        Story
      </span>

      {toolbar}
    </div>
  );
}
