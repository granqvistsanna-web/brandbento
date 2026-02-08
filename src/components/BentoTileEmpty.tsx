import type { MouseEvent } from 'react';
import { twMerge } from 'tailwind-merge';

export interface BentoTileEmptyProps {
  slotId: string;
  className?: string;
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
