/**
 * Interface Tile Component
 *
 * UI component showcase displaying buttons in the brand style.
 * Demonstrates how the brand colors work in interactive elements.
 *
 * ## Features
 *
 * - Primary button with brand primary color
 * - Secondary/outline button with border
 * - Adaptive button text color based on primary brightness
 * - Hover and active states with micro-interactions
 * - Uses secondary/UI font for button text
 * - Surface color from tileSurfaces overrides or default (index 2)
 *
 * @component
 * @example
 * <InterfaceTile placementId="buttons" />
 */
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { ArrowRight } from 'lucide-react';
import { getAdaptiveTextColor } from '@/utils/color';
import { resolveSurfaceColor } from '@/utils/surface';

/**
 * Props for InterfaceTile component.
 */
interface InterfaceTileProps {
  /** Grid placement ID for surface color override lookup */
  placementId?: string;
}

/**
 * UI components showcase tile with buttons.
 */
export function InterfaceTile({ placementId }: InterfaceTileProps) {
    const { colors, bodyFont } = useBrandStore(
        useShallow((state: BrandStore) => ({
            colors: state.brand.colors,
            bodyFont: state.brand.typography.secondary,
        }))
    );
    const tileSurfaceIndex = useBrandStore((state: BrandStore) =>
        placementId ? state.tileSurfaces[placementId] : undefined
    );
    const { primary, text, bg, surfaces } = colors;

    // Get surface index: user override > default (2 for interface)
    const bgColor = resolveSurfaceColor({
        placementId,
        tileSurfaceIndex,
        surfaces,
        bg,
        defaultIndex: 2,
    });

    // Adapt text colors based on surface brightness
    const adaptiveText = getAdaptiveTextColor(bgColor, text, '#FAFAFA');
    const buttonTextColor = getAdaptiveTextColor(bgColor, bg, '#0A0A0A');

    return (
        <div
            className="w-full h-full p-6 flex flex-col justify-center items-center gap-4 relative overflow-hidden transition-colors duration-300"
            style={{ backgroundColor: bgColor }}
        >
            {/* Primary Button */}
            <div className="w-full max-w-[200px] group relative z-10">
                <button
                    className="w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-fast shadow-sm hover:shadow-md active:scale-[0.98]"
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
                    className="w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 border transition-fast hover:opacity-80 active:scale-[0.98]"
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
