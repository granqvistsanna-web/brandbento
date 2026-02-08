import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { ArrowRight } from 'lucide-react';
import { hexToHSL } from '@/utils/colorMapping';

interface InterfaceTileProps {
    placementId?: string;
}

export function InterfaceTile({ placementId }: InterfaceTileProps) {
    const brand = useBrandStore((state: BrandStore) => state.brand);
    const tileSurfaces = useBrandStore((state: BrandStore) => state.tileSurfaces);
    const { primary, text, bg, surfaces } = brand.colors;
    const { secondary: bodyFont } = brand.typography;

    // Get surface index: user override > default (2 for interface)
    const surfaceIndex = placementId && tileSurfaces[placementId] !== undefined
        ? tileSurfaces[placementId]
        : 2;
    const bgColor = surfaces?.[surfaceIndex ?? 2] || bg;

    // Adapt text colors based on surface brightness
    const { l } = hexToHSL(bgColor);
    const adaptiveText = l > 55 ? text : '#FAFAFA';
    const buttonTextColor = l > 55 ? bg : '#0A0A0A';

    return (
        <div
            className="w-full h-full p-6 flex flex-col justify-center items-center gap-4 relative overflow-hidden transition-colors duration-300"
            style={{ backgroundColor: bgColor }}
        >
            {/* Primary Button */}
            <div className="w-full max-w-[200px] group relative z-10">
                <button
                    className="w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
                    style={{
                        backgroundColor: primary,
                        color: buttonTextColor,
                        fontFamily: bodyFont,
                        fontWeight: 600,
                        fontSize: '0.9rem'
                    }}
                >
                    <span>Get Started</span>
                    <ArrowRight size={14} />
                </button>
            </div>

            {/* Secondary Button */}
            <div className="w-full max-w-[200px] z-10">
                <button
                    className="w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 border transition-all duration-200 hover:opacity-80 active:scale-[0.98]"
                    style={{
                        borderColor: adaptiveText,
                        color: adaptiveText,
                        fontFamily: bodyFont,
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        opacity: 0.8
                    }}
                >
                    <span>View Details</span>
                </button>
            </div>


        </div>
    );
}
