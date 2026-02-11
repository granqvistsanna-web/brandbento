/**
 * App Icon / Iconography Tile Component
 *
 * Presents the brand app icon as a dramatic hero statement — the way
 * Pentagram or Collins might present a logo on a case study page.
 * The icon sits at oversized scale with editorial typography creating
 * compositional tension. A thin rule and subtle detail number anchor
 * the design without cluttering it.
 *
 * Adapts layout based on tile shape:
 * - Portrait: icon centered upper area, text composition bottom-aligned
 * - Landscape: icon left with vertical rule, text right
 * - Square: icon upper-right, text lower-left — diagonal tension
 */
import { useRef, useState, useEffect } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { getAdaptiveTextColor } from '@/utils/color';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { usePlacementTile } from '@/hooks/usePlacementTile';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale, getHeadlineTracking, getHeadlineLineHeight, getHeadlineTransform } from '@/utils/typography';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarDivider,
  ToolbarTileTypeGrid,
  ToolbarSurfaceSwatches,
  ToolbarTextInput,
  ToolbarLabel,
} from './FloatingToolbar';

/* ─── Types ─── */

interface AppIconTileProps {
  placementId?: string;
}

type TileShape = 'portrait' | 'square' | 'landscape';

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
  const surfaceBg = resolveSurfaceColor({ placementId, tileSurfaceIndex, surfaces, bg, defaultIndex: 1 });
  const adaptiveText = getAdaptiveTextColor(surfaceBg, textColor, COLOR_DEFAULTS.TEXT_LIGHT);
  const fontPreview = useBrandStore((state) => state.fontPreview);

  /* ─── Typography ─── */
  const secondaryFontChoice = fontPreview?.target === "secondary" ? fontPreview.font : typography.secondary;
  const primaryFontChoice = fontPreview?.target === "primary" ? fontPreview.font : typography.primary;
  const { fontFamily: bodyFont } = useGoogleFonts(secondaryFontChoice, getFontCategory(secondaryFontChoice));
  const { fontFamily: headlineFont } = useGoogleFonts(primaryFontChoice, getFontCategory(primaryFontChoice));
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

  /* ─── Shape detection ─── */
  const ratio = dims.w / dims.h;
  const shape: TileShape = ratio > 1.4 ? 'landscape' : ratio < 0.75 ? 'portrait' : 'square';

  /* ─── Proportional icon size ─── */
  const shorter = Math.min(dims.w, dims.h);
  const iconSize = Math.max(48, Math.min(shorter * 0.44, 200));
  const iconRadius = iconSize * 0.22;

  /* ─── Padding ─── */
  const pad = 'clamp(20px, 8%, 40px)';

  /* ─── Shared icon element ─── */
  const stagePad = Math.round(iconSize * 0.08);
  const stageRadius = iconRadius + stagePad;

  const iconElement = (
    <div
      style={{
        padding: stagePad,
        borderRadius: stageRadius,
        backgroundColor: bg,
        flexShrink: 0,
        boxShadow: `0 ${iconSize * 0.03}px ${iconSize * 0.12}px rgba(0,0,0,0.10)`,
        transition: 'background-color 0.3s ease',
      }}
    >
      <div
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: iconRadius,
          backgroundColor: brandIconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.3s ease',
        }}
      >
        {logo.image ? (
          <img
            src={logo.image}
            alt=""
            style={{
              width: iconSize * 0.58,
              height: iconSize * 0.58,
              objectFit: 'contain',
            }}
          />
        ) : (
          <span
            style={{
              fontSize: iconSize * 0.42,
              fontWeight: 700,
              color: brandIconText,
              lineHeight: 1,
              fontFamily: headlineFont,
            }}
          >
            {(logo.text || 'A').charAt(0)}
          </span>
        )}
      </div>
    </div>
  );

  /* ─── Shared typography ─── */
  const labelElement = (
    <span
      className="select-none"
      style={{
        fontFamily: bodyFont,
        fontWeight: parseInt(typography.weightBody) || 400,
        fontSize: `${clampFontSize(typeScale.stepMinus2, 9, 12)}px`,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: adaptiveText,
        opacity: 0.42,
      }}
    >
      {label}
    </span>
  );

  const headlineElement = (
    <h1
      style={{
        fontFamily: headlineFont,
        fontWeight: parseInt(typography.weightHeadline) || 700,
        fontSize: `${clampFontSize(typeScale.step2, 20, 52)}px`,
        lineHeight: getHeadlineLineHeight(typography),
        letterSpacing: getHeadlineTracking(typography),
        textTransform: getHeadlineTransform(typography) as React.CSSProperties['textTransform'],
        color: adaptiveText,
        textWrap: 'balance',
        margin: 0,
      }}
    >
      {appName}
    </h1>
  );

  const ruleStyle = {
    backgroundColor: adaptiveText,
    opacity: 0.1,
  };

  /* ─── LANDSCAPE: icon left, vertical rule, text right ─── */
  if (shape === 'landscape') {
    return (
      <div
        ref={containerRef}
        className="w-full h-full relative overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: surfaceBg }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: pad,
            gap: 'clamp(20px, 6%, 48px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              paddingLeft: 'clamp(8px, 3%, 24px)',
            }}
          >
            {iconElement}
          </div>

          <div
            style={{
              width: 1,
              alignSelf: 'stretch',
              ...ruleStyle,
              flexShrink: 0,
              margin: 'clamp(12px, 8%, 32px) 0',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${clampFontSize(typeScale.base * 0.4, 6, 14)}px`,
              minWidth: 0,
            }}
          >
            {labelElement}
            {headlineElement}
          </div>
        </div>

        {toolbar}
      </div>
    );
  }

  /* ─── PORTRAIT: icon upper center, rule, text bottom ─── */
  if (shape === 'portrait') {
    return (
      <div
        ref={containerRef}
        className="w-full h-full relative overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: surfaceBg }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: pad,
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 'clamp(8px, 4%, 24px)',
            }}
          >
            {iconElement}
          </div>

          <div
            style={{
              height: 1,
              ...ruleStyle,
              margin: `clamp(12px, 4%, 24px) 0`,
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${clampFontSize(typeScale.base * 0.4, 6, 12)}px`,
            }}
          >
            {labelElement}
            {headlineElement}
          </div>
        </div>

        {toolbar}
      </div>
    );
  }

  /* ─── SQUARE: diagonal tension — icon upper-right, text lower-left ─── */
  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: surfaceBg }}
    >
      <div
        className="absolute"
        style={{
          top: pad,
          right: pad,
          paddingTop: 'clamp(4px, 2%, 12px)',
        }}
      >
        {iconElement}
      </div>

      <div
        className="absolute"
        style={{
          bottom: pad,
          left: pad,
          display: 'flex',
          flexDirection: 'column',
          gap: `${clampFontSize(typeScale.base * 0.4, 6, 12)}px`,
          maxWidth: '75%',
        }}
      >
        {/* Partial-width rule above text */}
        <div
          style={{
            width: '60%',
            height: 1,
            ...ruleStyle,
            marginBottom: `${clampFontSize(typeScale.base * 0.3, 4, 10)}px`,
          }}
        />
        {labelElement}
        {headlineElement}
      </div>

      {toolbar}
    </div>
  );
}
