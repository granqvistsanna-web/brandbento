/**
 * Searchable font dropdown with category filtering and keyboard navigation.
 * Extracted from ControlPanel.jsx.
 */
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  RiArrowDownSLine as ChevronDown,
  RiCheckFill as Check,
  RiStarFill as Star,
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
  const loadedPreviewRef = useRef(new Set<string>());

  // Get recentFonts from store
  const recentFonts = useBrandStore(state => state.recentFonts);

  // Use the font search hook
  const { fonts: filteredFonts, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, recentCount } = useFontSearch(recentFonts);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        ref.current && !ref.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        if (listRef.current) {
          const selected = listRef.current.querySelector("[data-selected]");
          if (selected) (selected as HTMLElement).scrollIntoView({ block: "center" });
        }
      }, 80);
      setHighlightIdx(-1);
    }
  }, [isOpen]);

  const firstNonCuratedIdx = useMemo(() => {
    const idx = filteredFonts.findIndex((f) => !f.curated);
    // If we have recent fonts, adjust the index
    return idx >= 0 && recentCount > 0 ? idx + 1 : idx;
  }, [filteredFonts, recentCount]);

  const handleFontHover = useCallback((family: string) => {
    if (!loadedPreviewRef.current.has(family)) {
      loadedPreviewRef.current.add(family);
      const meta = GOOGLE_FONTS_MAP.get(family) as { source?: FontSource } | undefined;
      loadFontWithFallback(family, ["400"], 3000, meta?.source || "google");
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIdx((i) => Math.min(i + 1, filteredFonts.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && highlightIdx >= 0) {
        e.preventDefault();
        onChange(filteredFonts[highlightIdx].family);
        setIsOpen(false);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    },
    [isOpen, highlightIdx, filteredFonts, onChange]
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
            {/* Category pills */}
            <div
              className="px-2.5 pt-2.5 pb-1.5"
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
                  No fonts in this category
                </div>
              ) : (
                filteredFonts.map((font, idx) => (
                  <React.Fragment key={font.family}>
                    {idx === 0 && font.curated && (
                      <div
                        className="px-3 pt-1.5 pb-1 text-11 font-semibold uppercase tracking-wider flex items-center gap-1.5"
                        style={{ color: "var(--sidebar-text-muted)" }}
                      >
                        <Star size={8} style={{ opacity: 0.5 }} />
                        Curated
                      </div>
                    )}
                    {idx === firstNonCuratedIdx && firstNonCuratedIdx > 0 && (
                      <>
                        <div
                          className="mx-3 my-1"
                          style={{
                            borderTop: "1px solid var(--sidebar-border)",
                          }}
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
                          onChange(font.family);
                          setIsOpen(false);
                        }}
                        onHover={() => handleFontHover(font.family)}
                      />
                    </div>
                  </React.Fragment>
                ))
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
