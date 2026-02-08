/**
 * Read-Only Mode Hook
 *
 * Provides context and utilities for detecting and managing read-only mode.
 * Used for shared brand views where editing should be disabled.
 *
 * @module hooks/useReadOnly
 */
import { createContext, useContext, ReactNode, useMemo } from 'react';

/**
 * React context for read-only state.
 * Default is false (editing enabled).
 */
const ReadOnlyContext = createContext<boolean>(false);

/**
 * Props for ReadOnlyProvider component.
 */
interface ReadOnlyProviderProps {
  /** Child components that need access to read-only state */
  children: ReactNode;
}

/**
 * Provider component for read-only mode.
 *
 * Wraps the application to provide read-only context based on URL params.
 * Checks for `?view=readonly` in the URL to enable read-only mode.
 *
 * @example
 * // In App.tsx
 * function App() {
 *   return (
 *     <ReadOnlyProvider>
 *       <BentoCanvas />
 *       <ControlPanel />
 *     </ReadOnlyProvider>
 *   );
 * }
 */
export function ReadOnlyProvider({ children }: ReadOnlyProviderProps) {
  // Check URL params once on mount
  const isReadOnly = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'readonly';
  }, []);

  return (
    <ReadOnlyContext.Provider value={isReadOnly}>
      {children}
    </ReadOnlyContext.Provider>
  );
}

/**
 * Hook for checking if the app is in read-only mode.
 *
 * Must be used within a ReadOnlyProvider.
 *
 * @returns true if app is in read-only mode (shared view), false otherwise
 *
 * @example
 * function EditButton() {
 *   const isReadOnly = useReadOnly();
 *
 *   if (isReadOnly) return null; // Hide edit button in read-only mode
 *
 *   return <button>Edit</button>;
 * }
 */
export function useReadOnly(): boolean {
  return useContext(ReadOnlyContext);
}

/**
 * Utility function to check read-only mode outside of React components.
 *
 * Use this when you need to check read-only status in non-component code
 * (e.g., event handlers, utilities). For components, prefer useReadOnly hook.
 *
 * @returns true if URL contains `?view=readonly`, false otherwise
 *
 * @example
 * // In a utility function
 * function handleShare() {
 *   if (isReadOnlyMode()) {
 *     console.log('Cannot share in read-only mode');
 *     return;
 *   }
 *   // ... sharing logic
 * }
 */
export function isReadOnlyMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('view') === 'readonly';
}
