/**
 * Palette Grid
 *
 * Flat scrollable list of palettes grouped by style (pastel, neon, etc.).
 * Each group has a sticky header that pins while scrolling.
 * Shows a limited batch per group with "Show more" pagination.
 * Responds to PaletteStyleFilter selection to narrow to one category.
 */
import { memo, useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RiArrowDownSLine as ChevronDown } from 'react-icons/ri';
import { PaletteRow } from './PaletteRow';
import {
  getStyleGroups,
  STYLE_ORDER,
  STYLE_LABELS,
  type PaletteStyle,
} from '@/utils/paletteStyleClassifier';

const PAGE_SIZE = 6;

interface PaletteGridProps {
  /** Currently active style filter, or null for all styles */
  activeStyle: PaletteStyle | null;
  /** ID of the currently applied palette (for highlight) */
  selectedPaletteId: string | null;
  /** Called when user clicks a palette row */
  onSelectPalette: (id: string) => void;
}

export const PaletteGrid = memo(({
  activeStyle,
  selectedPaletteId,
  onSelectPalette,
}: PaletteGridProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const groups = useMemo(() => getStyleGroups(), []);

  // Track how many palettes to show per style group
  const [limits, setLimits] = useState<Record<string, number>>({});

  // Determine which styles to show
  const visibleStyles = useMemo(() => {
    if (activeStyle) return [activeStyle];
    return STYLE_ORDER.filter(s => groups[s].length > 0);
  }, [activeStyle, groups]);

  // Reset limits when filter changes
  useEffect(() => {
    setLimits({});
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeStyle]);

  const showMore = useCallback((style: PaletteStyle) => {
    setLimits(prev => ({
      ...prev,
      [style]: (prev[style] || PAGE_SIZE) + PAGE_SIZE,
    }));
  }, []);

  return (
    <div
      ref={scrollRef}
      className="overflow-y-auto flex-1 min-h-0 custom-scrollbar"
    >
      <AnimatePresence mode="popLayout">
        {visibleStyles.map((style) => {
          const all = groups[style];
          const limit = limits[style] || PAGE_SIZE;
          const visible = all.slice(0, limit);
          const remaining = all.length - limit;

          return (
            <motion.div
              key={style}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Group header */}
              <div
                className="px-3 pt-3 pb-1 flex items-center gap-2"
              >
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: 'var(--sidebar-text-muted)' }}
                >
                  {STYLE_LABELS[style]}
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: 'var(--sidebar-border-subtle)' }}
                />
                <span
                  className="text-[10px] tabular-nums"
                  style={{ color: 'var(--sidebar-text-muted)', opacity: 0.5 }}
                >
                  {visible.length}/{all.length}
                </span>
              </div>

              {/* Visible palettes */}
              <div className="px-1 pb-1 space-y-0.5">
                {visible.map((palette) => (
                  <PaletteRow
                    key={palette.id}
                    palette={palette}
                    isSelected={selectedPaletteId === palette.id}
                    onSelect={onSelectPalette}
                  />
                ))}
              </div>

              {/* Show more button */}
              {remaining > 0 && (
                <div className="px-3 pb-3">
                  <button
                    onClick={() => showMore(style)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-colors duration-100"
                    style={{
                      color: 'var(--sidebar-text-muted)',
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--sidebar-bg-hover)';
                      e.currentTarget.style.color = 'var(--sidebar-text)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--sidebar-text-muted)';
                    }}
                  >
                    <span>{remaining} more</span>
                    <ChevronDown size={12} />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
});

PaletteGrid.displayName = 'PaletteGrid';
