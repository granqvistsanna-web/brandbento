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

  const swatches = [
    { color: neutral, role: 'Surface' },
    { color: primary, role: 'Primary' },
    { color: accent, role: 'Accent' },
  ];

  return (
    <div
      className="w-full h-full grid grid-rows-[3fr_2fr_2fr] gap-0 overflow-hidden"
      style={{ backgroundColor: colors.bg }}
    >
      {swatches.map(({ color, role }) => (
        <motion.button
          key={role}
          className="w-full flex items-end justify-between p-3 min-h-0"
          style={{ backgroundColor: color }}
          whileTap={{ scale: 0.99 }}
          onClick={() => handleCopy(color)}
        >
          <span
            className="font-medium uppercase tracking-wider"
            style={{ color: getTextColor(color), opacity: 0.5, fontFamily: uiFont, fontSize: labelSize }}
          >
            {role}
          </span>
          <span
            className="font-medium uppercase tracking-wider flex items-center gap-1.5"
            style={{ color: getTextColor(color), opacity: 0.4, fontFamily: uiFont, fontSize: labelSize }}
          >
            {copied === color ? <Check size={10} strokeWidth={2.5} /> : null}
            {color}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
