import { getContrastTextColor } from '@/utils/colorContrast';
import type { ColorPalette } from '@/types/brand';

interface ColorSwatchProps {
  color: string;
  role: keyof ColorPalette;
  isSelected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

const ROLE_LABELS: Record<keyof ColorPalette, string> = {
  primary: 'Primary',
  accent: 'Accent',
  background: 'Background',
  text: 'Text',
};

export function ColorSwatch({
  color,
  role,
  isSelected = false,
  onClick,
}: ColorSwatchProps) {
  const textColor = getContrastTextColor(color);

  return (
    <button
      onClick={onClick}
      className={`
        w-full h-12 px-3 flex items-center justify-between
        rounded-md transition-all duration-150
        hover:scale-[1.02] active:scale-[0.98]
        ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-neutral-900' : ''}
      `}
      style={{ backgroundColor: color, color: textColor }}
      aria-label={`${ROLE_LABELS[role]}: ${color}`}
    >
      <span className="text-xs font-medium opacity-80">
        {ROLE_LABELS[role]}
      </span>
      <span className="text-xs font-mono uppercase">
        {color}
      </span>
    </button>
  );
}
