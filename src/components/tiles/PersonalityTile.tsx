/**
 * Personality / Brand Voice Tile Component
 *
 * A grid of pill-shaped tags displaying brand personality traits.
 * The kind of thing you see on brand strategy decks — "Friendly",
 * "Witty", "Confident" — laid out in a flowing tag cloud with
 * decorative arrow pills interspersed.
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { getAdaptiveTextColor } from '@/utils/color';
import { hexToHSL } from '@/utils/colorMapping';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { usePlacementTile } from '@/hooks/usePlacementTile';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale } from '@/utils/typography';
import { getPresetContent } from '@/data/tilePresetContent';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarDivider,
  ToolbarTileTypeGrid,
  ToolbarSurfaceSwatches,
  ToolbarItemList,
  ToolbarLabel,
} from './FloatingToolbar';

/* ─── Shuffle presets ─── */

const PERSONALITY_PRESETS = [
  ['Friendly', 'Witty', 'Confident', 'Playful', 'Human', 'Enthusiastic', 'Energetic', 'Curious'],
  ['Bold', 'Minimal', 'Precise', 'Elegant', 'Refined', 'Timeless', 'Restrained', 'Intentional'],
  ['Warm', 'Inclusive', 'Joyful', 'Authentic', 'Caring', 'Approachable', 'Honest', 'Grounded'],
  ['Disruptive', 'Fearless', 'Innovative', 'Direct', 'Ambitious', 'Progressive', 'Edgy', 'Sharp'],
  ['Calm', 'Thoughtful', 'Considered', 'Gentle', 'Patient', 'Wise', 'Subtle', 'Understated'],
];

/* ─── Types ─── */

interface PersonalityTileProps {
  placementId?: string;
}

/* ─── Component ─── */

export function PersonalityTile({ placementId }: PersonalityTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;
      if (!width) return;
      setScale(Math.max(0.6, Math.min(1.4, width / 340)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ─── Store ─── */
  const { colors, typography } = useBrandStore(
    useShallow((state: BrandStore) => ({
      colors: state.brand.colors,
      typography: state.brand.typography,
    }))
  );
  const activePreset = useBrandStore((s) => s.activePreset);
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
  const { bg, text: textColor, primary, accent, surfaces } = colors;
  const surfaceBg = resolveSurfaceColor({ placementId, tileSurfaceIndex, surfaces, bg, defaultIndex: 1 });
  const adaptiveText = getAdaptiveTextColor(surfaceBg, textColor, COLOR_DEFAULTS.TEXT_LIGHT);
  const { l: surfaceL } = hexToHSL(surfaceBg);
  const isLight = surfaceL > 55;
  const fontPreview = useBrandStore((state) => state.fontPreview);

  /* ─── Typography ─── */
  // Apply font preview if active
  const secondaryFontChoice = fontPreview?.target === "secondary" ? fontPreview.font : typography.secondary;

  const { fontFamily: bodyFont } = useGoogleFonts(secondaryFontChoice, getFontCategory(secondaryFontChoice));
  const typeScale = getTypeScale(typography);

  /* ─── Content ─── */
  const presetCopy = getPresetContent(activePreset).personality;
  const tileContent = tile?.content || {};
  const items: string[] = tileContent.items || presetCopy.items;
  const label = tileContent.label || 'Personality';

  /* ─── Toolbar ─── */
  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);

  const handleShuffle = useCallback(() => {
    if (!tile?.id) return;
    const currentKey = items.join(',');
    const candidates = PERSONALITY_PRESETS.filter((p) => p.join(',') !== currentKey);
    const preset = candidates[Math.floor(Math.random() * candidates.length)];
    updateTile(tile.id, { items: preset }, true);
  }, [tile?.id, items, updateTile]);

  /* ─── Pill styles ─── */
  const pillFontSize = clampFontSize(typeScale.stepMinus1 * scale, 11, 18);

  const getPillStyle = (index: number): React.CSSProperties => {
    const variant = index % 4;
    const base: React.CSSProperties = {
      fontFamily: bodyFont,
      fontWeight: parseInt(typography.weightBody) || 500,
      fontSize: `${pillFontSize}px`,
      letterSpacing: '0.04em',
      borderRadius: '9999px',
      padding: `${clampFontSize(6 * scale, 4, 10)}px ${clampFontSize(16 * scale, 10, 24)}px`,
      lineHeight: 1.3,
      whiteSpace: 'nowrap',
      transition: 'all 0.2s ease',
    };

    if (variant === 0) {
      // Solid primary
      return {
        ...base,
        backgroundColor: primary,
        color: getAdaptiveTextColor(primary, textColor, COLOR_DEFAULTS.TEXT_LIGHT),
      };
    } else if (variant === 1) {
      // Outlined
      return {
        ...base,
        backgroundColor: 'transparent',
        color: adaptiveText,
        border: `1.5px solid ${isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)'}`,
      };
    } else if (variant === 2) {
      // Solid accent
      return {
        ...base,
        backgroundColor: accent,
        color: getAdaptiveTextColor(accent, textColor, COLOR_DEFAULTS.TEXT_LIGHT),
      };
    } else {
      // Outlined
      return {
        ...base,
        backgroundColor: 'transparent',
        color: adaptiveText,
        border: `1.5px solid ${isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)'}`,
      };
    }
  };

  // Interleave arrow pills at positions 2, 5
  const ARROW_POSITIONS = new Set([2, 5]);

  const toolbar = isFocused && anchorRect && (
    <FloatingToolbar anchorRect={anchorRect}>
      <ToolbarActions onShuffle={handleShuffle} />
      <ToolbarDivider />
      <ToolbarTileTypeGrid
        currentType={tile?.type || 'personality'}
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
      <ToolbarLabel>Traits</ToolbarLabel>
      <ToolbarItemList
        label="Words"
        items={items}
        maxItems={10}
        onChange={(newItems) => tile?.id && updateTile(tile.id, { items: newItems }, false)}
        onCommit={(newItems) => tile?.id && updateTile(tile.id, { items: newItems }, true)}
      />
    </FloatingToolbar>
  );

  // Build the rendered pills list with decorative arrows
  const renderedPills: { text: string; isArrow: boolean; index: number }[] = [];
  let pillIndex = 0;
  items.forEach((item, i) => {
    if (ARROW_POSITIONS.has(i)) {
      renderedPills.push({ text: '\u2192', isArrow: true, index: pillIndex++ });
    }
    renderedPills.push({ text: item, isArrow: false, index: pillIndex++ });
  });

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col justify-center transition-colors duration-300 relative overflow-hidden"
      style={{
        backgroundColor: surfaceBg,
        padding: 'clamp(20px, 8%, 40px)',
      }}
    >
      {/* Pill cloud */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: `${clampFontSize(8 * scale, 5, 12)}px`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {renderedPills.map((pill) => (
          <span
            key={pill.index}
            style={
              pill.isArrow
                ? {
                    ...getPillStyle(1), // Use outlined style for arrows
                    opacity: 0.4,
                    fontSize: `${pillFontSize * 1.1}px`,
                  }
                : getPillStyle(pill.index)
            }
          >
            {pill.text}
          </span>
        ))}
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
