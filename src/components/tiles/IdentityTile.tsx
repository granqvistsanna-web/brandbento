import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { motion } from 'motion/react';
import { hexToHSL } from '@/utils/colorMapping';

interface IdentityTileProps {
    placementId?: string;
}

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
