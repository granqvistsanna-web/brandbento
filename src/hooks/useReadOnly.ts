import { createContext, useContext, ReactNode, useMemo } from 'react';

const ReadOnlyContext = createContext<boolean>(false);

interface ReadOnlyProviderProps {
  children: ReactNode;
}

export function ReadOnlyProvider({ children }: ReadOnlyProviderProps) {
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

export function useReadOnly(): boolean {
  return useContext(ReadOnlyContext);
}

export function isReadOnlyMode(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('view') === 'readonly';
}
