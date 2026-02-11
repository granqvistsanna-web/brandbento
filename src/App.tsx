import { useState, useRef, useEffect, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { useViewportHeight } from "./hooks/useViewportHeight";
// @ts-expect-error - legacy component
import BentoCanvas from "./components/BentoCanvasNew";
// @ts-expect-error - missing types
import ControlPanel from "./components/ControlPanel";
import { useBrandStore, exportAsCSS, exportAsJSON } from "./store/useBrandStore";
import { useTheme } from "./hooks/useTheme";
import { ReadOnlyProvider } from './components/ReadOnlyProvider';
import { useReadOnly } from './hooks/useReadOnly';
import { ThemeToggle } from "./components/ThemeToggle";
import { DevToolsPanel } from "./components/DevToolsPanel";

import toast, { Toaster } from 'react-hot-toast';
import { generateShareUrl, copyToClipboard } from './utils/sharing';
import { exportToPng } from './utils/export';
import {
  RiArrowDownSLine as ChevronDown,
  RiArrowGoBackFill as RotateCcw,
  RiArrowGoForwardFill as RotateCw,
  RiDownloadFill as Download,
  RiShareForwardFill as Share2,
  RiShuffleFill as Shuffle,
  RiPaletteFill as Palette,
  RiFontSize2 as FontSize,
  RiFullscreenFill as Maximize2,
} from "react-icons/ri";
import { motion, AnimatePresence } from "motion/react";
import "./index.css";

const EASE_CURVE: [number, number, number, number] = [0.4, 0, 0.2, 1];
const TRANSITION_FAST = { duration: 0.1, ease: EASE_CURVE };
const TRANSITION_BASE = { duration: 0.15, ease: EASE_CURVE };

// Figma-style toolbar button
const ToolbarButton = ({
  icon: Icon,
  label,
  shortcut,
  active,
  onClick,
  disabled,
}: {
  icon: React.ElementType;
  label?: string;
  shortcut?: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <motion.button
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="icon-btn"
        style={{
          background: active ? "var(--accent-muted)" : "transparent",
          color: active
            ? "var(--accent)"
            : disabled
              ? "var(--sidebar-text-muted)"
              : "var(--sidebar-text-secondary)",
          opacity: disabled ? 0.4 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        transition={TRANSITION_FAST}
      >
        <Icon size={16} />
      </motion.button>

      <AnimatePresence>
        {showTooltip && label && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={TRANSITION_FAST}
            className="absolute top-full left-1/2 -translate-x-1/2 z-50"
            style={{ marginTop: "var(--space-2)" }}
          >
            <div
              className="tooltip flex items-center"
              style={{ gap: "var(--space-2)" }}
            >
              <span>{label}</span>
              {shortcut && <span className="kbd">{shortcut}</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Toolbar divider — subtle warm separator
const ToolbarDivider = () => (
  <div
    style={{
      width: 1,
      height: 14,
      background: "var(--sidebar-border-subtle)",
      marginInline: "var(--space-2)",
      opacity: 0.5,
    }}
  />
);

// Zoom control
const ZoomControl = ({
  zoom,
  onZoomChange,
}: {
  zoom: number;
  onZoomChange: (nextZoom: number) => void;
}) => {
  const clampZoom = (value: number) => Math.max(25, Math.min(200, value));

  return (
    <div
      className="flex items-center"
      style={{ gap: "var(--space-1)", paddingInline: "var(--space-2)" }}
    >
      <motion.button
        onClick={() => onZoomChange(clampZoom(zoom - 25))}
        aria-label="Zoom out"
        className="icon-btn"
        style={{ width: 24, height: 24 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={TRANSITION_FAST}
      >
        <span
          className="text-12 font-medium"
          style={{ color: "var(--sidebar-text-secondary)" }}
        >
          -
        </span>
      </motion.button>
      <div
        className="w-12 text-center text-12 font-medium"
        style={{ color: "var(--sidebar-text)" }}
      >
        {zoom}%
      </div>
      <motion.button
        onClick={() => onZoomChange(clampZoom(zoom + 25))}
        aria-label="Zoom in"
        className="icon-btn"
        style={{ width: 24, height: 24 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={TRANSITION_FAST}
      >
        <span
          className="text-12 font-medium"
          style={{ color: "var(--sidebar-text-secondary)" }}
        >
          +
        </span>
      </motion.button>
    </div>
  );
};

// Logo/Brand mark with Osmo-style accent
const AppLogo = () => (
  <div className="flex items-center" style={{ paddingInline: "var(--space-4)" }}>
    <span
      className="tracking-tight"
      style={{ color: "var(--sidebar-text)", fontSize: 17, letterSpacing: "-0.02em" }}
    >
      <span style={{ fontWeight: 700 }}>Brand</span>
      <span style={{ color: "var(--sidebar-text-secondary)", fontWeight: 400 }}>Bento</span>
    </span>
  </div>
);

// Export menu dropdown
const ExportMenu = ({ canvasRef }: { canvasRef: React.RefObject<HTMLDivElement | null> }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const brand = useBrandStore((s) => s.brand);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = (format: "css" | "json") => {
    const content = format === "css" ? exportAsCSS(brand) : exportAsJSON(brand);
    const filename = `brand-tokens.${format}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const handleExportPng = async () => {
    if (!canvasRef.current) {
      toast.error('Canvas not ready');
      return;
    }

    setIsExporting(true);
    try {
      await exportToPng(canvasRef.current, 'brandbento');
      toast.success('PNG exported!');
      setIsOpen(false);
    } catch (err) {
      console.error('PNG export failed:', err);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="btn-figma btn-figma-accent"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={TRANSITION_FAST}
      >
        <Download size={14} />
        <span>Export</span>
        <ChevronDown size={12} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={TRANSITION_BASE}
            className="absolute top-full right-0 w-44 rounded-lg z-50"
            style={{
              marginTop: "var(--space-1)",
              paddingBlock: "var(--space-1)",
              background: "var(--sidebar-bg-elevated)",
              border: "1px solid var(--sidebar-border)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <button
              onClick={handleExportPng}
              disabled={isExporting}
              className="w-full flex items-center text-left transition-fast"
              style={{
                padding: "var(--space-2) var(--space-3)",
                gap: "var(--space-2)",
                color: isExporting ? "var(--sidebar-text-muted)" : "var(--sidebar-text)",
                cursor: isExporting ? 'wait' : 'pointer',
              }}
              onMouseEnter={(e) =>
                !isExporting && (e.currentTarget.style.background = "var(--sidebar-bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <span className="text-11">{isExporting ? 'Exporting...' : 'Export as PNG'}</span>
              <span
                className="text-10 rounded"
                style={{
                  marginLeft: "auto",
                  padding: "var(--space-1) var(--space-1)",
                  background: "var(--sidebar-bg-active)",
                  color: "var(--sidebar-text-muted)",
                }}
              >
                .png
              </span>
            </button>
            <button
              onClick={() => handleExport("css")}
              className="w-full flex items-center text-left transition-fast"
              style={{
                padding: "var(--space-2) var(--space-3)",
                gap: "var(--space-2)",
                color: "var(--sidebar-text)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--sidebar-bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <span className="text-11">Export as CSS</span>
              <span
                className="text-10 rounded"
                style={{
                  marginLeft: "auto",
                  padding: "var(--space-1) var(--space-1)",
                  background: "var(--sidebar-bg-active)",
                  color: "var(--sidebar-text-muted)",
                }}
              >
                .css
              </span>
            </button>
            <button
              onClick={() => handleExport("json")}
              className="w-full flex items-center text-left transition-fast"
              style={{
                padding: "var(--space-2) var(--space-3)",
                gap: "var(--space-2)",
                color: "var(--sidebar-text)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--sidebar-bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <span className="text-11">Export as JSON</span>
              <span
                className="text-10 rounded"
                style={{
                  marginLeft: "auto",
                  padding: "var(--space-1) var(--space-1)",
                  background: "var(--sidebar-bg-active)",
                  color: "var(--sidebar-text-muted)",
                }}
              >
                .json
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// File menu dropdown
const FileMenu = ({ onReset, onShare }: { onReset: () => void; onShare: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const brand = useBrandStore((s) => s.brand);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleExportFile = (format: "css" | "json") => {
    const content = format === "css" ? exportAsCSS(brand) : exportAsJSON(brand);
    const filename = `brand-tokens.${format}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    const state = useBrandStore.getState();
    const data = JSON.stringify({ brand: state.brand, tiles: state.tiles }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "moodboard.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Moodboard saved!");
  };

  const handleOpen = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.brand) {
            const { brand, tiles, tileSurfaces, placementContent, history } = useBrandStore.getState();
            useBrandStore.setState({
              brand: data.brand,
              ...(data.tiles ? { tiles: data.tiles } : {}),
              history: {
                past: [...history.past, { brand, tiles, tileSurfaces, placementContent }],
                future: [],
              },
            });
            toast.success("Moodboard loaded!");
          } else {
            toast.error("Invalid moodboard file");
          }
        } catch {
          toast.error("Failed to parse file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center rounded-md transition-fast"
        style={{
          gap: "var(--space-1)",
          padding: "var(--space-2) var(--space-3)",
          background: isOpen ? "var(--sidebar-bg-hover)" : "transparent",
          color: "var(--sidebar-text-secondary)",
        }}
        whileHover={{ background: "var(--sidebar-bg-hover)" }}
        transition={TRANSITION_FAST}
      >
        <span className="text-12 font-medium">File</span>
        <ChevronDown size={12} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={TRANSITION_BASE}
            className="absolute top-full left-0 w-52 rounded-lg z-50"
            style={{
              marginTop: "var(--space-1)",
              paddingBlock: "var(--space-1)",
              background: "var(--sidebar-bg-elevated)",
              border: "1px solid var(--sidebar-border)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            {[
              { label: "New Moodboard", shortcut: "N", action: onReset },
              { label: "Open...", shortcut: "O", action: handleOpen },
              { divider: true },
              { label: "Save", shortcut: "S", action: handleSave },
              { label: "Export as CSS", action: () => handleExportFile("css") },
              { label: "Export as JSON", action: () => handleExportFile("json") },
              { divider: true },
              { label: "Share...", action: onShare },
              { label: "Reset to Defaults", action: onReset },
            ].map((item, i) =>
              item.divider ? (
                <div key={i} className="divider-h" style={{ marginInline: "var(--space-2)" }} />
              ) : (
                <button
                  key={i}
                  onClick={() => {
                    item.action?.();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between text-left transition-fast"
                  style={{
                    padding: "var(--space-2) var(--space-3)",
                    color: "var(--sidebar-text)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--sidebar-bg-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span className="text-11">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-11" style={{ color: "var(--sidebar-text-muted)" }}>
                      {item.shortcut}
                    </span>
                  )}
                </button>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function AppContent() {
  // Initialize theme management
  useTheme();

  const isReadOnly = useReadOnly();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [showDevTools, setShowDevTools] = useState(false);


  const toggleDevTools = useCallback(() => setShowDevTools((v) => !v), []);

  const { undo, redo, history, shuffleBrand, shuffleColors, shuffleTypography, resetToDefaults } =
    useBrandStore(
      useShallow((s) => ({
        undo: s.undo,
        redo: s.redo,
        history: s.history,
        shuffleBrand: s.shuffleBrand,
        shuffleColors: s.shuffleColors,
        shuffleTypography: s.shuffleTypography,
        resetToDefaults: s.resetToDefaults,
      }))
    );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (mod && e.shiftKey && e.key === 'd') {
        e.preventDefault();
        toggleDevTools();
      }

      // Undo: Cmd+Z
      if (mod && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }

      // Redo: Cmd+Shift+Z
      if (mod && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
      }

      // Shuffle shortcuts (only when not typing in an input)
      if (!isInput && !mod) {
        // Space: shuffle all
        if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          shuffleBrand();
        }
        // C: shuffle colors only
        if (e.key === 'c') {
          e.preventDefault();
          shuffleColors();
        }
        // T: shuffle typography only
        if (e.key === 't') {
          e.preventDefault();
          shuffleTypography();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [toggleDevTools, undo, redo, shuffleBrand, shuffleColors, shuffleTypography]);

  const handleShare = async () => {
    const { brand, tiles } = useBrandStore.getState();
    const shareUrl = generateShareUrl({ brand, tiles });
    const success = await copyToClipboard(shareUrl);
    if (success) {
      toast.success('Copied!');
    } else {
      toast.error('Failed to copy link');
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      'Reset moodboard to defaults? This can be undone with Cmd+Z.'
    );
    if (confirmed) {
      resetToDefaults();
      toast.success('Moodboard reset!');
    }
  };

  const viewportHeight = useViewportHeight();

  return (
    <div
      className={`flex flex-col overflow-hidden ${isReadOnly ? 'read-only-mode' : ''}`}
      style={{ height: viewportHeight }}
    >
      {/* Read-only banner */}
      {isReadOnly && (
        <div className="read-only-banner">
          View-only mode
          <a href={window.location.pathname}>Create your own</a>
        </div>
      )}

      {/* === TOP TOOLBAR (Figma Style) === */}
      {!isReadOnly && (
        <header
          data-export-exclude="true"
          className="flex items-center justify-between z-20 flex-shrink-0"
          style={{
            height: 52,
            paddingInline: "var(--space-5)",
            background: "var(--sidebar-bg)",
            borderBottom: "1px solid var(--sidebar-border-subtle)",
          }}
        >
          {/* Left: Logo + File Menu */}
          <div className="flex items-center" style={{ gap: "var(--space-1)" }}>
            <AppLogo />

            <ToolbarDivider />

            <FileMenu onReset={handleReset} onShare={handleShare} />
          </div>

          {/* Center: Tool buttons */}
          <div className="flex items-center" style={{ gap: "var(--space-1-5)" }}>
            <ToolbarButton
              icon={RotateCcw}
              label="Undo"
              shortcut="⌘Z"
              onClick={undo}
              disabled={history.past.length === 0}
            />
            <ToolbarButton
              icon={RotateCw}
              label="Redo"
              shortcut="⇧⌘Z"
              onClick={redo}
              disabled={history.future.length === 0}
            />

            <ToolbarDivider />

            <ThemeToggle />

            <ToolbarButton
              icon={Shuffle}
              label="Shuffle All"
              shortcut="Space"
              onClick={shuffleBrand}
            />
            <ToolbarButton
              icon={Palette}
              label="Shuffle Colors"
              shortcut="C"
              onClick={shuffleColors}
            />
            <ToolbarButton
              icon={FontSize}
              label="Shuffle Type"
              shortcut="T"
              onClick={shuffleTypography}
            />

            <ToolbarDivider />

            <ZoomControl zoom={zoom} onZoomChange={setZoom} />

            <ToolbarButton icon={Maximize2} label="Fit to Screen" shortcut="1" onClick={() => setZoom(100)} />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center" style={{ gap: "var(--space-2)" }}>
            <motion.button
              className="btn-figma btn-figma-ghost"
              onClick={handleShare}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={TRANSITION_FAST}
            >
              <Share2 size={13} />
              <span>Share</span>
            </motion.button>

            <ExportMenu canvasRef={canvasRef} />
          </div>
        </header>
      )}

      {/* === MAIN LAYOUT === */}
      <main className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Control Panel */}
        {!isReadOnly && <ControlPanel />}

        {/* Center: Canvas */}
        <BentoCanvas ref={canvasRef} zoom={zoom} />

      </main>

      {/* === BOTTOM STATUS BAR === */}
      {!isReadOnly && (
        <footer
          data-export-exclude="true"
          className="flex items-center justify-between flex-shrink-0"
          style={{
            height: 34,
            paddingInline: "var(--space-5)",
            background: "var(--sidebar-bg)",
            borderTop: "1px solid var(--sidebar-border-subtle)",
          }}
        >
          {/* Left: Status */}
          <div className="flex items-center" style={{ gap: "var(--space-2)" }}>
            <div
              className="rounded-full"
              style={{ width: 5, height: 5, background: "var(--success)", opacity: 0.7 }}
            />
            <span
              className="text-11"
              style={{ color: "var(--sidebar-text-muted)" }}
            >
              Saved
            </span>
          </div>

          {/* Center: Keyboard hints */}
          <div className="flex items-center" style={{ gap: "var(--space-4)" }}>
            <div className="flex items-center" style={{ gap: "var(--space-1)" }}>
              <span className="kbd">Esc</span>
              <span
                className="text-11"
                style={{ color: "var(--sidebar-text-muted)" }}
              >
                Deselect
              </span>
            </div>
            <div className="flex items-center" style={{ gap: "var(--space-1)" }}>
              <span className="kbd">⌘Z</span>
              <span
                className="text-11"
                style={{ color: "var(--sidebar-text-muted)" }}
              >
                Undo
              </span>
            </div>
            <div className="flex items-center" style={{ gap: "var(--space-1)" }}>
              <span className="kbd">⇧⌘Z</span>
              <span
                className="text-11"
                style={{ color: "var(--sidebar-text-muted)" }}
              >
                Redo
              </span>
            </div>
          </div>

          {/* Right: Version */}
          <span
            className="text-11"
            style={{ color: "var(--sidebar-text-muted)", opacity: 0.5 }}
          >
            v1.0.0
          </span>
        </footer>
      )}

      {!isReadOnly && (
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 2000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              fontSize: '13px',
            },
          }}
        />
      )}

      {showDevTools && <DevToolsPanel onClose={() => setShowDevTools(false)} />}

    </div>
  );
}

export default function App() {
  return (
    <ReadOnlyProvider>
      <AppContent />
    </ReadOnlyProvider>
  );
}
