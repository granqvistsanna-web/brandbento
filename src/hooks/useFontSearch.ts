import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { GOOGLE_FONTS, POPULAR_FONTS, type GoogleFontMeta } from '@/data/googleFontsMetadata';

type FontCategory = GoogleFontMeta['category'] | null;

interface UseFontSearchResult {
  fonts: GoogleFontMeta[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: FontCategory;
  setCategoryFilter: (category: FontCategory) => void;
  recentCount: number;
}

/**
 * Hook for searching and filtering Google Fonts
 * Uses Fuse.js for fuzzy (typo-tolerant) search
 *
 * @param recentlyUsed Array of recently used font family names (most recent first)
 * @returns Filtered fonts list and control functions
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
