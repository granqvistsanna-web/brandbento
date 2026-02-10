/**
 * Hero Tile Component
 *
 * Image-led hero with refined typographic overlay.
 * Supports two variants:
 * - 'hero' (default): bottom-aligned, left-aligned, 2 fields (headline, subcopy)
 * - 'overlay': centered/bottom-aligned based on shape, 3 fields (label, headline, body)
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { motion } from 'motion/react';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getLetterSpacing, getTypeScale } from '@/utils/typography';
import { IMAGE_OVERLAY_TEXT, imageOverlayTextMuted } from '@/utils/colorDefaults';
import { getPresetContent } from '@/data/tilePresetContent';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarLabel,
  ToolbarTextInput,
  ToolbarDivider,
  getRandomShuffleImage,
} from './FloatingToolbar';

interface HeroTileProps {
  /** Grid placement ID — determines tile content and surface color */
  placementId?: string;
  /** 'hero' = bottom-aligned left text; 'overlay' = centered cinematic */
  variant?: 'hero' | 'overlay';
}

type TileShape = 'portrait' | 'square' | 'landscape';

export function HeroTile({ placementId, variant = 'hero' }: HeroTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shape, setShape] = useState<TileShape>('landscape');

  const isOverlay = variant === 'overlay';

  // Shape detection for overlay variant.
  // Ratio thresholds: < 0.75 = portrait (tall/narrow, e.g. 3:4),
  // > 1.6 = landscape (wide, e.g. 16:10), else square-ish.
  useEffect(() => {
    if (!isOverlay) return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      const ratio = width / height;
      if (ratio < 0.75) setShape('portrait');
      else if (ratio > 1.6) setShape('landscape');
      else setShape('square');
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOverlay]);

  const { typography, colors } = useBrandStore(
    useShallow((state: BrandStore) => ({
      typography: state.brand.typography,
      colors: state.brand.colors,
    }))
  );
  const activePreset = useBrandStore((state: BrandStore) => state.activePreset);
  const updateTile = useBrandStore((s) => s.updateTile);
  const placementTileId = getPlacementTileId(placementId);
  const placementTileType = getPlacementTileType(placementId);
  const tile = useBrandStore((state: BrandStore) => {
    if (placementTileId) {
      return state.tiles.find((t) => t.id === placementTileId);
    }
    if (placementTileType) {
      return state.tiles.find((t) => t.type === placementTileType);
    }
    return undefined;
  });
  const placementContent = useBrandStore((state: BrandStore) =>
    placementId ? state.placementContent?.[placementId] : undefined
  );

  const content = { ...tile?.content, ...(placementContent || {}) };
  const imageUrl = content.image;

  // Overlay variant uses preset content; hero uses hardcoded defaults
  const overlayCopy = getPresetContent(activePreset).overlay;

  const headline = isOverlay
    ? (content.headline || overlayCopy.headline)
    : (content.headline || 'Your brand, on its best day.');
  const subcopy = isOverlay
    ? (content.body || overlayCopy.body)
    : (content.subcopy || 'Build a visual world that feels unmistakably you.');
  const label = isOverlay
    ? (content.label || content.subcopy || overlayCopy.label)
    : undefined;

  const spacing = getLetterSpacing(typography.letterSpacing);
  const { fontFamily: headlineFont } = useGoogleFonts(typography.primary, getFontCategory(typography.primary));
  const { fontFamily: bodyFont } = useGoogleFonts(typography.secondary, getFontCategory(typography.secondary));
  const typeScale = getTypeScale(typography);

  const isSpread = activePreset === 'spread';

  // Floating toolbar
  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);

  const handleTextChange = useCallback((key: string, value: string) => {
    if (tile?.id) updateTile(tile.id, { [key]: value }, false);
  }, [updateTile, tile?.id]);

  const handleTextCommit = useCallback((key: string, value: string) => {
    if (tile?.id) updateTile(tile.id, { [key]: value }, true);
  }, [updateTile, tile?.id]);

  // Shared image/toolbar actions
  const toolbarActions = (
    <ToolbarActions
      onShuffle={() => {
        if (!content.imageLocked) {
          updateTile(tile!.id, { image: getRandomShuffleImage(content.image) }, true);
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
  );

  // ─── OVERLAY VARIANT ────────────────────────────────────────
  if (isOverlay) {
    const isLandscape = shape === 'landscape';

    return (
      <div ref={containerRef} className="relative w-full h-full overflow-hidden">
        {imageUrl ? (
          <motion.img
            src={imageUrl}
            alt={headline}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(160deg, ${colors.primary}ee, ${colors.accent || colors.primary}99)`,
            }}
          />
        )}

        {/* Gradient scrim — stronger for overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.65) 100%)',
          }}
        />

        {/* Content — centered or bottom-aligned */}
        <div
          className="relative h-full w-full flex flex-col items-center"
          style={{
            padding: 'clamp(16px, 6%, 36px)',
            justifyContent: isLandscape ? 'center' : 'flex-end',
            textAlign: 'center',
          }}
        >
          <span
            className="uppercase tracking-widest"
            style={{
              fontFamily: bodyFont,
              fontWeight: parseInt(typography.weightBody) || 400,
              fontSize: `${clampFontSize(typeScale.stepMinus2, 9, 12)}px`,
              letterSpacing: '0.16em',
              color: imageOverlayTextMuted(0.65),
              marginBottom: `${clampFontSize(typeScale.base * 0.5, 6, 16)}px`,
            }}
          >
            {label}
          </span>

          <h1
            className="leading-[1.02]"
            style={{
              fontFamily: headlineFont,
              fontWeight: parseInt(typography.weightHeadline) || 700,
              fontSize: `${clampFontSize(typeScale.step2, 20, 36)}px`,
              letterSpacing: spacing,
              color: IMAGE_OVERLAY_TEXT,
              textWrap: 'balance',
              maxWidth: '16ch',
              marginBottom: `${clampFontSize(typeScale.base * 0.6, 8, 20)}px`,
            }}
          >
            {headline}
          </h1>

          <p
            className="leading-[1.45]"
            style={{
              fontFamily: bodyFont,
              fontWeight: parseInt(typography.weightBody) || 400,
              fontSize: `${clampFontSize(typeScale.stepMinus1, 11, 15)}px`,
              letterSpacing: spacing,
              color: imageOverlayTextMuted(0.6),
              maxWidth: '38ch',
            }}
          >
            {subcopy}
          </p>
        </div>

        {isFocused && anchorRect && (
          <FloatingToolbar anchorRect={anchorRect}>
            {toolbarActions}
            <ToolbarDivider />
            <ToolbarLabel>Content</ToolbarLabel>
            <ToolbarTextInput
              label="Label"
              value={label || ''}
              onChange={(v) => handleTextChange('subcopy', v)}
              onCommit={(v) => handleTextCommit('subcopy', v)}
              placeholder={overlayCopy.label}
            />
            <ToolbarTextInput
              label="Headline"
              value={headline}
              onChange={(v) => handleTextChange('headline', v)}
              onCommit={(v) => handleTextCommit('headline', v)}
              placeholder={overlayCopy.headline}
            />
            <ToolbarTextInput
              label="Body"
              value={subcopy}
              onChange={(v) => handleTextChange('body', v)}
              onCommit={(v) => handleTextCommit('body', v)}
              placeholder={overlayCopy.body}
            />
          </FloatingToolbar>
        )}
      </div>
    );
  }

  // ─── HERO VARIANT (default) ─────────────────────────────────
  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {imageUrl ? (
        <motion.img
          src={imageUrl}
          alt={headline}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(145deg, ${colors.primary}dd, ${colors.accent || colors.primary}88)`,
          }}
        />
      )}

      {/* Refined gradient overlay — heavier at bottom for text legibility */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.72) 100%)',
        }}
      />

      {/* Content — pinned to bottom with generous breathing room */}
      <div
        className="relative h-full w-full flex flex-col justify-end"
        style={{ padding: 'clamp(14px, 5%, 28px)', gap: 'clamp(4px, 1.5%, 10px)' }}
      >
        <h1
          className="leading-[1.08]"
          style={{
            fontFamily: headlineFont,
            fontWeight: parseInt(typography.weightHeadline) || 700,
            fontSize: `${clampFontSize(typeScale.step2, 18, 34)}px`,
            letterSpacing: isSpread ? '0.06em' : spacing,
            color: IMAGE_OVERLAY_TEXT,
            textTransform: isSpread ? 'uppercase' : 'none',
            textWrap: 'balance',
          }}
        >
          {headline}
        </h1>

        {subcopy && (
          <p
            className="leading-relaxed max-w-[34ch]"
            style={{
              fontFamily: bodyFont,
              fontWeight: parseInt(typography.weightBody) || 400,
              fontSize: `${clampFontSize(typeScale.stepMinus1, 11, 15)}px`,
              letterSpacing: isSpread ? '0.04em' : spacing,
              color: imageOverlayTextMuted(0.68),
              textTransform: isSpread ? 'uppercase' : 'none',
            }}
          >
            {subcopy}
          </p>
        )}
      </div>

      {isFocused && anchorRect && (
        <FloatingToolbar anchorRect={anchorRect}>
          {toolbarActions}
          <ToolbarDivider />
          <ToolbarLabel>Content</ToolbarLabel>
          <ToolbarTextInput
            label="Headline"
            value={headline}
            onChange={(v) => handleTextChange('headline', v)}
            onCommit={(v) => handleTextCommit('headline', v)}
            placeholder="Your brand, on its best day."
          />
          <ToolbarTextInput
            label="Subcopy"
            value={subcopy}
            onChange={(v) => handleTextChange('subcopy', v)}
            onCommit={(v) => handleTextCommit('subcopy', v)}
            placeholder="Build a visual world that feels unmistakably you."
          />
        </FloatingToolbar>
      )}
    </div>
  );
}
