import type { ColorPalette } from '@/types/brand';
import { hexToHsl, hslToHex } from './colorConversion';

export type PalettePresetName =
  | 'original'
  | 'warm'
  | 'cool'
  | 'bold'
  | 'muted';

export interface PalettePreset {
  name: PalettePresetName;
  label: string;
  generate: (baseColors: string[]) => ColorPalette;
}

/**
 * Get most saturated color from array (likely the brand primary)
 */
function getMostSaturated(colors: string[]): string {
  if (colors.length === 0) return '#2563EB';
  return colors.reduce((best, color) => {
    const bestHsl = hexToHsl(best);
    const colorHsl = hexToHsl(color);
    return colorHsl.s > bestHsl.s ? color : best;
  });
}

/**
 * Shift hue by degrees (wraps around 360)
 */
function shiftHue(hex: string, degrees: number): string {
  const hsl = hexToHsl(hex);
  hsl.h = (hsl.h + degrees + 360) % 360;
  return hslToHex(hsl);
}

/**
 * Adjust saturation by multiplier (0-1 reduces, >1 increases)
 */
function adjustSaturation(hex: string, multiplier: number): string {
  const hsl = hexToHsl(hex);
  hsl.s = Math.min(100, Math.max(0, hsl.s * multiplier));
  return hslToHex(hsl);
}

/**
 * Get complementary color (opposite on color wheel)
 */
function getComplementary(hex: string): string {
  return shiftHue(hex, 180);
}

export const PALETTE_PRESETS: PalettePreset[] = [
  {
    name: 'original',
    label: 'Extracted',
    generate: (baseColors) => {
      // Use extracted colors directly, assign roles by saturation/luminance
      const primary = getMostSaturated(baseColors);
      const remaining = baseColors.filter(c => c !== primary);

      // Find darkest for text, lightest for background
      const sorted = [...remaining].sort((a, b) => {
        const aHsl = hexToHsl(a);
        const bHsl = hexToHsl(b);
        return aHsl.l - bHsl.l;
      });

      return {
        primary,
        accent: remaining.length > 1 ? remaining[0] : shiftHue(primary, 30),
        background: sorted[sorted.length - 1] || '#F5F5F5',
        text: sorted[0] || '#111111',
      };
    },
  },
  {
    name: 'warm',
    label: 'Warm Neutral',
    generate: (baseColors) => {
      const primary = shiftHue(getMostSaturated(baseColors), 15);
      return {
        primary,
        accent: shiftHue(primary, -30),
        background: '#FFF9F5',
        text: '#2C1810',
      };
    },
  },
  {
    name: 'cool',
    label: 'Cool Professional',
    generate: (baseColors) => {
      const primary = shiftHue(getMostSaturated(baseColors), -15);
      return {
        primary,
        accent: shiftHue(primary, 30),
        background: '#F5F9FF',
        text: '#0F1C2E',
      };
    },
  },
  {
    name: 'bold',
    label: 'Bold Saturated',
    generate: (baseColors) => {
      const primary = adjustSaturation(getMostSaturated(baseColors), 1.3);
      return {
        primary,
        accent: getComplementary(primary),
        background: '#FFFFFF',
        text: '#000000',
      };
    },
  },
  {
    name: 'muted',
    label: 'Muted Editorial',
    generate: (baseColors) => {
      const primary = adjustSaturation(getMostSaturated(baseColors), 0.5);
      return {
        primary,
        accent: adjustSaturation(shiftHue(primary, 180), 0.4),
        background: '#FFFCF5',
        text: '#1A1814',
      };
    },
  },
];

/**
 * Generate a palette from base colors using a preset
 */
export function generatePalette(
  baseColors: string[],
  presetName: PalettePresetName = 'original'
): ColorPalette {
  const preset = PALETTE_PRESETS.find(p => p.name === presetName) || PALETTE_PRESETS[0];
  return preset.generate(baseColors);
}

/**
 * Create default palette from defaults
 */
export function createDefaultPalette(): ColorPalette {
  return {
    primary: '#2563EB',
    accent: '#7C3AED',
    background: '#F5F5F5',
    text: '#111111',
  };
}
