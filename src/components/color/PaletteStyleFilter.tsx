import { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { STYLE_ORDER, STYLE_LABELS, type PaletteStyle } from '@/utils/paletteStyleClassifier';

interface PaletteStyleFilterProps {
  activeStyle: PaletteStyle | null;
  onStyleChange: (style: PaletteStyle | null) => void;
  styleCounts?: Record<PaletteStyle, number>;
}

export const PaletteStyleFilter = memo(({
  activeStyle,
  onStyleChange,
  styleCounts,
}: PaletteStyleFilterProps) => {
  return (
    <div className="px-3 py-2">
      <div className="flex flex-wrap items-center gap-1.5 pb-0.5">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.08em] shrink-0 mr-0.5"
          style={{ color: 'var(--sidebar-text-muted)' }}
        >
          Style:
        </span>

        {STYLE_ORDER.map((style) => {
          const isActive = activeStyle === style;
          const count = styleCounts?.[style] ?? 0;

          return (
            <motion.button
              key={style}
              onClick={() => onStyleChange(isActive ? null : style)}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors"
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
              <span className="uppercase tracking-[0.04em]">{STYLE_LABELS[style]}</span>
              {count > 0 && (
                <span
                  className="text-[9px] opacity-40"
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
