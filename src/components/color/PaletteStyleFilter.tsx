/**
 * Palette Style Filter
 *
 * Horizontal scrollable row of pill-shaped buttons for filtering palettes by visual style.
 * "All" shows every category; clicking a category shows only that category.
 */
import { memo } from 'react';
import { STYLE_ORDER, STYLE_LABELS, type PaletteStyle } from '@/utils/paletteStyleClassifier';

interface PaletteStyleFilterProps {
  /** Currently selected style, or null for "show all" */
  activeStyle: PaletteStyle | null;
  /** Called with new style or null to clear filter */
  onStyleChange: (style: PaletteStyle | null) => void;
}

const pillClass = "shrink-0 h-6 px-2.5 rounded-full text-[11px] font-medium transition-all duration-100";

export const PaletteStyleFilter = memo(({
  activeStyle,
  onStyleChange,
}: PaletteStyleFilterProps) => {
  const isAllActive = activeStyle === null;

  return (
    <div className="px-3 py-1.5">
      <div
        className="flex items-center gap-1 overflow-x-auto scrollbar-hidden"
      >
        {/* "All" pill */}
        <button
          onClick={() => onStyleChange(null)}
          className={pillClass}
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
          All
        </button>

        {STYLE_ORDER.map((style) => {
          const isActive = activeStyle === style;

          return (
            <button
              key={style}
              onClick={() => onStyleChange(style)}
              className={pillClass}
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
              {STYLE_LABELS[style]}
            </button>
          );
        })}
      </div>
    </div>
  );
});

PaletteStyleFilter.displayName = 'PaletteStyleFilter';
