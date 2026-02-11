/**
 * List Tile Component
 *
 * Unified list display with two variants:
 *
 * - **list** (default): Standalone list with section label,
 *   items with dividers, and action labels. Clean editorial feel.
 *
 * - **split**: Two-panel layout with image + overlaid brand text
 *   on one side, and a headed numbered list on the other.
 *   Adapts to portrait/landscape/square shapes.
 */
import { useRef, useState, useEffect } from 'react';
import { useBrandStore, type BrandStore, type Tile } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { motion } from 'motion/react';
import { getAdaptiveTextColor } from '@/utils/color';
import { COLOR_DEFAULTS, IMAGE_OVERLAY_TEXT, imageOverlayTextMuted } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { usePlacementTile } from '@/hooks/usePlacementTile';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale, getHeadlineTracking, getHeadlineLineHeight } from '@/utils/typography';
import { getImageFilter } from '@/utils/imagery';
import { getPresetContent } from '@/data/tilePresetContent';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarTextInput,
  ToolbarItemList,
  ToolbarDivider,
  ToolbarTileTypeGrid,
  ToolbarSurfaceSwatches,
  ToolbarLabel,
  getRandomShuffleImage,
} from './FloatingToolbar';

interface ListTileProps {
  placementId?: string;
  variant?: 'list' | 'split';
}

type TileShape = 'portrait' | 'square' | 'landscape';

export function ListTile({ placementId, variant = 'list' }: ListTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shape, setShape] = useState<TileShape>('landscape');

  // Shape detection — only needed for split variant (standalone is single-column).
  // Ratio thresholds: < 0.75 = portrait (stacks image above list),
  // > 1.4 = landscape (image left, list right), else square (same as landscape).
  useEffect(() => {
    if (variant !== 'split') return;
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
  }, [variant]);

  const { colors, typography, activePreset, imagery } = useBrandStore(
    useShallow((state: BrandStore) => ({
      colors: state.brand.colors,
      typography: state.brand.typography,
      activePreset: state.activePreset,
      imagery: state.brand.imagery,
    }))
  );
  const imageFilter = getImageFilter(imagery.style, imagery.overlay);
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
  const logoText = useBrandStore((state: BrandStore) => state.brand.logo?.text);

  const { bg, text, surfaces } = colors;
  const surfaceBg = resolveSurfaceColor({
    placementId,
    tileSurfaceIndex,
    surfaces,
    bg,
    defaultIndex: 1,
  });
  const adaptiveText = getAdaptiveTextColor(surfaceBg, text, COLOR_DEFAULTS.TEXT_LIGHT);
  const fontPreview = useBrandStore((state) => state.fontPreview);

  // Apply font preview if active
  const primaryFont = fontPreview?.target === "primary" ? fontPreview.font : typography.primary;
  const secondaryFont = fontPreview?.target === "secondary" ? fontPreview.font : typography.secondary;

  const { fontFamily: headlineFont } = useGoogleFonts(primaryFont, getFontCategory(primaryFont));
  const { fontFamily: bodyFont } = useGoogleFonts(secondaryFont, getFontCategory(secondaryFont));
  const typeScale = getTypeScale(typography);

  const updateTile = useBrandStore((s) => s.updateTile);
  const swapTileType = useBrandStore((s) => s.swapTileType);
  const setTileSurface = useBrandStore((s) => s.setTileSurface);

  // Floating toolbar
  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);

  const content = { ...tile?.content, ...(placementContent || {}) };

  const sharedToolbarTop = (
    <>
      <ToolbarTileTypeGrid
        currentType={tile?.type || (variant === 'split' ? 'split-list' : 'menu')}
        onTypeChange={(type) => tile?.id && swapTileType(tile.id, type)}
      />
      <ToolbarDivider />
      <ToolbarSurfaceSwatches
        surfaces={surfaces}
        bgColor={bg}
        currentIndex={tileSurfaceIndex}
        onSurfaceChange={(idx) => placementId && setTileSurface(placementId, idx)}
      />
    </>
  );

  if (variant === 'split') {
    return (
      <SplitLayout
        containerRef={containerRef}
        shape={shape}
        content={content}
        colors={colors}
        surfaceBg={surfaceBg}
        adaptiveText={adaptiveText}
        headlineFont={headlineFont}
        bodyFont={bodyFont}
        typeScale={typeScale}
        typography={typography}
        activePreset={activePreset}
        logoText={logoText}
        isFocused={isFocused}
        anchorRect={anchorRect}
        tile={tile}
        updateTile={updateTile}
        sharedToolbarTop={sharedToolbarTop}
        imageFilter={imageFilter}
      />
    );
  }

  return (
    <StandaloneLayout
      containerRef={containerRef}
      content={content}
      surfaceBg={surfaceBg}
      adaptiveText={adaptiveText}
      headlineFont={headlineFont}
      bodyFont={bodyFont}
      typeScale={typeScale}
      activePreset={activePreset}
      isFocused={isFocused}
      anchorRect={anchorRect}
      tile={tile}
      updateTile={updateTile}
      sharedToolbarTop={sharedToolbarTop}
    />
  );
}

/* ── Standalone list variant ──────────────────────────────── */

function StandaloneLayout({
  containerRef,
  content,
  surfaceBg,
  adaptiveText,
  headlineFont,
  bodyFont,
  typeScale,
  activePreset,
  isFocused,
  anchorRect,
  tile,
  updateTile,
  sharedToolbarTop,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  content: Record<string, unknown>;
  surfaceBg: string;
  adaptiveText: string;
  headlineFont: string;
  bodyFont: string;
  typeScale: ReturnType<typeof getTypeScale>;
  activePreset: string;
  isFocused: boolean;
  anchorRect: DOMRect | null;
  tile: Tile | undefined;
  updateTile: BrandStore['updateTile'];
  sharedToolbarTop: React.ReactNode;
}) {
  const industryDefaults = getPresetContent(activePreset).menu;
  const subcopy = (content.subcopy as string) || industryDefaults.subcopy;
  const items = (content.items as string[]) || industryDefaults.items;
  const actionLabel = ((content.buttonLabel as string) || industryDefaults.action).toUpperCase();

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col transition-colors duration-300 overflow-hidden"
      style={{ backgroundColor: surfaceBg, padding: 'clamp(16px, 6%, 24px)' }}
    >
      <div
        className="uppercase tracking-widest shrink-0"
        style={{
          color: adaptiveText,
          fontFamily: bodyFont,
          opacity: 0.5,
          fontSize: `${clampFontSize(typeScale.stepMinus2)}px`,
          marginBottom: 'clamp(6px, 3%, 12px)',
        }}
      >
        {subcopy}
      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-center overflow-hidden">
        <div className="shrink min-h-0">
          {items.slice(0, 4).map((item, index) => (
            <div key={`${item}-${index}`}>
              {index === 0 && (
                <div className="h-px w-full" style={{ backgroundColor: `color-mix(in srgb, ${adaptiveText} 15%, transparent)` }} />
              )}
              <div
                className="flex items-center justify-between gap-2"
                style={{ padding: `clamp(6px, 2.5%, 14px) 0` }}
              >
                <span
                  className="uppercase truncate"
                  style={{
                    color: adaptiveText,
                    fontFamily: headlineFont,
                    letterSpacing: '0.08em',
                    fontSize: `${clampFontSize(typeScale.step1, 14, 28)}px`,
                  }}
                >
                  {item}
                </span>
                <span
                  className="uppercase tracking-wider shrink-0"
                  style={{
                    color: adaptiveText,
                    opacity: 0.45,
                    fontFamily: bodyFont,
                    fontSize: `${clampFontSize(typeScale.stepMinus2, 9, 13)}px`,
                  }}
                >
                  {actionLabel}
                </span>
              </div>
              <div className="h-px w-full" style={{ backgroundColor: `color-mix(in srgb, ${adaptiveText} 15%, transparent)` }} />
            </div>
          ))}
        </div>
      </div>

      {isFocused && anchorRect && tile?.id && (
        <FloatingToolbar anchorRect={anchorRect}>
          <ToolbarActions
            onShuffle={() => {
              /* List tile has no image to shuffle */
            }}
          />
          <ToolbarDivider />
          {sharedToolbarTop}
          <ToolbarDivider />
          <ToolbarLabel>Content</ToolbarLabel>
          <ToolbarTextInput
            label="Label"
            value={(content.subcopy as string) || ''}
            onChange={(v) => updateTile(tile!.id, { subcopy: v }, false)}
            onCommit={(v) => updateTile(tile!.id, { subcopy: v }, true)}
            placeholder="Section label"
          />
          <ToolbarItemList
            label="Items"
            items={(content.items as string[]) || industryDefaults.items}
            onChange={(items) => updateTile(tile!.id, { items }, false)}
            onCommit={(items) => updateTile(tile!.id, { items }, true)}
          />
          <ToolbarTextInput
            label="Action"
            value={(content.buttonLabel as string) || ''}
            onChange={(v) => updateTile(tile!.id, { buttonLabel: v }, false)}
            onCommit={(v) => updateTile(tile!.id, { buttonLabel: v }, true)}
            placeholder="Action label"
          />
        </FloatingToolbar>
      )}
    </div>
  );
}

/* ── Split image + list variant ───────────────────────────── */

function SplitLayout({
  containerRef,
  shape,
  content,
  colors,
  surfaceBg,
  adaptiveText,
  headlineFont,
  bodyFont,
  typeScale,
  typography,
  activePreset,
  logoText,
  isFocused,
  anchorRect,
  tile,
  updateTile,
  sharedToolbarTop,
  imageFilter,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  shape: TileShape;
  content: Record<string, unknown>;
  colors: BrandStore['brand']['colors'];
  surfaceBg: string;
  adaptiveText: string;
  headlineFont: string;
  bodyFont: string;
  typeScale: ReturnType<typeof getTypeScale>;
  typography: BrandStore['brand']['typography'];
  activePreset: string;
  logoText: string | undefined;
  isFocused: boolean;
  anchorRect: DOMRect | null;
  tile: Tile | undefined;
  updateTile: BrandStore['updateTile'];
  sharedToolbarTop: React.ReactNode;
  imageFilter: string;
}) {
  const industryCopy = getPresetContent(activePreset).splitList;
  const imageUrl = content.image as string | undefined;
  const brandLabel = logoText || (content.label as string) || industryCopy.brandLabel;
  const headline = (content.headline as string) || industryCopy.headline;
  const listHeading = (content.overlayText as string) || industryCopy.listHeading;
  const items = (content.items as string[]) || industryCopy.items;

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
      {/* Image panel with overlaid text */}
      <div
        className="relative overflow-hidden"
        style={{
          [isPortrait ? 'height' : 'width']: isPortrait ? '55%' : '58%',
          flexShrink: 0,
        }}
      >
        {imageUrl ? (
          <motion.img
            src={imageUrl}
            alt={headline}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: imageFilter }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(160deg, ${colors.primary}dd, ${colors.accent || colors.primary}88)`,
            }}
          />
        )}

        {/* Gradient scrim for text */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.60) 100%)',
          }}
        />

        {/* Overlaid brand label + headline */}
        <div
          className="relative h-full w-full flex flex-col justify-end"
          style={{ padding: 'clamp(14px, 5%, 28px)' }}
        >
          <span
            className="uppercase tracking-widest"
            style={{
              fontFamily: bodyFont,
              fontWeight: parseInt(typography.weightBody) || 400,
              fontSize: `${clampFontSize(typeScale.stepMinus2, 8, 11)}px`,
              letterSpacing: '0.14em',
              color: imageOverlayTextMuted(0.6),
              marginBottom: `${clampFontSize(typeScale.base * 0.3, 4, 10)}px`,
            }}
          >
            {brandLabel}
          </span>
          <h2
            style={{
              fontFamily: headlineFont,
              fontWeight: parseInt(typography.weightHeadline) || 700,
              fontSize: `${clampFontSize(typeScale.step2, 18, 32)}px`,
              lineHeight: getHeadlineLineHeight(typography),
              letterSpacing: getHeadlineTracking(typography),
              color: IMAGE_OVERLAY_TEXT,
              whiteSpace: 'pre-line',
            }}
          >
            {headline}
          </h2>
        </div>
      </div>

      {/* List panel */}
      <div
        className="flex flex-col justify-center overflow-hidden"
        style={{
          flex: 1,
          backgroundColor: surfaceBg,
          padding: 'clamp(14px, 5%, 28px)',
        }}
      >
        <h3
          style={{
            fontFamily: headlineFont,
            fontWeight: parseInt(typography.weightHeadline) || 700,
            fontSize: `${clampFontSize(typeScale.base, 14, 22)}px`,
            lineHeight: getHeadlineLineHeight(typography),
            letterSpacing: getHeadlineTracking(typography),
            color: adaptiveText,
            marginBottom: `${clampFontSize(typeScale.base * 0.6, 8, 18)}px`,
            flexShrink: 0,
          }}
        >
          {listHeading}
        </h3>

        <div className="flex flex-col" style={{ gap: `${clampFontSize(typeScale.base * 0.35, 4, 10)}px` }}>
          {items.slice(0, 4).map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-baseline"
              style={{ gap: `${clampFontSize(typeScale.base * 0.35, 4, 10)}px` }}
            >
              <span
                style={{
                  fontFamily: bodyFont,
                  fontWeight: 500,
                  fontSize: `${clampFontSize(typeScale.stepMinus2, 8, 11)}px`,
                  color: adaptiveText,
                  opacity: 0.4,
                  flexShrink: 0,
                }}
              >
                [{index + 1}]
              </span>
              <span
                className="uppercase"
                style={{
                  fontFamily: bodyFont,
                  fontWeight: parseInt(typography.weightBody) || 400,
                  fontSize: `${clampFontSize(typeScale.stepMinus2, 9, 12)}px`,
                  letterSpacing: '0.06em',
                  color: adaptiveText,
                  opacity: 0.7,
                  lineHeight: 1.3,
                }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating toolbar when focused */}
      {isFocused && anchorRect && tile?.id && (
        <FloatingToolbar anchorRect={anchorRect}>
          <ToolbarActions
            onShuffle={() => {
              if (tile?.id) updateTile(tile.id, { image: getRandomShuffleImage(content.image as string) }, true);
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
          {sharedToolbarTop}
          <ToolbarDivider />
          <ToolbarLabel>Content</ToolbarLabel>
          <ToolbarTextInput
            label="Headline"
            value={(content.headline as string) || ''}
            onChange={(v) => updateTile(tile!.id, { headline: v }, false)}
            onCommit={(v) => updateTile(tile!.id, { headline: v }, true)}
            placeholder="Headline"
          />
          <ToolbarTextInput
            label="Heading"
            value={(content.overlayText as string) || ''}
            onChange={(v) => updateTile(tile!.id, { overlayText: v }, false)}
            onCommit={(v) => updateTile(tile!.id, { overlayText: v }, true)}
            placeholder="List heading"
          />
          <ToolbarItemList
            label="Items"
            items={(content.items as string[]) || industryCopy.items}
            onChange={(items) => updateTile(tile!.id, { items }, false)}
            onCommit={(items) => updateTile(tile!.id, { items }, true)}
          />
        </FloatingToolbar>
      )}
    </div>
  );
}
