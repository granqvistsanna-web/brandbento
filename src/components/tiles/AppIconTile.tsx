/**
 * App Icon / Iconography Tile Component
 *
 * iPhone home screen mockup showing the brand's app icon alongside
 * system apps. The phone sits offset to the right against a bold
 * brand-colored background — the kind of context shot you see in
 * brand identity presentations.
 */
import { useRef, useState, useEffect } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { getAdaptiveTextColor } from '@/utils/color';
import { hexToHSL } from '@/utils/colorMapping';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { usePlacementTile } from '@/hooks/usePlacementTile';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale } from '@/utils/typography';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarDivider,
  ToolbarTileTypeGrid,
  ToolbarSurfaceSwatches,
  ToolbarTextInput,
  ToolbarLabel,
} from './FloatingToolbar';

/* ─── Phone design-space constants ─── */
const PHONE_W = 236;
const PHONE_H = 460;
const BEZEL = 8;
const PHONE_RADIUS = 40;
const SCREEN_RADIUS = PHONE_RADIUS - BEZEL;
const ICON_SIZE = 52;
const ICON_RADIUS = 12;
const ICON_GAP = 18;
const LABEL_SIZE = 9;
const ISLAND_W = 72;
const ISLAND_H = 18;

/* ─── Types ─── */

interface AppIconTileProps {
  placementId?: string;
}

/* ─── System App Icons ─── */

function CalendarIcon() {
  const day = new Date().getDate();
  const weekday = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()];
  return (
    <div
      style={{
        width: ICON_SIZE, height: ICON_SIZE, borderRadius: ICON_RADIUS,
        backgroundColor: '#fff', display: 'flex', flexDirection: 'column',
        alignItems: 'center', overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%', height: 15, backgroundColor: '#ff3b30',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 7.5, fontWeight: 700, color: '#fff', letterSpacing: '0.06em', lineHeight: 1 }}>
          {weekday}
        </span>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 24, fontWeight: 300, color: '#1a1a1a', lineHeight: 1, marginTop: -2 }}>
          {day}
        </span>
      </div>
    </div>
  );
}

function CalculatorIcon() {
  const rows = [
    ['#a5a5a5', '#a5a5a5', '#a5a5a5', '#ff9500'],
    ['#333', '#333', '#333', '#ff9500'],
    ['#333', '#333', '#333', '#ff9500'],
    ['#333', '#333', '#333', '#ff9500'],
  ];
  return (
    <div
      style={{
        width: ICON_SIZE, height: ICON_SIZE, borderRadius: ICON_RADIUS,
        backgroundColor: '#1c1c1e', display: 'flex', flexDirection: 'column',
        gap: 2.5, padding: '7px 5px 5px',
      }}
    >
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 2.5, flex: 1 }}>
          {row.map((c, ci) => (
            <div key={ci} style={{ flex: 1, backgroundColor: c, borderRadius: 3 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function ThreadsIcon() {
  return (
    <div
      style={{
        width: ICON_SIZE, height: ICON_SIZE, borderRadius: ICON_RADIUS,
        backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
        <path
          d="M12.186 2C14.04 2 15.633 2.42 16.892 3.178c1.26.757 2.193 1.83 2.787 3.158.388.871.638 1.868.736 2.96a6.95 6.95 0 0 1-.142 2.214c-.289 1.184-.85 2.188-1.658 2.98-.83.81-1.88 1.362-3.1 1.617a6.7 6.7 0 0 1-1.524.166c-.652 0-1.276-.089-1.862-.262-.586-.174-1.102-.422-1.542-.732a4.04 4.04 0 0 1-1.062-1.12 5.1 5.1 0 0 1-.59-1.4 6.02 6.02 0 0 1-.194-1.548c0-.926.17-1.76.51-2.496.336-.736.806-1.31 1.414-1.722.604-.41 1.282-.616 2.032-.616.498 0 .958.085 1.378.256.42.17.78.41 1.08.72.3.308.53.67.696 1.084.164.414.246.866.246 1.356 0 .57-.104 1.064-.312 1.482-.21.418-.494.74-.856.966-.36.228-.766.342-1.216.342a1.47 1.47 0 0 1-.776-.198.96.96 0 0 1-.434-.55"
          stroke="#fff"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/* ─── Component ─── */

export function AppIconTile({ placementId }: AppIconTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 400, h: 300 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      setDims({ w: width, h: height });
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  /* ─── Store ─── */
  const { colors, typography, logo } = useBrandStore(
    useShallow((state: BrandStore) => ({
      colors: state.brand.colors,
      typography: state.brand.typography,
      logo: state.brand.logo,
    }))
  );
  const updateTile = useBrandStore((s) => s.updateTile);
  const swapTileType = useBrandStore((s) => s.swapTileType);
  const setTileSurface = useBrandStore((s) => s.setTileSurface);
  const { tileId: placementTileId, tileType: placementTileType } = usePlacementTile(placementId);
  const tile = useBrandStore((state: BrandStore) => {
    if (placementTileId) return state.tiles.find((t) => t.id === placementTileId);
    if (placementTileType) return state.tiles.find((t) => t.type === placementTileType);
    return undefined;
  });
  const tileSurfaceIndex = useBrandStore((state: BrandStore) =>
    placementId ? state.tileSurfaces[placementId] : undefined
  );

  /* ─── Colors ─── */
  const { bg, text: textColor, primary, surfaces } = colors;
  const surfaceBg = resolveSurfaceColor({ placementId, tileSurfaceIndex, surfaces, bg, defaultIndex: 0 });
  const adaptiveText = getAdaptiveTextColor(surfaceBg, textColor, COLOR_DEFAULTS.TEXT_LIGHT);
  const fontPreview = useBrandStore((state) => state.fontPreview);

  /* ─── Typography ─── */
  // Apply font preview if active
  const secondaryFontChoice = fontPreview?.target === "secondary" ? fontPreview.font : typography.secondary;

  const { fontFamily: bodyFont } = useGoogleFonts(secondaryFontChoice, getFontCategory(secondaryFontChoice));
  const typeScale = getTypeScale(typography);

  /* ─── Content ─── */
  const tileContent = tile?.content || {};
  const appName = tileContent.headerTitle || logo.text || 'App';
  const label = tileContent.label || 'Iconography';

  /* ─── Toolbar ─── */
  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);

  const toolbar = isFocused && anchorRect && (
    <FloatingToolbar anchorRect={anchorRect}>
      <ToolbarTileTypeGrid
        currentType={tile?.type || 'app-icon'}
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
      <ToolbarLabel>Content</ToolbarLabel>
      <ToolbarTextInput
        label="App Name"
        value={appName}
        onChange={(v) => tile?.id && updateTile(tile.id, { headerTitle: v }, false)}
        onCommit={(v) => tile?.id && updateTile(tile.id, { headerTitle: v }, true)}
        placeholder="App name"
      />
    </FloatingToolbar>
  );

  /* ─── Brand app icon ─── */
  const brandIconBg = primary;
  const brandIconText = getAdaptiveTextColor(primary, '#ffffff', '#000000');

  /* ─── Phone wallpaper color ─── */
  const { l: surfL } = hexToHSL(surfaceBg);
  const wallpaperBg = surfaces?.[1] || (surfL > 55 ? '#f2ece4' : '#2a2a2e');
  const wallpaperText = getAdaptiveTextColor(wallpaperBg, '#000', '#fff');

  /* ─── Phone scale & position ─── */
  const isLandscape = dims.w > dims.h * 1.3;
  const widthFactor = isLandscape ? 0.45 : 0.55;
  const phoneScale = Math.max(
    0.3,
    Math.min((dims.h * 0.92) / PHONE_H, (dims.w * widthFactor) / PHONE_W, 1.15)
  );
  const scaledW = PHONE_W * phoneScale;
  const scaledH = PHONE_H * phoneScale;

  const apps = [
    {
      name: appName,
      icon: (
        <div
          style={{
            width: ICON_SIZE, height: ICON_SIZE, borderRadius: ICON_RADIUS,
            backgroundColor: brandIconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background-color 0.3s ease',
          }}
        >
          {logo.image ? (
            <img src={logo.image} alt="" style={{ width: 30, height: 30, objectFit: 'contain' }} />
          ) : (
            <span style={{ fontSize: 22, fontWeight: 700, color: brandIconText }}>
              {(logo.text || 'A').charAt(0)}
            </span>
          )}
        </div>
      ),
    },
    { name: 'Calendar', icon: <CalendarIcon /> },
    { name: 'Calculator', icon: <CalculatorIcon /> },
    { name: 'Threads', icon: <ThreadsIcon /> },
  ];

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: surfaceBg }}
    >
      {/* ── Top-left accent bar ── */}
      <div
        className="absolute z-10"
        style={{
          top: 0,
          left: 0,
        }}
      >
        <div
          style={{
            width: 'clamp(3px, 0.8%, 5px)',
            height: 'clamp(24px, 10%, 48px)',
            backgroundColor: primary,
            borderRadius: '0 2px 2px 0',
            transition: 'background-color 0.3s ease',
          }}
        />
      </div>

      {/* ── Phone mockup — offset right, partially cropped ── */}
      <div
        style={{
          position: 'absolute',
          left: dims.w - scaledW * 0.88,
          top: (dims.h - scaledH) / 2,
          width: PHONE_W,
          height: PHONE_H,
          transform: `scale(${phoneScale})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Dark bezel */}
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#1a1a1a',
            borderRadius: PHONE_RADIUS,
            padding: BEZEL,
            boxSizing: 'border-box',
            boxShadow: '-4px 4px 32px rgba(0,0,0,0.2), -1px 1px 8px rgba(0,0,0,0.1)',
          }}
        >
          {/* Screen */}
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: wallpaperBg,
              borderRadius: SCREEN_RADIUS,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'background-color 0.3s ease',
            }}
          >
            {/* Dynamic Island */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
              <div
                style={{
                  width: ISLAND_W,
                  height: ISLAND_H,
                  backgroundColor: '#000',
                  borderRadius: ISLAND_H / 2,
                }}
              />
            </div>

            {/* Status bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 20px 0',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: wallpaperText }}>
                12:30
              </span>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <svg width="14" height="10" viewBox="0 0 14 10">
                  {[0, 1, 2, 3].map((i) => (
                    <rect
                      key={i}
                      x={i * 3.5}
                      y={10 - (i + 1) * 2.5}
                      width="2.5"
                      height={(i + 1) * 2.5}
                      rx="0.5"
                      fill={wallpaperText}
                    />
                  ))}
                </svg>
                <svg width="12" height="10" viewBox="0 0 12 10" fill={wallpaperText}>
                  <path d="M6 9a1.2 1.2 0 100-2.4A1.2 1.2 0 006 9z" />
                  <path d="M3.5 6.5a3.5 3.5 0 015 0" stroke={wallpaperText} fill="none" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M1.5 4.5a6 6 0 019 0" stroke={wallpaperText} fill="none" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <svg width="18" height="9" viewBox="0 0 18 9">
                  <rect x="0" y="0" width="15.5" height="9" rx="1.5" stroke={wallpaperText} fill="none" strokeWidth="1" />
                  <rect x="2" y="2" width="10" height="5" rx="0.5" fill={wallpaperText} />
                  <rect x="16" y="2.5" width="1.5" height="4" rx="0.5" fill={wallpaperText} opacity="0.4" />
                </svg>
              </div>
            </div>

            {/* App grid */}
            <div
              style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: ICON_GAP,
                justifyItems: 'center',
                alignContent: 'center',
                padding: '24px 32px',
              }}
            >
              {apps.map((app) => (
                <div
                  key={app.name}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
                >
                  {app.icon}
                  <span
                    style={{
                      fontSize: LABEL_SIZE,
                      color: wallpaperText,
                      fontWeight: 400,
                      letterSpacing: '0.01em',
                      textAlign: 'center',
                      maxWidth: ICON_SIZE + 10,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {app.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom-left label ── */}
      <span
        className="absolute select-none"
        style={{
          bottom: 'clamp(16px, 6%, 32px)',
          left: 'clamp(16px, 6%, 32px)',
          fontFamily: bodyFont,
          fontWeight: parseInt(typography.weightBody) || 400,
          fontSize: `${clampFontSize(typeScale.stepMinus1, 10, 14)}px`,
          letterSpacing: '0.06em',
          fontStyle: 'italic',
          color: adaptiveText,
          opacity: 0.3,
        }}
      >
        {label}
      </span>

      {toolbar}
    </div>
  );
}
