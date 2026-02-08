/**
 * Social Post Tile Component
 *
 * Streamlined Instagram-style social media mockup.
 * Reduced chrome for cleaner appearance at small tile sizes.
 */
import { useEffect, useRef, useState } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { resolveSurfaceColor } from '@/utils/surface';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale } from '@/utils/typography';

interface SocialPostTileProps {
  placementId?: string;
}

export function SocialPostTile({ placementId }: SocialPostTileProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [cardScale, setCardScale] = useState(1);
  const [shouldHide, setShouldHide] = useState(false);
  const { colors, logoText, uiFont, typography } = useBrandStore(
    useShallow((state: BrandStore) => ({
      colors: state.brand.colors,
      logoText: state.brand.logo.text,
      uiFont: state.brand.typography.ui,
      typography: state.brand.typography,
    }))
  );
  const tileSurfaceIndex = useBrandStore((state: BrandStore) =>
    placementId ? state.tileSurfaces[placementId] : undefined
  );
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
  const { bg, surfaces } = colors;
  const imageUrl = placementContent?.image || tile?.content?.image;
  const socialHandle = placementContent?.socialHandle || logoText.toLowerCase();
  const socialCaption =
    placementContent?.socialCaption || 'Defining the new standard for calm, focused brand systems.';
  const socialLikes = placementContent?.socialLikes || '1,204 likes';
  const socialSponsored = placementContent?.socialSponsored || 'Sponsored';
  const socialAspect = placementContent?.socialAspect || '4:5';
  const { fontFamily: uiFontStack } = useGoogleFonts(uiFont, getFontCategory(uiFont));
  const typeScale = getTypeScale(typography);

  const surfaceBg = resolveSurfaceColor({
    placementId,
    tileSurfaceIndex,
    surfaces,
    bg,
    defaultIndex: 3,
  });

  const fallbackInitial = (logoText || 'B').charAt(0);
  const baseCardWidth = 200;
  const baseCardHeight = 330;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const updateScale = () => {
      const rect = el.getBoundingClientRect();
      const widthScale = rect.width / (baseCardWidth + 16);
      const heightScale = rect.height / (baseCardHeight + 16);
      const nextScale = Math.min(1, widthScale, heightScale);
      setCardScale(Math.max(0.4, nextScale));
      const aspect = rect.width / Math.max(1, rect.height);
      const tooWide = aspect > 1.15;
      const tooShort = rect.height < 200;
      setShouldHide(tooWide || tooShort);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(el);

    return () => observer.disconnect();
  }, [baseCardWidth, baseCardHeight]);

  if (shouldHide) return null;

  return (
    <div
      ref={containerRef}
      className="w-full h-full p-4 flex items-center justify-center transition-fast"
      style={{ backgroundColor: surfaceBg }}
    >
      <div
        className="rounded-xl overflow-hidden relative flex flex-col"
        style={{
          width: `${baseCardWidth}px`,
          background: "var(--canvas-surface)",
          border: "1px solid var(--canvas-border)",
          transform: `scale(${cardScale})`,
          transformOrigin: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header */}
        <div className="px-2.5 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-10 font-bold"
              style={{
                backgroundColor: "var(--canvas-bg)",
                color: "var(--canvas-text)",
                border: "1px solid var(--canvas-border)",
              }}
            >
              {fallbackInitial}
            </div>
            <span
              className="text-10 font-semibold"
              style={{
                fontFamily: uiFontStack,
                color: "var(--canvas-text)",
                fontSize: `${clampFontSize(typeScale.stepMinus2)}px`,
              }}
            >
              {socialHandle}
            </span>
          </div>
          {socialSponsored && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full"
              style={{
                color: "var(--sidebar-text-muted)",
                background: "var(--sidebar-bg-active)",
                fontFamily: uiFontStack,
                fontSize: `${clampFontSize(typeScale.stepMinus2)}px`,
              }}
            >
              {socialSponsored}
            </span>
          )}
        </div>

        {/* Image */}
        <div
          className="w-full relative px-1 flex-1 min-h-0"
          style={{
            background: "var(--sidebar-bg-active)",
            aspectRatio:
              socialAspect === '1:1'
                ? '1 / 1'
                : socialAspect === '1.91:1'
                  ? '1.91 / 1'
                  : '4 / 5',
          }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="Social" className="w-full h-full object-cover rounded-md" />
          ) : (
            <div
              className="w-full h-full rounded-md"
              style={{
                background: `linear-gradient(145deg, ${colors.primary || '#666'}cc, ${colors.accent || colors.primary || '#888'}88)`,
              }}
            />
          )}
        </div>

        {/* Actions + caption */}
        <div className="px-2.5 py-2">
          <div className="flex justify-between mb-1.5" style={{ color: "var(--canvas-text)" }}>
            <div className="flex gap-2.5">
              <Heart size={14} />
              <MessageCircle size={14} />
              <Send size={14} />
            </div>
            <Bookmark size={14} />
          </div>
          {socialLikes && (
            <p
              className="text-10 font-semibold mb-0.5"
              style={{
                fontFamily: uiFontStack,
                color: "var(--canvas-text-secondary)",
                fontSize: `${clampFontSize(typeScale.stepMinus2)}px`,
              }}
            >
              {socialLikes}
            </p>
          )}
          <p
            className="text-10 font-medium leading-snug line-clamp-2"
            style={{
              fontFamily: uiFontStack,
              color: "var(--canvas-text)",
              fontSize: `${clampFontSize(typeScale.stepMinus1)}px`,
            }}
          >
            <span className="font-bold mr-1">{socialHandle}</span>
            {socialCaption}
          </p>
        </div>
      </div>
    </div>
  );
}
