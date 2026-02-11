/**
 * Custom Mode Panel
 *
 * Inspotype-style 3-column color editor. Each column shows a
 * PreviewCard with its color roles listed below it (BACKGROUND,
 * TONE, TEXT, TEXT-CTA, CTA, CONTRAST). Editable roles open an
 * inline color picker. Auto-derived roles are read-only.
 */
import { memo, useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HexColorPicker } from 'react-colorful';
import { RiRefreshFill as RotateCcw } from 'react-icons/ri';
import { useBrandStore, type Colors } from '@/store/useBrandStore';
import { getContrastRatio, mapPaletteToBrand, enforceContrast, deriveColumnRoles } from '@/utils/colorMapping';
import { isValidHex } from '@/utils/colorDefaults';
import { ColorColumn } from './ColorColumn';

type ColorKey = 'bg' | 'text' | 'primary' | 'accent' | 'surface';

export const CustomModePanel = memo(() => {
  const colors = useBrandStore((s) => s.brand.colors);
  const updateBrand = useBrandStore((s) => s.updateBrand);
  const [editingSurfaceIdx, setEditingSurfaceIdx] = useState<number | null>(null);

  const handleColorChange = useCallback((key: ColorKey, hex: string) => {
    if (!isValidHex(hex)) return;
    const next: Partial<Colors> = { [key]: hex };
    if (key === 'bg') {
      next.surfaces = [hex, ...(colors.surfaces || []).filter(s => s !== hex)];
    }
    if (key === 'surface') {
      const surfaces = [...(colors.surfaces || [])];
      surfaces[0] = hex;
      next.surfaces = surfaces;
    }
    updateBrand({ colors: { ...colors, ...next } }, false);
  }, [colors, updateBrand]);

  const handleSurfaceChange = useCallback((idx: number, hex: string) => {
    if (!isValidHex(hex)) return;
    const surfaces = [...(colors.surfaces || [])];
    surfaces[idx] = hex;
    const next: Partial<Colors> = { surfaces };
    if (idx === 0) next.surface = hex;
    updateBrand({ colors: { ...colors, ...next } }, false);
  }, [colors, updateBrand]);

  const handleReset = useCallback(() => {
    const palette = colors.paletteColors;
    if (!palette || palette.length === 0) return;
    const raw = mapPaletteToBrand(palette);
    const mapped = enforceContrast(raw);
    updateBrand({ colors: mapped as Colors });
  }, [colors.paletteColors, updateBrand]);

  // Derive roles for each column
  const primaryRoles = useMemo(
    () => deriveColumnRoles(colors.primary, colors.bg),
    [colors.primary, colors.bg],
  );
  const surfaceRoles = useMemo(
    () => deriveColumnRoles(colors.surface, colors.primary),
    [colors.surface, colors.primary],
  );
  const accentRoles = useMemo(
    () => deriveColumnRoles(colors.accent, colors.bg),
    [colors.accent, colors.bg],
  );

  // Overall WCAG check: text on bg
  const textBgContrast = useMemo(
    () => getContrastRatio(colors.text, colors.bg),
    [colors.text, colors.bg],
  );
  const passesAA = textBgContrast >= 4.5;

  const hasPalette = colors.paletteColors && colors.paletteColors.length > 0;
  const surfaceCount = colors.surfaces?.length ?? 0;

  return (
    <div className="flex flex-col gap-3">
      {/* WCAG badge + reset */}
      <div className="mx-3 flex items-center gap-2">
        <div className="flex-1 h-px" style={{ background: 'var(--sidebar-border-subtle)' }} />
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
          style={{
            background: passesAA
              ? 'color-mix(in srgb, var(--sidebar-text) 8%, transparent)'
              : 'rgba(248, 113, 113, 0.12)',
            color: passesAA ? 'var(--sidebar-text-secondary)' : '#f87171',
          }}
        >
          {passesAA ? `AA ${textBgContrast.toFixed(1)}:1` : `LOW ${textBgContrast.toFixed(1)}:1`}
        </span>
        {hasPalette && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full transition-colors"
            style={{
              color: 'var(--sidebar-text-muted)',
              background: 'transparent',
              border: '1px solid var(--sidebar-border)',
            }}
            title="Reset to palette colors"
          >
            <RotateCcw size={8} />
            Reset
          </button>
        )}
        <div className="flex-1 h-px" style={{ background: 'var(--sidebar-border-subtle)' }} />
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-3 gap-3 px-3">
        <ColorColumn
          variant="primary"
          colors={colors}
          roles={primaryRoles}
          onBackgroundChange={(hex) => handleColorChange('primary', hex)}
          onCtaChange={(hex) => handleColorChange('bg', hex)}
        />
        <ColorColumn
          variant="surface"
          colors={colors}
          roles={surfaceRoles}
          onBackgroundChange={(hex) => handleColorChange('surface', hex)}
          onCtaChange={(hex) => handleColorChange('primary', hex)}
        />
        <ColorColumn
          variant="accent"
          colors={colors}
          roles={accentRoles}
          onBackgroundChange={(hex) => handleColorChange('accent', hex)}
          onCtaChange={(hex) => handleColorChange('bg', hex)}
        />
      </div>

      {/* Editable surface swatches */}
      {surfaceCount > 1 && (
        <div className="px-3 py-1.5">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.08em] w-[72px] text-left shrink-0"
              style={{ color: 'var(--sidebar-text-muted)' }}
            >
              Surfaces
            </span>
            <span
              className="text-[9px] uppercase tracking-wider"
              style={{ color: 'var(--sidebar-text-muted)', opacity: 0.5 }}
            >
              {surfaceCount} colors
            </span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {colors.surfaces.slice(0, 8).map((s, i) => (
              <button
                key={i}
                onClick={() => setEditingSurfaceIdx(editingSurfaceIdx === i ? null : i)}
                className="w-7 h-7 rounded-md ring-1 ring-inset transition-all duration-150 hover:scale-110"
                style={{
                  backgroundColor: s,
                  '--tw-ring-color': editingSurfaceIdx === i ? 'var(--accent)' : 'var(--sidebar-border-subtle)',
                  outline: editingSurfaceIdx === i ? '2px solid var(--accent)' : 'none',
                  outlineOffset: '1px',
                } as React.CSSProperties}
                title={`Surface ${i + 1}`}
              />
            ))}
          </div>
          <AnimatePresence>
            {editingSurfaceIdx !== null && editingSurfaceIdx < surfaceCount && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div
                  className="rounded-xl p-3 mt-2"
                  style={{
                    background: 'var(--sidebar-bg-elevated)',
                    border: '1px solid var(--sidebar-border)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--sidebar-text-muted)' }}
                    >
                      Surface {editingSurfaceIdx + 1}
                    </span>
                    <span
                      className="text-[11px] font-medium"
                      style={{
                        color: 'var(--sidebar-text-secondary)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {colors.surfaces[editingSurfaceIdx]?.toUpperCase()}
                    </span>
                  </div>
                  <HexColorPicker
                    color={colors.surfaces[editingSurfaceIdx] || '#FFFFFF'}
                    onChange={(hex) => handleSurfaceChange(editingSurfaceIdx, hex)}
                    style={{ width: '100%', height: '130px' }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
});

CustomModePanel.displayName = 'CustomModePanel';
