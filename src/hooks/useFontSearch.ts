/**
 * Font Search Hook
 *
 * Provides fuzzy search and category filtering for Google Fonts
 * with support for recently used fonts.
 *
 * @module hooks/useFontSearch
 */
import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { GOOGLE_FONTS, POPULAR_FONTS, type GoogleFontMeta } from '@/data/googleFontsMetadata';

/** Font category filter type (null means no filter) */
type FontCategory = GoogleFontMeta['category'] | null;

/**
 * Result object returned by useFontSearch hook.
 */
interface UseFontSearchResult {
  /** Filtered and sorted fonts array */
  fonts: GoogleFontMeta[];
  /** Current search query string */
  searchQuery: string;
  /** Function to update search query */
  setSearchQuery: (query: string) => void;
  /** Current category filter (null = all categories) */
  categoryFilter: FontCategory;
  /** Function to update category filter */
  setCategoryFilter: (category: FontCategory) => void;
  /** Number of recently used fonts in results */
  recentCount: number;
}

/**
 * Hook for searching and filtering Google Fonts.
 *
 * Features:
 * - Fuzzy search with Fuse.js (typo-tolerant)
 * - Category filtering (serif, sans-serif, display, handwriting, monospace)
 * - Recently used fonts appear first
 * - Popular fonts prioritized when no search query
 *
 * @param recentlyUsed - Array of recently used font family names (most recent first)
 * @returns Object with filtered fonts and control functions
 *
 * @example
 * function FontPicker() {
 *   const { fonts, searchQuery, setSearchQuery, setCategoryFilter } = useFontSearch(['Inter', 'Roboto']);
 *
 *   return (
 *     <>
 *       <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
 *       <button onClick={() => setCategoryFilter('serif')}>Serif only</button>
 *       {fonts.map(font => <FontOption key={font.family} font={font} />)}
 *     </>
 *   );
 * }
 */
export function useFontSearch(recentlyUsed: string[] = []): UseFontSearchResult {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FontCategory>(null);

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(
    () => new Fuse(GOOGLE_FONTS, {
      keys: ['family'],
      threshold: 0.3, // Lower = stricter matching
      distance: 100,
      includeScore: true,
    }),
    []
  );

  // Filter and search fonts
  const filteredFonts = useMemo(() => {
    let result = [...GOOGLE_FONTS];

    // Apply category filter first
    if (categoryFilter) {
      result = result.filter(f => f.category === categoryFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      // Re-create fuse with filtered list if category is applied
      const searchSource = categoryFilter
        ? new Fuse(result, { keys: ['family'], threshold: 0.3, distance: 100 })
        : fuse;

      const searchResults = searchSource.search(searchQuery);
      result = searchResults.map(r => r.item);
    } else if (!categoryFilter) {
      // No search and no filter: show popular fonts first
      const popular = result.filter(f => POPULAR_FONTS.includes(f.family));
      const rest = result.filter(f => !POPULAR_FONTS.includes(f.family));
      result = [...popular, ...rest];
    }

    return result;
  }, [categoryFilter, searchQuery, fuse]);

  // Organize: Recently Used fonts at top of list
  const organizedFonts = useMemo(() => {
    if (recentlyUsed.length === 0) return filteredFonts;

    // Separate recent fonts from rest
    const recent = filteredFonts.filter(f => recentlyUsed.includes(f.family));
    const rest = filteredFonts.filter(f => !recentlyUsed.includes(f.family));

    // Sort recent fonts by their order in recentlyUsed array
    const sortedRecent = recent.sort((a, b) =>
      recentlyUsed.indexOf(a.family) - recentlyUsed.indexOf(b.family)
    );

    return [...sortedRecent, ...rest];
  }, [filteredFonts, recentlyUsed]);

  return {
    fonts: organizedFonts,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    recentCount: recentlyUsed.length
  };
}
