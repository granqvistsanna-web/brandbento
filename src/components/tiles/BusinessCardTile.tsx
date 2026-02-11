/**
 * Business Card Tile Component
 *
 * Realistic business card layout — the kind you see in brand identity
 * presentations. Fixed-ratio card scaled to fit the tile, with brand
 * logo, contact info, and address. All text in brand typography.
 *
 * Uses the scale-to-fit pattern (fixed design-space, ResizeObserver
 * scale factor) like InterfaceTile and SocialPostTile.
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { hexToHSL } from '@/utils/colorMapping';
import { resolveSurfaceColor } from '@/utils/surface';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { getFontCategory, getHeadlineLineHeight, getBodyLineHeight, getBodyTracking } from '@/utils/typography';
import { getPresetContent } from '@/data/tilePresetContent';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarDivider,
  ToolbarTileTypeGrid,
  ToolbarSurfaceSwatches,
  ToolbarTextInput,
  ToolbarTextArea,
  ToolbarLabel,
} from './FloatingToolbar';

/* ─── Design-space dimensions (business card ~3.5:2 ratio) ─── */
const CARD_W = 380;
const CARD_H = 220;

/* ─── Shuffle presets ─── */

const CARD_PRESETS = [
  { headline: 'Jessica Smith', subcopy: 'Marketing Manager', label: 'jessica@studio.co', price: '+1 (555) 234-5678', body: '10/349 Edward Street\nNorth Melbourne VIC 3051', cta: 'studio.co' },
  { headline: 'Alex Rivera', subcopy: 'Creative Director', label: 'alex@forma.design', price: '+44 20 7946 0958', body: '42 Rivington Street\nLondon EC2A 3LX', cta: 'forma.design' },
  { headline: 'Mika Tanaka', subcopy: 'Brand Strategist', label: 'mika@kindred.co', price: '+81 3 5555 1234', body: '3-14-5 Jingumae\nShibuya, Tokyo 150-0001', cta: 'kindred.co' },
  { headline: 'Sam Osei', subcopy: 'Design Lead', label: 'sam@basecamp.studio', price: '+233 55 123 4567', body: '12 Independence Ave\nAccra, Ghana', cta: 'basecamp.studio' },
];

/* ─── Types ─── */

interface BusinessCardTileProps {
  placementId?: string;
}

/* ─── Component ─── */

export function BusinessCardTile({ placementId }: BusinessCardTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const pad = Math.min(width, height) * 0.08;
      const s = Math.min((width - pad * 2) / CARD_W, (height - pad * 2) / CARD_H);
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
  const activePreset = useBrandStore((s) => s.activePreset);
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

  // Card itself is always light (like a real business card)
  const cardBg = '#ffffff';
  const { l: textL } = hexToHSL(textColor);
  // If brand text is light, use dark text on the white card
  const cardTextColor = textL > 55 ? '#1a1a1a' : textColor;
  const fontPreview = useBrandStore((state) => state.fontPreview);

  /* ─── Typography ─── */
  // Apply font preview if active
  const primaryFont = fontPreview?.target === "primary" ? fontPreview.font : typography.primary;
  const secondaryFont = fontPreview?.target === "secondary" ? fontPreview.font : typography.secondary;

  const { fontFamily: headlineFont } = useGoogleFonts(primaryFont, getFontCategory(primaryFont));
  const { fontFamily: bodyFont } = useGoogleFonts(secondaryFont, getFontCategory(secondaryFont));

  /* ─── Content (field mapping: headline=name, subcopy=title, label=email, price=phone, body=address, cta=website) ─── */
  const presetCopy = getPresetContent(activePreset).businessCard;
  const tileContent = tile?.content || {};
  const name = tileContent.headline || presetCopy.name;
  const title = tileContent.subcopy || presetCopy.title;
  const email = tileContent.label || presetCopy.email;
  const phone = tileContent.price || presetCopy.phone;
  const address = tileContent.body || presetCopy.address;
  const website = tileContent.cta || presetCopy.website;

  /* ─── Toolbar ─── */
  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);

  const handleShuffle = useCallback(() => {
    if (!tile?.id) return;
    const candidates = CARD_PRESETS.filter((p) => p.headline !== name);
    const preset = candidates[Math.floor(Math.random() * candidates.length)];
    updateTile(tile.id, preset, true);
  }, [tile?.id, name, updateTile]);

  const toolbar = isFocused && anchorRect && (
    <FloatingToolbar anchorRect={anchorRect}>
      <ToolbarActions onShuffle={handleShuffle} />
      <ToolbarDivider />
      <ToolbarTileTypeGrid
        currentType={tile?.type || 'business-card'}
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
      <ToolbarLabel>Contact</ToolbarLabel>
      <ToolbarTextInput
        label="Name"
        value={name}
        onChange={(v) => tile?.id && updateTile(tile.id, { headline: v }, false)}
        onCommit={(v) => tile?.id && updateTile(tile.id, { headline: v }, true)}
        placeholder="Full name"
      />
      <ToolbarTextInput
        label="Title"
        value={title}
        onChange={(v) => tile?.id && updateTile(tile.id, { subcopy: v }, false)}
        onCommit={(v) => tile?.id && updateTile(tile.id, { subcopy: v }, true)}
        placeholder="Job title"
      />
      <ToolbarTextInput
        label="Email"
        value={email}
        onChange={(v) => tile?.id && updateTile(tile.id, { label: v }, false)}
        onCommit={(v) => tile?.id && updateTile(tile.id, { label: v }, true)}
        placeholder="email@company.com"
      />
      <ToolbarTextInput
        label="Phone"
        value={phone}
        onChange={(v) => tile?.id && updateTile(tile.id, { price: v }, false)}
        onCommit={(v) => tile?.id && updateTile(tile.id, { price: v }, true)}
        placeholder="+1 (555) 000-0000"
      />
      <ToolbarTextArea
        label="Address"
        value={address}
        onChange={(v) => tile?.id && updateTile(tile.id, { body: v }, false)}
        onCommit={(v) => tile?.id && updateTile(tile.id, { body: v }, true)}
        placeholder="Street address..."
      />
      <ToolbarTextInput
        label="Website"
        value={website}
        onChange={(v) => tile?.id && updateTile(tile.id, { cta: v }, false)}
        onCommit={(v) => tile?.id && updateTile(tile.id, { cta: v }, true)}
        placeholder="company.com"
      />
    </FloatingToolbar>
  );

  /* ─── Logo rendering ─── */
  const logoImage = logo.image;
  const logoText = logo.text;

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center transition-colors duration-300 relative overflow-hidden"
      style={{ backgroundColor: surfaceBg }}
    >
      {/* Scaled card */}
      <div
        style={{
          width: CARD_W,
          height: CARD_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          backgroundColor: cardBg,
          borderRadius: 6,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
          padding: 28,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        {/* Top row: logo left, contact info right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Logo */}
          <div style={{ flexShrink: 0, maxWidth: 100 }}>
            {logoImage ? (
              <img
                src={logoImage}
                alt="Logo"
                style={{ maxHeight: 32, maxWidth: 80, objectFit: 'contain' }}
              />
            ) : logoText ? (
              <span
                style={{
                  fontFamily: headlineFont,
                  fontWeight: parseInt(typography.weightHeadline) || 700,
                  fontSize: 18,
                  color: primary,
                  lineHeight: 1.2,
                }}
              >
                {logoText}
              </span>
            ) : null}
          </div>

          {/* Contact info — right aligned */}
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: headlineFont,
                fontWeight: parseInt(typography.weightHeadline) || 700,
                fontSize: 12,
                color: cardTextColor,
                lineHeight: getHeadlineLineHeight(typography),
                marginBottom: 2,
              }}
            >
              {name}
            </div>
            <div
              style={{
                fontFamily: bodyFont,
                fontSize: 9.5,
                color: cardTextColor,
                opacity: 0.6,
                lineHeight: getBodyLineHeight(typography),
                letterSpacing: getBodyTracking(typography),
              }}
            >
              {title}
              <br />
              {phone}
              <br />
              {email}
            </div>
          </div>
        </div>

        {/* Bottom row: address left, website right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div
            style={{
              fontFamily: bodyFont,
              fontSize: 9,
              color: cardTextColor,
              opacity: 0.5,
              lineHeight: getBodyLineHeight(typography),
              letterSpacing: getBodyTracking(typography),
              whiteSpace: 'pre-line',
            }}
          >
            {address}
          </div>
          <div
            style={{
              fontFamily: headlineFont,
              fontWeight: parseInt(typography.weightHeadline) || 700,
              fontSize: 10,
              color: primary,
              lineHeight: 1.3,
            }}
          >
            {website}
          </div>
        </div>
      </div>

      {toolbar}
    </div>
  );
}
