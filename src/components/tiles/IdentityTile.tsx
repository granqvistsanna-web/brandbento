/**
 * Identity Tile Component
 *
 * Displays the brand logo/wordmark with adaptive colors.
 * Automatically adjusts logo color based on surface brightness.
 *
 * ## Features
 *
 * - Displays brand wordmark/logo text
 * - Adaptive text color for contrast (light surface → brand color, dark → white)
 * - Surface color from tileSurfaces overrides or default (index 1)
 * - Framer Motion layoutId for smooth transitions
 * - Uses primary typography for logo
 *
 * @component
 * @example
 * <IdentityTile placementId="hero" />
 */
import { useBrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { getAdaptiveTextColor } from '@/utils/color';
import { resolveSurfaceColor } from '@/utils/surface';

/**
 * Props for IdentityTile component.
 */
interface IdentityTileProps {
  /** Grid placement ID for surface color override lookup */
  placementId?: string;
}

/**
 * Brand identity tile displaying brand colors in a grid.
 */
export function IdentityTile({ placementId }: IdentityTileProps) {
    const { logo, colors } = useBrandStore(
        useShallow((state) => ({
            logo: state.brand.logo,
            colors: state.brand.colors,
        }))
    );
    const tileSurfaceIndex = useBrandStore((state) =>
        placementId ? state.tileSurfaces[placementId] : undefined
    );
    const { padding, size: logoSize, text: logoText } = logo;
    const { primary, bg, surfaces } = colors;

    // Get surface index: user override > default (1 for identity)
    const surfaceBg = resolveSurfaceColor({
        placementId,
        tileSurfaceIndex,
        surfaces,
        bg,
        defaultIndex: 1,
    });

    const swatches = [primary, bg, ...(surfaces || [])].filter(Boolean);
    const gridSwatches =
        swatches.length > 0
            ? Array.from({ length: 9 }, (_, i) => swatches[i % swatches.length])
            : [];

    const isHero = placementId === 'hero';
    const showWordmark = Boolean(logoText && logoText.trim().length > 0);
    const wordmarkColor = getAdaptiveTextColor(surfaceBg, primary, '#FFFFFF');
    const heroFontSize = Math.max(32, logoSize * 2);
    const wordmarkStyle = {
        fontSize: `${isHero ? heroFontSize : logoSize}px`,
        fontWeight: 700,
        letterSpacing: '0.04em',
        color: wordmarkColor,
    };

    return (
        <div className="w-full h-full relative overflow-hidden">
            {/* Background Layer */}
            <div
                className="absolute inset-0"
                style={{ backgroundColor: surfaceBg }}
            />

            {/* Content Layer */}
            {isHero ? (
                <>
                    <div
                        className="absolute inset-0 grid grid-cols-3 gap-2 opacity-20"
                        style={{ padding: `${padding}px` }}
                    >
                        {gridSwatches.map((color, index) => (
                            <div
                                key={`${color}-${index}`}
                                className="w-full h-full"
                                style={{ backgroundColor: color }}
                                aria-hidden="true"
                            />
                        ))}
                    </div>
                    <div
                        className="relative h-full w-full flex items-center justify-center text-center"
                        style={{ padding: `${padding}px` }}
                    >
                        {showWordmark ? (
                            <span style={wordmarkStyle}>{logoText}</span>
                        ) : null}
                    </div>
                </>
            ) : (
                <div
                    className="relative h-full w-full"
                    style={{ padding: `${padding}px` }}
                >
                    <div className="h-full w-full grid grid-cols-3 gap-2">
                        {gridSwatches.map((color, index) => (
                            <div
                                key={`${color}-${index}`}
                                className="w-full aspect-square"
                                style={{ backgroundColor: color }}
                                aria-label={`Color swatch ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
