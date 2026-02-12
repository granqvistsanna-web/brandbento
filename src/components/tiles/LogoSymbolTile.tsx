/**
 * Logo Symbol Tile Component
 *
 * Shows only the logo mark/symbol centered on a clean surface.
 * No text wordmark — this is for the icon/symbol part of the brand.
 *
 * Three variation states:
 * 1. Standalone symbol on surface
 * 2. Symbol inside rounded background container (badge/app-icon feel)
 * 3. Symbol paired with optional short label
 *
 * Default placeholder shows the first letter of the brand name in the
 * headline font — aligning visually with LogoTile's fallback.
 */
import { memo, useCallback } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { getAdaptiveTextColor } from '@/utils/color';
import { resolveSurfaceColor } from '@/utils/surface';
import { usePlacementTile } from '@/hooks/usePlacementTile';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { getFontCategory, clampFontSize, getTypeScale } from '@/utils/typography';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarLabel,
  ToolbarSlider,
  ToolbarDivider,
  ToolbarTileTypeGrid,
  ToolbarSurfaceSwatches,
  ToolbarColorPicker,
  ToolbarToggle,
  ToolbarTextInput,
  ToolbarSegmented,
} from './FloatingToolbar';

interface LogoSymbolTileProps {
  placementId?: string;
}

export const LogoSymbolTile = memo(function LogoSymbolTile({ placementId }: LogoSymbolTileProps) {
  /* ─── Store ─── */
  const { logo, colors, typography } = useBrandStore(
    useShallow((state: BrandStore) => ({
      logo: state.brand.logo,
      colors: state.brand.colors,
      typography: state.brand.typography,
    }))
  );
  const updateBrand = useBrandStore((s) => s.updateBrand);
  const brand = useBrandStore((s) => s.brand);
  const updateTile = useBrandStore((s) => s.updateTile);
  const swapTileType = useBrandStore((s) => s.swapTileType);
  const setTileSurface = useBrandStore((s) => s.setTileSurface);
  const { tileId: placementTileId, tileType: placementTileType } = usePlacementTile(placementId);
  const tile = useBrandStore((state: BrandStore) => {
    if (placementTileId) return state.tiles.find((t) => t.id === placementTileId);
    if (placementTileType) return state.tiles.find((t) => t.type === placementTileType);
    return state.tiles.find((t) => t.type === 'logo-symbol');
  });
  const tileSurfaceIndex = useBrandStore((state: BrandStore) =>
    placementId ? state.tileSurfaces[placementId] : undefined
  );

  /* ─── Destructure ─── */
  const { padding, size: logoSize, image: logoImage } = logo;
  const { bg, primary, text: textColor, surfaces } = colors;
  const tileContent = tile?.content || {};

  /* ─── Tile-level content ─── */
  const symbolBg = tileContent.symbolBg ?? false;
  const symbolBgColor = tileContent.symbolBgColor || primary;
  const symbolBgRadius = tileContent.symbolBgRadius ?? 24;
  const symbolBgPadding = tileContent.symbolBgPadding ?? 20;
  const symbolBgShadow = tileContent.symbolBgShadow ?? false;
  const symbolColor = tileContent.symbolColor;
  const symbolStroke = tileContent.symbolStroke ?? false;
  const symbolLabel = tileContent.symbolLabel || '';

  /* ─── Colors ─── */
  const surfaceBg = resolveSurfaceColor({
    placementId,
    tileSurfaceIndex,
    surfaces,
    bg,
    defaultIndex: 1,
  });
  const adaptiveText = getAdaptiveTextColor(surfaceBg, textColor, COLOR_DEFAULTS.TEXT_LIGHT);

  /* ─── Typography ─── */
  const fontPreview = useBrandStore((state) => state.fontPreview);
  const primaryFontChoice = fontPreview?.target === 'primary' ? fontPreview.font : typography.primary;
  const secondaryFontChoice = fontPreview?.target === 'secondary' ? fontPreview.font : typography.secondary;
  const { fontFamily: headlineFont } = useGoogleFonts(primaryFontChoice, getFontCategory(primaryFontChoice));
  const { fontFamily: bodyFont } = useGoogleFonts(secondaryFontChoice, getFontCategory(secondaryFontChoice));
  const typeScale = getTypeScale(typography);
  const headlineWeight = parseInt(typography.weightHeadline) || 700;

  /* ─── Toolbar ─── */
  const { isFocused, containerRef, anchorRect } = useTileToolbar(placementId);

  const handleLogoChange = useCallback((key: string, value: unknown, isCommit = true) => {
    updateBrand({ logo: { ...brand.logo, [key]: value } }, isCommit);
  }, [updateBrand, brand.logo]);

  const handleContentChange = useCallback((updates: Record<string, unknown>, isCommit = true) => {
    if (tile?.id) updateTile(tile.id, updates, isCommit);
  }, [tile?.id, updateTile]);

  /* ─── Resolved symbol color ─── */
  // If inside container: contrast against container bg
  // If standalone: contrast against tile surface
  const resolvedSymbolColor = symbolColor
    || (symbolBg
      ? getAdaptiveTextColor(symbolBgColor, COLOR_DEFAULTS.TEXT_DARK, COLOR_DEFAULTS.WHITE)
      : adaptiveText);

  // Palette colors for color picker
  const paletteColors = [primary, textColor, bg, ...(surfaces || []).slice(0, 3)];

  /* ─── Symbol sizing ─── */
  const symbolScale = 20 + ((logoSize - 12) / 68) * 75; // 20% – 95%

  /* ─── Default letter mark ─── */
  const brandLetter = (logo.text || 'B').charAt(0).toUpperCase();

  /* ─── Symbol element ─── */
  const symbolElement = logoImage ? (
    <img
      src={logoImage}
      alt="Brand symbol"
      className="object-contain"
      style={{
        maxWidth: `${symbolScale}%`,
        maxHeight: `${symbolScale}%`,
        ...(symbolStroke ? { filter: 'brightness(0)' } : {}),
        ...(symbolColor && !symbolStroke ? { filter: `drop-shadow(0 0 0 ${symbolColor})` } : {}),
        transition: 'filter 0.3s ease',
      }}
    />
  ) : (
    <span
      style={{
        fontFamily: headlineFont,
        fontSize: clampFontSize(logoSize * 2.2, 28, 140),
        fontWeight: headlineWeight,
        letterSpacing: '0.02em',
        color: resolvedSymbolColor,
        lineHeight: 1,
        transition: 'color 0.3s ease',
      }}
    >
      {brandLetter}
    </span>
  );

  /* ─── Container wrapper (variation 2) ─── */
  const containerElement = symbolBg ? (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: symbolBgColor,
        borderRadius: symbolBgRadius,
        padding: symbolBgPadding,
        boxShadow: symbolBgShadow
          ? '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)'
          : 'none',
        transition: 'background-color 0.3s ease, border-radius 0.3s ease, box-shadow 0.3s ease',
        maxWidth: '80%',
        maxHeight: '80%',
      }}
    >
      {symbolElement}
    </div>
  ) : (
    symbolElement
  );

  /* ─── Label element (variation 3) ─── */
  const labelElement = symbolLabel ? (
    <span
      style={{
        fontFamily: bodyFont,
        fontWeight: parseInt(typography.weightBody) || 400,
        fontSize: `${clampFontSize(typeScale.stepMinus2, 9, 13)}px`,
        letterSpacing: '0.12em',
        textTransform: 'uppercase' as const,
        color: adaptiveText,
        opacity: 0.45,
        marginTop: clampFontSize(logoSize * 0.3, 6, 16),
        transition: 'color 0.3s ease',
      }}
    >
      {symbolLabel}
    </span>
  ) : null;

  /* ─── Toolbar ─── */
  const toolbar = isFocused && anchorRect && (
    <FloatingToolbar anchorRect={anchorRect}>
      <ToolbarActions
        onShuffle={() => {/* no-op */}}
        hasImage
        onImageUpload={(dataUrl) => handleLogoChange('image', dataUrl)}
      />
      <ToolbarDivider />
      <ToolbarTileTypeGrid
        currentType={tile?.type || 'logo-symbol'}
        onTypeChange={(type) => tile?.id && swapTileType(tile.id, type)}
      />
      <ToolbarDivider />
      <ToolbarSurfaceSwatches
        surfaces={surfaces}
        bgColor={bg}
        currentIndex={tileSurfaceIndex}
        onSurfaceChange={(idx) => placementId && setTileSurface(placementId, idx)}
      />
      <ToolbarDivider />

      {/* ─── Symbol controls ─── */}
      <ToolbarLabel>Symbol</ToolbarLabel>
      <ToolbarSlider
        label="Size"
        value={logoSize || 32}
        min={12}
        max={80}
        displayValue={`${logoSize || 32}px`}
        onChange={(v) => handleLogoChange('size', Math.round(v), false)}
        onCommit={(v) => handleLogoChange('size', Math.round(v), true)}
      />
      <ToolbarSlider
        label="Padding"
        value={padding || 0}
        min={0}
        max={80}
        displayValue={`${padding || 0}px`}
        onChange={(v) => handleLogoChange('padding', Math.round(v), false)}
        onCommit={(v) => handleLogoChange('padding', Math.round(v), true)}
      />
      <ToolbarColorPicker
        label="Symbol Color"
        color={symbolColor || resolvedSymbolColor}
        autoColor={symbolBg
          ? getAdaptiveTextColor(symbolBgColor, COLOR_DEFAULTS.TEXT_DARK, COLOR_DEFAULTS.WHITE)
          : adaptiveText}
        paletteColors={paletteColors}
        onChange={(hex) => handleContentChange({ symbolColor: hex }, false)}
        onCommit={(val) => handleContentChange({ symbolColor: val !== undefined ? val : tileContent.symbolColor }, true)}
      />
      {logoImage && (
        <ToolbarSegmented
          label="Style"
          options={[
            { value: 'fill', label: 'Fill' },
            { value: 'stroke', label: 'Stroke' },
          ]}
          value={symbolStroke ? 'stroke' : 'fill'}
          onChange={(v) => handleContentChange({ symbolStroke: v === 'stroke' }, true)}
        />
      )}
      <ToolbarDivider />

      {/* ─── Background container ─── */}
      <ToolbarLabel>Background</ToolbarLabel>
      <ToolbarToggle
        label="Container"
        checked={symbolBg}
        onChange={(v) => handleContentChange({ symbolBg: v }, true)}
      />
      {symbolBg && (
        <>
          <ToolbarColorPicker
            label="Color"
            color={symbolBgColor}
            autoColor={primary}
            paletteColors={paletteColors}
            onChange={(hex) => handleContentChange({ symbolBgColor: hex || primary }, false)}
            onCommit={(val) => handleContentChange({ symbolBgColor: val !== undefined ? (val || primary) : (tileContent.symbolBgColor || primary) }, true)}
          />
          <ToolbarSlider
            label="Radius"
            value={symbolBgRadius}
            min={0}
            max={80}
            displayValue={`${symbolBgRadius}px`}
            onChange={(v) => handleContentChange({ symbolBgRadius: Math.round(v) }, false)}
            onCommit={(v) => handleContentChange({ symbolBgRadius: Math.round(v) }, true)}
          />
          <ToolbarSlider
            label="Padding"
            value={symbolBgPadding}
            min={8}
            max={60}
            displayValue={`${symbolBgPadding}px`}
            onChange={(v) => handleContentChange({ symbolBgPadding: Math.round(v) }, false)}
            onCommit={(v) => handleContentChange({ symbolBgPadding: Math.round(v) }, true)}
          />
          <ToolbarToggle
            label="Shadow"
            checked={symbolBgShadow}
            onChange={(v) => handleContentChange({ symbolBgShadow: v }, true)}
          />
        </>
      )}
      <ToolbarDivider />

      {/* ─── Label ─── */}
      <ToolbarLabel>Label</ToolbarLabel>
      <ToolbarTextInput
        value={symbolLabel}
        onChange={(v) => handleContentChange({ symbolLabel: v }, false)}
        onCommit={(v) => handleContentChange({ symbolLabel: v }, true)}
        placeholder="e.g. Studio, Mark, Icon"
      />
    </FloatingToolbar>
  );

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <div
        className="absolute inset-0 transition-colors duration-300"
        style={{ backgroundColor: surfaceBg }}
      />
      <div
        className="relative h-full w-full flex flex-col items-center justify-center"
        style={{ padding: `${Math.max(padding, 20)}px` }}
      >
        {containerElement}
        {labelElement}
      </div>
      {toolbar}
    </div>
  );
});
