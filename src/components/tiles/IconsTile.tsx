/**
 * Icons Tile Component
 *
 * Multi-library icon grid with configurable density.
 * Supports 5 icon families (Remix, Feather, Lucide, Phosphor, Tabler),
 * 3 grid sizes (single, 2x2, 3x3), and custom SVG upload.
 * Scales proportionally via ResizeObserver.
 */
import { memo, useRef, useState, useEffect, useCallback } from 'react';
import type { IconType } from 'react-icons';
import { useBrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { hexToHSL } from '@/utils/colorMapping';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';

// Remix Icons
import {
  RiPaletteFill, RiStackFill, RiVipDiamondFill,
  RiQuillPenFill, RiHexagonFill, RiSparklingFill,
  RiCompassFill, RiDropFill, RiLeafFill,
  RiCameraLensFill, RiBallPenFill, RiContrastDropFill,
  RiPokerDiamondsFill, RiFireFill, RiEyeFill,
  RiShieldFill, RiLightbulbFill, RiMagicFill,
  RiHeartFill, RiStarFill, RiBookOpenFill,
  RiAwardFill, RiCupFill, RiFlashlightFill,
  RiFontSize, RiPlanetFill, RiSunFill,
} from 'react-icons/ri';

// Feather Icons (all outline)
import {
  FiFeather, FiCompass, FiHexagon,
  FiDroplet, FiStar, FiSun,
  FiTarget, FiZap, FiAperture,
  FiGrid, FiLayers, FiPenTool,
  FiCircle, FiTriangle, FiSquare,
  FiAnchor, FiCrosshair, FiCommand,
  FiGlobe, FiEye, FiHeart,
  FiAward, FiCoffee, FiBox,
  FiBookOpen, FiCode, FiBook,
} from 'react-icons/fi';

// Lucide Icons
import {
  LuPalette, LuDiamond, LuSparkles,
  LuLeaf, LuDroplets, LuFlame,
  LuAperture, LuHexagon, LuTriangle,
  LuSquare, LuStar, LuSun,
  LuMoon, LuZap, LuGem,
  LuCompass, LuTarget, LuShield,
  LuCrown, LuFeather, LuGlobe,
  LuEye, LuHeart, LuLayers,
  LuPentagon, LuCircle, LuAtom,
} from 'react-icons/lu';

// Phosphor Icons (filled)
import {
  PiDiamondFill, PiStarFill, PiHexagonFill,
  PiLeafFill, PiDropFill, PiLightningFill,
  PiSunFill, PiCompassFill, PiEyeFill,
  PiFireFill, PiFlowerFill, PiCrownFill,
  PiGlobeFill, PiHeartFill, PiSnowflakeFill,
  PiTreeFill, PiPaintBrushFill, PiLightbulbFill,
  PiMountainsFill, PiPlanetFill, PiShieldCheckFill,
  PiCirclesFourFill, PiStarFourFill, PiSquareFill,
  PiTriangleFill, PiButterflyFill, PiAtomFill,
} from 'react-icons/pi';

// Tabler Icons
import {
  TbHexagon, TbDiamond, TbStar,
  TbDroplet, TbLeaf, TbFlame,
  TbBolt, TbSun, TbPalette,
  TbCompass, TbTarget, TbAtom,
  TbPentagon, TbTriangle, TbCircle,
  TbFeather, TbEye, TbHeart,
  TbSnowflake, TbCrown, TbShield,
  TbMoon, TbAward, TbGlobe,
  TbSquare, TbCode, TbCoffee,
} from 'react-icons/tb';

import { RiUploadLine, RiCloseLine } from 'react-icons/ri';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarDivider,
  ToolbarTileTypeGrid,
  ToolbarSurfaceSwatches,
  ToolbarColorPicker,
  ToolbarToggle,
  ToolbarSegmented,
  ToolbarLabel,
} from './FloatingToolbar';

/* ─── Types ─── */

interface IconsTileProps {
  placementId?: string;
}

type LibraryId = 'remix' | 'feather' | 'lucide' | 'phosphor' | 'tabler';
type LayoutMode = 'single' | 'row' | 'column' | 'grid';

/* ─── Icon Libraries ─── */

/** 3 sets of 9 icons per library. Sliced to 1/4/9 based on grid size. */
const LIBRARIES: Record<LibraryId, IconType[][]> = {
  remix: [
    [RiPaletteFill, RiStackFill, RiVipDiamondFill, RiHexagonFill, RiSparklingFill, RiCompassFill, RiDropFill, RiLeafFill, RiStarFill],
    [RiCameraLensFill, RiQuillPenFill, RiBallPenFill, RiContrastDropFill, RiPokerDiamondsFill, RiFireFill, RiEyeFill, RiShieldFill, RiLightbulbFill],
    [RiMagicFill, RiHeartFill, RiBookOpenFill, RiAwardFill, RiCupFill, RiFlashlightFill, RiFontSize, RiPlanetFill, RiSunFill],
  ],
  feather: [
    [FiFeather, FiCompass, FiHexagon, FiDroplet, FiStar, FiSun, FiTarget, FiZap, FiAperture],
    [FiGrid, FiLayers, FiPenTool, FiCircle, FiTriangle, FiSquare, FiAnchor, FiCrosshair, FiCommand],
    [FiGlobe, FiEye, FiHeart, FiAward, FiCoffee, FiBox, FiBookOpen, FiCode, FiBook],
  ],
  lucide: [
    [LuPalette, LuDiamond, LuSparkles, LuLeaf, LuDroplets, LuFlame, LuAperture, LuHexagon, LuTriangle],
    [LuSquare, LuStar, LuSun, LuMoon, LuZap, LuGem, LuCompass, LuTarget, LuShield],
    [LuCrown, LuFeather, LuGlobe, LuEye, LuHeart, LuLayers, LuPentagon, LuCircle, LuAtom],
  ],
  phosphor: [
    [PiDiamondFill, PiStarFill, PiHexagonFill, PiLeafFill, PiDropFill, PiLightningFill, PiSunFill, PiCompassFill, PiEyeFill],
    [PiFireFill, PiFlowerFill, PiCrownFill, PiGlobeFill, PiHeartFill, PiSnowflakeFill, PiTreeFill, PiPaintBrushFill, PiLightbulbFill],
    [PiMountainsFill, PiPlanetFill, PiShieldCheckFill, PiCirclesFourFill, PiStarFourFill, PiSquareFill, PiTriangleFill, PiButterflyFill, PiAtomFill],
  ],
  tabler: [
    [TbHexagon, TbDiamond, TbStar, TbDroplet, TbLeaf, TbFlame, TbBolt, TbSun, TbPalette],
    [TbCompass, TbTarget, TbAtom, TbPentagon, TbTriangle, TbCircle, TbFeather, TbEye, TbHeart],
    [TbSnowflake, TbCrown, TbShield, TbMoon, TbAward, TbGlobe, TbSquare, TbCode, TbCoffee],
  ],
};

/* ─── Layout Configs ─── */

interface LayoutConfig {
  totalW: number;
  totalH: number;
  cell: number;
  gap: number;
  iconSize: number;
  cols: number;
  count: number;
  radius: string;
}

const LAYOUT_CONFIGS: Record<LayoutMode, LayoutConfig> = {
  single: { totalW: 64, totalH: 64, cell: 64, gap: 0, iconSize: 38, cols: 1, count: 1, radius: 'rounded-2xl' },
  row:    { totalW: 186, totalH: 42, cell: 42, gap: 6, iconSize: 22, cols: 4, count: 4, radius: 'rounded-xl' },
  column: { totalW: 42, totalH: 186, cell: 42, gap: 6, iconSize: 22, cols: 1, count: 4, radius: 'rounded-xl' },
  grid:   { totalW: 138, totalH: 138, cell: 42, gap: 6, iconSize: 20, cols: 3, count: 9, radius: 'rounded-lg' },
};

/* ─── Component ─── */

export const IconsTile = memo(function IconsTile({ placementId }: IconsTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [scale, setScale] = useState(1);
  const [iconSetIndex, setIconSetIndex] = useState(0);

  const { colors } = useBrandStore(
    useShallow((state) => ({
      colors: state.brand.colors,
    }))
  );
  const swapTileType = useBrandStore((s) => s.swapTileType);
  const setTileSurface = useBrandStore((s) => s.setTileSurface);
  const setPlacementContent = useBrandStore((s) => s.setPlacementContent);
  const tile = useBrandStore((state) =>
    state.tiles.find((t) => t.type === 'icons')
  );
  const tileSurfaceIndex = useBrandStore((state) =>
    placementId ? state.tileSurfaces[placementId] : undefined
  );
  const placementContent = useBrandStore((state) =>
    placementId ? state.placementContent[placementId] : undefined
  );

  // Persisted state
  const iconColorOverride = placementContent?.iconColor || undefined;
  const iconShowBg = placementContent?.iconShowBg ?? true;
  const iconLibrary: LibraryId = (placementContent?.iconLibrary as LibraryId) || 'remix';
  const iconLayout: LayoutMode = (placementContent?.iconLayout as LayoutMode) || 'grid';
  const iconCustomSvg = placementContent?.iconCustomSvg || undefined;

  const { primary, bg, surfaces } = colors;
  const layoutConfig = LAYOUT_CONFIGS[iconLayout];

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
  const primaryContrast = Math.abs(surfaceL - primaryL);
  const autoIconColor = primaryContrast > 25 ? primary : (surfaceLight ? COLOR_DEFAULTS.TEXT_DARK : COLOR_DEFAULTS.TEXT_LIGHT);
  const iconColor = iconColorOverride || autoIconColor;

  const iconHSL = hexToHSL(iconColor);
  const tintBg = iconShowBg ? `hsla(${iconHSL.h}, ${iconHSL.s}%, ${iconHSL.l}%, 0.1)` : 'transparent';

  // Scale-to-fit with dynamic grid dimensions
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const pad = Math.min(width, height) * 0.12;
      const s = Math.min(
        (width - pad * 2) / layoutConfig.totalW,
        (height - pad * 2) / layoutConfig.totalH
      );
      setScale(s);
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, [layoutConfig.totalW, layoutConfig.totalH]);

  const librarySets = LIBRARIES[iconLibrary];

  const handleShuffle = useCallback(() => {
    if (iconCustomSvg && placementId) {
      // Clear custom SVG and return to library icons
      setPlacementContent(placementId, { iconCustomSvg: '' }, true);
      return;
    }
    setIconSetIndex((prev) => (prev + 1) % librarySets.length);
  }, [iconCustomSvg, placementId, setPlacementContent, librarySets.length]);

  const handleLibraryChange = useCallback((value: string) => {
    if (!placementId) return;
    setPlacementContent(placementId, { iconLibrary: value as LibraryId }, true);
    setIconSetIndex(0);
  }, [placementId, setPlacementContent]);

  const handleLayoutChange = useCallback((value: string) => {
    if (!placementId) return;
    setPlacementContent(placementId, { iconLayout: value as LayoutMode }, true);
  }, [placementId, setPlacementContent]);

  const handleSvgUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !placementId) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPlacementContent(placementId, { iconCustomSvg: reader.result }, true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [placementId, setPlacementContent]);

  const handleClearSvg = useCallback(() => {
    if (!placementId) return;
    setPlacementContent(placementId, { iconCustomSvg: '' }, true);
  }, [placementId, setPlacementContent]);

  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);

  const currentIcons = librarySets[iconSetIndex % librarySets.length].slice(0, layoutConfig.count);
  const paletteColors = useBrandStore((s) => s.brand.colors.paletteColors) || [];

  const handleIconColorChange = useCallback((hex: string | undefined) => {
    if (!placementId) return;
    setPlacementContent(placementId, { iconColor: hex || '' }, !hex);
  }, [placementId, setPlacementContent]);

  const handleIconColorCommit = useCallback((val?: string | null) => {
    if (!placementId) return;
    setPlacementContent(placementId, { iconColor: val !== undefined ? (val || '') : iconColorOverride }, true);
  }, [placementId, iconColorOverride, setPlacementContent]);

  const handleToggleBg = useCallback((checked: boolean) => {
    if (!placementId) return;
    setPlacementContent(placementId, { iconShowBg: checked }, true);
  }, [placementId, setPlacementContent]);

  /* ─── Toolbar ─── */

  const iconBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 7,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    background: 'var(--sidebar-bg-hover)',
    color: 'var(--sidebar-text-muted)',
  };

  const toolbar = isFocused && anchorRect && (
    <FloatingToolbar anchorRect={anchorRect}>
      <ToolbarActions onShuffle={handleShuffle} />
      <ToolbarDivider />
      <ToolbarSegmented
        label="Library"
        options={[
          { value: 'remix', label: 'Remix' },
          { value: 'feather', label: 'Feather' },
          { value: 'lucide', label: 'Lucide' },
          { value: 'phosphor', label: 'Phosphor' },
          { value: 'tabler', label: 'Tabler' },
        ]}
        value={iconLibrary}
        onChange={handleLibraryChange}
      />
      <ToolbarSegmented
        label="Layout"
        options={[
          { value: 'single', label: 'Single' },
          { value: 'row', label: 'Row' },
          { value: 'column', label: 'Column' },
          { value: 'grid', label: 'Grid' },
        ]}
        value={iconLayout}
        onChange={handleLayoutChange}
      />
      <ToolbarDivider />
      <ToolbarLabel>Custom SVG</ToolbarLabel>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button
          onClick={() => fileRef.current?.click()}
          aria-label="Upload SVG"
          style={iconBtnStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--sidebar-bg-active)';
            e.currentTarget.style.color = 'var(--sidebar-text)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--sidebar-bg-hover)';
            e.currentTarget.style.color = 'var(--sidebar-text-muted)';
          }}
        >
          <RiUploadLine size={14} />
        </button>
        {iconCustomSvg && (
          <button
            onClick={handleClearSvg}
            aria-label="Clear custom SVG"
            style={iconBtnStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--sidebar-bg-active)';
              e.currentTarget.style.color = 'var(--sidebar-text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--sidebar-bg-hover)';
              e.currentTarget.style.color = 'var(--sidebar-text-muted)';
            }}
          >
            <RiCloseLine size={14} />
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".svg,image/svg+xml"
          onChange={handleSvgUpload}
          style={{ display: 'none' }}
        />
        {iconCustomSvg && (
          <span style={{ fontSize: 10, color: 'var(--sidebar-text-muted)' }}>Active</span>
        )}
      </div>
      <ToolbarDivider />
      <ToolbarColorPicker
        label="Icon Color"
        color={iconColor}
        autoColor={autoIconColor}
        paletteColors={paletteColors}
        onChange={handleIconColorChange}
        onCommit={handleIconColorCommit}
      />
      <ToolbarDivider />
      <ToolbarToggle
        label="Cell Backgrounds"
        checked={iconShowBg}
        onChange={handleToggleBg}
      />
      <ToolbarDivider />
      <ToolbarSurfaceSwatches
        surfaces={surfaces}
        bgColor={bg}
        currentIndex={tileSurfaceIndex}
        onSurfaceChange={(idx) => placementId && setTileSurface(placementId, idx)}
      />
      <ToolbarDivider />
      <ToolbarTileTypeGrid
        currentType={tile?.type || 'icons'}
        onTypeChange={(type) => tile?.id && swapTileType(tile.id, type)}
      />
    </FloatingToolbar>
  );

  /* ─── Custom SVG render ─── */
  if (iconCustomSvg) {
    return (
      <div ref={containerRef} className="w-full h-full relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundColor: surfaceBg }} />
        <div className="relative h-full w-full flex items-center justify-center">
          <div
            className={`flex items-center justify-center ${LAYOUT_CONFIGS['single'].radius}`}
            style={{
              width: 60 * scale,
              height: 60 * scale,
              background: tintBg,
            }}
          >
            <img
              src={iconCustomSvg}
              alt="Custom icon"
              style={{
                width: 36 * scale,
                height: 36 * scale,
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
        {toolbar}
      </div>
    );
  }

  /* ─── Icon grid render ─── */
  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <div className="absolute inset-0" style={{ backgroundColor: surfaceBg }} />

      <div className="relative h-full w-full flex items-center justify-center">
        <div
          style={{
            width: layoutConfig.totalW * scale,
            height: layoutConfig.totalH * scale,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${layoutConfig.cols}, ${layoutConfig.cell}px)`,
              gap: layoutConfig.gap,
              width: layoutConfig.totalW,
              height: layoutConfig.totalH,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            {currentIcons.map((Icon, i) => (
              <div
                key={`${iconLibrary}-${iconSetIndex}-${i}`}
                className={`${layoutConfig.radius} flex items-center justify-center`}
                style={{
                  width: layoutConfig.cell,
                  height: layoutConfig.cell,
                  background: tintBg,
                  aspectRatio: '1',
                }}
              >
                <Icon
                  size={layoutConfig.iconSize}
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
