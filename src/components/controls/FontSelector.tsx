/**
 * Searchable font dropdown with category filtering and keyboard navigation.
 * Extracted from ControlPanel.jsx.
 */
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  RiArrowDownSLine as ChevronDown,
  RiCheckFill as Check,
  RiStarFill as Star,
  RiSearchLine as SearchIcon,
  RiCloseLine as CloseIcon,
  RiTimeLine as RecentIcon,
} from "react-icons/ri";
import { motion, AnimatePresence } from "motion/react";
import { GOOGLE_FONTS_MAP, type FontSource } from "../../data/googleFontsMetadata";
import { loadFontWithFallback } from "../../services/googleFonts";
import { PropRow } from "./index";
import { useFontSearch } from "../../hooks/useFontSearch";
import { useBrandStore } from "../../store/useBrandStore";

const CATEGORY_FILTERS = [
  { value: "all", label: "All" },
  { value: "sans-serif", label: "Sans" },
  { value: "serif", label: "Serif" },
  { value: "display", label: "Display" },
  { value: "monospace", label: "Mono" },
];

const FontItem = ({
  font,
  isSelected,
  onSelect,
  onHover,
}: {
  font: { family: string; category: string; curated?: boolean };
  isSelected: boolean;
  onSelect: () => void;
  onHover: () => void;
}) => (
  <button
    onClick={onSelect}
    onMouseEnter={onHover}
    className="w-full px-3 py-1.5 flex items-center gap-2 text-left transition-fast group"
    style={{
      background: isSelected ? "var(--accent-muted)" : "transparent",
      color: isSelected ? "var(--accent)" : "var(--sidebar-text)",
    }}
    onMouseOver={(e) => {
      if (!isSelected) (e.currentTarget as HTMLElement).style.background = "var(--sidebar-bg-hover)";
    }}
    onMouseOut={(e) => {
      (e.currentTarget as HTMLElement).style.background = isSelected ? "var(--accent-muted)" : "transparent";
    }}
  >
    <span
      className="text-13 truncate flex-1"
      style={{ fontFamily: `"${font.family}", ${font.category === 'serif' ? 'serif' : 'sans-serif'}` }}
    >
      {font.family}
    </span>
    {font.curated && !isSelected && (
      <Star size={9} style={{ color: "var(--sidebar-text-muted)", opacity: 0.4, flexShrink: 0 }} />
    )}
    {isSelected && <Check size={12} style={{ flexShrink: 0 }} />}
  </button>
);

export const FontSelector = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (family: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const loadedPreviewRef = useRef(new Set<string>());

  // Get recentFonts, addRecentFont, and setFontPreview from store
  const recentFonts = useBrandStore(state => state.recentFonts);
  const addRecentFont = useBrandStore(state => state.addRecentFont);
  const setFontPreview = useBrandStore(state => state.setFontPreview);

  // Map label to preview target: "Headline" → "primary", "Body" → "secondary"
  const target: "primary" | "secondary" = label === "Headline" ? "primary" : "secondary";

  // Debounce timer for preview to avoid rapid flashing
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Use the font search hook
  const { fonts: filteredFonts, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter } = useFontSearch(recentFonts);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
        setCategoryFilter(null);
        setFontPreview(null, target); // Clear preview on close
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setSearchQuery, setCategoryFilter, setFontPreview, target]);

  // Clear preview when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      // Clear any pending preview timer
      if (previewTimerRef.current) {
        clearTimeout(previewTimerRef.current);
        previewTimerRef.current = null;
      }
      setFontPreview(null, target);
    }
  }, [isOpen, setFontPreview, target]);

  // Calculate position & focus search on open
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const maxHeight = 420;
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const spaceAbove = rect.top - 8;
      const openUp = spaceBelow < 200 && spaceAbove > spaceBelow;

      setDropdownPos({
        top: openUp ? Math.max(8, rect.top - Math.min(maxHeight, spaceAbove)) : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
        if (listRef.current) {
          const selected = listRef.current.querySelector("[data-selected]");
          if (selected) (selected as HTMLElement).scrollIntoView({ block: "center" });
        }
      }, 80);
      setHighlightIdx(-1);
    }
  }, [isOpen]);

  // Compute section boundaries for recently-used / curated / more fonts
  const { actualRecentCount, firstCuratedIdx, firstNonCuratedIdx } = useMemo(() => {
    // Count how many recent fonts are actually in the filtered results
    const recentSet = new Set(recentFonts);
    let actualRecent = 0;
    // Recent fonts are at the start of the array (from useFontSearch hook)
    for (let i = 0; i < filteredFonts.length; i++) {
      if (recentSet.has(filteredFonts[i].family) && i === actualRecent) {
        actualRecent++;
      } else {
        break;
      }
    }

    // Find first curated font after recent section
    let firstCurated = -1;
    for (let i = actualRecent; i < filteredFonts.length; i++) {
      if (filteredFonts[i].curated) {
        firstCurated = i;
        break;
      }
    }

    // Find first non-curated font after recent section
    let firstNonCurated = -1;
    for (let i = actualRecent; i < filteredFonts.length; i++) {
      if (!filteredFonts[i].curated) {
        firstNonCurated = i;
        break;
      }
    }

    return {
      actualRecentCount: actualRecent,
      firstCuratedIdx: firstCurated,
      firstNonCuratedIdx: firstNonCurated,
    };
  }, [filteredFonts, recentFonts]);

  const handleFontHover = useCallback((family: string) => {
    // Clear any pending preview timer
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
    }

    // Debounce preview by 100ms to avoid rapid flashing
    previewTimerRef.current = setTimeout(() => {
      // Load font if not already loaded
      if (!loadedPreviewRef.current.has(family)) {
        loadedPreviewRef.current.add(family);
        const meta = GOOGLE_FONTS_MAP.get(family) as { source?: FontSource } | undefined;
        loadFontWithFallback(family, ["400"], 3000, meta?.source || "google").then(() => {
          // After font loads, trigger preview
          setFontPreview(family, target);
        });
      } else {
        // Font already loaded, trigger preview immediately
        setFontPreview(family, target);
      }
    }, 100);
  }, [target, setFontPreview]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      // Typing while not in input should focus search
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.target !== searchInputRef.current) {
          e.preventDefault();
          searchInputRef.current?.focus();
          // The input will handle the character
        }
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        // If we're in search input and have no highlight, start highlighting first item
        if (e.target === searchInputRef.current && highlightIdx < 0) {
          setHighlightIdx(0);
        } else {
          setHighlightIdx((i) => Math.min(i + 1, filteredFonts.length - 1));
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && highlightIdx >= 0) {
        e.preventDefault();
        addRecentFont(filteredFonts[highlightIdx].family);
        onChange(filteredFonts[highlightIdx].family);
        setFontPreview(null, target); // Clear preview
        setIsOpen(false);
        setSearchQuery('');
        setCategoryFilter(null);
      } else if (e.key === "Escape") {
        // First Escape clears search, second closes dropdown
        if (searchQuery) {
          e.preventDefault();
          setSearchQuery('');
        } else {
          setIsOpen(false);
          setCategoryFilter(null);
        }
      }
    },
    [isOpen, highlightIdx, filteredFonts, onChange, addRecentFont, setSearchQuery, setCategoryFilter, searchQuery, setFontPreview, target]
  );

  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-font-item]");
      items[highlightIdx]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIdx]);

  return (
    <div ref={ref}>
      <PropRow label={label}>
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 px-3 flex items-center gap-2 transition-fast"
          style={{
            height: 34,
            borderRadius: 12,
            background: isOpen ? "var(--sidebar-bg-hover)" : "transparent",
            border: `1px solid ${isOpen ? "var(--accent)" : "var(--sidebar-border-subtle)"}`,
            color: "var(--sidebar-text)",
            boxShadow: isOpen ? "var(--sidebar-focus-ring)" : "none",
          }}
        >
          <span
            className="text-11 shrink-0"
            style={{ color: "var(--sidebar-text-muted)", fontFamily: `"${value}", sans-serif` }}
          >
            Aa
          </span>
          <span
            className="text-12 truncate flex-1 text-left"
            style={{ fontFamily: `"${value}", sans-serif` }}
          >
            {value}
          </span>
          <ChevronDown
            size={12}
            style={{
              color: "var(--sidebar-text-muted)",
              transform: isOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.15s ease",
              flexShrink: 0,
            }}
          />
        </button>
      </PropRow>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="rounded-xl flex flex-col"
            style={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              zIndex: 9999,
              background: "var(--sidebar-bg-elevated)",
              border: "1px solid var(--sidebar-border)",
              boxShadow: "var(--shadow-xl)",
              maxHeight: "min(420px, 60vh)",
            }}
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="px-2.5 pt-2.5 pb-2">
              <div className="relative">
                <SearchIcon
                  size={14}
                  className="absolute left-2.5 top-1/2"
                  style={{
                    transform: "translateY(-50%)",
                    color: "var(--sidebar-text-muted)",
                  }}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search fonts..."
                  className="w-full pl-8 pr-8 py-1.5 text-12 rounded-lg transition-fast"
                  style={{
                    background: "transparent",
                    border: "1px solid var(--sidebar-border-subtle)",
                    color: "var(--sidebar-text)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border = "1px solid var(--accent)";
                    e.currentTarget.style.boxShadow = "var(--sidebar-focus-ring)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border = "1px solid var(--sidebar-border-subtle)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2"
                    style={{
                      transform: "translateY(-50%)",
                      color: "var(--sidebar-text-muted)",
                    }}
                  >
                    <CloseIcon size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Category pills */}
            <div
              className="px-2.5 pb-1.5"
              style={{ borderBottom: "1px solid var(--sidebar-border)" }}
            >
              <div className="flex flex-wrap gap-1 pb-0.5">
                {CATEGORY_FILTERS.map((cat) => {
                  const isActive = (cat.value === "all" && categoryFilter === null) || categoryFilter === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setCategoryFilter(cat.value === "all" ? null : cat.value as any);
                        setHighlightIdx(-1);
                      }}
                      className="px-2.5 py-0.5 rounded-full text-11 transition-fast"
                      style={{
                        background: isActive ? "var(--accent)" : "transparent",
                        color: isActive ? "#fff" : "var(--sidebar-text-muted)",
                        fontWeight: isActive ? 600 : 400,
                      }}
                      onMouseOver={(e) => {
                        if (!isActive)
                          (e.currentTarget as HTMLElement).style.background = "var(--sidebar-bg-hover)";
                      }}
                      onMouseOut={(e) => {
                        if (!isActive)
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font list */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto scrollbar-dark py-1"
              style={{ minHeight: 0 }}
            >
              {filteredFonts.length === 0 ? (
                <div
                  className="px-3 py-6 text-center text-12"
                  style={{ color: "var(--sidebar-text-muted)" }}
                >
                  {searchQuery ? "No fonts match your search" : "No fonts in this category"}
                </div>
              ) : (
                filteredFonts.map((font, idx) => {
                  const isSearching = searchQuery.trim().length > 0;
                  return (
                    <React.Fragment key={font.family}>
                      {/* Recently Used header */}
                      {!isSearching && idx === 0 && actualRecentCount > 0 && (
                        <div
                          className="px-3 pt-1.5 pb-1 text-11 font-semibold uppercase tracking-wider flex items-center gap-1.5"
                          style={{ color: "var(--sidebar-text-muted)" }}
                        >
                          <RecentIcon size={8} style={{ opacity: 0.5 }} />
                          Recently Used
                        </div>
                      )}
                      {/* Curated header (after recent section, or at start if no recents) */}
                      {!isSearching && idx === firstCuratedIdx && firstCuratedIdx >= 0 && (
                        <>
                          {actualRecentCount > 0 && (
                            <div
                              className="mx-3 my-1"
                              style={{ borderTop: "1px solid var(--sidebar-border)" }}
                            />
                          )}
                          <div
                            className="px-3 pt-1.5 pb-1 text-11 font-semibold uppercase tracking-wider flex items-center gap-1.5"
                            style={{ color: "var(--sidebar-text-muted)" }}
                          >
                            <Star size={8} style={{ opacity: 0.5 }} />
                            Curated
                          </div>
                        </>
                      )}
                      {/* More Fonts header */}
                      {!isSearching && idx === firstNonCuratedIdx && firstNonCuratedIdx > 0 && (
                        <>
                          <div
                            className="mx-3 my-1"
                            style={{ borderTop: "1px solid var(--sidebar-border)" }}
                          />
                          <div
                            className="px-3 pt-0.5 pb-1 text-11 font-semibold uppercase tracking-wider"
                            style={{ color: "var(--sidebar-text-muted)" }}
                          >
                            More fonts
                          </div>
                        </>
                      )}
                      <div
                        data-font-item
                        {...(value === font.family ? { "data-selected": true } : {})}
                        style={{
                          background:
                            highlightIdx === idx
                              ? "var(--sidebar-bg-hover)"
                              : undefined,
                        }}
                      >
                        <FontItem
                          font={font}
                          isSelected={value === font.family}
                          onSelect={() => {
                            addRecentFont(font.family);
                            onChange(font.family);
                            setFontPreview(null, target); // Clear preview
                            setIsOpen(false);
                            setSearchQuery('');
                            setCategoryFilter(null);
                          }}
                          onHover={() => handleFontHover(font.family)}
                        />
                      </div>
                    </React.Fragment>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div
              className="px-3 py-1.5 flex items-center justify-between text-11"
              style={{
                borderTop: "1px solid var(--sidebar-border)",
                color: "var(--sidebar-text-muted)",
              }}
            >
              <span>{filteredFonts.length} fonts</span>
              <span className="flex gap-2">
                <span><kbd className="kbd">&uarr;&darr;</kbd> navigate</span>
                <span><kbd className="kbd">&crarr;</kbd> select</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
