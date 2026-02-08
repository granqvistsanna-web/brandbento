import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { hexToHSL } from '@/utils/colorMapping';

interface EditorialTileProps {
    placementId?: string;
}

export function EditorialTile({ placementId }: EditorialTileProps) {
    const brand = useBrandStore((state: BrandStore) => state.brand);
    const tileSurfaces = useBrandStore((state: BrandStore) => state.tileSurfaces);
    const { primary, secondary, weightHeadline, weightBody, scale, baseSize, letterSpacing } = brand.typography;
    const { text: textColor, bg, surfaces } = brand.colors;

    // Get surface index: user override > default (0 for editorial)
    const surfaceIndex = placementId && tileSurfaces[placementId] !== undefined
        ? tileSurfaces[placementId]
        : 0;
    const surfaceBg = surfaces?.[surfaceIndex ?? 0] || bg;

    // Get readable text color for this surface
    const { l } = hexToHSL(surfaceBg);
    const adaptiveTextColor = l > 55 ? textColor : '#FAFAFA';

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
                The Future Is Created.
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
                We build digital experiences that matter. Quality over quantity, always.
            </p>
        </div>
    );
}
