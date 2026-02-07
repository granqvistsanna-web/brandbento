import type { ColorPalette } from '@/types/brand';

interface DuotoneFilterProps {
  children: React.ReactNode;
  palette: ColorPalette;
}

/**
 * Duotone effect using CSS mix-blend-mode.
 * Maps image shadows to background color, highlights to primary color.
 */
export function DuotoneFilter({ children, palette }: DuotoneFilterProps) {
  return (
    <div
      className="relative w-full h-full"
      style={{ backgroundColor: palette.background }}
    >
      {/* Image with grayscale + darken blend */}
      <div
        className="w-full h-full"
        style={{
          filter: 'grayscale(100%) contrast(1)',
          mixBlendMode: 'darken',
        }}
      >
        {children}
      </div>

      {/* Primary color overlay with lighten blend */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: palette.primary,
          mixBlendMode: 'lighten',
        }}
      />
    </div>
  );
}
