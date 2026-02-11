/**
 * Logo Tile Component
 *
 * Centered brand logo display — shows the uploaded logo image
 * or falls back to a text wordmark on the brand primary color.
 * Adapts size for hero placements.
 */
import { memo, useCallback } from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { hexToHSL } from '@/utils/colorMapping';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { getFontCategory, clampFontSize } from '@/utils/typography';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarLabel,
  ToolbarSlider,
  ToolbarDivider,
  ToolbarTileTypeGrid,
  ToolbarColorPicker,
  ToolbarTextInput,
} from './FloatingToolbar';

interface LogoTileProps {
  placementId?: string;
}

const adaptiveColor = (bgHex: string, lightChoice: string, darkChoice: string, threshold = 55) =>
  hexToHSL(bgHex).l > threshold ? lightChoice : darkChoice;

export const LogoTile = memo(function LogoTile({ placementId }: LogoTileProps) {
  const { logo, colors, typography } = useBrandStore(
    useShallow((state) => ({
      logo: state.brand.logo,
      colors: state.brand.colors,
      typography: state.brand.typography,
    }))
  );
  const updateBrand = useBrandStore((s) => s.updateBrand);
  const brand = useBrandStore((s) => s.brand);
  const swapTileType = useBrandStore((s) => s.swapTileType);
  const tile = useBrandStore((state) =>
    state.tiles.find((t) => t.type === 'logo')
  );
  const {
    padding, size: logoSize, text: logoText, image: logoImage,
    color: logoColorOverride, bgColor: logoBgOverride,
    fontFamily: logoFontOverride, fontWeight: logoWeightOverride,
    letterSpacing: logoTrackingOverride, lineHeight: logoLineHeightOverride,
  } = logo;
  const { primary, bg, surfaces } = colors;

  const isHero = placementId === 'hero';
  const showWordmark = Boolean(logoText && logoText.trim().length > 0);

  // Resolve font: logo override > font preview > brand primary
  const fontPreview = useBrandStore((state) => state.fontPreview);
  const resolvedFontName = logoFontOverride || (fontPreview?.target === "primary" ? fontPreview.font : typography.primary);
  const { fontFamily: resolvedFont } = useGoogleFonts(resolvedFontName, getFontCategory(resolvedFontName));

  // Resolve weight
  const resolvedWeight = logoWeightOverride ?? (parseInt(typography.weightHeadline) || 700);

  // Resolve letter spacing & line height
  const resolvedTracking = logoTrackingOverride ?? 0.04;
  const resolvedLineHeight = logoLineHeightOverride ?? 1;

  // Resolve background color: logo override > primary (non-hero) / surface (hero)
  const defaultBg = primary || bg;
  const tileBg = logoBgOverride || defaultBg;

  // Resolve text color: logo override > auto from bg luminance
  const autoBgForText = tileBg;
  const autoTextColor = adaptiveColor(autoBgForText, COLOR_DEFAULTS.TEXT_DARK, COLOR_DEFAULTS.WHITE);
  const textColor = logoColorOverride || autoTextColor;

  const { isFocused, containerRef, anchorRect } = useTileToolbar(placementId);

  const handleLogoChange = useCallback((key: string, value: unknown, isCommit = true) => {
    updateBrand({ logo: { ...brand.logo, [key]: value } }, isCommit);
  }, [updateBrand, brand.logo]);

  // Palette colors for color pickers (surfaces + primary + accent)
  const paletteColors = [...new Set([primary, ...surfaces, colors.accent, colors.text, bg])];

  const toolbar = isFocused && anchorRect && (
    <FloatingToolbar anchorRect={anchorRect}>
      <ToolbarActions
        onShuffle={() => {/* no-op for logo */}}
        hasImage
        onImageUpload={(dataUrl) => handleLogoChange('image', dataUrl)}
      />
      <ToolbarDivider />
      <ToolbarTileTypeGrid
        currentType={tile?.type || 'logo'}
        onTypeChange={(type) => tile?.id && swapTileType(tile.id, type)}
      />
      <ToolbarDivider />
      <ToolbarColorPicker
        label="Background"
        color={tileBg}
        autoColor={defaultBg}
        paletteColors={paletteColors}
        onChange={(hex) => handleLogoChange('bgColor', hex ?? null, false)}
        onCommit={() => handleLogoChange('bgColor', logo.bgColor ?? null, true)}
      />
      <ToolbarColorPicker
        label="Text Color"
        color={textColor}
        autoColor={autoTextColor}
        paletteColors={paletteColors}
        onChange={(hex) => handleLogoChange('color', hex ?? null, false)}
        onCommit={() => handleLogoChange('color', logo.color ?? null, true)}
      />
      <ToolbarDivider />
      <ToolbarLabel>Logo</ToolbarLabel>
      <ToolbarTextInput
        label="Text"
        value={logoText || ''}
        onChange={(v) => handleLogoChange('text', v, false)}
        onCommit={(v) => handleLogoChange('text', v, true)}
        placeholder="BRAND"
      />
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
      <ToolbarDivider />
      <ToolbarLabel>Typography</ToolbarLabel>
      <ToolbarTextInput
        label="Font"
        value={logoFontOverride || typography.primary}
        onChange={(v) => handleLogoChange('fontFamily', v || null, false)}
        onCommit={(v) => handleLogoChange('fontFamily', v || null, true)}
        placeholder={typography.primary}
      />
      <ToolbarSlider
        label="Weight"
        value={resolvedWeight}
        min={100}
        max={900}
        step={100}
        displayValue={`${resolvedWeight}`}
        onChange={(v) => handleLogoChange('fontWeight', Math.round(v), false)}
        onCommit={(v) => handleLogoChange('fontWeight', Math.round(v), true)}
      />
      <ToolbarSlider
        label="Tracking"
        value={resolvedTracking}
        min={-0.05}
        max={0.3}
        step={0.01}
        displayValue={`${resolvedTracking.toFixed(2)}em`}
        onChange={(v) => handleLogoChange('letterSpacing', parseFloat(v.toFixed(2)), false)}
        onCommit={(v) => handleLogoChange('letterSpacing', parseFloat(v.toFixed(2)), true)}
      />
      <ToolbarSlider
        label="Line Height"
        value={resolvedLineHeight}
        min={0.8}
        max={2.0}
        step={0.05}
        displayValue={`${resolvedLineHeight.toFixed(2)}`}
        onChange={(v) => handleLogoChange('lineHeight', parseFloat(v.toFixed(2)), false)}
        onCommit={(v) => handleLogoChange('lineHeight', parseFloat(v.toFixed(2)), true)}
      />
    </FloatingToolbar>
  );

  // Hero placement renders larger
  const fontSize = isHero
    ? clampFontSize(logoSize * 2, 32, 160)
    : clampFontSize(logoSize * 1.6, 24, 120);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundColor: tileBg }} />
      <div
        className="relative h-full w-full flex items-center justify-center text-center"
        style={{ padding: `${padding}px` }}
      >
        {logoImage ? (
          <img
            src={logoImage}
            alt={showWordmark ? logoText : 'Brand logo'}
            className="object-contain"
            style={{
              filter: 'drop-shadow(var(--shadow-lg))',
              maxWidth: `${20 + ((logoSize - 12) / 68) * 75}%`,
              maxHeight: `${20 + ((logoSize - 12) / 68) * 75}%`,
            }}
          />
        ) : (
          <span
            style={{
              fontFamily: resolvedFont,
              fontSize: `${fontSize}px`,
              fontWeight: resolvedWeight,
              letterSpacing: `${resolvedTracking}em`,
              color: textColor,
              lineHeight: resolvedLineHeight,
            }}
          >
            {showWordmark ? logoText : 'BRAND'}
          </span>
        )}
      </div>
      {toolbar}
    </div>
  );
});
