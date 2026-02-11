/**
 * Empty Tile Placeholder Component
 *
 * Renders a placeholder for empty grid slots. Maintains layout stability
 * when tiles haven't been assigned content yet.
 *
 * ## Features
 *
 * - Theme-aware styling via CSS variables
 * - Dashed border to indicate empty state
 * - Shows slot ID for development reference
 * - Renders as button when clickable (accessibility)
 *
 * @component
 * @example
 * <BentoTileEmpty slotId="hero" onClick={() => setFocusedTile('hero')} />
 */
import type { MouseEvent } from 'react';
import { RiAddFill as Plus } from 'react-icons/ri';
import { twMerge } from 'tailwind-merge';
import { useBrandStore } from '@/store/useBrandStore';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale } from '@/utils/typography';

/**
 * Props for BentoTileEmpty component.
 */
export interface BentoTileEmptyProps {
  /** Unique identifier for the grid slot */
  slotId: string;
  /** Primary label for the placeholder */
  label?: string;
  /** Optional helper text to clarify expected content */
  hint?: string;
  /** Whether this tile is currently focused/selected */
  isFocused?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Click handler (makes component interactive) */
  onClick?: (e: MouseEvent) => void;
}

/**
 * Empty tile placeholder – layout-stable, content-independent.
 * Uses theme-aware border/background from CSS variables.
 */
export function BentoTileEmpty({ slotId, label, hint, isFocused, className, onClick }: BentoTileEmptyProps) {
  const typography = useBrandStore((state) => state.brand.typography);
  const { fontFamily: uiFont } = useGoogleFonts(typography.ui, getFontCategory(typography.ui));
  const typeScale = getTypeScale(typography);
  const displayLabel = label || slotId;
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={hint || displayLabel}
      className={twMerge(
        'h-full w-full rounded-xl',
        'flex flex-col items-center justify-center gap-2',
        'border border-dashed',
        'transition-all duration-150',
        'min-h-0 min-w-0 overflow-hidden',
        onClick && 'cursor-pointer text-left active:scale-[0.98]',
        isFocused && 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--canvas-bg)]',
        className
      )}
      style={{
        backgroundColor: 'var(--canvas-surface)',
        borderColor: isFocused ? 'var(--accent)' : 'var(--canvas-border)',
      }}
      data-slot-id={slotId}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center opacity-30"
        style={{ backgroundColor: 'var(--canvas-border)' }}
      >
        <Plus size={16} style={{ color: 'var(--canvas-text)' }} />
      </div>
      <span
        className="text-10 font-medium uppercase tracking-wider opacity-50"
        style={{
          color: 'var(--canvas-text-secondary)',
          fontFamily: uiFont,
          fontSize: `${clampFontSize(typeScale.stepMinus2)}px`,
        }}
      >
        {displayLabel}
      </span>
      {hint ? (
        <span
          className="text-10 font-medium opacity-30"
          style={{
            color: 'var(--canvas-text-secondary)',
            fontFamily: uiFont,
            fontSize: `${clampFontSize(typeScale.stepMinus2)}px`,
          }}
        >
          {hint}
        </span>
      ) : null}
    </Component>
  );
}

export default BentoTileEmpty;
