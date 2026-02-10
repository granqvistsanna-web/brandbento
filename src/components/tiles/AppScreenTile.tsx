/**
 * App Screen Tile Component
 *
 * A phone-frame mockup displaying a branded app screen inside.
 * Think Dribbble device mockup — bridges brand identity into product context.
 * Supports four screen variants: login, feed, profile, settings.
 */
import { useRef, useState, useEffect } from 'react';
import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { useShallow } from 'zustand/react/shallow';
import { getAdaptiveTextColor } from '@/utils/color';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import { resolveSurfaceColor } from '@/utils/surface';
import { getPlacementTileId, getPlacementTileType } from '@/config/placements';
import { useGoogleFonts } from '@/hooks/useGoogleFonts';
import { getFontCategory } from '@/utils/typography';
import { useTileToolbar } from '@/hooks/useTileToolbar';
import { ChevronRight } from 'lucide-react';
import {
  FloatingToolbar,
  ToolbarActions,
  ToolbarSegmented,
  ToolbarLabel,
  ToolbarDivider,
} from './FloatingToolbar';

/* ─── Constants ─── */

const PHONE_W = 200;
const PHONE_H = 400;

const SCREEN_VARIANTS = ['login', 'feed', 'profile', 'settings'] as const;
type ScreenVariant = (typeof SCREEN_VARIANTS)[number];

/* ─── Screen Props ─── */

interface ScreenProps {
  bg: string;
  textColor: string;
  primary: string;
  primaryTextColor: string;
  surfaces: string[];
  headlineFont: string;
  bodyFont: string;
  logoInitial: string;
}

/* ─── Dynamic Island ─── */

function DynamicIsland({ textColor }: { textColor: string }) {
  return (
    <div
      style={{
        width: 72,
        height: 22,
        borderRadius: 11,
        backgroundColor: `color-mix(in srgb, ${textColor} 85%, transparent)`,
        margin: '8px auto 0',
        flexShrink: 0,
      }}
    />
  );
}

/* ─── Login Screen ─── */

function LoginScreen({ textColor, primary, primaryTextColor, headlineFont, bodyFont }: ScreenProps) {
  const inputBorder = `color-mix(in srgb, ${textColor} 15%, transparent)`;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 20px 20px' }}>
      {/* Welcome headline */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontFamily: headlineFont,
            fontSize: 18,
            fontWeight: 700,
            lineHeight: 1.1,
            color: textColor,
          }}
        >
          Welcome
        </div>
        <div
          style={{
            fontFamily: headlineFont,
            fontSize: 18,
            fontWeight: 700,
            lineHeight: 1.1,
            color: textColor,
            opacity: 0.55,
          }}
        >
          back.
        </div>
      </div>

      {/* Form inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {/* Email input */}
        <div
          style={{
            border: `1px solid ${inputBorder}`,
            borderRadius: 8,
            height: 32,
            padding: '0 10px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: bodyFont,
              fontSize: 10,
              color: textColor,
              opacity: 0.35,
            }}
          >
            Email
          </span>
        </div>
        {/* Password input */}
        <div
          style={{
            border: `1px solid ${inputBorder}`,
            borderRadius: 8,
            height: 32,
            padding: '0 10px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: bodyFont,
              fontSize: 10,
              color: textColor,
              opacity: 0.35,
            }}
          >
            Password
          </span>
        </div>
      </div>

      {/* Sign In button */}
      <div
        style={{
          backgroundColor: primary,
          color: primaryTextColor,
          borderRadius: 8,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: bodyFont,
          fontSize: 11,
          fontWeight: 600,
          marginBottom: 12,
        }}
      >
        Sign In
      </div>

      {/* Forgot password */}
      <div
        style={{
          fontFamily: bodyFont,
          fontSize: 10,
          color: textColor,
          opacity: 0.4,
          textAlign: 'center',
        }}
      >
        Forgot password?
      </div>
    </div>
  );
}

/* ─── Feed Screen ─── */

function FeedScreen({ textColor, primary, surfaces, headlineFont, bodyFont }: ScreenProps) {
  const cardBg = surfaces?.[0] || '#f0f0f0';
  const dividerColor = `color-mix(in srgb, ${textColor} 10%, transparent)`;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top bar */}
      <div
        style={{
          padding: '12px 16px 8px',
          fontFamily: headlineFont,
          fontSize: 14,
          fontWeight: 700,
          color: textColor,
          flexShrink: 0,
        }}
      >
        Explore
      </div>
      <div style={{ height: 1, backgroundColor: dividerColor, flexShrink: 0 }} />

      {/* Cards */}
      <div
        style={{
          flex: 1,
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          overflow: 'hidden',
        }}
      >
        {/* Card 1 */}
        <div
          style={{
            backgroundColor: cardBg,
            borderRadius: 10,
            padding: 12,
            height: 60,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontFamily: bodyFont, fontSize: 10, fontWeight: 600, color: textColor }}>
            Today&apos;s pick
          </div>
          <div style={{ fontFamily: bodyFont, fontSize: 10, color: textColor, opacity: 0.45, marginTop: 2 }}>
            Curated for you
          </div>
        </div>

        {/* Card 2 */}
        <div
          style={{
            backgroundColor: cardBg,
            borderRadius: 10,
            padding: 12,
            height: 60,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontFamily: bodyFont, fontSize: 10, fontWeight: 600, color: textColor }}>
            New arrival
          </div>
          <div style={{ fontFamily: bodyFont, fontSize: 10, color: textColor, opacity: 0.45, marginTop: 2 }}>
            Just dropped today
          </div>
        </div>

        {/* Card 3 — partially visible */}
        <div
          style={{
            backgroundColor: cardBg,
            borderRadius: 10,
            padding: 12,
            height: 60,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontFamily: bodyFont, fontSize: 10, fontWeight: 600, color: textColor }}>
            Featured
          </div>
          <div style={{ fontFamily: bodyFont, fontSize: 10, color: textColor, opacity: 0.45, marginTop: 2 }}>
            Editor&apos;s choice
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 6,
          padding: '10px 0 14px',
          flexShrink: 0,
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: primary }} />
        <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: textColor, opacity: 0.2 }} />
        <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: textColor, opacity: 0.2 }} />
        <div style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: textColor, opacity: 0.2 }} />
      </div>
    </div>
  );
}

/* ─── Profile Screen ─── */

function ProfileScreen({ textColor, primary, primaryTextColor, headlineFont, bodyFont, logoInitial }: ScreenProps) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 20px 20px',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: primaryTextColor,
          fontSize: 16,
          fontWeight: 700,
          fontFamily: headlineFont,
          marginBottom: 8,
          flexShrink: 0,
        }}
      >
        {logoInitial}
      </div>

      {/* Username */}
      <div
        style={{
          fontFamily: headlineFont,
          fontSize: 14,
          fontWeight: 700,
          color: textColor,
          marginBottom: 2,
        }}
      >
        {logoInitial}studio
      </div>

      {/* Handle */}
      <div
        style={{
          fontFamily: bodyFont,
          fontSize: 10,
          color: textColor,
          opacity: 0.45,
          marginBottom: 16,
        }}
      >
        @{logoInitial.toLowerCase()}studio
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          marginBottom: 16,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: bodyFont, fontSize: 12, fontWeight: 700, color: textColor }}>128</div>
          <div style={{ fontFamily: bodyFont, fontSize: 9, color: textColor, opacity: 0.4 }}>Posts</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: bodyFont, fontSize: 12, fontWeight: 700, color: textColor }}>2.4K</div>
          <div style={{ fontFamily: bodyFont, fontSize: 9, color: textColor, opacity: 0.4 }}>Followers</div>
        </div>
      </div>

      {/* Edit Profile button */}
      <div
        style={{
          border: `1.5px solid ${primary}`,
          borderRadius: 8,
          height: 30,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: bodyFont,
          fontSize: 10,
          fontWeight: 600,
          color: primary,
        }}
      >
        Edit Profile
      </div>
    </div>
  );
}

/* ─── Settings Screen ─── */

function SettingsScreen({ textColor, headlineFont, bodyFont }: ScreenProps) {
  const rows = ['Account', 'Notifications', 'Appearance', 'Privacy', 'About'];
  const dividerColor = `color-mix(in srgb, ${textColor} 8%, transparent)`;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          padding: '14px 16px 10px',
          fontFamily: headlineFont,
          fontSize: 16,
          fontWeight: 700,
          color: textColor,
          flexShrink: 0,
        }}
      >
        Settings
      </div>

      {/* List rows */}
      <div style={{ flex: 1 }}>
        {rows.map((label, i) => (
          <div key={label}>
            <div
              style={{
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
              }}
            >
              <span style={{ fontFamily: bodyFont, fontSize: 11, color: textColor }}>
                {label}
              </span>
              <ChevronRight size={12} color={textColor} style={{ opacity: 0.3 }} />
            </div>
            {i < rows.length - 1 && (
              <div style={{ height: 1, backgroundColor: dividerColor, margin: '0 16px' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

interface AppScreenTileProps {
  placementId?: string;
}

export function AppScreenTile({ placementId }: AppScreenTileProps) {
  const { colors, typography, logoText } = useBrandStore(
    useShallow((state: BrandStore) => ({
      colors: state.brand.colors,
      typography: state.brand.typography,
      logoText: state.brand.logo.text,
    }))
  );

  const updateTile = useBrandStore((s) => s.updateTile);

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

  const { bg, text, primary, surfaces } = colors;

  const tileBg = resolveSurfaceColor({
    placementId,
    tileSurfaceIndex,
    surfaces,
    bg,
    defaultIndex: 1,
  });

  /* Typography */
  const { fontFamily: headlineFont } = useGoogleFonts(
    typography.primary,
    getFontCategory(typography.primary)
  );
  const { fontFamily: bodyFont } = useGoogleFonts(
    typography.secondary,
    getFontCategory(typography.secondary)
  );

  /* Screen variant */
  const content = tile?.content || {};
  const variant: ScreenVariant = (SCREEN_VARIANTS as readonly string[]).includes(
    content.screenVariant as string
  )
    ? (content.screenVariant as ScreenVariant)
    : 'login';

  /* Phone-interior text color (adapts to brand bg) */
  const screenTextColor = getAdaptiveTextColor(bg, text, COLOR_DEFAULTS.TEXT_LIGHT);
  const primaryTextColor = getAdaptiveTextColor(
    primary,
    COLOR_DEFAULTS.TEXT_DARK,
    COLOR_DEFAULTS.WHITE
  );

  /* Scale-to-fit */
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const pad = Math.min(rect.width, rect.height) * 0.1;
      const s = Math.min(
        (rect.width - pad * 2) / PHONE_W,
        (rect.height - pad * 2) / PHONE_H
      );
      setScale(s);
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, []);

  /* Toolbar */
  const { isFocused, anchorRect } = useTileToolbar(placementId, containerRef);

  const logoInitial = (logoText || 'B').charAt(0).toUpperCase();

  /* Screen props shared by all variants */
  const screenProps: ScreenProps = {
    bg,
    textColor: screenTextColor,
    primary,
    primaryTextColor,
    surfaces: surfaces || [],
    headlineFont,
    bodyFont,
    logoInitial,
  };

  /* Render the active screen variant */
  const renderScreen = () => {
    switch (variant) {
      case 'feed':
        return <FeedScreen {...screenProps} />;
      case 'profile':
        return <ProfileScreen {...screenProps} />;
      case 'settings':
        return <SettingsScreen {...screenProps} />;
      case 'login':
      default:
        return <LoginScreen {...screenProps} />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: tileBg }}
    >
      {/* Outer scaled wrapper — actual pixel size */}
      <div style={{ width: PHONE_W * scale, height: PHONE_H * scale, flexShrink: 0 }}>
        {/* Design-space phone frame with transform */}
        <div
          style={{
            width: PHONE_W,
            height: PHONE_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            borderRadius: 28,
            border: `2px solid color-mix(in srgb, ${text} 12%, transparent)`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            backgroundColor: bg,
            display: 'flex',
            flexDirection: 'column' as const,
          }}
        >
          {/* Dynamic island */}
          <DynamicIsland textColor={screenTextColor} />

          {/* Screen content */}
          {renderScreen()}
        </div>
      </div>

      {/* Floating toolbar when focused */}
      {isFocused && anchorRect && (
        <FloatingToolbar anchorRect={anchorRect}>
          <ToolbarActions
            onShuffle={() => {
              const currentIdx = SCREEN_VARIANTS.indexOf(variant);
              const next = SCREEN_VARIANTS[(currentIdx + 1) % SCREEN_VARIANTS.length];
              if (tile?.id) updateTile(tile.id, { screenVariant: next }, true);
            }}
          />
          <ToolbarDivider />
          <ToolbarLabel>App Screen</ToolbarLabel>
          <ToolbarSegmented
            label="Screen"
            options={[
              { value: 'login', label: 'Login' },
              { value: 'feed', label: 'Feed' },
              { value: 'profile', label: 'Profile' },
              { value: 'settings', label: 'Settings' },
            ]}
            value={variant}
            onChange={(v) => {
              if (tile?.id) updateTile(tile.id, { screenVariant: v }, true);
            }}
          />
        </FloatingToolbar>
      )}
    </div>
  );
}
