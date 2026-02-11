/**
 * Split Hero Tile Component
 *
 * Editorial split layout: image on one side, branded surface
 * with headline, body copy, and CTA on the other.
 * Inspired by fashion editorial spreads — image-led but balanced.
 *
 * Adapts layout based on tile shape:
 * - Landscape/square: side-by-side (image left, copy right)
 * - Portrait/narrow: stacked (image top, copy bottom)
 */
import { useRef, useState, useEffect } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { motion } from 'motion/react';
import { getAdaptiveTextColor } from '@/utils/color';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { usePlacementTile } from '@/hooks/usePlacementTile';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale, getHeadlineTracking, getBodyTracking, getHeadlineLineHeight, getBodyLineHeight, getHeadlineTransform } from '@/utils/typography';
import { getImageFilter } from '@/utils/imagery';
import { getPresetContent } from '@/data/tilePresetContent';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarTextInput,
  ToolbarTextArea,
  ToolbarDivider,
  ToolbarTileTypeGrid,
  ToolbarSurfaceSwatches,
  ToolbarLabel,
  getRandomShuffleImage,
} from './FloatingToolbar';

interface SplitHeroTileProps {
  /** Grid placement ID — determines tile content and surface color */
  placementId?: string;
}

type TileShape = 'portrait' | 'square' | 'landscape';


export function SplitHeroTile({ placementId }: SplitHeroTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shape, setShape] = useState<TileShape>('landscape');

  // Shape detection — switches between stacked (portrait) and
  // side-by-side (landscape/square) image+copy layout.
  // Ratio thresholds: < 0.75 = portrait (stacks image above copy),
  // > 1.4 = landscape (image left, copy right), else square (same as landscape).
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

  const { typography, colors, ui, imagery } = useBrandStore(
    useShallow((state: BrandStore) => ({
      typography: state.brand.typography,
      colors: state.brand.colors,
      ui: state.brand.ui,
      imagery: state.brand.imagery,
    }))
  );
  const imageFilter = getImageFilter(imagery.style, imagery.overlay);
  const activePreset = useBrandStore((state: BrandStore) => state.activePreset);
  const { tileId: placementTileId, tileType: placementTileType } = usePlacementTile(placementId);
  const tile = useBrandStore((state: BrandStore) => {
    if (placementTileId) return state.tiles.find((t) => t.id === placementTileId);
    if (placementTileType) return state.tiles.find((t) => t.type === placementTileType);
    return undefined;
  });
  const placementContent = useBrandStore((state: BrandStore) =>
    placementId ? state.placementContent?.[placementId] : undefined
  );
  const tileSurfaceIndex = useBrandStore((state: BrandStore) =>
    placementId ? state.tileSurfaces[placementId] : undefined
  );

  const content = { ...tile?.content, ...(placementContent || {}) };
  const industryCopy = getPresetContent(activePreset).splitHero;
  const imageUrl = content.image;
  const headline = content.headline || industryCopy.headline;
  const body = content.body || content.subcopy || industryCopy.body;
  const cta = content.cta || content.buttonLabel || industryCopy.cta;
  const ctaHidden = content.ctaHidden === true;

  const updateTile = useBrandStore((s) => s.updateTile);
  const swapTileType = useBrandStore((s) => s.swapTileType);
  const setTileSurface = useBrandStore((s) => s.setTileSurface);
  const fontPreview = useBrandStore((state) => state.fontPreview);

  const { bg, text, surfaces, primary } = colors;
  const surfaceBg = resolveSurfaceColor({
    placementId,
    tileSurfaceIndex,
    surfaces,
    bg,
    defaultIndex: 0,
  });
  const adaptiveText = getAdaptiveTextColor(surfaceBg, text, COLOR_DEFAULTS.TEXT_LIGHT);

  // Button styling from UI store (matches InterfaceTile)
  const btnColor = ui?.buttonColor || primary;
  const btnRadius = ui?.buttonRadius ?? 10;
  const btnStyle = ui?.buttonStyle ?? 'filled';
  const btnWeight = ui?.buttonWeight ?? 600;
  const btnUppercase = ui?.buttonUppercase ?? false;
  const btnLetterSpacing = ui?.buttonLetterSpacing ?? 0;

  const btnTextOnFilled = getAdaptiveTextColor(
    btnColor,
    COLOR_DEFAULTS.TEXT_DARK,
    COLOR_DEFAULTS.WHITE
  );

  const ctaBtnStyles = (() => {
    switch (btnStyle) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: btnColor,
          border: `1.5px solid ${btnColor}`,
        };
      case 'soft':
        return {
          backgroundColor: `color-mix(in srgb, ${btnColor} 12%, transparent)`,
          color: btnColor,
          border: 'none',
        };
      default:
        return {
          backgroundColor: btnColor,
          color: btnTextOnFilled,
          border: 'none',
        };
    }
  })();

  // Apply font preview if active
  const primaryFont = fontPreview?.target === "primary" ? fontPreview.font : typography.primary;
  const secondaryFont = fontPreview?.target === "secondary" ? fontPreview.font : typography.secondary;

  const { fontFamily: headlineFont } = useGoogleFonts(primaryFont, getFontCategory(primaryFont));
  const { fontFamily: bodyFont } = useGoogleFonts(secondaryFont, getFontCategory(secondaryFont));
  const typeScale = getTypeScale(typography);

  // Floating toolbar
  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);

  const isPortrait = shape === 'portrait';

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden transition-colors duration-300"
      style={{
        display: 'flex',
        flexDirection: isPortrait ? 'column' : 'row',
      }}
    >
      {/* Image half */}
      <div
        className="relative overflow-hidden"
        style={{
          [isPortrait ? 'height' : 'width']: '50%',
          flexShrink: 0,
        }}
      >
        {imageUrl ? (
          <motion.img
            src={imageUrl}
            alt={headline}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: imageFilter }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(145deg, ${colors.primary}dd, ${colors.accent || colors.primary}88)`,
            }}
          />
        )}
      </div>

      {/* Copy half */}
      <div
        className="flex flex-col justify-center overflow-hidden"
        style={{
          flex: 1,
          backgroundColor: surfaceBg,
          padding: 'clamp(16px, 6%, 32px)',
        }}
      >
        <h2
          style={{
            fontFamily: headlineFont,
            fontWeight: parseInt(typography.weightHeadline) || 700,
            fontSize: `${clampFontSize(typeScale.step3, 22, 54)}px`,
            lineHeight: getHeadlineLineHeight(typography),
            letterSpacing: getHeadlineTracking(typography),
            textTransform: getHeadlineTransform(typography) as React.CSSProperties['textTransform'],
            color: adaptiveText,
            textWrap: 'balance',
            marginBottom: `${clampFontSize(typeScale.base * 0.8, 10, 22)}px`,
          }}
        >
          {headline}
        </h2>

        <p
          style={{
            fontFamily: bodyFont,
            fontWeight: parseInt(typography.weightBody) || 400,
            fontSize: `${clampFontSize(typeScale.stepMinus1, 11, 15)}px`,
            lineHeight: getBodyLineHeight(typography),
            letterSpacing: getBodyTracking(typography),
            color: adaptiveText,
            opacity: 0.6,
            maxWidth: '32ch',
            marginBottom: `${clampFontSize(typeScale.base * 0.6, 8, 18)}px`,
          }}
        >
          {body}
        </p>

        {!ctaHidden && (
          <button
            className="self-start flex items-center justify-center"
            style={{
              fontFamily: bodyFont,
              fontWeight: btnWeight,
              fontSize: `${clampFontSize(typeScale.stepMinus1, 11, 14)}px`,
              textTransform: btnUppercase ? 'uppercase' : 'none',
              letterSpacing: btnUppercase
                ? `${Math.max(btnLetterSpacing, 0.04)}em`
                : btnLetterSpacing ? `${btnLetterSpacing}em` : undefined,
              borderRadius: btnRadius,
              padding: `${clampFontSize(typeScale.stepMinus1 * 0.55, 6, 10)}px ${clampFontSize(typeScale.step1 * 0.9, 14, 24)}px`,
              cursor: 'default',
              ...ctaBtnStyles,
            }}
          >
            {cta}
          </button>
        )}
      </div>

      {/* Floating toolbar when focused */}
      {isFocused && anchorRect && tile?.id && (
        <FloatingToolbar anchorRect={anchorRect}>
          <ToolbarActions
            onShuffle={() => {
              if (tile?.id) updateTile(tile.id, { image: getRandomShuffleImage(content.image) }, true);
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
            currentType={tile?.type || 'split-hero'}
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
            label="Headline"
            value={content.headline || ''}
            onChange={(v) => updateTile(tile!.id, { headline: v }, false)}
            onCommit={(v) => updateTile(tile!.id, { headline: v }, true)}
            placeholder="Headline"
          />
          <ToolbarTextArea
            label="Body"
            value={content.body || content.subcopy || ''}
            onChange={(v) => updateTile(tile!.id, { body: v }, false)}
            onCommit={(v) => updateTile(tile!.id, { body: v }, true)}
            placeholder="Body text"
          />
          <ToolbarTextInput
            label="CTA"
            value={content.cta || content.buttonLabel || ''}
            onChange={(v) => updateTile(tile!.id, { cta: v }, false)}
            onCommit={(v) => updateTile(tile!.id, { cta: v }, true)}
            placeholder="Button label"
          />
        </FloatingToolbar>
      )}
    </div>
  );
}
