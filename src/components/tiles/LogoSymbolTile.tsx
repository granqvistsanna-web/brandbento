/**
 * Logo Symbol Tile Component
 *
 * Shows only the logo mark/image centered on a clean surface.
 * No text wordmark — this is for the icon/symbol part of the brand.
 * If no logo image is uploaded, shows a subtle placeholder.
 */
import { memo, useCallback } from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { hexToHSL } from '@/utils/colorMapping';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { Fingerprint } from 'lucide-react';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarLabel,
  ToolbarSlider,
  ToolbarDivider,
} from './FloatingToolbar';

interface LogoSymbolTileProps {
  placementId?: string;
}

export const LogoSymbolTile = memo(function LogoSymbolTile({ placementId }: LogoSymbolTileProps) {
  const { logo, colors } = useBrandStore(
    useShallow((state) => ({
      logo: state.brand.logo,
      colors: state.brand.colors,
    }))
  );
  const updateBrand = useBrandStore((s) => s.updateBrand);
  const brand = useBrandStore((s) => s.brand);
  const tileSurfaceIndex = useBrandStore((state) =>
    placementId ? state.tileSurfaces[placementId] : undefined
  );
  const { padding, size: logoSize, image: logoImage } = logo;
  const { bg, surfaces } = colors;

  const surfaceBg = resolveSurfaceColor({
    placementId,
    tileSurfaceIndex,
    surfaces,
    bg,
    defaultIndex: 1,
  });

  const surfaceL = hexToHSL(surfaceBg).l;
  const surfaceLight = surfaceL > 55;
  const placeholderColor = surfaceLight ? COLOR_DEFAULTS.TEXT_DARK : COLOR_DEFAULTS.WHITE;

  const { isFocused, containerRef, anchorRect } = useTileToolbar(placementId);

  const handleLogoChange = useCallback((key: string, value: unknown, isCommit = true) => {
    updateBrand({ logo: { ...brand.logo, [key]: value } }, isCommit);
  }, [updateBrand, brand.logo]);

  const toolbar = isFocused && anchorRect && (
    <FloatingToolbar anchorRect={anchorRect}>
      <ToolbarActions onShuffle={() => {/* no-op */}} />
      <ToolbarDivider />
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
    </FloatingToolbar>
  );

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundColor: surfaceBg }} />
      <div
        className="relative h-full w-full flex items-center justify-center"
        style={{ padding: `${Math.max(padding, 20)}px` }}
      >
        {logoImage ? (
          <img
            src={logoImage}
            alt="Brand symbol"
            className="max-w-full max-h-full object-contain"
            style={{
              filter: 'drop-shadow(var(--shadow-lg))',
              maxWidth: '65%',
              maxHeight: '65%',
            }}
          />
        ) : (
          <Fingerprint
            size={clamp(logoSize * 1.5, 32, 80)}
            strokeWidth={1}
            color={placeholderColor}
            style={{ opacity: 0.15 }}
          />
        )}
      </div>
      {toolbar}
    </div>
  );
});

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
