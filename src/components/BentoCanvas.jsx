import React, { useEffect } from "react";
import { useBrandStore, getContrastRatio } from "../store/useBrandStore";
import { motion, AnimatePresence } from "motion/react";
import { twMerge } from "tailwind-merge";

// Smart text color based on background
const getSmartTextColor = (bgColor, textColor) => {
  const contrast = getContrastRatio(textColor, bgColor);
  if (contrast < 4.5) {
    // Try white
    const whiteContrast = getContrastRatio("#FFFFFF", bgColor);
    if (whiteContrast > contrast) {
      return "#FFFFFF";
    }
    // Try black
    return "#000000";
  }
  return textColor;
};

const BrandTile = ({ tile, index }) => {
  const { brand, focusedTileId, setFocusedTile, darkModePreview } =
    useBrandStore();
  const isFocused = focusedTileId === tile.id;

  const { typography, colors, logo } = brand;

  // Dark mode color adjustments
  const displayColors = darkModePreview
    ? {
        bg: "#0A0A0A",
        text: "#FAFAFA",
        primary: "#FFFFFF",
        accent: "#A0A0A0",
        surface: "#1A1A1A",
      }
    : colors;

  // Letter spacing map
  const letterSpacingMap = {
    tight: "-0.02em",
    normal: "0",
    wide: "0.05em",
  };

  // Style objects based on brand tokens
  const tileStyle = {
    backgroundColor: displayColors.surface,
    color: displayColors.text,
    fontFamily: typography.ui,
    borderWidth: isFocused ? "2px" : "1px",
    borderColor: isFocused
      ? displayColors.primary
      : darkModePreview
        ? "#333"
        : "#E5E5E5",
    transition: "all 0.2s ease",
  };

  const headlineStyle = {
    fontFamily: typography.primary,
    fontSize: `${typography.baseSize * Math.pow(typography.scale, 2)}px`,
    lineHeight: 1.1,
    fontWeight: typography.weightHeadline,
    color: displayColors.text,
    letterSpacing: letterSpacingMap[typography.letterSpacing] || "0",
  };

  const bodyStyle = {
    fontFamily: typography.secondary,
    fontSize: `${typography.baseSize}px`,
    lineHeight: 1.5,
    fontWeight: typography.weightBody,
    color: displayColors.text,
    letterSpacing: letterSpacingMap[typography.letterSpacing] || "0",
  };

  const labelStyle = {
    fontFamily: typography.ui,
    fontSize: "12px",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: displayColors.accent,
  };

  const buttonStyle = {
    backgroundColor: displayColors.primary,
    color: getSmartTextColor(displayColors.primary, displayColors.bg),
    fontFamily: typography.ui,
    padding: "8px 24px",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "600",
  };

  // Accessibility and Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setFocusedTile(tile.id);
    }
  };

  const renderContent = () => {
    switch (tile.type) {
      case "hero":
        return (
          <div
            className="relative h-full w-full overflow-hidden flex flex-col justify-end p-10"
            style={{ backgroundColor: displayColors.bg }}
          >
            {tile.content.image && (
              <div
                className="absolute inset-0 z-0 opacity-20 grayscale"
                style={{
                  backgroundImage: `url(${tile.content.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}
            <div className="relative z-10 space-y-5">
              <h1
                style={headlineStyle}
                className="line-clamp-3 overflow-hidden"
              >
                {tile.content.headline}
              </h1>
              <p
                style={bodyStyle}
                className="max-w-[85%] line-clamp-2 overflow-hidden"
              >
                {tile.content.subcopy}
              </p>
              <button style={buttonStyle} className="w-fit shrink-0 mt-2">
                {tile.content.cta}
              </button>
            </div>
          </div>
        );
      case "editorial":
        return (
          <div className="p-8 space-y-4 h-full flex flex-col justify-center overflow-hidden">
            <h2 style={headlineStyle} className="line-clamp-4">
              {tile.content.headline}
            </h2>
            <p style={bodyStyle} className="line-clamp-6">
              {tile.content.body}
            </p>
          </div>
        );
      case "product":
        return (
          <div className="p-7 h-full flex flex-col gap-4">
            <div className="flex-1 overflow-hidden rounded-lg bg-white/50">
              <img
                src={tile.content.image}
                alt=""
                className="w-full h-full object-cover grayscale"
              />
            </div>
            <div className="flex justify-between items-end">
              <div>
                <span style={labelStyle}>{tile.content.label}</span>
                <p style={bodyStyle} className="font-bold">
                  {tile.content.price}
                </p>
              </div>
              <button
                style={{
                  ...buttonStyle,
                  padding: "6px 16px",
                  fontSize: "12px",
                }}
              >
                View
              </button>
            </div>
          </div>
        );
      case "ui-preview":
        return (
          <div className="p-7 h-full flex flex-col gap-4 bg-white/30">
            <div
              className="flex items-center justify-between border-b pb-3"
              style={{ borderColor: displayColors.surface }}
            >
              <span style={{ ...labelStyle, fontSize: "10px" }}>
                {tile.content.headerTitle}
              </span>
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: displayColors.accent }}
              />
            </div>
            <div className="space-y-3 flex-1 flex flex-col justify-center">
              <div
                className="h-10 rounded-lg px-4 flex items-center border bg-white/50"
                style={{ borderColor: displayColors.surface }}
              >
                <span className="text-[12px] opacity-50">
                  {tile.content.inputPlaceholder}
                </span>
              </div>
              <button className="w-full" style={buttonStyle}>
                {tile.content.buttonLabel}
              </button>
            </div>
          </div>
        );
      case "image":
        return (
          <div className="relative h-full w-full overflow-hidden">
            <img
              src={tile.content.image}
              alt=""
              className="w-full h-full object-cover grayscale"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <span
                style={{ ...headlineStyle, color: "#FFF", fontSize: "24px" }}
              >
                {tile.content.overlayText}
              </span>
            </div>
          </div>
        );
      case "utility":
        return (
          <div className="p-7 h-full flex flex-col justify-center">
            <h3 style={{ ...labelStyle, marginBottom: "20px" }}>
              {tile.content.headline}
            </h3>
            <ul className="space-y-3">
              {tile.content.items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2"
                  style={bodyStyle}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: displayColors.primary }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        );
      case "logo":
        return (
          <div className="p-8 flex flex-col items-center justify-center h-full text-center gap-5">
            <div
              style={{
                fontFamily: typography.primary,
                fontSize: `${logo.size}px`,
                padding: `${logo.padding}px`,
                border: `1px solid ${displayColors.surface}`,
                backgroundColor: displayColors.bg,
                color: displayColors.primary,
                letterSpacing: "0.2em",
                fontWeight: "900",
              }}
            >
              {logo.text}
            </div>
            <span style={labelStyle}>{tile.content.label}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="button"
      aria-pressed={isFocused}
      onClick={(e) => {
        e.stopPropagation();
        setFocusedTile(tile.id);
      }}
      className={twMerge(
        "rounded-2xl overflow-hidden cursor-pointer relative group focus:outline-none focus:ring-2 focus:ring-black/5",
        tile.colSpan === 2 ? "col-span-2" : "col-span-1",
        tile.rowSpan === 2 ? "row-span-2" : "row-span-1",
      )}
      style={tileStyle}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: "easeOut",
      }}
      whileHover={{ scale: 0.995 }}
      key={`${tile.id}-${tile.type}`}
    >
      {renderContent()}

      {/* Title only focus indicator */}
      {isFocused && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-3 left-3 z-20 bg-white/95 px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wider uppercase border border-[#E5E5E5] shadow-sm"
        >
          {tile.type} Focus
        </motion.div>
      )}
    </motion.div>
  );
};

const BentoCanvas = () => {
  const { tiles, setFocusedTile, darkModePreview, loadRandomTemplate } =
    useBrandStore();

  // Load random template on mount
  useEffect(() => {
    loadRandomTemplate();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div
      className="flex-1 overflow-auto transition-colors duration-300"
      style={{ backgroundColor: darkModePreview ? "#050505" : "#FAFAFA" }}
      onClick={() => setFocusedTile(null)}
    >
      <div className="min-h-full flex items-center justify-center p-12">
        <div className="w-full max-w-[1600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={darkModePreview ? "dark" : "light"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-4 auto-rows-[280px] gap-4"
            >
              {tiles.map((tile, index) => (
                <BrandTile key={tile.id} tile={tile} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BentoCanvas;
