import { useState, useCallback } from 'react';

interface UseHoverPreviewResult<T> {
  activeValue: T;
  isPreview: boolean;
  startPreview: (value: T) => void;
  endPreview: () => void;
  commit: (value: T, onCommit: (value: T) => void) => void;
}

/**
 * Hook for hover preview pattern
 * Shows temporary preview without committing to state until clicked
 *
 * @param committedValue The currently committed value in state
 * @returns activeValue (preview or committed), isPreview flag, and control functions
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
