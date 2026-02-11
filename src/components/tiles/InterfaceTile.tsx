/**
 * Interface Tile Component
 *
 * Simple button specimens showcasing primary, secondary, and tertiary
 * button styles in the brand's palette. Scales to fit any tile size.
 * Click tile to show floating toolbar for editing button settings.
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { HexColorPicker } from 'react-colorful';
import { getAdaptiveTextColor } from '@/utils/color';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { getFontCategory } from '@/utils/typography';
import { hexToHSL } from '@/utils/colorMapping';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarSlider,
  ToolbarSegmented,
} from './FloatingToolbar';

/** Design-space dimensions for the button specimen card (px).
 *  Content is authored at this fixed size then uniformly scaled
 *  via ResizeObserver to fit whatever tile it lives in. */
const CARD_W = 240;
const CARD_H = 200;

interface InterfaceTileProps {
  placementId?: string;
}

export function InterfaceTile({ placementId }: InterfaceTileProps) {
  const { colors, bodyFont, ui } = useBrandStore(
    useShallow((state: BrandStore) => ({
      colors: state.brand.colors,
      bodyFont: state.brand.typography.secondary,
      ui: state.brand.ui,
    }))
  );

  const updateBrand = useBrandStore((s) => s.updateBrand);
  const brand = useBrandStore((s) => s.brand);

  const placementTileId = getPlacementTileId(placementId);
  const placementTileType = getPlacementTileType(placementId);
  const tile = useBrandStore((state: BrandStore) => {
    if (placementTileId) return state.tiles.find((t) => t.id === placementTileId);
    if (placementTileType) return state.tiles.find((t) => t.type === placementTileType);
    return undefined;
  });
  const tileSurfaceIndex = useBrandStore((state: BrandStore) =>
    placementId ? state.tileSurfaces[placementId] : undefined
  );

  const { primary, text, bg, surfaces } = colors;
  const btnColor = ui?.buttonColor || primary;
  const btnRadius = ui?.buttonRadius ?? 10;
  const btnStyle = ui?.buttonStyle ?? 'filled';
  const btnSize = ui?.buttonSize ?? 'default';
  const btnWeight = ui?.buttonWeight ?? 600;
  const btnUppercase = ui?.buttonUppercase ?? false;
  const btnLetterSpacing = ui?.buttonLetterSpacing ?? 0;

  const sizeMap: Record<string, { height: number; fontSize: number; px: number }> = {
    compact: { height: 36, fontSize: 12, px: 16 },
    default: { height: 46, fontSize: 14, px: 22 },
    large: { height: 54, fontSize: 15, px: 28 },
  };
  const sizeConfig = sizeMap[btnSize] || sizeMap.default;
  const content = tile?.content || {};
  const primaryLabel = content.buttonLabel || 'Get Started';
  const secondaryLabel = content.headerTitle || 'Learn More';

  const { fontFamily: uiFont } = useGoogleFonts(bodyFont, getFontCategory(bodyFont));

  const tileBg = resolveSurfaceColor({
    placementId,
    tileSurfaceIndex,
    surfaces,
    bg,
    defaultIndex: 1,
  });

  const tileBgL = hexToHSL(tileBg).l;
  const isLight = tileBgL > 55;

  const cardText = isLight
    ? `color-mix(in srgb, ${text} 80%, transparent)`
    : `color-mix(in srgb, ${text} 75%, transparent)`;

  const btnTextOnFilled = getAdaptiveTextColor(
    btnColor,
    COLOR_DEFAULTS.TEXT_DARK,
    COLOR_DEFAULTS.WHITE
  );

  const primaryBtnStyles = (() => {
    switch (btnStyle) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: btnColor,
          border: `1.5px solid ${btnColor}`,
          boxShadow: 'none',
        };
      case 'soft':
        return {
          backgroundColor: `color-mix(in srgb, ${btnColor} 12%, transparent)`,
          color: btnColor,
          border: 'none',
          boxShadow: 'none',
        };
      default:
        return {
          backgroundColor: btnColor,
          color: btnTextOnFilled,
          border: 'none',
          boxShadow: 'none',
        };
    }
  })();

  // Scale-to-fit: the button card is authored at CARD_W x CARD_H,
  // then uniformly scaled to fill the tile with 8% proportional padding.
  // Uses Math.min of x/y ratios so the card never overflows either axis.
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const pad = Math.min(rect.width, rect.height) * 0.08;
      const s = Math.min((rect.width - pad * 2) / CARD_W, (rect.height - pad * 2) / CARD_H);
      setScale(s);
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  // Toolbar
  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);
  const [showPicker, setShowPicker] = useState(false);
  const [colorDraft, setColorDraft] = useState(btnColor);
  useEffect(() => { setColorDraft(btnColor); }, [btnColor]);

  const handleUiChange = useCallback((key: string, value: unknown, isCommit = true) => {
    updateBrand({ ui: { ...brand.ui, [key]: value } }, isCommit);
  }, [updateBrand, brand.ui]);


  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: tileBg }}
    >
      <div
        className="flex flex-col"
        style={{
          width: CARD_W,
          height: CARD_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
          fontFamily: uiFont,
          gap: 10,
          justifyContent: 'center',
        }}
      >
        {/* Primary */}
        <button
          className="flex items-center justify-center"
          style={{
            width: '100%',
            height: sizeConfig.height,
            padding: `0 ${sizeConfig.px}px`,
            borderRadius: btnRadius,
            fontFamily: uiFont,
            fontWeight: btnWeight,
            fontSize: sizeConfig.fontSize,
            textTransform: btnUppercase ? 'uppercase' : 'none',
            letterSpacing: btnUppercase ? `${Math.max(btnLetterSpacing, 0.04)}em` : btnLetterSpacing ? `${btnLetterSpacing}em` : undefined,
            cursor: 'default',
            ...primaryBtnStyles,
          }}
        >
          {primaryLabel}
        </button>

        {/* Secondary — outline */}
        <button
          className="flex items-center justify-center"
          style={{
            width: '100%',
            height: sizeConfig.height,
            padding: `0 ${sizeConfig.px}px`,
            borderRadius: btnRadius,
            backgroundColor: 'transparent',
            color: cardText,
            fontFamily: uiFont,
            fontWeight: Math.min(btnWeight, 500) as number,
            fontSize: sizeConfig.fontSize,
            textTransform: btnUppercase ? 'uppercase' : 'none',
            letterSpacing: btnUppercase ? `${Math.max(btnLetterSpacing, 0.04)}em` : btnLetterSpacing ? `${btnLetterSpacing}em` : undefined,
            border: `1.5px solid ${isLight
              ? `color-mix(in srgb, ${text} 18%, transparent)`
              : `color-mix(in srgb, ${text} 14%, transparent)`
            }`,
            cursor: 'default',
          }}
        >
          {secondaryLabel}
        </button>
      </div>

      {/* Floating toolbar when focused */}
      {isFocused && anchorRect && (
        <FloatingToolbar anchorRect={anchorRect}>
          <ToolbarActions
            onShuffle={() => {
              const styles = ['filled', 'outline', 'soft'];
              const next = styles[(styles.indexOf(btnStyle) + 1) % styles.length];
              handleUiChange('buttonStyle', next, true);
            }}
          />
          <ToolbarSlider
            label="Radius"
            value={btnRadius}
            min={0}
            max={24}
            displayValue={`${btnRadius}px`}
            onChange={(v) => handleUiChange('buttonRadius', Math.round(v), false)}
            onCommit={(v) => handleUiChange('buttonRadius', Math.round(v), true)}
          />
          <ToolbarSegmented
            label="Style"
            options={[
              { value: 'filled', label: 'Filled' },
              { value: 'outline', label: 'Outline' },
              { value: 'soft', label: 'Soft' },
            ]}
            value={btnStyle}
            onChange={(v) => handleUiChange('buttonStyle', v, true)}
          />

          <ToolbarSegmented
            label="Size"
            options={[
              { value: 'compact', label: 'S' },
              { value: 'default', label: 'M' },
              { value: 'large', label: 'L' },
            ]}
            value={btnSize}
            onChange={(v) => handleUiChange('buttonSize', v, true)}
          />
          <ToolbarSegmented
            label="Weight"
            options={[
              { value: '400', label: 'Regular' },
              { value: '500', label: 'Medium' },
              { value: '600', label: 'Semi' },
              { value: '700', label: 'Bold' },
            ]}
            value={String(btnWeight)}
            onChange={(v) => handleUiChange('buttonWeight', Number(v), true)}
          />
          <ToolbarSegmented
            label="Case"
            options={[
              { value: 'false', label: 'Default' },
              { value: 'true', label: 'ABC' },
            ]}
            value={String(btnUppercase)}
            onChange={(v) => handleUiChange('buttonUppercase', v === 'true', true)}
          />
          <ToolbarSlider
            label="Spacing"
            value={btnLetterSpacing}
            min={0}
            max={0.2}
            displayValue={`${btnLetterSpacing.toFixed(2)}em`}
            onChange={(v) => handleUiChange('buttonLetterSpacing', Math.round(v * 100) / 100, false)}
            onCommit={(v) => handleUiChange('buttonLetterSpacing', Math.round(v * 100) / 100, true)}
          />
          {/* Color picker (unique to InterfaceTile) */}
          <div>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sidebar-text-muted)', display: 'block', marginBottom: 6 }}>Color</span>
            <button
              onClick={() => setShowPicker(!showPicker)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '4px 8px',
                background: showPicker ? 'var(--sidebar-bg-active)' : 'transparent',
                border: '1px solid var(--sidebar-border)', borderRadius: 8, cursor: 'pointer',
              }}
            >
              <div style={{ width: 18, height: 18, borderRadius: 5, backgroundColor: btnColor, flexShrink: 0, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', color: 'var(--sidebar-text-secondary)' }}>
                {btnColor.toUpperCase()}
              </span>
            </button>
            {showPicker && (
              <div style={{ marginTop: 6, padding: 8, background: 'var(--sidebar-bg-elevated)', border: '1px solid var(--sidebar-border)', borderRadius: 10 }}>
                <HexColorPicker
                  color={colorDraft}
                  onChange={(hex) => {
                    setColorDraft(hex);
                    handleUiChange('buttonColor', hex, false);
                  }}
                  style={{ width: '100%', height: 120 }}
                />
                <input
                  type="text"
                  value={colorDraft.toUpperCase()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setColorDraft(val);
                    if (/^#[0-9A-Fa-f]{6}$/.test(val)) handleUiChange('buttonColor', val, false);
                  }}
                  onBlur={() => handleUiChange('buttonColor', colorDraft, true)}
                  style={{
                    marginTop: 6, width: '100%', fontSize: 11, padding: '4px 8px', borderRadius: 6,
                    background: 'var(--sidebar-bg-active)', color: 'var(--sidebar-text)',
                    border: '1px solid var(--sidebar-border)', fontFamily: 'ui-monospace, monospace',
                  }}
                />
              </div>
            )}
          </div>

        </FloatingToolbar>
      )}
    </div>
  );
}
