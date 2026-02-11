/**
 * Palette Style Filter
 *
 * Horizontal row of pill-shaped buttons for filtering palettes by visual style.
 * "All" shows every category; clicking a category shows only that category.
 */
import { memo } from 'react';
import { STYLE_ORDER, STYLE_LABELS, type PaletteStyle } from '@/utils/paletteStyleClassifier';

interface PaletteStyleFilterProps {
  /** Currently selected style, or null for "show all" */
  activeStyle: PaletteStyle | null;
  /** Called with new style or null to clear filter */
  onStyleChange: (style: PaletteStyle | null) => void;
  /** Number of palettes per style (shown as count badge) */
  styleCounts?: Record<PaletteStyle, number>;
}

export const PaletteStyleFilter = memo(({
  activeStyle,
  onStyleChange,
  styleCounts,
}: PaletteStyleFilterProps) => {
  const isAllActive = activeStyle === null;
  const totalCount = styleCounts
    ? Object.values(styleCounts).reduce((sum, n) => sum + n, 0)
    : 0;

  return (
    <div className="px-3 py-1.5">
      <div className="flex flex-wrap items-center gap-1">
        {/* "All" pill */}
        <button
          onClick={() => onStyleChange(null)}
          className="shrink-0 flex items-center gap-1 h-6 px-2.5 rounded-full text-[11px] font-medium transition-all duration-100"
          style={{
            background: isAllActive ? 'var(--accent-muted)' : 'transparent',
            color: isAllActive ? 'var(--accent)' : 'var(--sidebar-text-muted)',
          }}
          onMouseEnter={(e) => {
            if (!isAllActive) {
              e.currentTarget.style.background = 'var(--sidebar-bg-hover)';
              e.currentTarget.style.color = 'var(--sidebar-text)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isAllActive) {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--sidebar-text-muted)';
            }
          }}
        >
          <span>All</span>
          {totalCount > 0 && (
            <span
              className="text-[9px] tabular-nums"
              style={{ opacity: isAllActive ? 0.7 : 0.35 }}
            >
              {totalCount}
            </span>
          )}
        </button>

        {STYLE_ORDER.map((style) => {
          const isActive = activeStyle === style;
          const count = styleCounts?.[style] ?? 0;

          return (
            <button
              key={style}
              onClick={() => onStyleChange(style)}
              className="shrink-0 flex items-center gap-1 h-6 px-2.5 rounded-full text-[11px] font-medium transition-all duration-100"
              style={{
                background: isActive ? 'var(--accent-muted)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--sidebar-text-muted)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--sidebar-bg-hover)';
                  e.currentTarget.style.color = 'var(--sidebar-text)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--sidebar-text-muted)';
                }
              }}
            >
              <span>{STYLE_LABELS[style]}</span>
              {count > 0 && (
                <span
                  className="text-[9px] tabular-nums"
                  style={{ opacity: isActive ? 0.7 : 0.35 }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});

PaletteStyleFilter.displayName = 'PaletteStyleFilter';
