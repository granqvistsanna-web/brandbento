/**
 * Color Column
 *
 * Single column in the Inspotype-style custom color modal.
 * Shows a PreviewCard at top + 6 color role rows below it.
 * BACKGROUND and CTA rows are editable (inline picker).
 * TONE, TEXT, TEXT-CTA, CONTRAST are auto-derived (read-only).
 */
import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RiPencilFill as Pencil } from 'react-icons/ri';
import { HexColorPicker } from 'react-colorful';
import { isValidHex } from '@/utils/colorDefaults';
import type { ColumnRoles } from '@/utils/colorMapping';
import type { Colors } from '@/store/useBrandStore';
import { PreviewCard } from './PreviewCard';

interface ColorColumnProps {
  variant: 'primary' | 'surface' | 'accent';
  colors: Colors;
  roles: ColumnRoles;
  onBackgroundChange: (hex: string) => void;
  onCtaChange: (hex: string) => void;
}

type EditingRow = 'background' | 'cta' | null;

export const ColorColumn = memo(({
  variant,
  colors,
  roles,
  onBackgroundChange,
  onCtaChange,
}: ColorColumnProps) => {
  const [editing, setEditing] = useState<EditingRow>(null);
  const [draft, setDraft] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    if (!editing) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setEditing(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [editing]);

  const handleRowClick = useCallback((row: EditingRow) => {
    if (editing === row) {
      setEditing(null);
    } else {
      setEditing(row);
      setDraft(row === 'background' ? roles.background : roles.cta);
    }
  }, [editing, roles.background, roles.cta]);

  const handlePickerChange = useCallback((hex: string) => {
    setDraft(hex);
    if (editing === 'background') onBackgroundChange(hex);
    else if (editing === 'cta') onCtaChange(hex);
  }, [editing, onBackgroundChange, onCtaChange]);

  const handleHexInput = useCallback((val: string) => {
    setDraft(val);
    if (isValidHex(val)) {
      if (editing === 'background') onBackgroundChange(val);
      else if (editing === 'cta') onCtaChange(val);
    }
  }, [editing, onBackgroundChange, onCtaChange]);

  const passesAA = roles.contrastRatio >= 4.5;

  const rows: {
    label: string;
    color: string;
    editable: boolean;
    rowKey: EditingRow;
  }[] = [
    { label: 'BACKGROUND', color: roles.background, editable: true, rowKey: 'background' },
    { label: 'TONE', color: roles.tone, editable: false, rowKey: null },
    { label: 'TEXT', color: roles.text, editable: false, rowKey: null },
    { label: 'TEXT-CTA', color: roles.textCta, editable: false, rowKey: null },
    { label: 'CTA', color: roles.cta, editable: true, rowKey: 'cta' },
  ];

  return (
    <div className="flex flex-col gap-0">
      {/* Preview card */}
      <PreviewCard colors={colors} variant={variant} />

      {/* Divider */}
      <div
        className="h-px my-2"
        style={{ background: 'var(--sidebar-border-subtle)' }}
      />

      {/* Role rows */}
      {rows.map(({ label, color, editable, rowKey }) => (
        <div key={label} ref={editing === rowKey ? pickerRef : undefined}>
          <button
            onClick={editable ? () => handleRowClick(rowKey) : undefined}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors"
            style={{
              background: editing === rowKey ? 'var(--sidebar-bg-active)' : 'transparent',
              cursor: editable ? 'pointer' : 'default',
            }}
            onMouseEnter={(e) => {
              if (editable && editing !== rowKey) {
                e.currentTarget.style.background = 'var(--sidebar-bg-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (editable && editing !== rowKey) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {/* Label */}
            <span
              className="text-[9px] font-semibold uppercase tracking-[0.08em] w-[68px] text-left shrink-0"
              style={{ color: 'var(--sidebar-text-muted)' }}
            >
              {label}
            </span>

            {/* Swatch */}
            <div
              className="w-5 h-5 rounded-[4px] shrink-0 ring-1 ring-inset"
              style={{
                backgroundColor: color,
                '--tw-ring-color': 'var(--sidebar-border-subtle)',
              } as React.CSSProperties}
            />

            {/* Hex value */}
            <span
              className="text-[11px] font-medium tracking-wide flex-1 text-left"
              style={{
                color: 'var(--sidebar-text-secondary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {color.toUpperCase()}
            </span>

            {/* Edit icon or AUTO badge */}
            {editable ? (
              <Pencil
                size={10}
                className="shrink-0"
                style={{
                  color: 'var(--sidebar-text-muted)',
                  opacity: editing === rowKey ? 1 : 0.4,
                }}
              />
            ) : (
              <span
                className="text-[8px] font-semibold uppercase tracking-wider shrink-0"
                style={{ color: 'var(--sidebar-text-muted)', opacity: 0.4 }}
              >
                Auto
              </span>
            )}
          </button>

          {/* Inline picker (only for editable rows) */}
          <AnimatePresence>
            {editing === rowKey && rowKey !== null && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div
                  className="rounded-lg p-2.5 mt-1 mb-1"
                  style={{
                    background: 'var(--sidebar-bg-elevated)',
                    border: '1px solid var(--sidebar-border)',
                  }}
                >
                  <HexColorPicker
                    color={draft}
                    onChange={handlePickerChange}
                    style={{ width: '100%', height: '120px' }}
                  />
                  <input
                    type="text"
                    value={draft.toUpperCase()}
                    onChange={(e) => handleHexInput(e.target.value)}
                    className="w-full text-[10px] px-2 py-1 rounded mt-2"
                    style={{
                      background: 'var(--sidebar-bg-active)',
                      color: 'var(--sidebar-text)',
                      border: `1px solid ${isValidHex(draft) ? 'var(--sidebar-border)' : 'var(--error)'}`,
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Contrast row */}
      <div className="flex items-center gap-2 px-2 py-1.5">
        <span
          className="text-[9px] font-semibold uppercase tracking-[0.08em] w-[68px] text-left shrink-0"
          style={{ color: 'var(--sidebar-text-muted)' }}
        >
          Contrast
        </span>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
          style={{
            background: passesAA
              ? 'color-mix(in srgb, var(--sidebar-text) 8%, transparent)'
              : 'rgba(248, 113, 113, 0.12)',
            color: passesAA ? 'var(--sidebar-text-secondary)' : '#f87171',
          }}
        >
          {passesAA ? 'AA' : 'LOW'} {roles.contrastRatio.toFixed(1)}:1
        </span>
      </div>
    </div>
  );
});

ColorColumn.displayName = 'ColorColumn';
