import { memo, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PaletteRow } from './PaletteRow';
import {
  getStyledPalettes,
  getStyleGroups,
  STYLE_ORDER,
  STYLE_LABELS,
  type PaletteStyle,
  type StyledPalette,
} from '@/utils/paletteStyleClassifier';

interface PaletteGridProps {
  activeStyle: PaletteStyle | null;
  selectedPaletteId: string | null;
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
      className="overflow-y-auto flex-1 min-h-0"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--sidebar-border) transparent',
      }}
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
            {/* Style section header */}
            <div className="px-3 pt-3 pb-1 flex items-center gap-2">
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

            {/* Palette rows */}
            <div className="px-1 pb-1 space-y-0.5">
              {groups[style].map((palette, index) => (
                <motion.div
                  key={palette.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(index * 0.02, 0.3) }}
                >
                  <PaletteRow
                    palette={palette}
                    isSelected={selectedPaletteId === palette.id}
                    onSelect={onSelectPalette}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});

PaletteGrid.displayName = 'PaletteGrid';
