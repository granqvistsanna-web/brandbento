import { useCanvasStore } from '@/state/canvasState';
import { useHoverPreview } from '@/hooks/useHoverPreview';
import { PALETTE_PRESETS, type PalettePresetName } from '@/utils/paletteGenerator';
import type { ColorPalette } from '@/types/brand';
import { useEffect, useRef } from 'react';

interface PalettePresetsProps {
  baseColors: string[];
}

export function PalettePresets({ baseColors }: PalettePresetsProps) {
  const currentPalette = useCanvasStore(state => state.assets.palette);
  const setPalette = useCanvasStore(state => state.setPalette);
  const { activeValue, isPreview, startPreview, endPreview, commit } = useHoverPreview(currentPalette);

  // Store original palette to restore on hover end
  const originalPaletteRef = useRef<ColorPalette>(currentPalette);

  // Update original ref when committed palette changes
  useEffect(() => {
    if (!isPreview) {
      originalPaletteRef.current = currentPalette;
    }
  }, [currentPalette, isPreview]);

  // Apply preview palette to canvas temporarily
  useEffect(() => {
    if (isPreview) {
      setPalette(activeValue);
    }
  }, [activeValue, isPreview, setPalette]);

  // Revert to original on hover end
  useEffect(() => {
    if (!isPreview) {
      // Only revert if we were previously previewing
      const current = useCanvasStore.getState().assets.palette;
      if (current !== originalPaletteRef.current) {
        setPalette(originalPaletteRef.current);
      }
    }
  }, [isPreview, setPalette]);

  const handleHover = (presetName: PalettePresetName) => {
    const preset = PALETTE_PRESETS.find(p => p.name === presetName);
    if (preset) {
      const generatedPalette = preset.generate(baseColors);
      startPreview(generatedPalette);
    }
  };

  const handleClick = (presetName: PalettePresetName) => {
    const preset = PALETTE_PRESETS.find(p => p.name === presetName);
    if (preset) {
      const generatedPalette = preset.generate(baseColors);
      // Update the original ref to the new committed value
      originalPaletteRef.current = generatedPalette;
      commit(generatedPalette, setPalette);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {PALETTE_PRESETS.map((preset) => {
        const generated = preset.generate(baseColors);

        return (
          <button
            key={preset.name}
            onMouseEnter={() => handleHover(preset.name)}
            onMouseLeave={endPreview}
            onClick={() => handleClick(preset.name)}
            className="group flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            title={preset.label}
          >
            {/* Mini color swatch preview */}
            <div className="flex gap-0.5">
              {Object.values(generated).map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-sm first:rounded-l last:rounded-r"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300">
              {preset.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
