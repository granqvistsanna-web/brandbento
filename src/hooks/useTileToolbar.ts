import { useRef, useState, useEffect } from 'react';
import { useBrandStore } from '@/store/useBrandStore';

export function useTileToolbar(
  placementId?: string,
  externalRef?: React.RefObject<HTMLDivElement | null>,
) {
  const focusedTileId = useBrandStore((s) => s.focusedTileId);
  const isFocused = placementId != null && focusedTileId === placementId;

  const internalRef = useRef<HTMLDivElement>(null);
  const containerRef = externalRef || internalRef;
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isFocused || !containerRef.current) {
      setAnchorRect(null);
      return;
    }
    setAnchorRect(containerRef.current.getBoundingClientRect());

    const update = () => {
      if (containerRef.current) setAnchorRect(containerRef.current.getBoundingClientRect());
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isFocused, containerRef]);

  return { isFocused, containerRef, anchorRect };
}
