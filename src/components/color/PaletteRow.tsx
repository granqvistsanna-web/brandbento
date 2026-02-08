import { memo, useCallback } from 'react';
import { motion } from 'motion/react';
import type { StyledPalette } from '@/utils/paletteStyleClassifier';

interface PaletteRowProps {
  palette: StyledPalette;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const PaletteRow = memo(({ palette, isSelected, onSelect }: PaletteRowProps) => {
  const handleClick = useCallback(() => onSelect(palette.id), [onSelect, palette.id]);

  // Show up to 5 colors in the bar, proportionally sized
  const displayColors = palette.colors
    .filter(hex => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex))
    .slice(0, 5);

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
          : 'rgba(255,255,255,0.04)',
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

      {/* Color bar */}
      <div className="flex-1 flex h-[28px] rounded-md overflow-hidden" style={{
        outline: isSelected ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.06)',
        outlineOffset: isSelected ? '1px' : '0',
      }}>
        {displayColors.map((color, i) => (
          <div
            key={`${color}-${i}`}
            className="h-full transition-all duration-200"
            style={{
              backgroundColor: color,
              flex: 1,
            }}
          />
        ))}
      </div>
    </motion.button>
  );
});

PaletteRow.displayName = 'PaletteRow';
