/**
 * Social Post Tile Component
 *
 * Realistic Instagram-style social post card, centered within the tile.
 * The card scales fluidly to fill available space while maintaining
 * proper card proportions with surrounding padding.
 */
import { useRef, useState, useEffect } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { resolveSurfaceColor } from '@/utils/surface';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { getFontCategory } from '@/utils/typography';
import { hexToHSL } from '@/utils/colorMapping';

/* Fixed design dimensions — the card is authored at this size
   then uniformly scaled to fit whatever tile it lives in. */
const CARD_W = 320;
const CARD_H = 420;

interface SocialPostTileProps {
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

  // Card colors — the card itself is always a clean white/dark surface
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

  /* ── Scale-to-fit logic ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const pad = Math.min(width, height) * 0.06;
      const s = Math.min((width - pad * 2) / CARD_W, (height - pad * 2) / CARD_H);
      setScale(s);
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: surfaceBg }}
    >
      {/* Card rendered at fixed design size, then scaled uniformly */}
      <div
        className="flex flex-col overflow-hidden"
        style={{
          width: CARD_W,
          height: CARD_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
          backgroundColor: cardBg,
          borderRadius: 12,
          border: `1px solid ${cardBorder}`,
          boxShadow: isLight
            ? '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)'
            : '0 1px 3px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)',
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
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Social post"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(155deg, ${primary}18 0%, ${primary}30 50%, ${colors.accent || primary}22 100%)`,
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
            {likes}
          </p>

          <p
            className="line-clamp-2"
            style={{ fontSize: 11, color: cardTextMuted, lineHeight: 1.4 }}
          >
            <span style={{ fontWeight: 600, color: cardText, marginRight: 4 }}>
              {handle}
            </span>
            {caption}
          </p>
        </div>
      </div>
    </div>
  );
}
