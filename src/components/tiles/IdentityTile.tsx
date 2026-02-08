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
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { motion } from 'motion/react';
import { hexToHSL } from '@/utils/colorMapping';

/**
 * Props for IdentityTile component.
 */
interface IdentityTileProps {
  /** Grid placement ID for surface color override lookup */
  placementId?: string;
}

/**
 * Brand identity tile displaying logo/wordmark.
 */
export function IdentityTile({ placementId }: IdentityTileProps) {
    const brand = useBrandStore((state: BrandStore) => state.brand);
    const tileSurfaces = useBrandStore((state: BrandStore) => state.tileSurfaces);
    const { text, size, padding } = brand.logo;
    const { primary, bg, surfaces } = brand.colors;

    // Get surface index: user override > default (1 for identity)
    const surfaceIndex = placementId && tileSurfaces[placementId] !== undefined
        ? tileSurfaces[placementId]
        : 1;
    const surfaceBg = surfaces?.[surfaceIndex ?? 1] || bg;

    // Adapt logo color based on surface brightness
    const { l } = hexToHSL(surfaceBg);
    const adaptivePrimary = l > 55 ? primary : '#FAFAFA';

    return (
        <div className="w-full h-full relative overflow-hidden">
            {/* Background Layer */}
            <div
                className="absolute inset-0"
                style={{ backgroundColor: surfaceBg }}
            />

            {/* Content Layer */}
            <div
                className="relative h-full w-full flex items-center justify-center"
                style={{ padding: `${padding}px` }}
            >
                <motion.div
                    layoutId="identity-logo"
                    className="font-bold tracking-tight leading-none text-center select-none z-10"
                    style={{
                        fontFamily: brand.typography.primary,
                        fontSize: `${size * 2}px`,
                        color: adaptivePrimary,
                    }}
                >
                    {text}
                </motion.div>
            </div>
        </div>
    );
}
