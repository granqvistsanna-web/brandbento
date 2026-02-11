/**
 * Swatch Tile Component
 *
 * Unified color palette display with two variants:
 *
 * - **chips** (default): Pantone-chip inspired vertical swatches
 *   showing all five brand colors with role labels beneath.
 *
 * - **bars**: Horizontal stacked bands showing surface, primary,
 *   and accent. Click any bar to copy its hex value.
 */
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { resolveSurfaceColor } from '@/utils/surface';
import { hexToHSL } from '@/utils/colorMapping';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale } from '@/utils/typography';
import { RiCheckFill as Check } from 'react-icons/ri';

interface SwatchTileProps {
  placementId?: string;
  variant?: 'chips' | 'bars';
}

interface SwatchItem {
  color: string;
  label: string;
}

export function SwatchTile({ placementId, variant = 'chips' }: SwatchTileProps) {
  const { colors, typography } = useBrandStore(
    useShallow((state: BrandStore) => ({
      colors: state.brand.colors,
      typography: state.brand.typography,
    }))
  );
  const tileSurfaceIndex = useBrandStore((state: BrandStore) =>
    placementId ? state.tileSurfaces[placementId] : undefined
  );

  const { bg, surfaces, primary, accent, text } = colors;

  const { fontFamily: bodyFont } = useGoogleFonts(
    typography.secondary,
    getFontCategory(typography.secondary)
  );
  const { fontFamily: uiFont } = useGoogleFonts(
    typography.ui,
    getFontCategory(typography.ui)
  );
  const typeScale = getTypeScale(typography);

  /* ── Bars variant ─────────────────────────────────────── */

  if (variant === 'bars') {
    return (
      <BarsLayout
        colors={colors}
        uiFont={uiFont}
        labelSize={`${clampFontSize(typeScale.stepMinus2)}px`}
      />
    );
  }

  /* ── Chips variant (default) ──────────────────────────── */

  // Default to neutral bg so color chips pop — only use a surface
  // if the user explicitly picked one via the tile surface selector.
  const surfaceBg = tileSurfaceIndex !== undefined
    ? resolveSurfaceColor({ placementId, tileSurfaceIndex, surfaces, bg, defaultIndex: 0 })
    : bg;

  const surfaceL = hexToHSL(surfaceBg).l;
  const isLight = surfaceL > 55;
  const labelColor = isLight ? COLOR_DEFAULTS.TEXT_DARK : COLOR_DEFAULTS.WHITE;

  const swatches: SwatchItem[] = [
    { color: primary || COLOR_DEFAULTS.PRIMARY, label: 'Primary' },
    { color: accent || COLOR_DEFAULTS.ACCENT, label: 'Accent' },
    { color: surfaces?.[0] || COLOR_DEFAULTS.SURFACE, label: 'Surface' },
    { color: bg || COLOR_DEFAULTS.BG, label: 'BG' },
    { color: text || COLOR_DEFAULTS.TEXT_DARK, label: 'Text' },
  ];

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: surfaceBg,
        padding: 'clamp(12px, 6%, 24px)',
      }}
    >
      {/* Section label */}
      <span
        className="uppercase shrink-0"
        style={{
          fontFamily: bodyFont,
          fontSize: 'clamp(8px, 2.5%, 11px)',
          letterSpacing: '0.12em',
          color: labelColor,
          opacity: 0.4,
          marginBottom: 'clamp(8px, 4%, 16px)',
        }}
      >
        Palette
      </span>

      {/* Chip row — fills remaining space */}
      <div
        className="flex-1 min-h-0 flex"
        style={{ gap: 'clamp(4px, 2%, 10px)' }}
      >
        {swatches.map((swatch) => {
          const chipL = hexToHSL(swatch.color).l;
          const needsBorder = Math.abs(chipL - surfaceL) < 12;

          return (
            <div
              key={swatch.label}
              className="flex flex-col min-w-0"
              style={{ flex: '1 1 0' }}
            >
              {/* Color chip — takes most of the height */}
              <div
                className="flex-1 min-h-0"
                style={{
                  backgroundColor: swatch.color,
                  borderRadius: 'clamp(4px, 1.5%, 8px)',
                  border: needsBorder
                    ? `1px solid color-mix(in srgb, ${labelColor} 12%, transparent)`
                    : 'none',
                }}
              />

              {/* Role label beneath the chip */}
              <span
                className="uppercase truncate shrink-0"
                style={{
                  fontFamily: bodyFont,
                  fontSize: 'clamp(7px, 2%, 10px)',
                  letterSpacing: '0.08em',
                  color: labelColor,
                  opacity: 0.45,
                  marginTop: 'clamp(4px, 2%, 8px)',
                  lineHeight: 1,
                }}
              >
                {swatch.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Bars sub-component ─────────────────────────────────── */

function BarsLayout({
  colors,
  uiFont,
  labelSize,
}: {
  colors: BrandStore['brand']['colors'];
  uiFont: string;
  labelSize: string;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const neutral = colors.surface || colors.bg;
  const primaryColor = colors.primary || colors.accent;
  const accentColor = colors.accent || colors.primary;

  const textColorMap = useMemo(() => {
    const map = new Map<string, string>();
    const ensure = (hex: string) => {
      if (!hex || map.has(hex)) return;
      const { l } = hexToHSL(hex);
      map.set(hex, l > 55 ? COLOR_DEFAULTS.PRIMARY : COLOR_DEFAULTS.WHITE);
    };
    [neutral, primaryColor, accentColor].filter(Boolean).forEach(ensure);
    return map;
  }, [neutral, primaryColor, accentColor]);

  const getTextColor = (bgHex: string): string =>
    textColorMap.get(bgHex) ?? COLOR_DEFAULTS.PRIMARY;

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color).then(() => {
      setCopied(color);
      setTimeout(() => setCopied(null), 1500);
    }).catch(() => {
      // Clipboard access denied — silently ignore
    });
  };

  const bars = [
    { color: neutral, role: 'Surface' },
    { color: primaryColor, role: 'Primary' },
    { color: accentColor, role: 'Accent' },
  ];

  return (
    <div
      className="w-full h-full grid grid-rows-[3fr_2fr_2fr] gap-0 overflow-hidden"
      style={{ backgroundColor: colors.bg }}
    >
      {bars.map(({ color, role }) => (
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
            {copied === color ? <Check size={10} /> : null}
            {color}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
