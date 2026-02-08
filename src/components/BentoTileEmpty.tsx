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
import { twMerge } from 'tailwind-merge';

/**
 * Props for BentoTileEmpty component.
 */
export interface BentoTileEmptyProps {
  /** Unique identifier for the grid slot */
  slotId: string;
  /** Additional CSS classes */
  className?: string;
  /** Click handler (makes component interactive) */
  onClick?: (e: MouseEvent) => void;
}

/**
 * Empty tile placeholder – layout-stable, content-independent.
 * Uses theme-aware border/background from CSS variables.
 */
export function BentoTileEmpty({ slotId, className, onClick }: BentoTileEmptyProps) {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={twMerge(
        'h-full w-full rounded-xl',
        'flex items-center justify-center',
        'border border-dashed',
        'transition-colors duration-200',
        'min-h-0 min-w-0 overflow-hidden',
        onClick && 'cursor-pointer text-left',
        className
      )}
      style={{
        backgroundColor: 'var(--canvas-surface)',
        borderColor: 'var(--canvas-border)',
      }}
      data-slot-id={slotId}
    >
      <span
        className="text-[10px] font-medium uppercase tracking-wider opacity-40"
        style={{ color: 'var(--canvas-text-secondary)' }}
      >
        {slotId}
      </span>
    </Component>
  );
}

export default BentoTileEmpty;
