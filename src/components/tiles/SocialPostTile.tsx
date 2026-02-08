/**
 * Social Post Tile Component
 *
 * Instagram-style social media mockup showcasing brand imagery.
 * Displays hero image in a realistic social post context.
 *
 * ## Features
 *
 * - Instagram-style post layout (header, image, actions, caption)
 * - Brand avatar using logo initial and primary color
 * - Hero image from brand.imagery.url
 * - Social actions (like, comment, share, save icons)
 * - Branded caption with logo name
 * - Surface color from tileSurfaces overrides or default (index 3)
 *
 * @component
 * @example
 * <SocialPostTile placementId="image" />
 */
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { Heart, MessageCircle, Send, Bookmark, Image as ImageIcon } from 'lucide-react';
import { resolveSurfaceColor } from '@/utils/surface';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';

/**
 * Props for SocialPostTile component.
 */
interface SocialPostTileProps {
  /** Grid placement ID for surface color override lookup */
  placementId?: string;
}

/**
 * Social media mockup tile displaying brand imagery.
 */
export function SocialPostTile({ placementId }: SocialPostTileProps) {
    const { colors, logoText, uiFont } = useBrandStore(
        useShallow((state: BrandStore) => ({
            colors: state.brand.colors,
            logoText: state.brand.logo.text,
            uiFont: state.brand.typography.ui,
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
    const { bg, primary, surfaces } = colors;
    const imageUrl = placementContent?.image || tile?.content?.image;
    const socialHandle = placementContent?.socialHandle || logoText.toLowerCase();
    const socialCaption =
        placementContent?.socialCaption || 'Defining the new standard for calm, focused brand systems.';
    const socialLikes = placementContent?.socialLikes || '1,204 likes';
    const socialSponsored = placementContent?.socialSponsored || 'Sponsored';
    const socialAspect = placementContent?.socialAspect || '4:5';

    // Get surface index: user override > default (3 for social)
    const surfaceBg = resolveSurfaceColor({
        placementId,
        tileSurfaceIndex,
        surfaces,
        bg,
        defaultIndex: 3,
    });

    const fallbackInitial = (logoText || 'B').charAt(0);

    return (
        <div
            className="w-full h-full p-4 flex items-center justify-center transition-fast"
            style={{ backgroundColor: surfaceBg }}
        >
            {/* Mock Phone/Card */}
            <div
                className="w-full max-w-[200px] rounded-xl overflow-hidden shadow-sm relative"
                style={{
                    background: "var(--canvas-surface)",
                    border: "1px solid var(--canvas-border)",
                }}
            >
                <div
                    className="pointer-events-none absolute inset-0 rounded-xl"
                    style={{ boxShadow: "inset 0 0 0 1px var(--sidebar-border-subtle)" }}
                />
                {/* Header */}
                <div className="p-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded-full p-1"
                            style={{ backgroundColor: primary }}
                        >
                            <div
                                className="w-full h-full rounded-full flex items-center justify-center text-10 font-bold"
                                style={{ backgroundColor: primary, color: "var(--sidebar-text)" }}
                            >
                                {fallbackInitial}
                            </div>
                        </div>
                        <span
                            className="text-10 font-semibold"
                            style={{ fontFamily: uiFont, color: "var(--canvas-text)" }}
                        >
                            {socialHandle}
                        </span>
                    </div>
                    {socialSponsored && (
                        <span
                            className="text-10 px-2 py-1 rounded-full"
                            style={{
                                color: "var(--sidebar-text-muted)",
                                background: "var(--sidebar-bg-active)",
                            }}
                        >
                            {socialSponsored}
                        </span>
                    )}
                </div>

                {/* Image */}
                <div
                    className={`w-full relative px-1 ${
                        socialAspect === '1:1'
                            ? 'aspect-square'
                            : socialAspect === '1.91:1'
                                ? 'aspect-[1.91/1]'
                                : 'aspect-[4/5]'
                    }`}
                    style={{ background: "var(--sidebar-bg-active)" }}
                >
                    {imageUrl ? (
                        <img src={imageUrl} alt="Social" className="w-full h-full object-cover rounded-md" />
                    ) : (
                        <div
                            className="w-full h-full flex flex-col items-center justify-center gap-2 rounded-md border border-dashed"
                            style={{
                                borderColor: "var(--sidebar-border)",
                                background: "var(--sidebar-bg-hover)",
                            }}
                        >
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center"
                                style={{
                                    background: "var(--sidebar-bg)",
                                    border: "1px solid var(--sidebar-border)",
                                    color: "var(--sidebar-text-muted)",
                                }}
                            >
                                <ImageIcon size={14} />
                            </div>
                            <span
                                className="text-10 uppercase tracking-wide"
                                style={{ fontFamily: uiFont, color: "var(--sidebar-text-muted)" }}
                            >
                                Image Placeholder
                            </span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-2">
                    <div className="flex justify-between mb-2" style={{ color: "var(--canvas-text)" }}>
                        <div className="flex gap-3">
                            <Heart size={16} />
                            <MessageCircle size={16} />
                            <Send size={16} />
                        </div>
                        <Bookmark size={16} />
                    </div>
                    {socialLikes && (
                        <p
                            className="text-10 font-semibold mb-1"
                            style={{ fontFamily: uiFont, color: "var(--canvas-text-secondary)" }}
                        >
                            {socialLikes}
                        </p>
                    )}
                    <p
                        className="text-10 font-medium leading-snug line-clamp-2"
                        style={{ fontFamily: uiFont, color: "var(--canvas-text)" }}
                    >
                        <span className="font-bold mr-1">{socialHandle}</span>
                        {socialCaption}
                    </p>
                </div>
            </div>
        </div>
    );
}
