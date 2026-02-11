/**
 * Color Palette Panel
 *
 * Top-level color section with two modes:
 * - Curated: browse pre-built palettes filtered by style (inline in sidebar)
 * - Custom: opens a modal for editing individual brand color roles
 * - Import: paste CSS from Coolors or hex values
 */
import { memo, useState, useMemo, useCallback } from 'react';
import { RiEqualizerFill as Sliders, RiClipboardLine } from 'react-icons/ri';
import { useBrandStore } from '@/store/useBrandStore';
import { getContrastRatio } from '@/utils/colorMapping';
import { type PaletteStyle } from '@/utils/paletteStyleClassifier';
import { parsePaletteInput } from '@/utils/parsePaletteInput';
import { PaletteStyleFilter } from './PaletteStyleFilter';
import { PaletteGrid } from './PaletteGrid';
import { CustomColorModal } from './CustomColorModal';

const ROLE_PREVIEW = [
  { key: 'bg', label: 'BG', flex: 3 },
  { key: 'surface', label: 'Surf', flex: 2 },
  { key: 'primary', label: 'Pri', flex: 2.5 },
  { key: 'accent', label: 'Acc', flex: 2 },
  { key: 'text', label: 'Text', flex: 1 },
] as const;

export const ColorPalettePanel = memo(() => {
  const [activeStyle, setActiveStyle] = useState<PaletteStyle | null>(null);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(false);

  // Import state
  const [importOpen, setImportOpen] = useState(false);
  const [importValue, setImportValue] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const applyPalette = useBrandStore((s) => s.applyPalette);
  const applyRawPalette = useBrandStore((s) => s.applyRawPalette);
  const colors = useBrandStore((s) => s.brand.colors);

  const passesAA = useMemo(
    () => getContrastRatio(colors.text, colors.bg) >= 4.5,
    [colors.text, colors.bg]
  );

  const handleSelectPalette = useCallback((paletteId: string) => {
    setSelectedPaletteId(paletteId);
    applyPalette(paletteId);
  }, [applyPalette]);

  // Live preview of pasted colors
  const previewColors = useMemo(() => {
    if (!importValue.trim()) return [];
    return parsePaletteInput(importValue).colors;
  }, [importValue]);

  const handleImportApply = useCallback(() => {
    const result = parsePaletteInput(importValue);
    if (result.error) {
      setImportError(result.error);
      return;
    }
    applyRawPalette(result.colors);
    setImportValue('');
    setImportOpen(false);
    setImportError(null);
  }, [importValue, applyRawPalette]);

  const handleImportClose = useCallback(() => {
    setImportOpen(false);
    setImportValue('');
    setImportError(null);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Active palette: role-mapped color bar + info row */}
      <div className="px-3 pt-3 pb-2">
        <div
          className="flex h-7 rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--sidebar-border-subtle)' }}
        >
          {ROLE_PREVIEW.map(({ key, flex }) => (
            <div
              key={key}
              className="transition-colors duration-200"
              style={{
                flex,
                background: (colors as unknown as Record<string, string>)[key],
              }}
            />
          ))}
        </div>

        {/* Role labels + action icons */}
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center" style={{ gap: 8 }}>
            {ROLE_PREVIEW.map(({ key, label }) => (
              <div key={key} className="flex items-center" style={{ gap: 3 }}>
                <div
                  className="transition-colors duration-200"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 2,
                    background: (colors as unknown as Record<string, string>)[key],
                    border: '1px solid rgba(128,128,128,0.12)',
                  }}
                />
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--sidebar-text-muted)',
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center" style={{ gap: 2 }}>
            {passesAA && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: 'var(--sidebar-text-muted)',
                  background: 'var(--sidebar-bg-hover)',
                  borderRadius: 4,
                  padding: '1px 5px',
                  marginRight: 2,
                }}
              >
                AA
              </span>
            )}
            <button
              title="Edit colors"
              onClick={() => setCustomOpen(true)}
              className="flex items-center justify-center w-6 h-6 rounded-md transition-colors duration-100"
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
            </button>
            <button
              title="Import palette"
              onClick={() => setImportOpen(!importOpen)}
              className="flex items-center justify-center w-6 h-6 rounded-md transition-colors duration-100"
              style={{
                color: importOpen ? 'var(--sidebar-text)' : 'var(--sidebar-text-muted)',
                background: importOpen ? 'var(--sidebar-bg-hover)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!importOpen) {
                  e.currentTarget.style.color = 'var(--sidebar-text)';
                  e.currentTarget.style.background = 'var(--sidebar-bg-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!importOpen) {
                  e.currentTarget.style.color = 'var(--sidebar-text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <RiClipboardLine size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Import area */}
      {importOpen && (
        <div className="px-3 pb-2 flex flex-col gap-2">
          <textarea
            value={importValue}
            onChange={(e) => {
              setImportValue(e.target.value);
              setImportError(null);
            }}
            placeholder={"Paste from Coolors:\n--color-name: #780000ff;\n\nOr hex values:\n#780000, #c1121f, #fdf0d5"}
            rows={4}
            className="w-full resize-none rounded-md text-[11px] leading-relaxed"
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              padding: '8px 10px',
              background: 'transparent',
              border: '1px solid var(--sidebar-border-subtle)',
              color: 'var(--sidebar-text)',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--sidebar-text-muted)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--sidebar-border-subtle)';
            }}
            autoFocus
          />

          {/* Live preview swatches */}
          {previewColors.length > 0 && (
            <div className="flex gap-1">
              {previewColors.map((color, i) => (
                <div
                  key={i}
                  className="h-5 flex-1 rounded"
                  style={{
                    background: color,
                    border: '1px solid rgba(128,128,128,0.15)',
                  }}
                />
              ))}
            </div>
          )}

          {importError && (
            <span className="text-[11px]" style={{ color: '#ef4444' }}>
              {importError}
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleImportApply}
              disabled={previewColors.length === 0}
              className="flex-1 h-7 rounded-md text-[11px] font-medium transition-colors duration-100"
              style={{
                background: previewColors.length > 0 ? 'var(--sidebar-text)' : 'var(--sidebar-bg-hover)',
                color: previewColors.length > 0 ? 'var(--sidebar-bg)' : 'var(--sidebar-text-muted)',
                cursor: previewColors.length > 0 ? 'pointer' : 'default',
              }}
            >
              Apply{previewColors.length > 0 ? ` (${previewColors.length})` : ''}
            </button>
            <button
              onClick={handleImportClose}
              className="h-7 px-3 rounded-md text-[11px] transition-colors duration-100"
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
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Curated content */}
      <div className="flex flex-col flex-1 min-h-0">
        <PaletteStyleFilter
          activeStyle={activeStyle}
          onStyleChange={setActiveStyle}
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
