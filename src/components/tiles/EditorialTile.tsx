/**
 * Editorial Tile Component
 *
 * Typography showcase that makes font pairings feel alive.
 * Uses a decorative accent line and generous whitespace
 * to frame the headline + body like a magazine spread.
 */
import { useBrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { getAdaptiveTextColor } from '@/utils/color';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getLetterSpacing, getTypeScale } from '@/utils/typography';

interface EditorialTileProps {
  placementId?: string;
}

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
  const { primary, secondary, weightHeadline, weightBody, letterSpacing } = typography;
  const { text: textColor, bg, surfaces } = colors;
  const { fontFamily: headlineFont } = useGoogleFonts(primary, getFontCategory(primary));
  const { fontFamily: bodyFont } = useGoogleFonts(secondary, getFontCategory(secondary));

  const surfaceBg = resolveSurfaceColor({
    placementId,
    tileSurfaceIndex,
    surfaces,
    bg,
    defaultIndex: 0,
  });

  const adaptiveTextColor = getAdaptiveTextColor(surfaceBg, textColor, COLOR_DEFAULTS.TEXT_LIGHT);
  const typeScale = getTypeScale(typography);
  const spacing = getLetterSpacing(letterSpacing);

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

  const copy = copyByPreset[activePreset] ?? copyByPreset.default;

  return (
    <div
      className="w-full h-full p-6 flex flex-col justify-center gap-5 transition-colors duration-300 relative overflow-hidden"
      style={{ backgroundColor: surfaceBg }}
    >
      <h1
        className="leading-[1.12]"
        style={{
          fontFamily: headlineFont,
          fontWeight: parseInt(weightHeadline) || 700,
                    fontSize: `${clampFontSize(typeScale.step2)}px`,
          letterSpacing: spacing,
          color: adaptiveTextColor,
          textWrap: 'balance',
        }}
      >
        {copy.title}
      </h1>

      <p
        className="leading-relaxed max-w-[30ch]"
        style={{
          fontFamily: bodyFont,
          fontWeight: parseInt(weightBody) || 400,
                    fontSize: `${clampFontSize(typeScale.base)}px`,
          letterSpacing: spacing,
          color: adaptiveTextColor,
          opacity: 0.6,
        }}
      >
        {copy.body}
      </p>
    </div>
  );
}
