import { createContext } from 'react';

/**
 * React context for read-only state.
 * Default is false (editing enabled).
 */
export const ReadOnlyContext = createContext<boolean>(false);
