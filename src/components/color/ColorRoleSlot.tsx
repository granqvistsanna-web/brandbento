import { memo, useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pencil } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { getContrastRatio } from '@/utils/colorMapping';

interface ColorRoleSlotProps {
  label: string;
  color: string;
  onChange: (hex: string) => void;
  /** If provided, shows WCAG contrast ratio badge against this color */
  contrastWith?: string;
}

export const ColorRoleSlot = memo(({ label, color, onChange, contrastWith }: ColorRoleSlotProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(color);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync draft when external color changes
  useEffect(() => { setDraft(color); }, [color]);

  // Close on outside click
  useEffect(() => {
    if (!isEditing) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onChange(draft);
        setIsEditing(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isEditing, draft, onChange]);

  const handlePickerChange = (hex: string) => {
    setDraft(hex);
    onChange(hex);
  };

  const contrast = useMemo(() => {
    if (!contrastWith) return null;
    return getContrastRatio(color, contrastWith);
  }, [color, contrastWith]);

  const passesAA = contrast !== null && contrast >= 4.5;

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsEditing(!isEditing)}
        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors"
        style={{
          background: isEditing ? 'var(--sidebar-bg-active)' : 'transparent',
        }}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
      >
        {/* Label */}
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.08em] w-[72px] text-left shrink-0"
          style={{ color: 'var(--sidebar-text-muted)' }}
        >
          {label}
        </span>

        {/* Color swatch */}
        <div
          className="w-5 h-5 rounded-[5px] shrink-0 ring-1 ring-inset ring-white/10"
          style={{ backgroundColor: color }}
        />

        {/* Hex value */}
        <span
          className="text-[12px] font-medium tracking-wide flex-1 text-left"
          style={{
            color: 'var(--sidebar-text-secondary)',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
          }}
        >
          {color.toUpperCase()}
        </span>

        {/* Contrast ratio badge */}
        {contrast !== null && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
            style={{
              background: passesAA ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)',
              color: passesAA ? '#4ade80' : '#f87171',
            }}
          >
            {contrast.toFixed(1)}
          </span>
        )}

        {/* Edit indicator */}
        <Pencil
          size={11}
          className="shrink-0 transition-opacity"
          style={{
            color: 'var(--sidebar-text-muted)',
            opacity: isEditing ? 1 : 0.4,
          }}
        />
      </motion.button>

      {/* Inline color picker (expands in flow, not absolute) */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            ref={popoverRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden mx-3"
          >
            <div
              className="rounded-xl p-3 mt-1 mb-1"
              style={{
                background: 'var(--sidebar-bg-elevated)',
                border: '1px solid var(--sidebar-border)',
              }}
            >
              <HexColorPicker
                color={draft}
                onChange={handlePickerChange}
                style={{ width: '100%', height: '140px' }}
              />
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={draft.toUpperCase()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDraft(val);
                    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                      onChange(val);
                    }
                  }}
                  className="flex-1 text-[11px] px-2 py-1 rounded-md"
                  style={{
                    background: 'var(--sidebar-bg-active)',
                    color: 'var(--sidebar-text)',
                    border: '1px solid var(--sidebar-border)',
                    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ColorRoleSlot.displayName = 'ColorRoleSlot';
