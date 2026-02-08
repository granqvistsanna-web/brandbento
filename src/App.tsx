import { useState, useRef, useEffect } from "react";
// @ts-ignore
import BentoCanvas from "./components/BentoCanvasNew";
// @ts-ignore
import ControlPanel from "./components/ControlPanel";
// @ts-ignore
import { useBrandStore, exportAsCSS, exportAsJSON } from "./store/useBrandStore";
import { useTheme } from "./hooks/useTheme";
import { ReadOnlyProvider, useReadOnly } from './hooks/useReadOnly';
import { ThemeToggle } from "./components/ThemeToggle";
import toast, { Toaster } from 'react-hot-toast';
import { generateShareUrl, copyToClipboard } from './utils/sharing';
import { exportToPng } from './utils/export';
import {
  ChevronDown,
  RotateCcw,
  RotateCw,
  Download,
  Share2,
  Layers,
  Maximize2,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import "./index.css";

// Figma-style toolbar button
const ToolbarButton = ({
  icon: Icon,
  label,
  shortcut,
  active,
  onClick,
  disabled,
}: {
  icon: any;
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
      >
        <Icon size={16} />
      </motion.button>

      <AnimatePresence>
        {showTooltip && label && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50"
          >
            <div className="tooltip flex items-center gap-2">
              <span>{label}</span>
              {shortcut && <span className="kbd">{shortcut}</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Toolbar divider
const ToolbarDivider = () => <div className="divider-v" />;

// Zoom control
const ZoomControl = () => {
  const [zoom, setZoom] = useState(100);

  return (
    <div className="flex items-center gap-1 px-2">
      <motion.button
        onClick={() => setZoom(Math.max(25, zoom - 25))}
        className="icon-btn"
        style={{ width: 24, height: 24 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <span
          className="text-11 font-medium"
          style={{ color: "var(--sidebar-text-secondary)" }}
        >
          -
        </span>
      </motion.button>
      <div
        className="w-12 text-center text-11 font-medium"
        style={{ color: "var(--sidebar-text)" }}
      >
        {zoom}%
      </div>
      <motion.button
        onClick={() => setZoom(Math.min(200, zoom + 25))}
        className="icon-btn"
        style={{ width: 24, height: 24 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <span
          className="text-11 font-medium"
          style={{ color: "var(--sidebar-text-secondary)" }}
        >
          +
        </span>
      </motion.button>
    </div>
  );
};

// Logo/Brand mark
const AppLogo = () => (
  <div className="flex items-center px-3">
    <span
      className="text-13 font-semibold tracking-tight"
      style={{ color: "var(--sidebar-text)" }}
    >
      Brand.Bento
    </span>
  </div>
);

// Export menu dropdown
const ExportMenu = ({ canvasRef }: { canvasRef: React.RefObject<HTMLDivElement> }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { brand } = useBrandStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

    try {
      await exportToPng(canvasRef.current, 'brandbento');
      toast.success('PNG exported!');
      setIsOpen(false);
    } catch (error) {
      toast.error('Export failed. Please try again.');
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-figma btn-figma-primary"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
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
            className="absolute top-full right-0 mt-1 w-44 py-1 rounded-lg z-50"
            style={{
              background: "var(--sidebar-bg-elevated)",
              border: "1px solid var(--sidebar-border)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <button
              onClick={handleExportPng}
              className="w-full px-3 py-2 flex items-center gap-2 text-left transition-fast"
              style={{ color: "var(--sidebar-text)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--sidebar-bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <span className="text-11">Export as PNG</span>
              <span
                className="ml-auto text-10 px-1.5 py-0.5 rounded"
                style={{
                  background: "var(--sidebar-bg-active)",
                  color: "var(--sidebar-text-muted)",
                }}
              >
                .png
              </span>
            </button>
            <button
              onClick={() => handleExport("css")}
              className="w-full px-3 py-2 flex items-center gap-2 text-left transition-fast"
              style={{ color: "var(--sidebar-text)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--sidebar-bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <span className="text-11">Export as CSS</span>
              <span
                className="ml-auto text-10 px-1.5 py-0.5 rounded"
                style={{
                  background: "var(--sidebar-bg-active)",
                  color: "var(--sidebar-text-muted)",
                }}
              >
                .css
              </span>
            </button>
            <button
              onClick={() => handleExport("json")}
              className="w-full px-3 py-2 flex items-center gap-2 text-left transition-fast"
              style={{ color: "var(--sidebar-text)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--sidebar-bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <span className="text-11">Export as JSON</span>
              <span
                className="ml-auto text-10 px-1.5 py-0.5 rounded"
                style={{
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
const FileMenu = ({ onReset }: { onReset: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-md transition-fast"
        style={{
          background: isOpen ? "var(--sidebar-bg-hover)" : "transparent",
          color: "var(--sidebar-text-secondary)",
        }}
        whileHover={{ background: "var(--sidebar-bg-hover)" }}
      >
        <span className="text-11 font-medium">File</span>
        <ChevronDown size={12} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 mt-1 w-52 py-1 rounded-lg z-50"
            style={{
              background: "var(--sidebar-bg-elevated)",
              border: "1px solid var(--sidebar-border)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            {[
              { label: "New Moodboard", shortcut: "N", action: () => {} },
              { label: "Open...", shortcut: "O", action: () => {} },
              { divider: true },
              { label: "Save", shortcut: "S", action: () => {} },
              { label: "Export as CSS", action: () => {} },
              { label: "Export as JSON", action: () => {} },
              { divider: true },
              { label: "Share...", action: () => {} },
              { label: "Reset to Defaults", action: onReset },
            ].map((item, i) =>
              item.divider ? (
                <div key={i} className="divider-h mx-2" />
              ) : (
                <button
                  key={i}
                  onClick={() => {
                    item.action?.();
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center justify-between text-left transition-fast"
                  style={{ color: "var(--sidebar-text)" }}
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

  const { brand, tiles, undo, redo, history, loadRandomTemplate, resetToDefaults } =
    useBrandStore();

  const handleShare = async () => {
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

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${isReadOnly ? 'read-only-mode' : ''}`}>
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
        className="h-12 flex items-center justify-between px-2 z-20 flex-shrink-0"
        style={{
          background: "var(--sidebar-bg)",
          borderBottom: "1px solid var(--sidebar-border)",
        }}
      >
        {/* Left: Logo + File Menu */}
        <div className="flex items-center gap-1">
          <AppLogo />

          <ToolbarDivider />

          <FileMenu onReset={handleReset} />

          <motion.button
            className="flex items-center gap-1 px-3 py-1.5 rounded-md transition-fast"
            style={{ color: "var(--sidebar-text-secondary)" }}
            whileHover={{ background: "var(--sidebar-bg-hover)" }}
          >
            <span className="text-11 font-medium">Edit</span>
          </motion.button>

          <motion.button
            className="flex items-center gap-1 px-3 py-1.5 rounded-md transition-fast"
            style={{ color: "var(--sidebar-text-secondary)" }}
            whileHover={{ background: "var(--sidebar-bg-hover)" }}
          >
            <span className="text-11 font-medium">View</span>
          </motion.button>
        </div>

        {/* Center: Tool buttons */}
        <div className="flex items-center gap-1">
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
            icon={Layers}
            label="Shuffle Template"
            onClick={loadRandomTemplate}
          />

          <ToolbarDivider />

          <ZoomControl />

          <ToolbarButton icon={Maximize2} label="Fit to Screen" shortcut="1" />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <motion.button
            className="btn-figma btn-figma-ghost"
            onClick={handleShare}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Share2 size={14} />
            <span>Share</span>
          </motion.button>

          <ExportMenu canvasRef={canvasRef} />

          <ToolbarDivider />

          <ToolbarButton icon={HelpCircle} label="Help" shortcut="?" />
        </div>
      </header>
      )}

      {/* === MAIN LAYOUT === */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Control Panel */}
        {!isReadOnly && <ControlPanel />}

        {/* Center: Canvas */}
        <BentoCanvas ref={canvasRef} />

      </main>

      {/* === BOTTOM STATUS BAR === */}
      {!isReadOnly && (
      <footer
        data-export-exclude="true"
        className="h-6 flex items-center justify-between px-3 flex-shrink-0"
        style={{
          background: "var(--sidebar-bg)",
          borderTop: "1px solid var(--sidebar-border)",
        }}
      >
        {/* Left: Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--success)" }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3 }}
              key={history.past.length}
            />
            <span
              className="text-[10px] flex items-center gap-1"
              style={{ color: "var(--sidebar-text-muted)" }}
            >
              All changes saved
            </span>
          </div>

          <div
            className="h-3 w-px"
            style={{ background: "var(--sidebar-border)" }}
          />

          <span
            className="text-[10px]"
            style={{ color: "var(--sidebar-text-muted)" }}
          >
            {history.past.length} changes
          </span>
        </div>

        {/* Center: Keyboard hints */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="kbd">Esc</span>
            <span
              className="text-[10px]"
              style={{ color: "var(--sidebar-text-muted)" }}
            >
              Deselect
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="kbd">⌘Z</span>
            <span
              className="text-[10px]"
              style={{ color: "var(--sidebar-text-muted)" }}
            >
              Undo
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="kbd">⇧⌘Z</span>
            <span
              className="text-[10px]"
              style={{ color: "var(--sidebar-text-muted)" }}
            >
              Redo
            </span>
          </div>
        </div>

        {/* Right: Version */}
        <div className="flex items-center gap-2">
          <span
            className="text-[10px]"
            style={{ color: "var(--sidebar-text-muted)" }}
          >
            v1.0.0
          </span>
        </div>
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
