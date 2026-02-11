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
import { getStyleGroups, type PaletteStyle } from '@/utils/paletteStyleClassifier';
import { parsePaletteInput } from '@/utils/parsePaletteInput';
import { PaletteStyleFilter } from './PaletteStyleFilter';
import { PaletteGrid } from './PaletteGrid';
import { CustomColorModal } from './CustomColorModal';

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

  const styleCounts = useMemo(() => {
    const groups = getStyleGroups();
    const counts = {} as Record<PaletteStyle, number>;
    for (const [style, palettes] of Object.entries(groups)) {
      counts[style as PaletteStyle] = palettes.length;
    }
    return counts;
  }, []);

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

  const headerButtonClass = "flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-colors duration-100";

  const handleButtonEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.color = 'var(--sidebar-text)';
    e.currentTarget.style.background = 'var(--sidebar-bg-hover)';
  }, []);

  const handleButtonLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.color = 'var(--sidebar-text-muted)';
    e.currentTarget.style.background = 'transparent';
  }, []);

  return (
    <div className="flex flex-col">
      {/* Header: Edit + Import buttons */}
      <div className="px-3 pt-2.5 pb-1.5 flex items-center gap-1">
        <button
          onClick={() => setCustomOpen(true)}
          className={`${headerButtonClass} -ml-2`}
          style={{ color: 'var(--sidebar-text-muted)' }}
          onMouseEnter={handleButtonEnter}
          onMouseLeave={handleButtonLeave}
        >
          <Sliders size={12} />
          Edit Colors
        </button>
        <button
          onClick={() => setImportOpen(!importOpen)}
          className={headerButtonClass}
          style={{
            color: importOpen ? 'var(--sidebar-text)' : 'var(--sidebar-text-muted)',
            background: importOpen ? 'var(--sidebar-bg-hover)' : 'transparent',
          }}
          onMouseEnter={handleButtonEnter}
          onMouseLeave={!importOpen ? handleButtonLeave : undefined}
        >
          <RiClipboardLine size={12} />
          Import
        </button>
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
              onMouseEnter={handleButtonEnter}
              onMouseLeave={handleButtonLeave}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Curated content (always shown inline) */}
      <div className="flex flex-col flex-1 min-h-0">
        <PaletteStyleFilter
          activeStyle={activeStyle}
          onStyleChange={setActiveStyle}
          styleCounts={styleCounts}
        />

        <div
          className="mx-3 h-px shrink-0"
          style={{ background: 'var(--sidebar-border-subtle)' }}
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
