/**
 * Color Tile Component
 *
 * Palette showcase as stacked horizontal swatches.
 * Dominant neutral takes most space, primary and accent
 * appear as proportional accent strips below.
 * Click any swatch to copy its hex value.
 */
import { useBrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { hexToHSL } from '@/utils/colorMapping';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { Check } from 'lucide-react';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale } from '@/utils/typography';

export function ColorTile() {
  const { colors, typography } = useBrandStore(
    useShallow((state) => ({
      colors: state.brand.colors,
      typography: state.brand.typography,
    }))
  );
  const { fontFamily: uiFont } = useGoogleFonts(typography.ui, getFontCategory(typography.ui));
  const typeScale = getTypeScale(typography);
  const [copied, setCopied] = useState<string | null>(null);

  const textColorMap = useMemo(() => {
    const map = new Map<string, string>();
    const ensure = (hex: string) => {
      if (!hex || map.has(hex)) return;
      const { l } = hexToHSL(hex);
      map.set(hex, l > 55 ? COLOR_DEFAULTS.PRIMARY : COLOR_DEFAULTS.WHITE);
    };

    [
      colors.primary,
      colors.accent,
      colors.surface,
      colors.bg,
      colors.text,
      ...(colors.surfaces ?? []),
    ]
      .filter(Boolean)
      .forEach(ensure);

    return map;
  }, [colors]);

  const getTextColor = (bgHex: string): string =>
    textColorMap.get(bgHex) ?? COLOR_DEFAULTS.PRIMARY;

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopied(color);
    setTimeout(() => setCopied(null), 1500);
  };

  const neutral = colors.surface || colors.bg;
  const primary = colors.primary || colors.accent;
  const accent = colors.accent || colors.primary;
  const labelSize = `${clampFontSize(typeScale.stepMinus2)}px`;

  return (
    <div
      className="w-full h-full grid grid-rows-[1fr_auto_auto] gap-0 overflow-hidden"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Dominant neutral — takes most vertical space */}
      <motion.button
        className="w-full flex items-end justify-start p-3 min-h-0"
        style={{ backgroundColor: neutral }}
        whileTap={{ scale: 0.99 }}
        onClick={() => handleCopy(neutral)}
      >
        <span
          className="font-medium uppercase tracking-wider flex items-center gap-1.5"
          style={{ color: getTextColor(neutral), opacity: 0.55, fontFamily: uiFont, fontSize: labelSize }}
        >
          {copied === neutral ? <Check size={10} strokeWidth={2.5} /> : null}
          {neutral}
        </span>
      </motion.button>

      {/* Primary strip */}
      <motion.button
        className="w-full flex items-center justify-start p-3 py-2.5"
        style={{ backgroundColor: primary }}
        whileTap={{ scale: 0.99 }}
        onClick={() => handleCopy(primary)}
      >
        <span
          className="font-medium uppercase tracking-wider flex items-center gap-1.5"
          style={{ color: getTextColor(primary), opacity: 0.65, fontFamily: uiFont, fontSize: labelSize }}
        >
          {copied === primary ? <Check size={10} strokeWidth={2.5} /> : null}
          {primary}
        </span>
      </motion.button>

      {/* Accent strip — thinnest */}
      <motion.button
        className="w-full flex items-center justify-start p-3 py-2"
        style={{ backgroundColor: accent }}
        whileTap={{ scale: 0.99 }}
        onClick={() => handleCopy(accent)}
      >
        <span
          className="font-medium uppercase tracking-wider flex items-center gap-1.5"
          style={{ color: getTextColor(accent), opacity: 0.65, fontFamily: uiFont, fontSize: labelSize }}
        >
          {copied === accent ? <Check size={10} strokeWidth={2.5} /> : null}
          {accent}
        </span>
      </motion.button>
    </div>
  );
}
