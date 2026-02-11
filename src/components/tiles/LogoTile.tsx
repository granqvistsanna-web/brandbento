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
import { resolveSurfaceColor } from '@/utils/surface';
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
  ToolbarSurfaceSwatches,
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
  const setTileSurface = useBrandStore((s) => s.setTileSurface);
  const tile = useBrandStore((state) =>
    state.tiles.find((t) => t.type === 'logo')
  );
  const tileSurfaceIndex = useBrandStore((state) =>
    placementId ? state.tileSurfaces[placementId] : undefined
  );
  const { padding, size: logoSize, text: logoText, image: logoImage } = logo;
  const { primary, bg, surfaces } = colors;

  const surfaceBg = resolveSurfaceColor({
    placementId,
    tileSurfaceIndex,
    surfaces,
    bg,
    defaultIndex: 0,
  });

  const isHero = placementId === 'hero';
  const showWordmark = Boolean(logoText && logoText.trim().length > 0);
  const headlineWeight = parseInt(typography.weightHeadline) || 700;
  const fontPreview = useBrandStore((state) => state.fontPreview);

  // Apply font preview if active
  const primaryFontChoice = fontPreview?.target === "primary" ? fontPreview.font : typography.primary;

  const { fontFamily: primaryFont } = useGoogleFonts(primaryFontChoice, getFontCategory(primaryFontChoice));
  const { isFocused, containerRef, anchorRect } = useTileToolbar(placementId);

  const handleLogoChange = useCallback((key: string, value: unknown, isCommit = true) => {
    updateBrand({ logo: { ...brand.logo, [key]: value } }, isCommit);
  }, [updateBrand, brand.logo]);

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
      <ToolbarSurfaceSwatches
        surfaces={surfaces}
        bgColor={bg}
        currentIndex={tileSurfaceIndex}
        onSurfaceChange={(idx) => placementId && setTileSurface(placementId, idx)}
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
    </FloatingToolbar>
  );

  // Use primary color as background, adaptive foreground
  const logoBg = primary || surfaceBg;
  const logoFg = adaptiveColor(logoBg, COLOR_DEFAULTS.TEXT_DARK, COLOR_DEFAULTS.WHITE);

  // Hero placement renders larger
  const fontSize = isHero
    ? clampFontSize(logoSize * 2, 32, 160)
    : clampFontSize(logoSize * 1.6, 24, 120);

  // For hero, use surface bg; for regular, use primary bg
  const tileBg = isHero ? surfaceBg : logoBg;
  const textColor = isHero
    ? (hexToHSL(surfaceBg).l > 55 ? primary : COLOR_DEFAULTS.WHITE)
    : logoFg;

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
              fontFamily: primaryFont,
              fontSize: `${fontSize}px`,
              fontWeight: headlineWeight,
              letterSpacing: '0.04em',
              color: textColor,
              lineHeight: 1,
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
