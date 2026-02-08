import { memo, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { useBrandStore, type Colors } from '@/store/useBrandStore';
import { hexToHSL, getContrastRatio } from '@/utils/colorMapping';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
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
  { key: 'accent', label: 'Accent' },
  { key: 'surface', label: 'Surface' },
];

type ColorKey = typeof COLOR_ROLES[number]['key'];

export const CustomModePanel = memo(() => {
  const colors = useBrandStore((s) => s.brand.colors);
  const updateBrand = useBrandStore((s) => s.updateBrand);

  const handleColorChange = useCallback((key: ColorKey, hex: string) => {
    const next: Partial<Colors> = { [key]: hex };

    // If changing bg, update surfaces array to include it
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

  // Overall WCAG check: text on bg
  const textBgContrast = useMemo(
    () => getContrastRatio(colors.text, colors.bg),
    [colors.text, colors.bg],
  );
  const passesAA = textBgContrast >= 4.5;

  // Derive contrast color
  const { l: bgL } = hexToHSL(colors.bg);
  const contrastColor = bgL > 55 ? COLOR_DEFAULTS.TEXT_DARK : COLOR_DEFAULTS.TEXT_LIGHT;

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

      {/* WCAG badge + divider */}
      <div className="mx-3 flex items-center gap-2">
        <div className="flex-1 h-px" style={{ background: 'var(--sidebar-border-subtle)' }} />
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
          style={{
            background: passesAA ? 'rgba(74, 222, 128, 0.12)' : 'rgba(248, 113, 113, 0.12)',
            color: passesAA ? '#4ade80' : '#f87171',
          }}
        >
          {passesAA ? 'WCAG AA' : 'LOW CONTRAST'}
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--sidebar-border-subtle)' }} />
      </div>

      {/* Color role editor */}
      <div className="space-y-0.5 pb-2">
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
      </div>
    </div>
  );
});

CustomModePanel.displayName = 'CustomModePanel';
