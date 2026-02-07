import { checkContrast } from '@/utils/colorContrast';
import type { ColorPalette } from '@/types/brand';

interface ContrastBadgeProps {
  palette: ColorPalette;
}

export function ContrastBadge({ palette }: ContrastBadgeProps) {
  // Check text on background (primary contrast pair)
  const result = checkContrast(palette.text, palette.background);

  const getBadgeStyles = (level: 'AAA' | 'AA' | 'fail') => {
    switch (level) {
      case 'AAA':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'AA':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
      case 'fail':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
    }
  };

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2 py-1 rounded-full
        text-xs font-medium border
        ${getBadgeStyles(result.level)}
      `}
      title={`Contrast ratio: ${result.ratio}:1`}
    >
      <span>{result.ratio}:1</span>
      <span className="font-semibold">
        {result.level === 'fail' ? 'Low' : result.level}
      </span>
      {result.level === 'fail' && (
        <span className="text-[10px]" title="Text may be hard to read">
          (warning)
        </span>
      )}
    </div>
  );
}
