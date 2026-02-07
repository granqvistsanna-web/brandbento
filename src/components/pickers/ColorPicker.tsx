import { HslColorPicker, HexColorInput } from 'react-colorful';
import { useRef, useCallback, useEffect, useState } from 'react';
import { useCanvasStore } from '@/state/canvasState';
import { hexToHsl, hslToHex, type HslColor } from '@/utils/colorConversion';
import { ContrastBadge } from '@/components/controls/ContrastBadge';
import { RoleDropdown } from '@/components/controls/RoleDropdown';
import type { ColorPalette } from '@/types/brand';

interface ColorPickerProps {
  colorRole: keyof ColorPalette;
  onClose: () => void;
  onRoleChange?: (newRole: keyof ColorPalette) => void;
}

export function ColorPicker({ colorRole, onClose, onRoleChange }: ColorPickerProps) {
  const palette = useCanvasStore(state => state.assets.palette);
  const setColorByRole = useCanvasStore(state => state.setColorByRole);

  const currentColor = palette[colorRole];
  const [localHsl, setLocalHsl] = useState<HslColor>(hexToHsl(currentColor));

  // Use ref for continuous updates to avoid re-render overhead
  const rafRef = useRef<number | null>(null);
  const latestColorRef = useRef<HslColor>(localHsl);

  const handleChange = useCallback((color: HslColor) => {
    latestColorRef.current = color;
    setLocalHsl(color); // Update local display

    // Cancel pending frame
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    // Schedule update on next frame (throttled to 60fps = ~16.67ms)
    rafRef.current = requestAnimationFrame(() => {
      const hex = hslToHex(latestColorRef.current);
      setColorByRole(colorRole, hex);
      rafRef.current = null;
    });
  }, [colorRole, setColorByRole]);

  const handleHexChange = useCallback((hex: string) => {
    const hsl = hexToHsl(hex);
    handleChange(hsl);
  }, [handleChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Sync local state when role changes
  useEffect(() => {
    setLocalHsl(hexToHsl(palette[colorRole]));
    latestColorRef.current = hexToHsl(palette[colorRole]);
  }, [colorRole, palette]);

  return (
    <div
      className="p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 w-64"
      onClick={(e) => e.stopPropagation()} // Prevent tile click from closing
    >
      <div className="flex items-center justify-between mb-3">
        <RoleDropdown
          currentRole={colorRole}
          onChange={onRoleChange}
        />
        <button
          onClick={onClose}
          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded"
          aria-label="Close picker"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* HSL Color Picker (hue ring + saturation/lightness square) */}
      <div className="mb-4 color-picker-container">
        <HslColorPicker
          color={localHsl}
          onChange={handleChange}
          style={{ width: '100%' }}
        />
      </div>

      {/* HEX Input */}
      <div className="mb-4">
        <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1">HEX</label>
        <HexColorInput
          color={hslToHex(localHsl)}
          onChange={handleHexChange}
          prefixed
          className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded text-sm font-mono uppercase bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
        />
      </div>

      {/* Contrast indicator */}
      <div className="flex justify-center">
        <ContrastBadge palette={palette} />
      </div>
    </div>
  );
}
