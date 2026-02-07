import { memo, useCallback } from 'react';
import { List, useListRef, type RowComponentProps } from 'react-window';
import type { GoogleFontMeta } from '@/data/googleFontsMetadata';
import { loadFont, isFontLoaded } from '@/services/googleFonts';

interface FontPickerListProps {
  fonts: GoogleFontMeta[];
  selectedFont: string;
  recentFonts: string[];
  onSelect: (family: string) => void;
  onHover: (family: string | null) => void;
  height: number;
}

const ITEM_HEIGHT = 48;

// Track which fonts have been loaded for preview
const previewLoadedFonts = new Set<string>();

// RowProps interface for react-window v2
interface FontRowProps {
  fonts: GoogleFontMeta[];
  selectedFont: string;
  recentFonts: string[];
  onSelect: (family: string) => void;
  handleHover: (family: string | null) => void;
}

// Row component for react-window v2
function FontRow({
  index,
  style,
  fonts,
  selectedFont,
  recentFonts,
  onSelect,
  handleHover,
}: RowComponentProps<FontRowProps>) {
  const font = fonts[index];
  const isSelected = font.family === selectedFont;
  const isRecent = recentFonts.includes(font.family);
  const isLoaded = previewLoadedFonts.has(font.family) || isFontLoaded(font.family);

  return (
    <div
      style={style}
      className={`font-picker-row ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(font.family)}
      onMouseEnter={() => handleHover(font.family)}
      onMouseLeave={() => handleHover(null)}
      role="option"
      aria-selected={isSelected}
    >
      <span
        className="font-picker-name"
        style={{
          fontFamily: isLoaded ? `"${font.family}", system-ui` : 'system-ui'
        }}
      >
        {font.family}
      </span>
      <div className="font-picker-meta">
        {isRecent && <span className="font-picker-badge recent">Recent</span>}
        <span className="font-picker-category">{font.category}</span>
      </div>
    </div>
  );
}

export const FontPickerList = memo(function FontPickerList({
  fonts,
  selectedFont,
  recentFonts,
  onSelect,
  onHover,
  height
}: FontPickerListProps) {
  const listRef = useListRef(null);

  // Load font when hovering for preview
  const handleHover = useCallback((family: string | null) => {
    if (family && !previewLoadedFonts.has(family) && !isFontLoaded(family)) {
      loadFont(family, ['400']).then(() => {
        previewLoadedFonts.add(family);
      }).catch(() => {
        // Ignore preview load failures - fallback font will be shown
      });
    }
    onHover(family);
  }, [onHover]);

  return (
    <List<FontRowProps>
      listRef={listRef}
      defaultHeight={height}
      rowCount={fonts.length}
      rowHeight={ITEM_HEIGHT}
      overscanCount={5}
      rowComponent={FontRow}
      rowProps={{
        fonts,
        selectedFont,
        recentFonts,
        onSelect,
        handleHover,
      }}
    />
  );
});
