import { useMemo, type ReactNode } from 'react';
import { ReadOnlyContext } from '../context/ReadOnlyContext';

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
