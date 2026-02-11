/**
 * Story / Ad Tile Component
 *
 * Instagram Story-format ad mockup — the kind of branded story card
 * you see in social media decks. Phone-shaped vertical container with
 * progress bars, profile row, image area, headline, body, and CTA.
 *
 * Uses scale-to-fit pattern with portrait story proportions.
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { getAdaptiveTextColor } from '@/utils/color';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale, getHeadlineTracking, getBodyTracking, getHeadlineLineHeight, getBodyLineHeight } from '@/utils/typography';
import { getPresetContent } from '@/data/tilePresetContent';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarDivider,
  ToolbarTileTypeGrid,
  ToolbarSurfaceSwatches,
  ToolbarTextInput,
  ToolbarTextArea,
  ToolbarLabel,
  getRandomShuffleImage,
} from './FloatingToolbar';

/* ─── Design-space dimensions (9:16 story ratio) ─── */
const STORY_W = 270;
const STORY_H = 480;

/* ─── Types ─── */

interface StoryTileProps {
  placementId?: string;
}

/* ─── Component ─── */

export function StoryTile({ placementId }: StoryTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const pad = Math.min(width, height) * 0.06;
      const s = Math.min((width - pad * 2) / STORY_W, (height - pad * 2) / STORY_H);
      setScale(s);
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  /* ─── Store ─── */
  const { colors, typography, logo } = useBrandStore(
    useShallow((state: BrandStore) => ({
      colors: state.brand.colors,
      typography: state.brand.typography,
      logo: state.brand.logo,
    }))
  );
  const activePreset = useBrandStore((s) => s.activePreset);
  const updateTile = useBrandStore((s) => s.updateTile);
  const swapTileType = useBrandStore((s) => s.swapTileType);
  const setTileSurface = useBrandStore((s) => s.setTileSurface);
  const setPlacementContent = useBrandStore((s) => s.setPlacementContent);
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
  const placementContent = useBrandStore((state: BrandStore) =>
    placementId ? state.placementContent?.[placementId] : undefined
  );

  /* ─── Colors ─── */
  const { bg, text: textColor, primary, surfaces } = colors;
  const surfaceBg = resolveSurfaceColor({ placementId, tileSurfaceIndex, surfaces, bg, defaultIndex: 0 });
  const adaptiveText = getAdaptiveTextColor(surfaceBg, textColor, COLOR_DEFAULTS.TEXT_LIGHT);
  const ctaTextColor = getAdaptiveTextColor(primary, '#ffffff', '#000000');
  const fontPreview = useBrandStore((state) => state.fontPreview);

  /* ─── Typography ─── */
  // Apply font preview if active
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
  const cta = tileContent.cta || presetCopy.cta;
  const handle = tileContent.socialHandle || logo.text?.toLowerCase() || 'brand';
  const sponsored = tileContent.label || 'Sponsored';

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
      <ToolbarSurfaceSwatches
        surfaces={surfaces}
        bgColor={bg}
        currentIndex={tileSurfaceIndex}
        onSurfaceChange={(idx) => placementId && setTileSurface(placementId, idx)}
      />
      <ToolbarDivider />
      <ToolbarLabel>Content</ToolbarLabel>
      <ToolbarTextInput
        label="Handle"
        value={handle}
        onChange={(v) => tile?.id && updateTile(tile.id, { socialHandle: v }, false)}
        onCommit={(v) => tile?.id && updateTile(tile.id, { socialHandle: v }, true)}
        placeholder="brandname"
      />
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
      <ToolbarTextInput
        label="CTA"
        value={cta}
        onChange={(v) => tile?.id && updateTile(tile.id, { cta: v }, false)}
        onCommit={(v) => tile?.id && updateTile(tile.id, { cta: v }, true)}
        placeholder="Shop Now"
      />
    </FloatingToolbar>
  );

  /* ─── Card colors ─── */
  const cardBg = surfaces?.[0] || bg;
  const cardText = getAdaptiveTextColor(cardBg, textColor, COLOR_DEFAULTS.TEXT_LIGHT);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center transition-colors duration-300 relative overflow-hidden"
      style={{ backgroundColor: surfaceBg }}
    >
      {/* Scaled story card */}
      <div
        style={{
          width: STORY_W,
          height: STORY_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          borderRadius: 16,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: cardBg,
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          position: 'relative',
        }}
      >
        {/* Image area (top ~55%) */}
        <div style={{ position: 'relative', height: '52%', flexShrink: 0 }}>
          {/* Image */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* Progress bars */}
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 12,
              right: 12,
              display: 'flex',
              gap: 3,
              zIndex: 2,
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 2,
                  borderRadius: 1,
                  backgroundColor: i === 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                }}
              />
            ))}
          </div>

          {/* Profile row */}
          <div
            style={{
              position: 'absolute',
              top: 18,
              left: 12,
              right: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              zIndex: 2,
            }}
          >
            {/* Avatar circle */}
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                backgroundColor: primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {logo.image ? (
                <img src={logo.image} alt="" style={{ width: 16, height: 16, objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: 11, fontWeight: 700, color: ctaTextColor }}>
                  {(logo.text || 'B').charAt(0)}
                </span>
              )}
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 600, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
              {handle}
            </span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', marginLeft: -2 }}>
              {sponsored}
            </span>
            {/* Close X */}
            <span style={{ marginLeft: 'auto', fontSize: 16, color: '#fff', opacity: 0.7, lineHeight: 1 }}>
              ×
            </span>
          </div>
        </div>

        {/* Content area (bottom) */}
        <div
          style={{
            flex: 1,
            padding: '18px 18px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {/* Headline */}
            <h2
              style={{
                fontFamily: headlineFont,
                fontWeight: parseInt(typography.weightHeadline) || 700,
                fontSize: 18,
                lineHeight: getHeadlineLineHeight(typography),
                letterSpacing: getHeadlineTracking(typography),
                color: cardText,
                textWrap: 'balance',
                marginBottom: 8,
              }}
            >
              {headline}
            </h2>

            {/* Body */}
            <p
              style={{
                fontFamily: bodyFont,
                fontWeight: parseInt(typography.weightBody) || 400,
                fontSize: 10.5,
                lineHeight: getBodyLineHeight(typography),
                letterSpacing: getBodyTracking(typography),
                color: cardText,
                opacity: 0.55,
                maxWidth: '30ch',
              }}
            >
              {body}
            </p>
          </div>

          {/* CTA button */}
          <button
            style={{
              width: '100%',
              padding: '10px 16px',
              backgroundColor: primary,
              color: ctaTextColor,
              fontFamily: headlineFont,
              fontWeight: parseInt(typography.weightHeadline) || 700,
              fontSize: 11,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              border: 'none',
              borderRadius: 6,
              cursor: 'default',
              transition: 'background-color 0.3s ease',
            }}
          >
            {cta} →
          </button>
        </div>
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
        Story
      </span>

      {toolbar}
    </div>
  );
}
