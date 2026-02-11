import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Section } from './index';
import {
  LUMMI_COLLECTIONS,
  getCollectionImages,
  lummiImageUrl,
  hasApiKey,
  type LummiImage,
} from '../../services/lummiApi';
import { useBrandStore } from '../../store/useBrandStore';

function CollectionCard({
  name,
  count,
  thumbUrl,
  isActive,
  loading,
  onClick,
}: {
  name: string;
  count: number;
  thumbUrl: string | null;
  isActive: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full text-left relative overflow-hidden"
      style={{
        borderRadius: 10,
        border: isActive
          ? '2px solid var(--accent)'
          : '1px solid var(--sidebar-border)',
        padding: 0,
        background: 'transparent',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        opacity: loading ? 0.6 : 1,
        cursor: loading ? 'wait' : 'pointer',
      }}
      whileHover={{
        borderColor: isActive ? undefined : 'var(--sidebar-text-muted)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          height: 56,
          background: 'var(--sidebar-bg-active)',
          overflow: 'hidden',
          borderRadius: '9px 9px 0 0',
          position: 'relative',
        }}
      >
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'var(--sidebar-bg-hover)',
            }}
          />
        )}
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.3)',
            }}
          >
            <div
              className="animate-spin"
              style={{
                width: 16,
                height: 16,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
              }}
            />
          </div>
        )}
      </div>

      {/* Label */}
      <div
        className="flex items-center justify-between"
        style={{ padding: '6px 10px' }}
      >
        <span
          className="text-[10px] uppercase tracking-wider"
          style={{
            color: isActive
              ? 'var(--sidebar-text)'
              : 'var(--sidebar-text-secondary)',
            fontWeight: 500,
          }}
        >
          {name}
        </span>
        <span
          className="text-[9px]"
          style={{ color: 'var(--sidebar-text-muted)' }}
        >
          {count}
        </span>
      </div>
    </motion.button>
  );
}

export function ImageCollections() {
  const activeCollectionId = useBrandStore((s) => s.activeCollectionId);
  const setImageCollection = useBrandStore((s) => s.setImageCollection);

  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const thumbsLoaded = useRef(false);

  // Lazy-load thumbnails on first render (staggered to respect rate limit)
  useEffect(() => {
    if (thumbsLoaded.current || !hasApiKey()) return;
    thumbsLoaded.current = true;

    let cancelled = false;
    (async () => {
      for (const col of LUMMI_COLLECTIONS) {
        if (cancelled) break;
        try {
          const images = await getCollectionImages(col.id);
          if (cancelled) break;
          if (images[0]?.url) {
            setThumbnails((prev) => ({
              ...prev,
              [col.id]: lummiImageUrl(images[0].url, { w: 300, fm: 'webp' }),
            }));
          }
        } catch {
          // Skip failed thumbnails silently
        }
        // Stagger requests ~1s apart to stay under 10 req/min
        if (!cancelled) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const handleSelect = async (collectionId: string) => {
    // Deselect
    if (activeCollectionId === collectionId) {
      setImageCollection(null, []);
      setError(null);
      return;
    }

    if (!hasApiKey()) {
      setError('Add VITE_LUMMI_API_KEY to .env');
      return;
    }

    setLoading(collectionId);
    setError(null);
    try {
      const images = await getCollectionImages(collectionId);
      const urls = images.map((img: LummiImage) =>
        lummiImageUrl(img.url, { w: 800, fm: 'webp' })
      );
      setImageCollection(collectionId, urls);
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes('Rate limited')
          ? 'Rate limited, try again shortly'
          : 'Could not load collection'
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <Section title="Image Collections" defaultOpen={false}>
      {!hasApiKey() && (
        <p
          className="text-[10px]"
          style={{ color: 'var(--sidebar-text-muted)', marginBottom: 8 }}
        >
          Add VITE_LUMMI_API_KEY to .env to enable
        </p>
      )}
      {error && (
        <p
          className="text-[10px]"
          style={{ color: 'var(--sidebar-text-muted)', marginBottom: 8 }}
        >
          {error}
        </p>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}
      >
        {LUMMI_COLLECTIONS.map((col) => (
          <CollectionCard
            key={col.id}
            name={col.name}
            count={col.count}
            thumbUrl={thumbnails[col.id] ?? null}
            isActive={activeCollectionId === col.id}
            loading={loading === col.id}
            onClick={() => handleSelect(col.id)}
          />
        ))}
      </div>
    </Section>
  );
}
