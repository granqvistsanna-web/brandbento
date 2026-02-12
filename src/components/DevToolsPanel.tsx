import { useState } from 'react';
import { RiCloseFill as X, RiArrowDownSLine as ChevronDown } from 'react-icons/ri';
import { useBrandStore } from '../store/useBrandStore';
import { HeroTile } from './tiles/HeroTile';
import { EditorialTile } from './tiles/EditorialTile';
import { CardTile } from './tiles/CardTile';
import { InterfaceTile } from './tiles/InterfaceTile';
import { SocialPostTile } from './tiles/SocialPostTile';
import { LogoTile } from './tiles/LogoTile';
import { ListTile } from './tiles/ListTile';
import { SwatchTile } from './tiles/SwatchTile';
import { ImageTile } from './tiles/ImageTile';
import { SplitHeroTile } from './tiles/SplitHeroTile';
import { LogoSymbolTile } from './tiles/LogoSymbolTile';
import { IconsTile } from './tiles/IconsTile';
import { PatternTile } from './tiles/PatternTile';
import { StatsTile } from './tiles/StatsTile';
import { MessagingTile } from './tiles/MessagingTile';
import { SpecimenTile } from './tiles/SpecimenTile';

import { ColorBlocksTile } from './tiles/ColorBlocksTile';
import { BusinessCardTile } from './tiles/BusinessCardTile';
import { AppIconTile } from './tiles/AppIconTile';
import { StoryTile } from './tiles/StoryTile';

/* Variant wrappers so previews render the correct variant */
function ColorBarsTile({ placementId }: { placementId?: string }) {
  return <SwatchTile placementId={placementId} variant="bars" />;
}
function MenuTile({ placementId }: { placementId?: string }) {
  return <ListTile placementId={placementId} />;
}

/* ─── Types ─── */

interface FieldDef {
  name: string;
  contentKey: string;
  type: 'text' | 'slider' | 'segmented' | 'items' | 'image' | 'brand';
}

interface CatalogEntry {
  type: string;
  label: string;
  component: React.ComponentType<{ placementId: string }> | React.ComponentType;
  placementId?: string;
  tileId: string;
  fields: FieldDef[];
  sizes: { w: number; h: number; label: string }[];
}

/* ─── Catalog ─── */

const TILE_CATALOG: CatalogEntry[] = [
  {
    type: 'hero',
    label: 'HeroTile',
    component: HeroTile,
    placementId: 'hero',
    tileId: 'hero-1',
    fields: [
      { name: 'headline', contentKey: 'headline', type: 'text' },
      { name: 'subcopy', contentKey: 'subcopy', type: 'text' },
      { name: 'image', contentKey: 'image', type: 'image' },
    ],
    sizes: [
      { w: 300, h: 200, label: '2x1' },
      { w: 300, h: 300, label: '2x2' },
      { w: 150, h: 300, label: '1x2' },
    ],
  },
  {
    type: 'editorial',
    label: 'EditorialTile',
    component: EditorialTile,
    placementId: 'editorial',
    tileId: 'editorial-1',
    fields: [
      { name: 'headline', contentKey: 'headline', type: 'text' },
      { name: 'subcopy', contentKey: 'subcopy', type: 'text' },
      { name: 'body', contentKey: 'body', type: 'text' },
    ],
    sizes: [
      { w: 200, h: 200, label: '1x1' },
      { w: 300, h: 200, label: '2x1' },
      { w: 150, h: 300, label: '1x2' },
    ],
  },
  {
    type: 'card',
    label: 'CardTile',
    component: CardTile,
    placementId: 'hero',
    tileId: 'product-1',
    fields: [
      { name: 'label', contentKey: 'label', type: 'text' },
      { name: 'subcopy', contentKey: 'subcopy', type: 'text' },
      { name: 'body (tag)', contentKey: 'body', type: 'text' },
      { name: 'price', contentKey: 'price', type: 'text' },
      { name: 'image', contentKey: 'image', type: 'image' },
    ],
    sizes: [
      { w: 200, h: 250, label: '1x1' },
      { w: 300, h: 200, label: '2x1' },
    ],
  },
  {
    type: 'ui-preview',
    label: 'InterfaceTile',
    component: InterfaceTile,
    placementId: 'buttons',
    tileId: 'ui-preview-1',
    fields: [
      { name: 'buttonRadius', contentKey: 'ui.buttonRadius', type: 'brand' },
      { name: 'buttonStyle', contentKey: 'ui.buttonStyle', type: 'brand' },
      { name: 'buttonLabel', contentKey: 'buttonLabel', type: 'text' },
      { name: 'headerTitle', contentKey: 'headerTitle', type: 'text' },
    ],
    sizes: [
      { w: 200, h: 200, label: '1x1' },
      { w: 300, h: 200, label: '2x1' },
    ],
  },
  {
    type: 'social',
    label: 'SocialPostTile',
    component: SocialPostTile,
    placementId: 'social',
    tileId: 'social-1',
    fields: [
      { name: 'socialHandle', contentKey: 'socialHandle', type: 'text' },
      { name: 'socialCaption', contentKey: 'socialCaption', type: 'text' },
      { name: 'socialLikes', contentKey: 'socialLikes', type: 'text' },
      { name: 'socialPostCount', contentKey: 'socialPostCount', type: 'segmented' },
      { name: 'image', contentKey: 'image', type: 'image' },
    ],
    sizes: [
      { w: 200, h: 300, label: '1x2' },
      { w: 200, h: 200, label: '1x1' },
    ],
  },
  {
    type: 'logo',
    label: 'LogoTile',
    component: LogoTile,
    placementId: 'logo',
    tileId: 'logo-1',
    fields: [
      { name: 'logo.size', contentKey: 'logo.size', type: 'brand' },
      { name: 'logo.padding', contentKey: 'logo.padding', type: 'brand' },
    ],
    sizes: [
      { w: 200, h: 200, label: '1x1' },
      { w: 300, h: 200, label: '2x1' },
    ],
  },
  {
    type: 'utility',
    label: 'ListTile',
    component: ListTile,
    placementId: 'hero',
    tileId: 'utility-1',
    fields: [
      { name: 'subcopy', contentKey: 'subcopy', type: 'text' },
      { name: 'buttonLabel', contentKey: 'buttonLabel', type: 'text' },
      { name: 'items', contentKey: 'items', type: 'items' },
    ],
    sizes: [
      { w: 200, h: 200, label: '1x1' },
      { w: 300, h: 200, label: '2x1' },
    ],
  },
  {
    type: 'swatch',
    label: 'SwatchTile (chips)',
    component: SwatchTile,
    placementId: 'e',
    tileId: 'swatch-1',
    fields: [],
    sizes: [
      { w: 200, h: 200, label: '1x1' },
    ],
  },
  {
    type: 'image',
    label: 'ImageTile',
    component: ImageTile,
    placementId: 'hero',
    tileId: '',
    fields: [
      { name: 'image', contentKey: 'image', type: 'image' },
      { name: 'overlayText', contentKey: 'overlayText', type: 'text' },
    ],
    sizes: [
      { w: 200, h: 200, label: '1x1' },
      { w: 300, h: 200, label: '2x1' },
    ],
  },
  {
    type: 'split-hero',
    label: 'SplitHeroTile',
    component: SplitHeroTile,
    placementId: 'hero',
    tileId: '',
    fields: [
      { name: 'headline', contentKey: 'headline', type: 'text' },
      { name: 'body', contentKey: 'body', type: 'text' },
      { name: 'cta', contentKey: 'cta', type: 'text' },
      { name: 'image', contentKey: 'image', type: 'image' },
    ],
    sizes: [
      { w: 300, h: 200, label: '2x1' },
      { w: 300, h: 300, label: '2x2' },
    ],
  },
  {
    type: 'split-list',
    label: 'ListTile (split)',
    component: ListTile,
    placementId: 'hero',
    tileId: '',
    fields: [
      { name: 'label', contentKey: 'label', type: 'text' },
      { name: 'headline', contentKey: 'headline', type: 'text' },
      { name: 'items', contentKey: 'items', type: 'items' },
      { name: 'image', contentKey: 'image', type: 'image' },
    ],
    sizes: [
      { w: 300, h: 200, label: '2x1' },
      { w: 300, h: 300, label: '2x2' },
    ],
  },
  {
    type: 'logo-symbol',
    label: 'LogoSymbolTile',
    component: LogoSymbolTile,
    placementId: 'logo',
    tileId: '',
    fields: [],
    sizes: [
      { w: 200, h: 200, label: '1x1' },
    ],
  },
  {
    type: 'stats',
    label: 'StatsTile',
    component: StatsTile,
    placementId: 'f',
    tileId: 'slot-f',
    fields: [
      { name: 'headline (value)', contentKey: 'headline', type: 'text' },
      { name: 'label', contentKey: 'label', type: 'text' },
      { name: 'body (detail)', contentKey: 'body', type: 'text' },
    ],
    sizes: [
      { w: 200, h: 200, label: '1x1' },
      { w: 300, h: 200, label: '2x1' },
    ],
  },
  {
    type: 'icons',
    label: 'IconsTile',
    component: IconsTile,
    placementId: 'hero',
    tileId: '',
    fields: [],
    sizes: [
      { w: 200, h: 200, label: '1x1' },
      { w: 300, h: 200, label: '2x1' },
    ],
  },
  {
    type: 'pattern',
    label: 'PatternTile',
    component: PatternTile,
    placementId: 'hero',
    tileId: '',
    fields: [
      { name: 'patternVariant', contentKey: 'patternVariant', type: 'segmented' },
      { name: 'patternScale', contentKey: 'patternScale', type: 'slider' },
      { name: 'patternImage', contentKey: 'patternImage', type: 'image' },
    ],
    sizes: [
      { w: 200, h: 200, label: '1x1' },
      { w: 300, h: 200, label: '2x1' },
    ],
  },
  {
    type: 'menu',
    label: 'ListTile (menu)',
    component: MenuTile,
    placementId: 'hero',
    tileId: '',
    fields: [
      { name: 'headline', contentKey: 'headline', type: 'text' },
      { name: 'items', contentKey: 'items', type: 'items' },
    ],
    sizes: [
      { w: 200, h: 200, label: '1x1' },
      { w: 300, h: 200, label: '2x1' },
    ],
  },
  {
    type: 'colors',
    label: 'SwatchTile (bars)',
    component: ColorBarsTile,
    placementId: 'e',
    tileId: '',
    fields: [],
    sizes: [
      { w: 200, h: 200, label: '1x1' },
      { w: 200, h: 300, label: '1x2' },
    ],
  },
  {
    type: 'messaging',
    label: 'MessagingTile',
    component: MessagingTile,
    placementId: 'hero',
    tileId: '',
    fields: [
      { name: 'headline', contentKey: 'headline', type: 'text' },
    ],
    sizes: [
      { w: 200, h: 200, label: '1x1' },
      { w: 300, h: 200, label: '2x1' },
      { w: 150, h: 300, label: '1x2' },
    ],
  },
  {
    type: 'specimen',
    label: 'SpecimenTile',
    component: SpecimenTile,
    placementId: 'hero',
    tileId: '',
    fields: [
      { name: 'headline (chars)', contentKey: 'headline', type: 'text' },
    ],
    sizes: [
      { w: 200, h: 200, label: '1x1' },
      { w: 300, h: 200, label: '2x1' },
      { w: 150, h: 300, label: '1x2' },
    ],
  },
  {
    type: 'color-blocks',
    label: 'ColorBlocksTile',
    component: ColorBlocksTile,
    placementId: 'hero',
    tileId: '',
    fields: [],
    sizes: [
      { w: 200, h: 200, label: '1x1' },
      { w: 300, h: 200, label: '2x1' },
      { w: 150, h: 300, label: '1x2' },
    ],
  },
  {
    type: 'business-card',
    label: 'BusinessCardTile',
    component: BusinessCardTile,
    placementId: 'hero',
    tileId: '',
    fields: [
      { name: 'name', contentKey: 'headline', type: 'text' },
      { name: 'title', contentKey: 'subcopy', type: 'text' },
      { name: 'email', contentKey: 'label', type: 'text' },
      { name: 'phone', contentKey: 'price', type: 'text' },
      { name: 'address', contentKey: 'body', type: 'text' },
      { name: 'website', contentKey: 'cta', type: 'text' },
    ],
    sizes: [
      { w: 300, h: 200, label: '2x1' },
      { w: 200, h: 200, label: '1x1' },
    ],
  },
  {
    type: 'app-icon',
    label: 'AppIconTile',
    component: AppIconTile,
    placementId: 'hero',
    tileId: '',
    fields: [
      { name: 'app name', contentKey: 'headerTitle', type: 'text' },
    ],
    sizes: [
      { w: 200, h: 250, label: '1x1' },
      { w: 200, h: 300, label: '1x2' },
    ],
  },
  {
    type: 'story',
    label: 'StoryTile',
    component: StoryTile,
    placementId: 'hero',
    tileId: '',
    fields: [
      { name: 'headline', contentKey: 'headline', type: 'text' },
      { name: 'body', contentKey: 'body', type: 'text' },
      { name: 'cta', contentKey: 'cta', type: 'text' },
      { name: 'image', contentKey: 'image', type: 'image' },
    ],
    sizes: [
      { w: 200, h: 300, label: '1x2' },
      { w: 200, h: 200, label: '1x1' },
    ],
  },
];

const TYPE_COLORS: Record<string, string> = {
  text: '#3b82f6',
  slider: '#8b5cf6',
  segmented: '#f59e0b',
  items: '#10b981',
  image: '#ec4899',
  brand: '#8b5cf6',
};

/* ─── Helpers ─── */

function truncate(s: string, max = 40): string {
  return s.length > max ? s.slice(0, max) + '\u2026' : s;
}

function resolveValue(
  content: Record<string, unknown> | undefined,
  brand: Record<string, unknown> | undefined,
  key: string,
): string {
  if (key.includes('.') && brand) {
    const parts = key.split('.');
    let val: unknown = brand;
    for (const p of parts) val = (val as Record<string, unknown>)?.[p];
    if (val == null) return '\u2013';
    return String(val);
  }
  const val = content?.[key];
  if (val == null) return '\u2013';
  if (Array.isArray(val)) return val.join(', ');
  if (typeof val === 'string' && (val.startsWith('/') || val.startsWith('data:')))
    return truncate(val.split('/').pop() || val, 28);
  return truncate(String(val));
}

/* ─── Preview box ─── */

function TilePreview({
  entry,
  width,
  height,
  sizeLabel,
}: {
  entry: CatalogEntry;
  width: number;
  height: number;
  sizeLabel: string;
}) {
  const Comp = entry.component as React.ComponentType<{ placementId?: string }>;
  const scale = 0.5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
      <div
        style={{
          width,
          height,
          overflow: 'hidden',
          borderRadius: 8,
          position: 'relative',
          background: 'var(--canvas-bg, #f3f4f6)',
          border: '1px solid var(--sidebar-border)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: `${100 / scale}%`,
            height: `${100 / scale}%`,
          }}
        >
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Comp placementId={entry.placementId} />
          </div>
        </div>
      </div>
      <span
        style={{
          fontSize: 9,
          fontFamily: 'ui-monospace, monospace',
          color: 'var(--sidebar-text-muted)',
          textAlign: 'center',
        }}
      >
        {sizeLabel} ({width}x{height})
      </span>
    </div>
  );
}

/* ─── Tile row ─── */

function TileRow({ entry }: { entry: CatalogEntry }) {
  const [expanded, setExpanded] = useState(false);

  const tiles = useBrandStore((s) => s.tiles);
  const brand = useBrandStore((s) => s.brand);
  const placementContent = useBrandStore((s) => s.placementContent);

  const tile = entry.tileId
    ? tiles.find((t) => t.id === entry.tileId)
    : tiles.find((t) => t.type === entry.type);

  const pcontent = entry.placementId ? placementContent?.[entry.placementId] : undefined;
  const mergedContent = {
    ...(tile?.content || {}),
    ...(pcontent || {}),
  } as Record<string, unknown>;

  return (
    <div
      style={{
        background: 'var(--sidebar-bg)',
        border: '1px solid var(--sidebar-border)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderBottom: '1px solid var(--sidebar-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--sidebar-text)' }}>
            {entry.label}
          </span>
          <span
            style={{
              fontSize: 10,
              fontFamily: 'ui-monospace, monospace',
              color: 'var(--sidebar-text-muted)',
              padding: '1px 6px',
              background: 'var(--sidebar-bg-hover)',
              borderRadius: 3,
            }}
          >
            {entry.type}
          </span>
          {tile && (
            <span
              style={{
                fontSize: 10,
                fontFamily: 'ui-monospace, monospace',
                color: 'var(--accent)',
                padding: '1px 6px',
                background: 'var(--accent-muted)',
                borderRadius: 3,
              }}
            >
              {tile.id}
            </span>
          )}
        </div>

        {entry.fields.length > 0 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              color: 'var(--sidebar-text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            {entry.fields.length} fields
            <ChevronDown
              size={12}
              style={{
                transform: expanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.15s',
              }}
            />
          </button>
        )}
      </div>

      {/* Previews at different sizes */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          padding: 16,
          overflowX: 'auto',
          alignItems: 'flex-start',
        }}
      >
        {entry.sizes.map((s) => (
          <TilePreview
            key={s.label}
            entry={entry}
            width={s.w}
            height={s.h}
            sizeLabel={s.label}
          />
        ))}
      </div>

      {/* Collapsible fields */}
      {expanded && entry.fields.length > 0 && (
        <div
          style={{
            padding: '8px 16px 12px',
            borderTop: '1px solid var(--sidebar-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {entry.fields.map((f) => {
            const color = TYPE_COLORS[f.type] || '#6b7280';
            const val = resolveValue(
              mergedContent,
              brand as unknown as Record<string, unknown>,
              f.contentKey,
            );
            return (
              <div
                key={f.contentKey}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 10,
                  lineHeight: '16px',
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'ui-monospace, monospace',
                    color: 'var(--sidebar-text-muted)',
                    flexShrink: 0,
                    minWidth: 100,
                  }}
                >
                  {f.name}
                </span>
                <span
                  style={{
                    fontFamily: 'ui-monospace, monospace',
                    color: 'var(--sidebar-text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {val}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Main Panel ─── */

export function DevToolsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div
      data-export-exclude="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'var(--sidebar-bg-elevated)',
        overflow: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 24px',
          background: 'var(--sidebar-bg)',
          borderBottom: '1px solid var(--sidebar-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--sidebar-text)' }}>
            Dev Tools — Tile Catalog
          </span>
          <span
            style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 4,
              background: 'var(--accent-muted)',
              color: 'var(--accent)',
              fontWeight: 600,
            }}
          >
            {TILE_CATALOG.length} tiles
          </span>
        </div>

        <button
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 6,
            border: 'none',
            background: 'var(--sidebar-bg-hover)',
            color: 'var(--sidebar-text-secondary)',
            cursor: 'pointer',
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Tile rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20 }}>
        {TILE_CATALOG.map((entry) => (
          <TileRow key={entry.type} entry={entry} />
        ))}
      </div>
    </div>
  );
}
