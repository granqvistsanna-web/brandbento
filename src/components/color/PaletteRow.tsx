/**
 * Palette Row
 *
 * Single selectable palette item showing name + role-mapped color preview.
 * Shows how palette colors will map to brand roles (bg, primary, accent, surface, text).
 */
import { memo, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { mapPaletteToBrand } from '@/utils/colorMapping';
import type { StyledPalette } from '@/utils/paletteStyleClassifier';

interface PaletteRowProps {
  /** Palette data including colors, name, and style classification */
  palette: StyledPalette;
  /** Whether this palette is currently applied */
  isSelected: boolean;
  /** Called with palette ID when row is clicked */
  onSelect: (id: string) => void;
}

export const PaletteRow = memo(({ palette, isSelected, onSelect }: PaletteRowProps) => {
  const handleClick = useCallback(() => onSelect(palette.id), [onSelect, palette.id]);

  // Map palette to brand roles for preview
  const mapped = useMemo(() => mapPaletteToBrand(palette.colors), [palette.colors]);

  // Show role-mapped colors with proportional sizing
  const previewColors = [
    { hex: mapped.bg, flex: 3 },
    { hex: mapped.surface, flex: 2 },
    { hex: mapped.primary, flex: 2.5 },
    { hex: mapped.accent, flex: 2 },
    { hex: mapped.text, flex: 1 },
  ];

  return (
    <motion.button
      onClick={handleClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group text-left"
      style={{
        background: isSelected
          ? 'var(--sidebar-bg-active)'
          : 'transparent',
      }}
      whileHover={{
        backgroundColor: isSelected
          ? 'var(--sidebar-bg-active)'
          : 'var(--sidebar-bg-hover)',
      }}
      whileTap={{ scale: 0.985 }}
    >
      {/* Palette name */}
      <span
        className="text-[13px] font-medium shrink-0 w-[88px] truncate"
        style={{ color: isSelected ? 'var(--sidebar-text)' : 'var(--sidebar-text-secondary)' }}
      >
        {palette.name}
      </span>

      {/* Role-mapped color preview */}
      <div className="flex-1 flex h-[28px] rounded-md overflow-hidden" style={{
        outline: isSelected ? '2px solid var(--accent)' : '1px solid var(--sidebar-border-subtle)',
        outlineOffset: isSelected ? '1px' : '0',
      }}>
        {previewColors.map((color, i) => (
          <div
            key={i}
            className="h-full transition-all duration-200"
            style={{
              backgroundColor: color.hex,
              flex: color.flex,
            }}
          />
        ))}
      </div>
    </motion.button>
  );
});

PaletteRow.displayName = 'PaletteRow';
