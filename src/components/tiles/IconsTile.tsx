/**
 * Icons Tile Component
 *
 * 2x2 brand icon grid with subtle tinted backgrounds.
 * Shows design-system icons on the tile surface color
 * with adaptive contrast. Scales proportionally to fill
 * any tile shape via ResizeObserver.
 */
import { memo, useRef, useState, useEffect, useCallback } from 'react';
import { useBrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { hexToHSL } from '@/utils/colorMapping';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import {
  RiPaletteFill as Palette,
  RiFontSize as Type,
  RiStackFill as Layers,
  RiVipDiamondFill as Diamond,
  RiCameraLensFill as Aperture,
  RiQuillPenFill as Feather,
  RiHexagonFill as Hexagon,
  RiSparklingFill as Sparkles,
  RiBallPenFill as PenTool,
  RiContrastDropFill as Droplets,
  RiPokerDiamondsFill as Gem,
  RiCompassFill as Compass,
} from 'react-icons/ri';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarLabel,
  ToolbarDivider,
  ToolbarTileTypeGrid,
  ToolbarSurfaceSwatches,
} from './FloatingToolbar';

interface IconsTileProps {
  placementId?: string;
}

const ICON_SETS = [
  [Palette, Type, Layers, Diamond],
  [Aperture, Feather, Hexagon, Sparkles],
  [PenTool, Droplets, Gem, Compass],
];

/** Design-space dimensions for the 2x2 icon grid.
 *  GRID_W/H define the authoring canvas. CELL is one icon cell,
 *  GAP is spacing between cells. The grid is then uniformly scaled
 *  via ResizeObserver to fit the tile with 12% proportional padding. */
const GRID_W = 120;
const GRID_H = 120;
const CELL = 48;
const GAP = 12;
const ICON_SIZE = 22;

export const IconsTile = memo(function IconsTile({ placementId }: IconsTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [iconSetIndex, setIconSetIndex] = useState(0);

  const { colors } = useBrandStore(
    useShallow((state) => ({
      colors: state.brand.colors,
    }))
  );
  const swapTileType = useBrandStore((s) => s.swapTileType);
  const setTileSurface = useBrandStore((s) => s.setTileSurface);
  const tile = useBrandStore((state) =>
    state.tiles.find((t) => t.type === 'icons')
  );
  const tileSurfaceIndex = useBrandStore((state) =>
    placementId ? state.tileSurfaces[placementId] : undefined
  );
  const { primary, bg, surfaces } = colors;

  const surfaceBg = resolveSurfaceColor({
    placementId,
    tileSurfaceIndex,
    surfaces,
    bg,
    defaultIndex: 0,
  });

  const surfaceL = hexToHSL(surfaceBg).l;
  const surfaceLight = surfaceL > 55;
  const primaryL = primary ? hexToHSL(primary).l : 50;
  // Use brand primary as icon color if it has enough contrast (> 25 lightness
  // delta) against the surface; otherwise fall back to neutral dark/light.
  const primaryContrast = Math.abs(surfaceL - primaryL);
  const iconColor = primaryContrast > 25 ? primary : (surfaceLight ? COLOR_DEFAULTS.TEXT_DARK : COLOR_DEFAULTS.TEXT_LIGHT);

  // Tinted cell background: same hue as the icon at 10% opacity for subtle branding
  const iconHSL = hexToHSL(iconColor);
  const tintBg = `hsla(${iconHSL.h}, ${iconHSL.s}%, ${iconHSL.l}%, 0.1)`;

  // Scale-to-fit: the 2x2 grid is authored at GRID_W x GRID_H then
  // uniformly scaled to fill the tile with 12% proportional padding.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const pad = Math.min(width, height) * 0.12;
      const s = Math.min(
        (width - pad * 2) / GRID_W,
        (height - pad * 2) / GRID_H
      );
      setScale(s);
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  const handleShuffle = useCallback(() => {
    setIconSetIndex((prev) => (prev + 1) % ICON_SETS.length);
  }, []);

  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);

  const currentIcons = ICON_SETS[iconSetIndex];

  const toolbar = isFocused && anchorRect && (
    <FloatingToolbar anchorRect={anchorRect}>
      <ToolbarActions onShuffle={handleShuffle} />
      <ToolbarDivider />
      <ToolbarTileTypeGrid
        currentType={tile?.type || 'icons'}
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
      <ToolbarLabel>Icons</ToolbarLabel>
    </FloatingToolbar>
  );

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundColor: surfaceBg }} />

      <div className="relative h-full w-full flex items-center justify-center">
        {/* Scaled wrapper — outer box shrinks to match transform */}
        <div
          style={{
            width: GRID_W * scale,
            height: GRID_H * scale,
            flexShrink: 0,
          }}
        >
          {/* Design-space grid with transform scale */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `${CELL}px ${CELL}px`,
              gap: GAP,
              width: GRID_W,
              height: GRID_H,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            {currentIcons.map((Icon, i) => (
              <div
                key={`${iconSetIndex}-${i}`}
                className="rounded-xl flex items-center justify-center"
                style={{
                  width: CELL,
                  height: CELL,
                  background: tintBg,
                  aspectRatio: '1',
                }}
              >
                <Icon
                  size={ICON_SIZE}
                  color={iconColor}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {toolbar}
    </div>
  );
});
