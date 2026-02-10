/**
 * Color Palette Panel
 *
 * Top-level color section with two modes via segmented control:
 * - Curated: browse pre-built palettes filtered by style (pastel, neon, etc.)
 * - Custom: manually edit individual brand color roles (bg, text, primary, etc.)
 */
import { memo, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Sliders } from 'lucide-react';
import { useBrandStore } from '@/store/useBrandStore';
import { getStyleGroups, type PaletteStyle } from '@/utils/paletteStyleClassifier';
import { PaletteStyleFilter } from './PaletteStyleFilter';
import { PaletteGrid } from './PaletteGrid';
import { CustomModePanel } from './CustomModePanel';

type PanelMode = 'curated' | 'custom';

export const ColorPalettePanel = memo(() => {
  const [mode, setMode] = useState<PanelMode>('curated');
  const [activeStyle, setActiveStyle] = useState<PaletteStyle | null>(null);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(null);

  const applyPalette = useBrandStore((s) => s.applyPalette);

  // Style group counts for filter pills
  const styleCounts = useMemo(() => {
    const groups = getStyleGroups();
    const counts = {} as Record<PaletteStyle, number>;
    for (const [style, palettes] of Object.entries(groups)) {
      counts[style as PaletteStyle] = palettes.length;
    }
    return counts;
  }, []);

  const handleSelectPalette = useCallback((paletteId: string) => {
    setSelectedPaletteId(paletteId);
    applyPalette(paletteId);
  }, [applyPalette]);

  return (
    <div className="flex flex-col" style={{ maxHeight: '420px' }}>
      {/* Segmented control: Curated / Custom */}
      <div className="px-3 pt-3 pb-2">
        <div
          className="flex rounded-full p-0.5 gap-0.5"
          style={{ background: 'var(--sidebar-bg-active)' }}
        >
          {(['curated', 'custom'] as const).map((m) => {
            const isActive = mode === m;
            const Icon = m === 'curated' ? Palette : Sliders;

            return (
              <motion.button
                key={m}
                onClick={() => setMode(m)}
                className="relative flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.06em]"
                style={{
                  color: isActive ? 'var(--sidebar-text)' : 'var(--sidebar-text-muted)',
                  zIndex: 'var(--z-panel)',
                }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="segmented-bg"
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'var(--sidebar-bg-elevated)', boxShadow: 'var(--shadow-sm)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <Icon size={12} className="stroke-[2]" />
                  {m === 'curated' ? 'Curated' : 'Custom'}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Mode content */}
      <AnimatePresence mode="wait">
        {mode === 'curated' ? (
          <motion.div
            key="curated"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Style filter pills */}
            <PaletteStyleFilter
              activeStyle={activeStyle}
              onStyleChange={setActiveStyle}
              styleCounts={styleCounts}
            />

            {/* Divider */}
            <div
              className="mx-3 h-px shrink-0"
              style={{ background: 'var(--sidebar-border-subtle)' }}
            />

            {/* Palette grid */}
            <PaletteGrid
              activeStyle={activeStyle}
              selectedPaletteId={selectedPaletteId}
              onSelectPalette={handleSelectPalette}
            />
          </motion.div>
        ) : (
          <motion.div
            key="custom"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.18 }}
            className="flex-1 min-h-0 overflow-y-auto custom-scrollbar"
          >
            <CustomModePanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ColorPalettePanel.displayName = 'ColorPalettePanel';
