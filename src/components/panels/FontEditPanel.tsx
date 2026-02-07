import { useCallback } from 'react';
import { useCanvasStore } from '@/state/canvasState';
import { FontPicker } from '../pickers/FontPicker';
import { Slider } from '../controls';
import { GOOGLE_FONTS } from '@/data/googleFontsMetadata';

// Weight display labels
const WEIGHT_LABELS: Record<string, string> = {
  '100': 'Thin',
  '200': 'Extra Light',
  '300': 'Light',
  '400': 'Regular',
  'regular': 'Regular',
  '500': 'Medium',
  '600': 'Semi Bold',
  '700': 'Bold',
  '800': 'Extra Bold',
  '900': 'Black',
};

// Standard weights for slider
const STANDARD_WEIGHTS = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];

interface FontEditPanelProps {
  role: 'primary' | 'secondary';
  onPreviewChange?: (family: string | null) => void;
}

/**
 * FontEditPanel - Typography editing controls
 *
 * Features:
 * - Font picker with search and category filters
 * - Weight slider with availability dots
 * - Size scale slider (0.7-1.4)
 * - Line height slider (1.0-2.0)
 * - Hover preview via onPreviewChange
 */
export function FontEditPanel({ role, onPreviewChange }: FontEditPanelProps) {
  const settingsKey = role === 'primary' ? 'primaryFont' : 'secondaryFont';
  const assetKey = role === 'primary' ? 'primaryFont' : 'secondaryFont';

  // Get current state
  const currentFont = useCanvasStore((state) => state.assets[assetKey]);
  const settings = useCanvasStore((state) => state.tileSettings[settingsKey]);
  const recentFonts = useCanvasStore((state) => state.tileSettings.recentFonts);

  // Actions
  const setAssets = useCanvasStore((state) => state.setAssets);
  const setFontSettings = useCanvasStore((state) => state.setFontSettings);
  const addRecentFont = useCanvasStore((state) => state.addRecentFont);

  // Get available weights for current font
  const fontMeta = GOOGLE_FONTS.find((f) => f.family === currentFont);
  const availableWeights = fontMeta?.variants || ['400'];

  // Convert weight to slider value (0-8 for 100-900)
  const weightToIndex = (weight: string): number => {
    const normalizedWeight = weight === 'regular' ? '400' : weight;
    const idx = STANDARD_WEIGHTS.indexOf(normalizedWeight);
    return idx >= 0 ? idx : 3; // Default to 400 (index 3)
  };

  // Convert slider value to weight
  const indexToWeight = (index: number): string => {
    return STANDARD_WEIGHTS[index] || '400';
  };

  // Find nearest available weight
  const findNearestWeight = (targetWeight: string): string => {
    const normalized = targetWeight === 'regular' ? '400' : targetWeight;
    if (availableWeights.includes(normalized)) return normalized;
    if (availableWeights.includes('regular') && normalized === '400') return 'regular';

    // Find nearest available weight
    const targetNum = parseInt(normalized, 10);
    let nearest = availableWeights[0];
    let minDist = Infinity;

    for (const w of availableWeights) {
      const wNum = parseInt(w === 'regular' ? '400' : w, 10);
      const dist = Math.abs(wNum - targetNum);
      if (dist < minDist) {
        minDist = dist;
        nearest = w;
      }
    }
    return nearest;
  };

  // Current weight index for slider
  const currentWeightIndex = weightToIndex(settings.weight);

  // Handle font selection
  const handleFontSelect = useCallback(
    (family: string) => {
      setAssets({ [assetKey]: family });
      addRecentFont(family);

      // Reset weight to available for new font
      const newFontMeta = GOOGLE_FONTS.find((f) => f.family === family);
      const newAvailable = newFontMeta?.variants || ['400'];
      if (!newAvailable.includes(settings.weight) &&
          !(settings.weight === 'regular' && newAvailable.includes('400'))) {
        setFontSettings(settingsKey, { weight: findNearestWeight(settings.weight) });
      }
    },
    [assetKey, settingsKey, settings.weight, setAssets, addRecentFont, setFontSettings]
  );

  // Handle weight change via slider
  const handleWeightChange = useCallback(
    (index: number) => {
      const targetWeight = indexToWeight(index);
      const actualWeight = findNearestWeight(targetWeight);
      setFontSettings(settingsKey, { weight: actualWeight });
    },
    [settingsKey, setFontSettings, availableWeights]
  );

  // Handle size scale change
  const handleSizeChange = useCallback(
    (value: number) => {
      setFontSettings(settingsKey, { sizeScale: value });
    },
    [settingsKey, setFontSettings]
  );

  // Handle line height change
  const handleLineHeightChange = useCallback(
    (value: number) => {
      setFontSettings(settingsKey, { lineHeight: value });
    },
    [settingsKey, setFontSettings]
  );

  // Weight label for display
  const weightLabel =
    WEIGHT_LABELS[settings.weight] || settings.weight;

  return (
    <div className="font-edit-panel">
      {/* Font Picker */}
      <div className="font-edit-section font-edit-picker">
        <FontPicker
          currentFont={currentFont}
          recentFonts={recentFonts}
          onSelect={handleFontSelect}
          onPreviewChange={onPreviewChange}
          height={200}
        />
      </div>

      {/* Weight Slider with Availability Dots */}
      <div className="font-edit-section">
        <div className="weight-slider-container">
          <Slider
            value={currentWeightIndex}
            min={0}
            max={8}
            step={1}
            label="Weight"
            onChange={handleWeightChange}
            formatValue={() => weightLabel}
          />
          {/* Weight availability dots */}
          <div className="weight-dots">
            {STANDARD_WEIGHTS.map((w, i) => {
              const isAvailable =
                availableWeights.includes(w) ||
                (w === '400' && availableWeights.includes('regular'));
              const isCurrent = i === currentWeightIndex;
              return (
                <span
                  key={w}
                  className={`weight-dot ${isAvailable ? 'available' : ''} ${isCurrent ? 'current' : ''}`}
                  title={WEIGHT_LABELS[w] || w}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Size Scale Slider */}
      <div className="font-edit-section">
        <Slider
          value={settings.sizeScale}
          min={0.7}
          max={1.4}
          step={0.05}
          label="Size"
          onChange={handleSizeChange}
          formatValue={(v) => `${Math.round(v * 100)}%`}
        />
      </div>

      {/* Line Height Slider */}
      <div className="font-edit-section">
        <Slider
          value={settings.lineHeight}
          min={1.0}
          max={2.0}
          step={0.1}
          label="Line Height"
          onChange={handleLineHeightChange}
          formatValue={(v) => v.toFixed(1)}
        />
      </div>
    </div>
  );
}
