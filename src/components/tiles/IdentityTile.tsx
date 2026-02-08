import { useBrandStore } from '@/store/useBrandStore';
import { motion } from 'motion/react';

export function IdentityTile() {
    const brand = useBrandStore((state) => state.brand);
    const { text, size, padding } = brand.logo;
    const { primary, bg } = brand.colors;

    return (
        <div className="w-full h-full relative overflow-hidden">
            {/* Background Layer */}
            <div
                className="absolute inset-0"
                style={{ backgroundColor: bg }}
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
                        color: primary,
                    }}
                >
                    {text}
                </motion.div>
            </div>
        </div>
    );
}
