/**
 * Palette Style Filter
 *
 * Horizontal row of pill-shaped toggle buttons for filtering
 * palettes by visual style. Clicking an active pill deselects it (shows all).
 */
import { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
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
  return (
    <div className="px-3 py-2">
      <div className="flex flex-wrap items-center gap-1">
        {STYLE_ORDER.map((style) => {
          const isActive = activeStyle === style;
          const count = styleCounts?.[style] ?? 0;

          return (
            <motion.button
              key={style}
              onClick={() => onStyleChange(isActive ? null : style)}
              className="shrink-0 flex items-center gap-1 px-2 py-[3px] rounded-full text-[11px] font-medium transition-colors"
              style={{
                background: isActive ? 'var(--sidebar-bg-active)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--sidebar-text-muted)' : 'var(--sidebar-border)'}`,
                color: isActive ? 'var(--sidebar-text)' : 'var(--sidebar-text-muted)',
              }}
              whileHover={{
                borderColor: 'var(--sidebar-text-muted)',
                color: 'var(--sidebar-text)',
              }}
              whileTap={{ scale: 0.95 }}
              layout
            >
              <AnimatePresence mode="popLayout">
                {isActive && (
                  <motion.span
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <X size={10} className="stroke-[2.5]" />
                  </motion.span>
                )}
              </AnimatePresence>
              <span>{STYLE_LABELS[style]}</span>
              {count > 0 && (
                <span
                  className="text-[9px] opacity-30 tabular-nums"
                >
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
});

PaletteStyleFilter.displayName = 'PaletteStyleFilter';
