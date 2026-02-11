/**
 * App Icon / Iconography Tile Component
 *
 * iPhone home screen mockup showing the brand's app icon alongside
 * system apps. The kind of context shot you see in brand identity
 * presentations — "here's how our icon looks on a real device."
 *
 * Uses scale-to-fit pattern with a partial phone frame.
 */
import { useRef, useState, useEffect } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { getAdaptiveTextColor } from '@/utils/color';
import { hexToHSL } from '@/utils/colorMapping';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';
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

/* ─── Design-space dimensions ─── */
const PHONE_W = 260;
const PHONE_H = 320;
const ICON_SIZE = 52;
const ICON_RADIUS = 12;
const ICON_GAP = 18;
const LABEL_SIZE = 9;

/* ─── Types ─── */

interface AppIconTileProps {
  placementId?: string;
}

/* ─── System App Icons (rendered in CSS) ─── */

function CalendarIcon() {
  const day = new Date().getDate();
  const weekday = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()];
  return (
    <div
      style={{
        width: ICON_SIZE, height: ICON_SIZE, borderRadius: ICON_RADIUS,
        backgroundColor: '#fff', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 14, backgroundColor: '#ff3b30' }} />
      <span style={{ fontSize: 7.5, fontWeight: 600, color: '#ff3b30', letterSpacing: '0.04em', marginTop: 6 }}>
        {weekday}
      </span>
      <span style={{ fontSize: 22, fontWeight: 300, color: '#1a1a1a', lineHeight: 1, marginTop: -1 }}>
        {day}
      </span>
    </div>
  );
}

function CalculatorIcon() {
  return (
    <div
      style={{
        width: ICON_SIZE, height: ICON_SIZE, borderRadius: ICON_RADIUS,
        backgroundColor: '#1c1c1e', display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(5, 1fr)',
        gap: 2, padding: 6,
      }}
    >
      {/* Top row: display area */}
      <div style={{ gridColumn: '1 / -1', backgroundColor: '#2c2c2e', borderRadius: 2 }} />
      {/* Button rows */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          style={{
            backgroundColor: i % 4 === 3 ? '#ff9500' : i < 4 ? '#636366' : '#d4d4d2',
            borderRadius: 2,
          }}
        />
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
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const pad = Math.min(width, height) * 0.06;
      const s = Math.min((width - pad * 2) / PHONE_W, (height - pad * 2) / PHONE_H);
      setScale(s);
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

  /* ─── Colors ─── */
  const { bg, text: textColor, primary, surfaces } = colors;
  const surfaceBg = resolveSurfaceColor({ placementId, tileSurfaceIndex, surfaces, bg, defaultIndex: 0 });
  const adaptiveText = getAdaptiveTextColor(surfaceBg, textColor, COLOR_DEFAULTS.TEXT_LIGHT);

  /* ─── Typography ─── */
  const { fontFamily: bodyFont } = useGoogleFonts(typography.secondary, getFontCategory(typography.secondary));
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
  const brandIconTextColor = getAdaptiveTextColor(primary, '#ffffff', '#000000');

  /* ─── Phone wallpaper ─── */
  const { l: surfL } = hexToHSL(surfaceBg);
  const wallpaperBg = surfaces?.[1] || (surfL > 55 ? '#f0efe9' : '#2a2a2e');

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
            <span style={{ fontSize: 22, fontWeight: 700, color: brandIconTextColor }}>
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
      className="w-full h-full flex items-center justify-center transition-colors duration-300 relative overflow-hidden"
      style={{ backgroundColor: surfaceBg }}
    >
      {/* Scaled phone frame */}
      <div
        style={{
          width: PHONE_W,
          height: PHONE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          backgroundColor: wallpaperBg,
          borderRadius: 28,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        }}
      >
        {/* Status bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px 0',
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: getAdaptiveTextColor(wallpaperBg, '#000', '#fff') }}>
            12:30
          </span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {/* Signal bars */}
            <svg width="14" height="10" viewBox="0 0 14 10">
              {[0, 1, 2, 3].map((i) => (
                <rect
                  key={i}
                  x={i * 3.5}
                  y={10 - (i + 1) * 2.5}
                  width="2.5"
                  height={(i + 1) * 2.5}
                  rx="0.5"
                  fill={getAdaptiveTextColor(wallpaperBg, '#000', '#fff')}
                />
              ))}
            </svg>
            {/* WiFi */}
            <svg width="12" height="10" viewBox="0 0 12 10" fill={getAdaptiveTextColor(wallpaperBg, '#000', '#fff')}>
              <path d="M6 9a1.2 1.2 0 100-2.4A1.2 1.2 0 006 9z" />
              <path d="M3.5 6.5a3.5 3.5 0 015 0" stroke={getAdaptiveTextColor(wallpaperBg, '#000', '#fff')} fill="none" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M1.5 4.5a6 6 0 019 0" stroke={getAdaptiveTextColor(wallpaperBg, '#000', '#fff')} fill="none" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {/* Battery */}
            <svg width="18" height="9" viewBox="0 0 18 9">
              <rect x="0" y="0" width="15.5" height="9" rx="1.5" stroke={getAdaptiveTextColor(wallpaperBg, '#000', '#fff')} fill="none" strokeWidth="1" />
              <rect x="2" y="2" width="10" height="5" rx="0.5" fill={getAdaptiveTextColor(wallpaperBg, '#000', '#fff')} />
              <rect x="16" y="2.5" width="1.5" height="4" rx="0.5" fill={getAdaptiveTextColor(wallpaperBg, '#000', '#fff')} opacity="0.4" />
            </svg>
          </div>
        </div>

        {/* App grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: ICON_GAP,
            justifyItems: 'center',
            padding: '36px 36px 20px',
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
                  color: getAdaptiveTextColor(wallpaperBg, '#000', '#fff'),
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

      {/* Corner label */}
      <span
        className="absolute select-none"
        style={{
          bottom: 'clamp(16px, 6%, 28px)',
          left: 'clamp(16px, 6%, 28px)',
          fontFamily: bodyFont,
          fontWeight: parseInt(typography.weightBody) || 400,
          fontSize: `${clampFontSize(typeScale.stepMinus2, 9, 12)}px`,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: adaptiveText,
          opacity: 0.35,
        }}
      >
        {label}
      </span>

      {toolbar}
    </div>
  );
}
