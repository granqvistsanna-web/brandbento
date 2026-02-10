/**
 * Palette Grid
 *
 * Flat scrollable list of palettes grouped by style (pastel, neon, etc.).
 * Each group has a sticky header that pins while scrolling.
 * Responds to PaletteStyleFilter selection to narrow to one category.
 */
import { memo, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PaletteRow } from './PaletteRow';
import {
  getStyleGroups,
  STYLE_ORDER,
  STYLE_LABELS,
  type PaletteStyle,
} from '@/utils/paletteStyleClassifier';

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

  // Determine which styles to show
  const visibleStyles = useMemo(() => {
    if (activeStyle) return [activeStyle];
    return STYLE_ORDER.filter(s => groups[s].length > 0);
  }, [activeStyle, groups]);

  // Scroll to top when filter changes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeStyle]);

  return (
    <div
      ref={scrollRef}
      className="overflow-y-auto flex-1 min-h-0 custom-scrollbar"
    >
      <AnimatePresence mode="popLayout">
        {visibleStyles.map((style) => (
          <motion.div
            key={style}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* Sticky group header */}
            <div
              className="sticky top-0 px-3 pt-3 pb-1 flex items-center gap-2"
              style={{ background: 'var(--sidebar-bg)', zIndex: 'var(--z-panel)' }}
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
                {groups[style].length}
              </span>
            </div>

            {/* All palettes in this group */}
            <div className="px-1 pb-1 space-y-0.5">
              {groups[style].map((palette) => (
                <PaletteRow
                  key={palette.id}
                  palette={palette}
                  isSelected={selectedPaletteId === palette.id}
                  onSelect={onSelectPalette}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});

PaletteGrid.displayName = 'PaletteGrid';
