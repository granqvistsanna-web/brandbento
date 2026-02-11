/**
 * Control Panel - Sidebar shell.
 * Always shows GlobalControls (brand-level settings).
 * Tile-specific editing lives in each tile's FloatingToolbar.
 */
import React, { useState, useEffect } from "react";
import {
  useBrandStore,
} from "../store/useBrandStore";
import {
  RiSidebarFoldFill as PanelLeftClose,
  RiSidebarUnfoldFill as PanelLeft,
  RiStackFill as Layers,
  RiFontSize as Type,
  RiPaletteFill as Palette,
  RiMagicFill as Wand2,
  RiSparklingFill as Sparkles,
} from "react-icons/ri";
import { motion } from "motion/react";
import { Tooltip } from "./controls";
import GlobalControls from "./GlobalControls";

const ControlPanel = () => {
  const focusedTileId = useBrandStore((s) => s.focusedTileId);
  const undo = useBrandStore((s) => s.undo);
  const redo = useBrandStore((s) => s.redo);
  const setFocusedTile = useBrandStore((s) => s.setFocusedTile);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.metaKey || e.ctrlKey) &&
        ((e.key === "z" && e.shiftKey) || e.key === "Z")
      ) {
        e.preventDefault();
        redo();
      } else if (e.key === "Escape" && focusedTileId) {
        setFocusedTile(null);
      } else if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, focusedTileId, setFocusedTile]);

  return (
    <motion.div
      data-export-exclude="true"
      className="h-full flex flex-col flex-shrink-0 relative"
      style={{
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
      initial={false}
      animate={{ width: isCollapsed ? 48 : 400 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Collapse toggle */}
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-2 top-3 z-50 w-6 h-6 rounded flex items-center justify-center"
        style={{
          background: "var(--sidebar-bg-hover)",
          color: "var(--sidebar-text-muted)",
        }}
        whileHover={{
          background: "var(--sidebar-bg-active)",
          color: "var(--sidebar-text)"
        }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isCollapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
        </motion.div>
      </motion.button>

      {isCollapsed ? (
        /* Collapsed state - icon shortcuts */
        <div className="flex flex-col items-center pt-14 gap-1.5">
          {[
            { icon: Layers, label: "Layout" },
            { icon: Type, label: "Typography" },
            { icon: Palette, label: "Colors" },
            { icon: Wand2, label: "Themes" },
            { icon: Sparkles, label: "Logo" },
          ].map((item) => (
            <Tooltip key={item.label} content={item.label} position="right">
              <button
                onClick={() => setIsCollapsed(false)}
                className="w-9 h-9 rounded-md flex items-center justify-center transition-fast"
                style={{
                  color: "var(--sidebar-text-muted)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--sidebar-bg-hover)";
                  e.currentTarget.style.color = "var(--sidebar-text)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--sidebar-text-muted)";
                }}
              >
                <item.icon size={16} />
              </button>
            </Tooltip>
          ))}
        </div>
      ) : (
        /* Expanded state */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Panel header */}
          <div
            className="flex items-center justify-between flex-shrink-0 relative"
            style={{ paddingBlock: 22, paddingInline: 24 }}
          >
            <span
              style={{ color: "var(--sidebar-text)", fontSize: 20, fontWeight: 600, letterSpacing: "-0.025em" }}
            >
              Design
            </span>
            <div className="flex items-center gap-2 mr-8" />
            <div
              className="absolute bottom-0 left-0 right-0 h-px"
              style={{ background: "var(--sidebar-border-subtle)", marginInline: 16, opacity: 0.4 }}
            />
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto scrollbar-dark">
            <GlobalControls />
          </div>

          {/* Panel footer */}
          <div
            className="py-3.5 flex items-center justify-center gap-5 flex-shrink-0"
            style={{
              paddingInline: 24,
              borderTop: "1px solid var(--sidebar-border-subtle)",
            }}
          >
            <div className="flex items-center gap-1.5" style={{ opacity: 0.7 }}>
              <span className="kbd">⌘Z</span>
              <span className="text-11" style={{ color: "var(--sidebar-text-muted)" }}>Undo</span>
            </div>
            <div className="w-px h-3" style={{ background: "var(--sidebar-border-subtle)" }} />
            <div className="flex items-center gap-1.5" style={{ opacity: 0.7 }}>
              <span className="kbd">⌘\</span>
              <span className="text-11" style={{ color: "var(--sidebar-text-muted)" }}>Toggle</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ControlPanel;
