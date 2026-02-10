/**
 * Social Post Tile Component
 *
 * Realistic Instagram-style social post card(s), centered within the tile.
 * Supports 1–3 cards that scale fluidly to fill available space.
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { resolveSurfaceColor } from '@/utils/surface';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { getFontCategory } from '@/utils/typography';
import { hexToHSL } from '@/utils/colorMapping';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarLabel,
  ToolbarTextInput,
  ToolbarDivider,
  ToolbarSegmented,
  getRandomShuffleImage,
} from './FloatingToolbar';

/** Fixed design dimensions — each card is authored at this size
 *  then uniformly scaled to fit whatever tile it lives in.
 *  Total design-space width = CARD_W * postCount + CARD_GAP * (postCount - 1).
 *  The gap count is one less than card count (N cards have N-1 gaps). */
const CARD_W = 320;
const CARD_H = 420;
const CARD_GAP = 12;

/** Fallback captions/likes for posts without explicit content */
const FALLBACK_CAPTIONS = [
  'Less noise, more signal. Building brands that breathe.',
  'Thoughtful systems for the next chapter.',
];
const FALLBACK_LIKES = ['843 likes', '2,017 likes'];

interface SocialPostTileProps {
  /** Grid placement ID — determines tile content and surface color */
  placementId?: string;
}

export function SocialPostTile({ placementId }: SocialPostTileProps) {
  const { colors, logoText, typography } = useBrandStore(
    useShallow((state: BrandStore) => ({
      colors: state.brand.colors,
      logoText: state.brand.logo.text,
      typography: state.brand.typography,
    }))
  );
  const setPlacementContent = useBrandStore((s) => s.setPlacementContent);
  const updateTile = useBrandStore((s) => s.updateTile);
  const tileSurfaceIndex = useBrandStore((state: BrandStore) =>
    placementId ? state.tileSurfaces[placementId] : undefined
  );
  const placementTileId = getPlacementTileId(placementId);
  const placementTileType = getPlacementTileType(placementId);
  const tile = useBrandStore((state: BrandStore) => {
    if (placementTileId) return state.tiles.find((t) => t.id === placementTileId);
    if (placementTileType) return state.tiles.find((t) => t.type === placementTileType);
    return undefined;
  });
  const placementContent = useBrandStore((state: BrandStore) =>
    placementId ? state.placementContent?.[placementId] : undefined
  );
  const { bg, surfaces, primary, text: textColor } = colors;
  const imageUrl = placementContent?.image || tile?.content?.image;
  const handle = placementContent?.socialHandle || logoText?.toLowerCase() || 'brand';
  const caption =
    placementContent?.socialCaption ||
    'Defining the new standard for calm, focused brand systems.';
  const likesRaw = placementContent?.socialLikes || '1,204 likes';
  const likes = likesRaw.toLowerCase().includes('like') ? likesRaw : `${likesRaw} likes`;
  const socialPosts = placementContent?.socialPosts;
  const postCount = socialPosts?.length
    ? Math.min(3, Math.max(1, socialPosts.length))
    : Math.min(3, Math.max(1, placementContent?.socialPostCount || 1));

  const { fontFamily: uiFontStack } = useGoogleFonts(
    typography.ui,
    getFontCategory(typography.ui)
  );
  const surfaceBg = resolveSurfaceColor({
    placementId,
    tileSurfaceIndex,
    surfaces,
    bg,
    defaultIndex: 3,
  });

  const surfaceL = hexToHSL(surfaceBg).l;
  const isLight = surfaceL > 55;

  // Card colors
  const cardBg = isLight ? '#FFFFFF' : `color-mix(in srgb, ${surfaceBg} 80%, #FFFFFF)`;
  const cardBorder = isLight
    ? `color-mix(in srgb, ${textColor} 10%, transparent)`
    : `color-mix(in srgb, ${textColor} 8%, transparent)`;
  const cardText = isLight
    ? `color-mix(in srgb, ${textColor} 85%, transparent)`
    : `color-mix(in srgb, ${textColor} 80%, transparent)`;
  const cardTextMuted = isLight
    ? `color-mix(in srgb, ${textColor} 45%, transparent)`
    : `color-mix(in srgb, ${textColor} 40%, transparent)`;
  const iconColor = isLight
    ? `color-mix(in srgb, ${textColor} 55%, transparent)`
    : `color-mix(in srgb, ${textColor} 50%, transparent)`;

  const initial = (handle || 'B').charAt(0).toUpperCase();

  /* ── Scale-to-fit logic ──
   * Cards are authored at fixed CARD_W x CARD_H dimensions and placed
   * side-by-side. The whole row is then uniformly scaled (via CSS transform)
   * to fill the tile container with 6% proportional padding on each side.
   * Uses Math.min of x/y ratios so the cards never overflow either axis.
   */
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const totalW = CARD_W * postCount + CARD_GAP * (postCount - 1);
  const totalH = CARD_H;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const pad = Math.min(width, height) * 0.06;
      const s = Math.min((width - pad * 2) / totalW, (height - pad * 2) / totalH);
      setScale(s);
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, [totalW, totalH]);

  // Floating toolbar
  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);

  const handleShuffle = useCallback(() => {
    const currentImage = placementContent?.image || tile?.content?.image;
    const newImage = getRandomShuffleImage(currentImage);
    if (placementId) {
      setPlacementContent(placementId, { image: newImage }, true);
    } else if (tile?.id) {
      updateTile(tile.id, { image: newImage }, true);
    }
  }, [placementId, placementContent?.image, tile?.content?.image, tile?.id, setPlacementContent, updateTile]);

  const handleImageUpload = useCallback((dataUrl: string) => {
    if (placementId) {
      setPlacementContent(placementId, { image: dataUrl }, true);
    } else if (tile?.id) {
      updateTile(tile.id, { image: dataUrl }, true);
    }
  }, [placementId, tile?.id, setPlacementContent, updateTile]);

  const handleToggleLock = useCallback(() => {
    if (placementId) {
      setPlacementContent(placementId, { imageLocked: !placementContent?.imageLocked }, true);
    } else if (tile?.id) {
      updateTile(tile.id, { imageLocked: !tile?.content?.imageLocked }, true);
    }
  }, [placementId, placementContent?.imageLocked, tile?.id, tile?.content?.imageLocked, setPlacementContent, updateTile]);

  const handleContentChange = useCallback((key: string, value: string | number, isCommit = false) => {
    if (placementId) {
      setPlacementContent(placementId, { [key]: value }, isCommit);
    }
  }, [placementId, setPlacementContent]);

  const renderCard = (index: number) => {
    const post = socialPosts?.[index];
    const cardCaption = post?.caption || (index === 0 ? caption : FALLBACK_CAPTIONS[(index - 1) % FALLBACK_CAPTIONS.length]);
    const cardLikesRaw = post?.likes || (index === 0 ? likes : FALLBACK_LIKES[(index - 1) % FALLBACK_LIKES.length]);
    const cardLikes = cardLikesRaw.toLowerCase().includes('like') ? cardLikesRaw : `${cardLikesRaw} likes`;
    const cardImage = post?.image || (index === 0 ? imageUrl : undefined);

    return (
      <div
        key={index}
        className="flex flex-col overflow-hidden"
        style={{
          width: CARD_W,
          height: CARD_H,
          flexShrink: 0,
          backgroundColor: cardBg,
          borderRadius: 12,
          border: `1px solid ${cardBorder}`,
          boxShadow: 'var(--shadow-md)',
          fontFamily: uiFontStack,
        }}
      >
        {/* ─── Header ─── */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{ padding: '10px 12px' }}
        >
          <div className="flex items-center" style={{ gap: 8 }}>
            <div
              className="rounded-full flex items-center justify-center shrink-0"
              style={{
                width: 26,
                height: 26,
                background: `linear-gradient(135deg, ${primary}20, ${primary}35)`,
                border: `1.5px solid ${primary}30`,
                color: primary,
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {initial}
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: cardText,
                lineHeight: 1.2,
              }}
            >
              {handle}
            </span>
          </div>
          <MoreHorizontal
            style={{ width: 15, height: 15, color: cardTextMuted }}
            strokeWidth={1.5}
          />
        </div>

        {/* ─── Image ─── */}
        <div
          className="relative w-full overflow-hidden"
          style={{ flex: '1 1 0', minHeight: 0 }}
        >
          {cardImage ? (
            <img
              src={cardImage}
              alt="Social post"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(${155 + index * 40}deg, ${primary}18 0%, ${primary}30 50%, ${colors.accent || primary}22 100%)`,
              }}
            />
          )}
        </div>

        {/* ─── Actions + caption ─── */}
        <div className="shrink-0" style={{ padding: '9px 12px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
            <div className="flex items-center" style={{ gap: 12 }}>
              {[Heart, MessageCircle, Send].map((Icon, i) => (
                <Icon
                  key={i}
                  strokeWidth={1.5}
                  style={{ width: 16, height: 16, color: iconColor, display: 'block' }}
                />
              ))}
            </div>
            <Bookmark
              strokeWidth={1.5}
              style={{ width: 16, height: 16, color: iconColor, display: 'block' }}
            />
          </div>

          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: cardText,
              lineHeight: 1.3,
              marginBottom: 2,
            }}
          >
            {cardLikes}
          </p>

          <p
            className="line-clamp-2"
            style={{ fontSize: 11, color: cardTextMuted, lineHeight: 1.4 }}
          >
            <span style={{ fontWeight: 600, color: cardText, marginRight: 4 }}>
              {handle}
            </span>
            {cardCaption}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: surfaceBg }}
    >
      <div
        style={{
          width: totalW * scale,
          height: totalH * scale,
          flexShrink: 0,
        }}
      >
        <div
          className="flex items-center"
          style={{
            gap: CARD_GAP,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: totalW,
            height: totalH,
          }}
        >
          {Array.from({ length: postCount }, (_, i) => renderCard(i))}
        </div>
      </div>

      {/* Floating toolbar when focused */}
      {isFocused && anchorRect && (
        <FloatingToolbar anchorRect={anchorRect}>
          <ToolbarActions
            onShuffle={handleShuffle}
            hasImage
            imageLocked={placementContent?.imageLocked || tile?.content?.imageLocked}
            onToggleLock={handleToggleLock}
            onImageUpload={handleImageUpload}
          />
          <ToolbarDivider />
          <ToolbarLabel>Social Post</ToolbarLabel>
          <ToolbarTextInput
            label="Handle"
            value={handle}
            onChange={(v) => handleContentChange('socialHandle', v)}
            onCommit={(v) => handleContentChange('socialHandle', v, true)}
            placeholder="handle"
          />
          <ToolbarTextInput
            label="Caption"
            value={caption}
            onChange={(v) => handleContentChange('socialCaption', v)}
            onCommit={(v) => handleContentChange('socialCaption', v, true)}
            placeholder="Caption text"
          />
          <ToolbarTextInput
            label="Likes"
            value={likesRaw}
            onChange={(v) => handleContentChange('socialLikes', v)}
            onCommit={(v) => handleContentChange('socialLikes', v, true)}
            placeholder="1,204 likes"
          />
          <ToolbarSegmented
            label="Posts"
            options={[
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
            ]}
            value={String(postCount)}
            onChange={(v) => {
              if (placementId) {
                setPlacementContent(placementId, { socialPostCount: parseInt(v) }, true);
              }
            }}
          />
        </FloatingToolbar>
      )}
    </div>
  );
}
