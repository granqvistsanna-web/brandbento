/**
 * Hover Preview Hook
 *
 * Implements the "preview on hover, commit on click" pattern
 * commonly used for font pickers, color selectors, etc.
 *
 * @module hooks/useHoverPreview
 */
import { useState, useCallback } from 'react';

/**
 * Result object returned by useHoverPreview hook.
 * @template T - Type of the value being previewed
 */
interface UseHoverPreviewResult<T> {
  /** Current active value (preview value if hovering, otherwise committed value) */
  activeValue: T;
  /** Whether a preview is currently active */
  isPreview: boolean;
  /** Start previewing a value (call on mouseenter) */
  startPreview: (value: T) => void;
  /** End preview and revert to committed value (call on mouseleave) */
  endPreview: () => void;
  /** Commit a value and end preview (call on click) */
  commit: (value: T, onCommit: (value: T) => void) => void;
}

/**
 * Hook for implementing hover preview pattern.
 *
 * Shows a temporary preview value on hover without committing to state.
 * The preview is discarded on mouse leave, or committed on click.
 * Useful for font pickers, color swatches, theme previews, etc.
 *
 * @template T - Type of the value being previewed
 * @param committedValue - The currently committed value in state
 * @returns Object with activeValue, preview state, and control functions
 *
 * @example
 * function FontOption({ font, currentFont, onSelect }) {
 *   const { activeValue, startPreview, endPreview, commit } = useHoverPreview(currentFont);
 *
 *   return (
 *     <button
 *       onMouseEnter={() => startPreview(font)}
 *       onMouseLeave={endPreview}
 *       onClick={() => commit(font, onSelect)}
 *       style={{ fontFamily: activeValue }}
 *     >
 *       {font}
 *     </button>
 *   );
 * }
 */
export function useHoverPreview<T>(committedValue: T): UseHoverPreviewResult<T> {
  const [previewValue, setPreviewValue] = useState<T | null>(null);

  const startPreview = useCallback((value: T) => {
    setPreviewValue(value);
  }, []);

  const endPreview = useCallback(() => {
    setPreviewValue(null);
  }, []);

  const commit = useCallback((value: T, onCommit: (value: T) => void) => {
    onCommit(value);
    setPreviewValue(null);
  }, []);

  // Use preview value if set, otherwise use committed value
  const activeValue = previewValue !== null ? previewValue : committedValue;

  return {
    activeValue,
    isPreview: previewValue !== null,
    startPreview,
    endPreview,
    commit
  };
}
