/**
 * Color Column
 *
 * Single column in the Inspotype-style custom color modal.
 * Shows a PreviewCard at top + 5 color role rows below it.
 * All rows are editable via inline picker. Auto-derivable rows
 * (TONE, TEXT, TEXT-CTA) show "Auto" when not overridden and
 * a reset icon when the user has set a custom value.
 */
import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RiPencilFill as Pencil, RiRefreshFill as RotateCcw } from 'react-icons/ri';
import { HexColorPicker } from 'react-colorful';
import { isValidHex } from '@/utils/colorDefaults';
import type { ColumnRoles, ColumnRoleOverrides } from '@/utils/colorMapping';
import type { Colors } from '@/store/useBrandStore';
import { PreviewCard } from './PreviewCard';

interface ColorColumnProps {
  variant: 'primary' | 'surface' | 'accent';
  colors: Colors;
  roles: ColumnRoles;
  overrides?: ColumnRoleOverrides;
  paletteColors: string[];
  onBackgroundChange: (hex: string) => void;
  onToneChange: (hex: string) => void;
  onTextChange: (hex: string) => void;
  onTextCtaChange: (hex: string) => void;
  onCtaChange: (hex: string) => void;
  onClearOverride: (role: 'tone' | 'text' | 'textCta') => void;
}

type EditingRow = 'background' | 'tone' | 'text' | 'textCta' | 'cta' | null;

export const ColorColumn = memo(({
  variant,
  colors,
  roles,
  overrides,
  paletteColors,
  onBackgroundChange,
  onToneChange,
  onTextChange,
  onTextCtaChange,
  onCtaChange,
  onClearOverride,
}: ColorColumnProps) => {
  const [editing, setEditing] = useState<EditingRow>(null);
  const [draft, setDraft] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Sync draft when external color changes while picker is open
  // (e.g., after reset-to-auto clears an override)
  useEffect(() => {
    if (!editing) return;
    const currentColor = (() => {
      switch (editing) {
        case 'background': return roles.background;
        case 'tone': return roles.tone;
        case 'text': return roles.text;
        case 'textCta': return roles.textCta;
        case 'cta': return roles.cta;
        default: return '';
      }
    })();
    if (currentColor && currentColor.toUpperCase() !== draft.toUpperCase()) {
      setDraft(currentColor);
    }
  }, [editing, roles, draft]);

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

  const colorForRow = useCallback((row: EditingRow): string => {
    switch (row) {
      case 'background': return roles.background;
      case 'tone': return roles.tone;
      case 'text': return roles.text;
      case 'textCta': return roles.textCta;
      case 'cta': return roles.cta;
      default: return '';
    }
  }, [roles]);

  const onChangeForRow = useCallback((row: EditingRow, hex: string) => {
    switch (row) {
      case 'background': onBackgroundChange(hex); break;
      case 'tone': onToneChange(hex); break;
      case 'text': onTextChange(hex); break;
      case 'textCta': onTextCtaChange(hex); break;
      case 'cta': onCtaChange(hex); break;
    }
  }, [onBackgroundChange, onToneChange, onTextChange, onTextCtaChange, onCtaChange]);

  const handleRowClick = useCallback((row: EditingRow) => {
    if (editing === row) {
      setEditing(null);
    } else {
      setEditing(row);
      setDraft(colorForRow(row));
    }
  }, [editing, colorForRow]);

  const handlePickerChange = useCallback((hex: string) => {
    setDraft(hex);
    onChangeForRow(editing, hex);
  }, [editing, onChangeForRow]);

  const handleHexInput = useCallback((val: string) => {
    setDraft(val);
    if (isValidHex(val)) {
      onChangeForRow(editing, val);
    }
  }, [editing, onChangeForRow]);

  const passesAA = roles.contrastRatio >= 4.5;

  const rows: {
    label: string;
    color: string;
    rowKey: EditingRow;
    isOverridden: boolean;
    isAutoDerivable: boolean;
    overrideKey?: 'tone' | 'text' | 'textCta';
  }[] = [
    { label: 'BACKGROUND', color: roles.background, rowKey: 'background', isOverridden: false, isAutoDerivable: false },
    { label: 'TONE', color: roles.tone, rowKey: 'tone', isOverridden: !!overrides?.tone, isAutoDerivable: true, overrideKey: 'tone' },
    { label: 'TEXT', color: roles.text, rowKey: 'text', isOverridden: !!overrides?.text, isAutoDerivable: true, overrideKey: 'text' },
    { label: 'TEXT-CTA', color: roles.textCta, rowKey: 'textCta', isOverridden: !!overrides?.textCta, isAutoDerivable: true, overrideKey: 'textCta' },
    { label: 'CTA', color: roles.cta, rowKey: 'cta', isOverridden: false, isAutoDerivable: false },
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
      {rows.map(({ label, color, rowKey, isOverridden, isAutoDerivable, overrideKey }) => (
        <div key={label} ref={editing === rowKey ? pickerRef : undefined}>
          <button
            onClick={() => handleRowClick(rowKey)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors"
            style={{
              background: editing === rowKey ? 'var(--sidebar-bg-active)' : 'transparent',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              if (editing !== rowKey) {
                e.currentTarget.style.background = 'var(--sidebar-bg-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (editing !== rowKey) {
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

            {/* Edit icon, AUTO badge, or reset-to-auto icon */}
            {isAutoDerivable ? (
              isOverridden ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    if (overrideKey) onClearOverride(overrideKey);
                  }}
                  className="shrink-0 flex items-center"
                  title="Reset to auto"
                >
                  <RotateCcw
                    size={9}
                    style={{ color: 'var(--sidebar-text-muted)', opacity: 0.6 }}
                  />
                </span>
              ) : (
                <span
                  className="text-[8px] font-semibold uppercase tracking-wider shrink-0"
                  style={{ color: 'var(--sidebar-text-muted)', opacity: 0.4 }}
                >
                  Auto
                </span>
              )
            ) : (
              <Pencil
                size={10}
                className="shrink-0"
                style={{
                  color: 'var(--sidebar-text-muted)',
                  opacity: editing === rowKey ? 1 : 0.4,
                }}
              />
            )}
          </button>

          {/* Inline picker */}
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
                  {/* Palette swatches */}
                  {paletteColors.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {paletteColors.map((pc, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setDraft(pc);
                            onChangeForRow(rowKey, pc);
                          }}
                          className="w-5 h-5 rounded-[3px] ring-1 ring-inset transition-all hover:scale-110"
                          style={{
                            backgroundColor: pc,
                            '--tw-ring-color': draft.toUpperCase() === pc.toUpperCase()
                              ? 'var(--accent)'
                              : 'var(--sidebar-border-subtle)',
                          } as React.CSSProperties}
                          title={pc.toUpperCase()}
                        />
                      ))}
                    </div>
                  )}
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
