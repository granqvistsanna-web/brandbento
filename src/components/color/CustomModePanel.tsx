/**
 * Custom Mode Panel
 *
 * Manual color editing view — shows live preview cards,
 * WCAG contrast badge, and editable ColorRoleSlot rows
 * for each brand role (bg, text, primary, accent, surface).
 * Includes reset-to-palette and derived contrast display.
 */
import { memo, useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HexColorPicker } from 'react-colorful';
import { RotateCcw } from 'lucide-react';
import { useBrandStore, type Colors } from '@/store/useBrandStore';
import { hexToHSL, getContrastRatio, mapPaletteToBrand, enforceContrast } from '@/utils/colorMapping';
import { COLOR_DEFAULTS, LIGHTNESS_THRESHOLD, isValidHex } from '@/utils/colorDefaults';
import { PreviewCard } from './PreviewCard';
import { ColorRoleSlot } from './ColorRoleSlot';

interface RoleDef {
  key: 'bg' | 'text' | 'primary' | 'accent' | 'surface';
  label: string;
  /** Key of the color to compute contrast against */
  contrastKey?: 'bg' | 'text' | 'primary' | 'accent' | 'surface';
}

const COLOR_ROLES: readonly RoleDef[] = [
  { key: 'bg', label: 'Background' },
  { key: 'text', label: 'Text', contrastKey: 'bg' },
  { key: 'primary', label: 'Primary', contrastKey: 'bg' },
  { key: 'accent', label: 'Accent', contrastKey: 'bg' },
  { key: 'surface', label: 'Surface' },
];

type ColorKey = typeof COLOR_ROLES[number]['key'];

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

    // If changing surface, update first surface
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

  // Overall WCAG check: text on bg
  const textBgContrast = useMemo(
    () => getContrastRatio(colors.text, colors.bg),
    [colors.text, colors.bg],
  );
  const passesAA = textBgContrast >= 4.5;

  // Derive contrast color
  const { l: bgL } = hexToHSL(colors.bg);
  const contrastColor = bgL > LIGHTNESS_THRESHOLD ? COLOR_DEFAULTS.TEXT_DARK : COLOR_DEFAULTS.TEXT_LIGHT;

  const hasPalette = colors.paletteColors && colors.paletteColors.length > 0;
  const surfaceCount = colors.surfaces?.length ?? 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Live preview cards */}
      <div className="px-3">
        <div className="flex gap-2">
          <PreviewCard colors={colors} variant="primary" />
          <PreviewCard colors={colors} variant="surface" />
          <PreviewCard colors={colors} variant="accent" />
        </div>
      </div>

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

      {/* Color role editor */}
      <div className="space-y-1 pb-2">
        {COLOR_ROLES.map((role, i) => (
          <motion.div
            key={role.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <ColorRoleSlot
              label={role.label}
              color={colors[role.key]}
              onChange={(hex) => handleColorChange(role.key, hex)}
              contrastWith={role.contrastKey ? colors[role.contrastKey] : undefined}
            />
          </motion.div>
        ))}

        {/* Contrast (derived, read-only display) */}
        <div className="flex items-center gap-2.5 px-3 py-1.5">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.08em] w-[72px] text-left shrink-0"
            style={{ color: 'var(--sidebar-text-muted)' }}
          >
            Contrast
          </span>
          <div
            className="w-5 h-5 rounded-[5px] shrink-0 ring-1 ring-inset ring-white/10"
            style={{ backgroundColor: contrastColor }}
          />
          <span
            className="text-[12px] font-medium tracking-wide flex-1 text-left"
            style={{
              color: 'var(--sidebar-text-muted)',
              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            }}
          >
            {contrastColor.toUpperCase()}
          </span>
          <span
            className="text-[9px] uppercase tracking-wider"
            style={{ color: 'var(--sidebar-text-muted)', opacity: 0.5 }}
          >
            Auto
          </span>
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
            {/* Inline picker for selected surface */}
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
    </div>
  );
});

CustomModePanel.displayName = 'CustomModePanel';
