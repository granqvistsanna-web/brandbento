/**
 * Hero Tile Component
 *
 * Bold, headline-only atmospheric tile with three variation modes:
 * - 'image': Image only, no text
 * - 'image-headline' (default): Image background + headline text
 * - 'solid-headline': Colored surface + headline (no image)
 *
 * Provides granular controls for typography, positioning, and overlay treatment.
 */
import { useRef, useCallback } from 'react';
import { useBrandStore, type BrandStore, type TileContent } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { motion } from 'motion/react';
import { usePlacementTile } from '@/hooks/usePlacementTile';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale, getHeadlineTracking, getHeadlineLineHeight, getHeadlineTransform } from '@/utils/typography';
import { IMAGE_OVERLAY_TEXT } from '@/utils/colorDefaults';
import { getImageFilter } from '@/utils/imagery';
import { getPresetContent } from '@/data/tilePresetContent';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarTextInput,
  ToolbarDivider,
  ToolbarTileTypeGrid,
  ToolbarLabel,
  ToolbarSlider,
  ToolbarSegmented,
  ToolbarColorPicker,
  ToolbarToggle,
  getRandomShuffleImage,
} from './FloatingToolbar';

interface HeroTileProps {
  /** Grid placement ID — determines tile content and surface color */
  placementId?: string;
  /** 'hero' or 'overlay' — determines which preset content key to use for fallback defaults */
  variant?: 'hero' | 'overlay';
}

export function HeroTile({ placementId, variant = 'hero' }: HeroTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const isOverlay = variant === 'overlay';

  // Shape detection removed - not needed for current simplified design

  const { typography, colors, imagery } = useBrandStore(
    useShallow((state: BrandStore) => ({
      typography: state.brand.typography,
      colors: state.brand.colors,
      imagery: state.brand.imagery,
    }))
  );
  const imageFilter = getImageFilter(imagery.style, imagery.overlay);
  const activePreset = useBrandStore((state: BrandStore) => state.activePreset);
  const updateTile = useBrandStore((s) => s.updateTile);
  const swapTileType = useBrandStore((s) => s.swapTileType);
  const fontPreview = useBrandStore((state: BrandStore) => state.fontPreview);
  const { tileId: placementTileId, tileType: placementTileType } = usePlacementTile(placementId);
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

  // Fallback defaults from preset content
  const presetContent = getPresetContent(activePreset);
  const defaultHeadline = isOverlay
    ? presetContent.overlay.headline
    : 'Your brand, on its best day.';
  const headline = content.headline || defaultHeadline;

  // Read hero control fields with sensible defaults
  const variation = content.heroVariation || 'image-headline';
  const fontWeight = content.heroFontWeight || parseInt(typography.weightHeadline) || 700;
  const fontScale = content.heroFontScale ?? 1.0;
  const tracking = content.heroTracking;  // undefined = use brand default
  const lineHeight = content.heroLineHeight;  // undefined = use brand default
  const textColor = content.heroTextColor;  // undefined = auto
  const textAlign = (content.heroTextAlign || 'left') as React.CSSProperties['textAlign'];
  const alignH = content.heroAlignH || 'left';
  const alignV = content.heroAlignV || 'bottom';
  const padding = content.heroPadding ?? 6;
  const maxWidth = content.heroMaxWidth;  // undefined = no constraint
  const overlayEnabled = content.heroOverlayEnabled ?? true;
  const overlayColor = content.heroOverlayColor || '#000000';
  const overlayOpacity = content.heroOverlayOpacity ?? 50;
  const overlayGradient = content.heroOverlayGradient;
  const blendMode = content.heroBlendMode || 'normal';

  // Apply font preview if active
  const primaryFont = fontPreview?.target === "primary" ? fontPreview.font : typography.primary;

  const { fontFamily: headlineFont } = useGoogleFonts(primaryFont, getFontCategory(primaryFont));
  const typeScale = getTypeScale(typography);

  // Floating toolbar
  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);

  // Toolbar content change handler
  const handleContentChange = useCallback((updates: Partial<TileContent>, commit: boolean) => {
    if (tile?.id) updateTile(tile.id, updates, commit);
  }, [tile?.id, updateTile]);

  // Convert opacity (0-100) to hex alpha
  const toHexAlpha = (pct: number) => Math.round((pct / 100) * 255).toString(16).padStart(2, '0');

  // Determine text color based on variation
  const resolvedTextColor = variation === 'solid-headline'
    ? (textColor || colors.text)
    : (textColor || IMAGE_OVERLAY_TEXT);

  // Shared image/toolbar actions (only show for image variations)
  const showImageActions = variation === 'image' || variation === 'image-headline';
  const toolbarActions = showImageActions ? (
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
  ) : null;

  // Build overlay gradient or solid
  let overlayBackground: string | undefined;
  if (overlayEnabled && (variation === 'image' || variation === 'image-headline')) {
    if (overlayGradient) {
      const alpha1 = toHexAlpha(overlayOpacity * 0.5);
      const alpha2 = toHexAlpha(overlayOpacity);
      overlayBackground = `linear-gradient(180deg, ${overlayGradient.color1}${alpha1} 0%, ${overlayGradient.color2}${alpha2} 100%)`;
    } else {
      const alpha1 = toHexAlpha(overlayOpacity * 0.3);
      const alpha2 = toHexAlpha(overlayOpacity * 0.6);
      const alpha3 = toHexAlpha(overlayOpacity);
      overlayBackground = `linear-gradient(180deg, ${overlayColor}${alpha1} 0%, ${overlayColor}${alpha2} 60%, ${overlayColor}${alpha3} 100%)`;
    }
  }

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* Image layer (for 'image' and 'image-headline' variations) */}
      {(variation === 'image' || variation === 'image-headline') && (
        <>
          {imageUrl ? (
            <motion.img
              src={imageUrl}
              alt={headline}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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

          {/* Overlay layer */}
          {overlayBackground && (
            <div
              className="absolute inset-0"
              style={{
                background: overlayBackground,
                mixBlendMode: blendMode as React.CSSProperties['mixBlendMode'],
              }}
            />
          )}
        </>
      )}

      {/* Solid background (for 'solid-headline' variation) */}
      {variation === 'solid-headline' && (
        <div
          className="absolute inset-0"
          style={{
            background: colors.primary,
          }}
        />
      )}

      {/* Headline layer (for 'image-headline' and 'solid-headline' variations) */}
      {(variation === 'image-headline' || variation === 'solid-headline') && (
        <div
          className="relative h-full w-full flex flex-col"
          style={{
            padding: `clamp(12px, ${padding}%, 48px)`,
            alignItems: alignH === 'left' ? 'flex-start' : alignH === 'center' ? 'center' : 'flex-end',
            justifyContent: alignV === 'top' ? 'flex-start' : alignV === 'center' ? 'center' : 'flex-end',
          }}
        >
          <h1
            style={{
              fontFamily: headlineFont,
              fontWeight,
              fontSize: `${clampFontSize(typeScale.step3 * fontScale, 18, 72)}px`,
              lineHeight: lineHeight ?? getHeadlineLineHeight(typography),
              letterSpacing: tracking !== undefined ? `${tracking}em` : getHeadlineTracking(typography),
              textTransform: getHeadlineTransform(typography) as React.CSSProperties['textTransform'],
              color: resolvedTextColor,
              textAlign,
              textWrap: 'balance',
              maxWidth: maxWidth ? `${maxWidth}ch` : undefined,
            }}
          >
            {headline}
          </h1>
        </div>
      )}

      {isFocused && anchorRect && tile?.id && (
        <FloatingToolbar anchorRect={anchorRect}>
          {toolbarActions}
          {toolbarActions && <ToolbarDivider />}
          <ToolbarTileTypeGrid
            currentType={tile?.type || variant}
            onTypeChange={(type) => tile?.id && swapTileType(tile.id, type)}
          />
          <ToolbarDivider />

          {/* Variation section */}
          <ToolbarLabel>Variation</ToolbarLabel>
          <ToolbarSegmented
            label="Mode"
            value={variation}
            options={[
              { value: 'image', label: 'Image' },
              { value: 'image-headline', label: 'Hero' },
              { value: 'solid-headline', label: 'Solid' },
            ]}
            onChange={(v) => handleContentChange({ heroVariation: v as typeof variation }, true)}
          />

          {/* Content section (only when variation !== 'image') */}
          {variation !== 'image' && (
            <>
              <ToolbarDivider />
              <ToolbarLabel>Content</ToolbarLabel>
              <ToolbarTextInput
                label="Headline"
                value={content.headline || ''}
                onChange={(v) => handleContentChange({ headline: v }, false)}
                onCommit={(v) => handleContentChange({ headline: v }, true)}
                placeholder="Headline"
              />
            </>
          )}

          {/* Typography section (only when variation !== 'image') */}
          {variation !== 'image' && (
            <>
              <ToolbarDivider />
              <ToolbarLabel>Typography</ToolbarLabel>
              <ToolbarSegmented
                label="Weight"
                value={String(fontWeight)}
                options={[
                  { value: '400', label: 'Regular' },
                  { value: '600', label: 'Semi' },
                  { value: '700', label: 'Bold' },
                  { value: '800', label: 'Extra' },
                  { value: '900', label: 'Black' },
                ]}
                onChange={(v) => handleContentChange({ heroFontWeight: parseInt(v) }, true)}
              />
              <ToolbarSlider
                label="Size"
                min={0.5}
                max={2.0}
                step={0.05}
                value={fontScale}
                displayValue={`${Math.round(fontScale * 100)}%`}
                onChange={(v) => handleContentChange({ heroFontScale: v }, false)}
                onCommit={(v) => handleContentChange({ heroFontScale: v }, true)}
              />
              <ToolbarSlider
                label="Tracking"
                min={-0.06}
                max={0.2}
                step={0.005}
                value={tracking ?? 0}
                displayValue={`${(tracking ?? 0).toFixed(3)}em`}
                onChange={(v) => handleContentChange({ heroTracking: v }, false)}
                onCommit={(v) => handleContentChange({ heroTracking: v }, true)}
              />
              <ToolbarSlider
                label="Leading"
                min={0.8}
                max={1.5}
                step={0.05}
                value={lineHeight ?? getHeadlineLineHeight(typography)}
                displayValue={`${(lineHeight ?? getHeadlineLineHeight(typography)).toFixed(2)}`}
                onChange={(v) => handleContentChange({ heroLineHeight: v }, false)}
                onCommit={(v) => handleContentChange({ heroLineHeight: v }, true)}
              />
              <ToolbarColorPicker
                label="Text Color"
                color={resolvedTextColor}
                autoColor={variation === 'solid-headline' ? colors.text : IMAGE_OVERLAY_TEXT}
                paletteColors={[colors.text, colors.primary, colors.accent, IMAGE_OVERLAY_TEXT, '#000000', '#FFFFFF']}
                onChange={(hex) => handleContentChange({ heroTextColor: hex || undefined }, false)}
                onCommit={() => handleContentChange({ heroTextColor: content.heroTextColor }, true)}
              />
              <ToolbarSegmented
                label="Align"
                value={textAlign as string}
                options={[
                  { value: 'left', label: 'Left' },
                  { value: 'center', label: 'Center' },
                  { value: 'right', label: 'Right' },
                ]}
                onChange={(v) => handleContentChange({ heroTextAlign: v as 'left' | 'center' | 'right' }, true)}
              />
            </>
          )}

          {/* Position section (only when variation !== 'image') */}
          {variation !== 'image' && (
            <>
              <ToolbarDivider />
              <ToolbarLabel>Position</ToolbarLabel>
              <ToolbarSegmented
                label="Horizontal"
                value={alignH}
                options={[
                  { value: 'left', label: 'Left' },
                  { value: 'center', label: 'Center' },
                  { value: 'right', label: 'Right' },
                ]}
                onChange={(v) => handleContentChange({ heroAlignH: v as typeof alignH }, true)}
              />
              <ToolbarSegmented
                label="Vertical"
                value={alignV}
                options={[
                  { value: 'top', label: 'Top' },
                  { value: 'center', label: 'Center' },
                  { value: 'bottom', label: 'Bottom' },
                ]}
                onChange={(v) => handleContentChange({ heroAlignV: v as typeof alignV }, true)}
              />
              <ToolbarSlider
                label="Padding"
                min={2}
                max={14}
                step={0.5}
                value={padding}
                displayValue={`${padding}%`}
                onChange={(v) => handleContentChange({ heroPadding: v }, false)}
                onCommit={(v) => handleContentChange({ heroPadding: v }, true)}
              />
              <ToolbarSlider
                label="Max Width"
                min={0}
                max={30}
                step={1}
                value={maxWidth ?? 0}
                displayValue={maxWidth ? `${maxWidth}ch` : 'None'}
                onChange={(v) => handleContentChange({ heroMaxWidth: v || undefined }, false)}
                onCommit={(v) => handleContentChange({ heroMaxWidth: v || undefined }, true)}
              />
            </>
          )}

          {/* Overlay section (only when variation is 'image' or 'image-headline') */}
          {(variation === 'image' || variation === 'image-headline') && (
            <>
              <ToolbarDivider />
              <ToolbarLabel>Overlay</ToolbarLabel>
              <ToolbarToggle
                label="Overlay"
                checked={overlayEnabled}
                onChange={(v) => handleContentChange({ heroOverlayEnabled: v }, true)}
              />
              {overlayEnabled && (
                <>
                  <ToolbarColorPicker
                    label="Color"
                    color={overlayColor}
                    autoColor="#000000"
                    paletteColors={['#000000', colors.primary, colors.accent, '#1a1a1a', '#0a0a0a']}
                    onChange={(hex) => handleContentChange({ heroOverlayColor: hex || '#000000' }, false)}
                    onCommit={() => handleContentChange({ heroOverlayColor: content.heroOverlayColor || '#000000' }, true)}
                  />
                  <ToolbarSlider
                    label="Opacity"
                    min={0}
                    max={100}
                    step={1}
                    value={overlayOpacity}
                    displayValue={`${overlayOpacity}%`}
                    onChange={(v) => handleContentChange({ heroOverlayOpacity: v }, false)}
                    onCommit={(v) => handleContentChange({ heroOverlayOpacity: v }, true)}
                  />
                  <ToolbarToggle
                    label="Gradient"
                    checked={!!overlayGradient}
                    onChange={(v) => {
                      const newValue = v ? { color1: overlayColor, color2: '#000000' } : null;
                      handleContentChange({ heroOverlayGradient: newValue }, true);
                    }}
                  />
                  {overlayGradient && (
                    <>
                      <ToolbarColorPicker
                        label="Gradient Start"
                        color={overlayGradient.color1}
                        autoColor={overlayColor}
                        paletteColors={['#000000', colors.primary, colors.accent, '#1a1a1a', '#0a0a0a']}
                        onChange={(hex) => {
                          const newGradient = { ...overlayGradient, color1: hex || overlayColor };
                          handleContentChange({ heroOverlayGradient: newGradient }, false);
                        }}
                        onCommit={() => handleContentChange({ heroOverlayGradient: content.heroOverlayGradient }, true)}
                      />
                      <ToolbarColorPicker
                        label="Gradient End"
                        color={overlayGradient.color2}
                        autoColor="#000000"
                        paletteColors={['#000000', colors.primary, colors.accent, '#1a1a1a', '#0a0a0a']}
                        onChange={(hex) => {
                          const newGradient = { ...overlayGradient, color2: hex || '#000000' };
                          handleContentChange({ heroOverlayGradient: newGradient }, false);
                        }}
                        onCommit={() => handleContentChange({ heroOverlayGradient: content.heroOverlayGradient }, true)}
                      />
                    </>
                  )}
                </>
              )}
            </>
          )}
        </FloatingToolbar>
      )}
    </div>
  );
}
