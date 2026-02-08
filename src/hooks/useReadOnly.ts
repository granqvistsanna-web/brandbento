import { useContext } from 'react';
import { ReadOnlyContext } from '../context/ReadOnlyContext';

export function useReadOnly(): boolean {
    return useContext(ReadOnlyContext);
}
