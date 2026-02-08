import { useBrandStore } from '@/store/useBrandStore';
import { motion } from 'motion/react';

export function IdentityTile() {
    const brand = useBrandStore((state) => state.brand);
    const { text, size, padding } = brand.logo;
    const { primary, bg, text: textColor, accent } = brand.colors;
    const { url: imageUrl } = brand.imagery || {};

    // We can toggle between image bg or solid color. For now, let's make it impactful.
    // If we have an image, maybe use it with an overlay?
    // User said "logo on img bg".

    return (
        <div className="w-full h-full relative overflow-hidden group">
            {/* Background Layer */}
            <div
                className="absolute inset-0 transition-colors duration-500"
                style={{ backgroundColor: bg }}
            />

            {imageUrl && (
                <>
                    <img
                        src={imageUrl}
                        alt="Brand Background"
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </>
            )}

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
                        fontSize: `${size * 2}px`, // Make it Hero size
                        color: primary,
                        textShadow: imageUrl ? '0 2px 10px rgba(0,0,0,0.1)' : 'none'
                    }}
                >
                    {text}
                </motion.div>
            </div>

            {/* Simple "Identity" Label for clarity? Or keep it clean? Keeping clean for now. */}
        </div>
    );
}
