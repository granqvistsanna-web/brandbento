/**
 * Color Palette Panel
 *
 * Top-level color section with two modes:
 * - Curated: browse pre-built palettes filtered by style (inline in sidebar)
 * - Custom: opens a modal for editing individual brand color roles
 */
import { memo, useState, useMemo, useCallback } from 'react';
import { RiEqualizerFill as Sliders } from 'react-icons/ri';
import { useBrandStore } from '@/store/useBrandStore';
import { getStyleGroups, type PaletteStyle } from '@/utils/paletteStyleClassifier';
import { PaletteStyleFilter } from './PaletteStyleFilter';
import { PaletteGrid } from './PaletteGrid';
import { CustomColorModal } from './CustomColorModal';

export const ColorPalettePanel = memo(() => {
  const [activeStyle, setActiveStyle] = useState<PaletteStyle | null>(null);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(false);

  const applyPalette = useBrandStore((s) => s.applyPalette);

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
    <div className="flex flex-col">
      {/* Header: title + Edit button */}
      <div className="px-3 pt-2.5 pb-1.5 flex items-center justify-between">
        <button
          onClick={() => setCustomOpen(true)}
          className="flex items-center gap-1.5 px-2 py-1 -ml-2 rounded-md text-[11px] font-medium transition-colors duration-100"
          style={{ color: 'var(--sidebar-text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--sidebar-text)';
            e.currentTarget.style.background = 'var(--sidebar-bg-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--sidebar-text-muted)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Sliders size={12} />
          Edit Colors
        </button>
      </div>

      {/* Curated content (always shown inline) */}
      <div className="flex flex-col flex-1 min-h-0">
        <PaletteStyleFilter
          activeStyle={activeStyle}
          onStyleChange={setActiveStyle}
          styleCounts={styleCounts}
        />

        <div
          className="mx-3 h-px shrink-0"
          style={{ background: 'var(--sidebar-border-subtle)' }}
        />

        <PaletteGrid
          activeStyle={activeStyle}
          selectedPaletteId={selectedPaletteId}
          onSelectPalette={handleSelectPalette}
        />
      </div>

      {/* Custom color modal */}
      <CustomColorModal open={customOpen} onClose={() => setCustomOpen(false)} />
    </div>
  );
});

ColorPalettePanel.displayName = 'ColorPalettePanel';
