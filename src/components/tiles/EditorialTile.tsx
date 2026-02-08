/**
 * Editorial Tile Component
 *
 * Typography showcase tile displaying headline and body text.
 * Demonstrates the brand's font pairing and type scale.
 *
 * ## Features
 *
 * - Headline using primary font + headline weight
 * - Body text using secondary font + body weight
 * - Type scale applied (baseSize × scale² for headlines)
 * - Letter spacing from brand settings
 * - Adaptive text colors based on surface brightness
 * - Surface color from tileSurfaces overrides or default (index 0)
 *
 * @component
 * @example
 * <EditorialTile placementId="editorial" />
 */
import { useBrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { getAdaptiveTextColor } from '@/utils/color';
import { resolveSurfaceColor } from '@/utils/surface';

/**
 * Props for EditorialTile component.
 */
interface EditorialTileProps {
  /** Grid placement ID for surface color override lookup */
  placementId?: string;
}

/**
 * Typography showcase tile with headline and body.
 */
export function EditorialTile({ placementId }: EditorialTileProps) {
    const { typography, colors } = useBrandStore(
        useShallow((state) => ({
            typography: state.brand.typography,
            colors: state.brand.colors,
        }))
    );
    const activePreset = useBrandStore((state) => state.activePreset);
    const tileSurfaceIndex = useBrandStore((state) =>
        placementId ? state.tileSurfaces[placementId] : undefined
    );
    const { primary, secondary, weightHeadline, weightBody, scale, baseSize, letterSpacing } = typography;
    const { text: textColor, bg, surfaces } = colors;

    // Get surface index: user override > default (0 for editorial)
    const surfaceBg = resolveSurfaceColor({
        placementId,
        tileSurfaceIndex,
        surfaces,
        bg,
        defaultIndex: 0,
    });

    // Get readable text color for this surface
    const adaptiveTextColor = getAdaptiveTextColor(surfaceBg, textColor, '#FAFAFA');

    // Calculate sizes based on type scale
    const titleSize = baseSize * scale * scale; // 2 steps up from base
    const bodySize = baseSize;

    // Map letter spacing setting to CSS value
    const spacingMap = {
        tight: '-0.02em',
        normal: '0',
        wide: '0.05em',
    };
    const spacing = spacingMap[letterSpacing] || '0';

    const copyByPreset: Record<string, { title: string; body: string }> = {
        default: {
            title: "Make the thing you wish existed.",
            body: "A clear brand system for ideas that are ready to ship.",
        },
        techStartup: {
            title: "Ship smarter updates, faster.",
            body: "Turn complex product news into crisp, confident stories.",
        },
        luxuryRetail: {
            title: "Elevate the everyday.",
            body: "An understated brand system with room for the extraordinary.",
        },
        communityNonprofit: {
            title: "Bring people into the story.",
            body: "Warm, human-first design that makes the mission easy to join.",
        },
        creativeStudio: {
            title: "Make bold work feel effortless.",
            body: "A flexible system for briefs, pitches, and launches.",
        },
        foodDrink: {
            title: "Samba sweetness.",
            body: "Succulent and bold, a dessert that captures bite.",
        },
    };

    const copy =
        copyByPreset[activePreset] ?? copyByPreset.default;

    return (
        <div
            className="w-full h-full p-6 flex flex-col justify-center gap-4 transition-colors duration-300"
            style={{ backgroundColor: surfaceBg }}
        >
            <h1
                className="leading-tight"
                style={{
                    fontFamily: primary,
                    fontWeight: parseInt(weightHeadline) || 700,
                    fontSize: `${titleSize}px`,
                    letterSpacing: spacing,
                    color: adaptiveTextColor,
                }}
            >
                {copy.title}
            </h1>

            <p
                className="leading-relaxed opacity-70"
                style={{
                    fontFamily: secondary,
                    fontWeight: parseInt(weightBody) || 400,
                    fontSize: `${bodySize}px`,
                    letterSpacing: spacing,
                    color: adaptiveTextColor,
                }}
            >
                {copy.body}
            </p>
        </div>
    );
}
