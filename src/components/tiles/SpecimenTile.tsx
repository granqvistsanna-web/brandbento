/**
 * Typography Specimen Tile Component
 *
 * Two variations:
 * - **Alphabet** (default): Classic type specimen sheet — the full alphabet
 *   rendered in the brand's primary font, centered.
 * - **Wordlist**: Bold stacked words filling the tile, one highlighted in the
 *   brand accent color. Inspired by type-foundry posters.
 */
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { getAdaptiveTextColor } from '@/utils/color';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { usePlacementTile } from '@/hooks/usePlacementTile';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { clampFontSize, getFontCategory, getTypeScale, getHeadlineTracking, getHeadlineLineHeight } from '@/utils/typography';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarDivider,
  ToolbarTileTypeGrid,
  ToolbarSurfaceSwatches,
  ToolbarSegmented,
  ToolbarTextArea,
  ToolbarLabel,
} from './FloatingToolbar';

/* ─── Shuffle presets ─── */

const ALPHABET_PRESETS = [
  'AäBbCcĐdEè\nFfGgHhIiJjKkLl\nMmNnØoPp\nQqRrSsTtŨuVv\nWwXxYyZż',
  'ABCDEFGHIJ\nKLMNOPQRST\nUVWXYZ',
  'abcdefghij\nklmnopqrst\nuvwxyz',
  '0123456789\n!@#$%&*()?\n€£¥¢§±×÷',
  'Aa Bb Cc Dd\nEe Ff Gg Hh\nIi Jj Kk Ll\nMm Nn Oo Pp',
];

const WORDLIST_PRESETS = [
  { words: ['archive', 'balance', 'contour', 'density', 'format', 'gesture', 'rhythm'], highlight: 3 },
  { words: ['minimal', 'graphic', 'studio', 'texture', 'volume', 'weight', 'optics'], highlight: 2 },
  { words: ['berlin', 'tokyo', 'cairo', 'oslo', 'lagos', 'lima', 'seoul'], highlight: 4 },
  { words: ['poster', 'grotesk', 'display', 'foundry', 'italic', 'serif', 'ligature'], highlight: 1 },
  { words: ['signal', 'matter', 'carbon', 'prism', 'strand', 'thread', 'origin'], highlight: 5 },
  { words: ['culture', 'motion', 'canvas', 'object', 'reform', 'shadow', 'bureau'], highlight: 0 },
];

/* ─── Types ─── */

interface SpecimenTileProps {
  placementId?: string;
}

/* ─── Component ─── */

export function SpecimenTile({ placementId }: SpecimenTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [containerWidth, setContainerWidth] = useState(300);
  const [containerHeight, setContainerHeight] = useState(300);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      setScale(Math.min(width, height) / 300);
      setContainerWidth(width);
      setContainerHeight(height);
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
  const { bg, text: textColor, primary: primaryColor, surfaces } = colors;
  const surfaceBg = resolveSurfaceColor({ placementId, tileSurfaceIndex, surfaces, bg, defaultIndex: 0 });
  const adaptiveText = getAdaptiveTextColor(surfaceBg, textColor, COLOR_DEFAULTS.TEXT_LIGHT);
  const fontPreview = useBrandStore((state) => state.fontPreview);

  /* ─── Typography ─── */
  const primaryFont = fontPreview?.target === "primary" ? fontPreview.font : typography.primary;
  const secondaryFont = fontPreview?.target === "secondary" ? fontPreview.font : typography.secondary;

  const { fontFamily: headlineFont } = useGoogleFonts(primaryFont, getFontCategory(primaryFont));
  const { fontFamily: bodyFont } = useGoogleFonts(secondaryFont, getFontCategory(secondaryFont));
  const typeScale = getTypeScale(typography);

  /* ─── Content ─── */
  const tileContent = tile?.content || {};
  const variation = tileContent.specimenVariation || 'alphabet';
  const characters = tileContent.headline || ALPHABET_PRESETS[0];
  const label = tileContent.label || 'Typography';

  /* ─── Wordlist state ─── */
  const wordlistData = useMemo(() => {
    if (variation !== 'wordlist') return WORDLIST_PRESETS[0];
    const body = tileContent.body;
    if (body) {
      try {
        return JSON.parse(body) as { words: string[]; highlight: number };
      } catch { /* fallback */ }
    }
    return WORDLIST_PRESETS[0];
  }, [variation, tileContent.body]);

  /* ─── Toolbar ─── */
  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);

  const handleShuffle = useCallback(() => {
    if (!tile?.id) return;
    if (variation === 'wordlist') {
      const candidates = WORDLIST_PRESETS.filter((p) => JSON.stringify(p) !== JSON.stringify(wordlistData));
      const preset = candidates[Math.floor(Math.random() * candidates.length)];
      updateTile(tile.id, { body: JSON.stringify(preset) }, true);
    } else {
      const candidates = ALPHABET_PRESETS.filter((p) => p !== characters);
      const preset = candidates[Math.floor(Math.random() * candidates.length)];
      updateTile(tile.id, { headline: preset }, true);
    }
  }, [tile?.id, variation, characters, wordlistData, updateTile]);

  const handleVariationChange = useCallback((v: string) => {
    if (!tile?.id) return;
    updateTile(tile.id, { specimenVariation: v as 'alphabet' | 'wordlist' }, true);
  }, [tile?.id, updateTile]);

  const specimenSize = clampFontSize(typeScale.step3 * 1.2 * Math.min(scale, 1.5), 18, 64);

  /* ─── Meta label style (shared) ─── */
  const metaLabelStyle: React.CSSProperties = {
    fontFamily: bodyFont,
    fontWeight: parseInt(typography.weightBody) || 400,
    fontSize: `${clampFontSize(typeScale.stepMinus2, 9, 11)}px`,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: adaptiveText,
    opacity: 0.3,
    textAlign: 'center',
  };

  /* ─── Toolbar JSX ─── */
  const toolbar = isFocused && anchorRect && (
    <FloatingToolbar anchorRect={anchorRect}>
      <ToolbarActions onShuffle={handleShuffle} />
      <ToolbarDivider />
      <ToolbarTileTypeGrid
        currentType={tile?.type || 'specimen'}
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
      <ToolbarSegmented
        label="Style"
        options={[
          { value: 'alphabet', label: 'Alphabet' },
          { value: 'wordlist', label: 'Wordlist' },
        ]}
        value={variation}
        onChange={handleVariationChange}
      />
      {variation === 'alphabet' && (
        <>
          <ToolbarDivider />
          <ToolbarLabel>Content</ToolbarLabel>
          <ToolbarTextArea
            label="Characters"
            value={characters}
            onChange={(v) => tile?.id && updateTile(tile.id, { headline: v }, false)}
            onCommit={(v) => tile?.id && updateTile(tile.id, { headline: v }, true)}
            placeholder="AaBbCcDd..."
          />
        </>
      )}
    </FloatingToolbar>
  );

  /* ─── Wordlist variation ─── */
  if (variation === 'wordlist') {
    const { words, highlight } = wordlistData;
    const padding = 'clamp(20px, 6%, 40px)';
    const lineCount = words.length;
    // Height-based: fill vertical space leaving room for padding + meta labels
    const availableHeight = containerHeight * 0.75;
    const heightBasedSize = availableHeight / (lineCount * 1.05);
    // Width-based: ensure the longest word fits horizontally
    const longestWordLen = Math.max(...words.map((w) => w.length));
    const availableWidth = containerWidth * 0.88; // account for horizontal padding
    const widthBasedSize = availableWidth / (longestWordLen * 0.62); // ~0.62em avg char width for bold
    const wordSize = clampFontSize(Math.min(heightBasedSize, widthBasedSize), 16, 120);

    return (
      <div
        ref={containerRef}
        className="w-full h-full flex flex-col justify-between transition-colors duration-300 relative overflow-hidden"
        style={{
          backgroundColor: surfaceBg,
          padding,
        }}
      >
        {/* Top meta */}
        <span className="select-none" style={{ ...metaLabelStyle, textAlign: 'left' }}>
          {typography.primary}
        </span>

        {/* Stacked words */}
        <div
          ref={textRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          {words.map((word, i) => (
            <span
              key={i}
              style={{
                fontFamily: headlineFont,
                fontWeight: parseInt(typography.weightHeadline) || 700,
                fontSize: `${wordSize}px`,
                lineHeight: 1.05,
                letterSpacing: getHeadlineTracking(typography),
                color: i === highlight ? primaryColor : adaptiveText,
                transition: 'color 0.3s ease',
              }}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Bottom meta */}
        <span className="select-none" style={{ ...metaLabelStyle, textAlign: 'left' }}>
          {label}
        </span>

        {toolbar}
      </div>
    );
  }

  /* ─── Alphabet variation (default) ─── */
  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center justify-center transition-colors duration-300 relative overflow-hidden"
      style={{
        backgroundColor: surfaceBg,
        padding: 'clamp(20px, 8%, 40px)',
      }}
    >
      {/* Font name — centered top */}
      <span
        className="absolute select-none"
        style={{
          ...metaLabelStyle,
          top: 'clamp(16px, 6%, 28px)',
          left: 0,
          right: 0,
        }}
      >
        {typography.primary}
      </span>

      {/* Alphabet specimen */}
      <div
        style={{
          fontFamily: headlineFont,
          fontWeight: parseInt(typography.weightHeadline) || 700,
          fontSize: `${specimenSize}px`,
          lineHeight: getHeadlineLineHeight(typography),
          letterSpacing: getHeadlineTracking(typography),
          color: adaptiveText,
          textAlign: 'center',
          whiteSpace: 'pre-line',
          textWrap: 'balance',
        }}
      >
        {characters}
      </div>

      {/* Corner label — centered bottom */}
      <span
        className="absolute select-none"
        style={{
          ...metaLabelStyle,
          bottom: 'clamp(16px, 6%, 28px)',
          left: 0,
          right: 0,
        }}
      >
        {label}
      </span>

      {toolbar}
    </div>
  );
}
