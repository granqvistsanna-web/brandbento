import { useEffect } from 'react';
import { useFontSearch } from '@/hooks/useFontSearch';
import { useHoverPreview } from '@/hooks/useHoverPreview';
import { FontPickerList } from './FontPickerList';
import type { GoogleFontMeta } from '@/data/googleFontsMetadata';

interface FontPickerProps {
  currentFont: string;
  recentFonts: string[];
  onSelect: (family: string) => void;
  onPreviewChange?: (family: string | null) => void;
  height?: number;
}

type CategoryFilter = GoogleFontMeta['category'] | null;

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'sans-serif', label: 'Sans' },
  { value: 'serif', label: 'Serif' },
  { value: 'display', label: 'Display' },
  { value: 'monospace', label: 'Mono' },
];

/**
 * Font picker with search, category filters, and virtualized list
 *
 * Features:
 * - Fuzzy search (typo-tolerant) via Fuse.js
 * - Category filters: All, Sans, Serif, Display, Mono
 * - Popular fonts shown by default
 * - Recently used fonts at top of list
 * - Font names rendered in their own typeface on hover/load
 * - Hover preview without committing to state
 * - Virtualized list for smooth scrolling with 60+ fonts
 */
export function FontPicker({
  currentFont,
  recentFonts,
  onSelect,
  onPreviewChange,
  height = 320
}: FontPickerProps) {
  const {
    fonts,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    recentCount
  } = useFontSearch(recentFonts);

  const {
    activeValue,
    isPreview,
    startPreview,
    endPreview,
    commit
  } = useHoverPreview(currentFont);

  // Notify parent of preview changes
  useEffect(() => {
    if (onPreviewChange) {
      onPreviewChange(isPreview ? activeValue : null);
    }
  }, [activeValue, isPreview, onPreviewChange]);

  const handleSelect = (family: string) => {
    commit(family, onSelect);
  };

  const handleHover = (family: string | null) => {
    if (family) {
      startPreview(family);
    } else {
      endPreview();
    }
  };

  return (
    <div className="font-picker">
      {/* Search input */}
      <div className="font-picker-search">
        <input
          type="text"
          placeholder="Search fonts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="font-picker-search-input"
          autoFocus
        />
      </div>

      {/* Category filters */}
      <div className="font-picker-filters">
        {CATEGORY_OPTIONS.map(option => (
          <button
            key={option.value || 'all'}
            type="button"
            className={`font-picker-filter-btn ${categoryFilter === option.value ? 'active' : ''}`}
            onClick={() => setCategoryFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Font count */}
      <div className="font-picker-count">
        {fonts.length} font{fonts.length !== 1 ? 's' : ''}
        {recentCount > 0 && ` (${recentCount} recent)`}
      </div>

      {/* Virtualized list */}
      <div className="font-picker-list-container">
        <FontPickerList
          fonts={fonts}
          selectedFont={currentFont}
          recentFonts={recentFonts}
          onSelect={handleSelect}
          onHover={handleHover}
          height={height}
        />
      </div>
    </div>
  );
}
