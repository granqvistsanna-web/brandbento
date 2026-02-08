import React from "react";
import { useBrandStore } from "../store/useBrandStore";
import { motion, AnimatePresence } from "motion/react";
import { BentoGrid } from './BentoGrid';
import { BentoTile } from './BentoTile';

// Geos brand design system
const GEOS = {
  colors: {
    canvas: "#0A0A0A",
    beige: "#E8E4DC",
    warmGray: "#D4CFC6",
    charcoal: "#3D3D3D",
    darkCharcoal: "#2A2A2A",
    yellow: "#F0E547",
    navy: "#2B3A67",
    white: "#FFFFFF",
    black: "#1A1A1A",
  },
  radius: {
    sm: "12px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  fonts: {
    display: "'DM Sans', 'SF Pro Display', -apple-system, sans-serif",
    body: "'DM Sans', 'SF Pro Text', -apple-system, sans-serif",
  },
};

// Tile configuration matching the reference layout exactly
// Grid: 3 cols x 3 rows
// | Hero (1×2) | Image (2×1)              |
// | Buttons    | Editorial (1×2)          |
// | Logo Navy  | Logo White | (continues) |
const GEOS_TILES = [
  // Phone mockup - top left, spans 2 rows
  {
    id: "hero-1",
    type: "hero",
    content: {
      headline: "Vill du jobba med oss?",
      cta: "LEDIGA TJÄNSTER",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
    },
  },
  // Face close-up with logo - top right, wide (2 cols)
  {
    id: "image-1",
    type: "image",
    content: {
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop",
      overlayText: "geos.",
    },
  },
  // Buttons tile - middle left
  {
    id: "ui-preview-1",
    type: "ui-preview",
    content: {
      buttons: ["BUTTON", "BUTTON", "BUTTON"],
    },
  },
  // Editorial - right side, spans 2 rows
  {
    id: "editorial-1",
    type: "editorial",
    content: {
      label: "INSIGHTS",
      headline: "Geo- och bergteknik",
      body: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      footnote: "Duis aute irure dolor in reprehenderit in. Consectetur adipiscing elit.",
    },
  },
  // Navy logo tile - bottom left
  {
    id: "logo-1",
    type: "logo",
    content: {
      variant: "dark",
    },
  },
  // White logo tile - bottom center
  {
    id: "colors-1",
    type: "colors",
    content: {
      variant: "light",
    },
  },
];

// Phone Mockup Component - realistic iPhone-style frame
const PhoneMockup = ({ image, headline, cta }) => {
  return (
    <div
      className="relative h-full w-full overflow-hidden flex items-center justify-center"
      style={{
        backgroundColor: GEOS.colors.beige,
        borderRadius: GEOS.radius.lg,
      }}
    >
      {/* Phone device frame */}
      <motion.div
        className="relative"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: "clamp(160px, 55%, 220px)",
          aspectRatio: "9/19",
        }}
      >
        {/* Phone outer frame */}
        <div
          className="absolute inset-0 rounded-[36px]"
          style={{
            background: "linear-gradient(145deg, #2A2A2A 0%, #1A1A1A 100%)",
            boxShadow: `
              0 25px 50px -12px rgba(0,0,0,0.5),
              0 0 0 1px rgba(255,255,255,0.05) inset,
              -8px -8px 16px rgba(255,255,255,0.02) inset
            `,
          }}
        />

        {/* Phone screen area */}
        <div
          className="absolute overflow-hidden"
          style={{
            top: "8px",
            left: "8px",
            right: "8px",
            bottom: "8px",
            borderRadius: "28px",
          }}
        >
          {/* Dynamic Island */}
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 z-20"
            style={{
              width: "80px",
              height: "24px",
              backgroundColor: "#000",
              borderRadius: "20px",
            }}
          />

          {/* Screen content */}
          <div className="relative h-full w-full">
            {/* Background image */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
              }}
            />

            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, transparent 70%)",
              }}
            />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <motion.h2
                className="text-white leading-tight mb-4"
                style={{
                  fontFamily: GEOS.fonts.display,
                  fontSize: "clamp(16px, 5vw, 22px)",
                  fontWeight: "700",
                  letterSpacing: "-0.02em",
                }}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {headline}
              </motion.h2>

              <motion.button
                className="w-full py-3 rounded-full font-semibold tracking-wide"
                style={{
                  backgroundColor: GEOS.colors.yellow,
                  color: GEOS.colors.black,
                  fontFamily: GEOS.fonts.body,
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                }}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {cta}
              </motion.button>
            </div>

            {/* Status bar */}
            <div className="absolute top-0 left-0 right-0 px-6 pt-3 flex justify-between items-center">
              <span
                className="text-white font-medium"
                style={{ fontSize: "12px", fontFamily: GEOS.fonts.body }}
              >
                9:04
              </span>
              <div className="flex items-center gap-1">
                <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
                  <rect x="0" y="4" width="3" height="8" rx="1" fillOpacity="0.4"/>
                  <rect x="4.5" y="2" width="3" height="10" rx="1" fillOpacity="0.6"/>
                  <rect x="9" y="0" width="3" height="12" rx="1"/>
                  <rect x="13" y="3" width="3" height="6" rx="1" stroke="white" strokeWidth="1" fill="none"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Face/Image tile with logo overlay
const ImageWithLogo = ({ image, overlayText }) => {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ borderRadius: GEOS.radius.lg }}
    >
      <motion.img
        src={image}
        alt=""
        className="w-full h-full object-cover"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="font-bold"
          style={{
            fontFamily: GEOS.fonts.display,
            fontSize: "clamp(28px, 5vw, 48px)",
            color: GEOS.colors.black,
            letterSpacing: "-0.02em",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {overlayText}
        </motion.span>
      </div>
    </div>
  );
};

// Editorial tile with refined typography
const EditorialTile = ({ label, headline, body, footnote }) => {
  return (
    <div
      className="h-full w-full flex flex-col justify-between p-6 overflow-hidden"
      style={{
        backgroundColor: GEOS.colors.charcoal,
        borderRadius: GEOS.radius.lg,
      }}
    >
      <div>
        <motion.span
          className="block mb-4"
          style={{
            fontFamily: GEOS.fonts.body,
            fontSize: "11px",
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase",
            fontWeight: "500",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {label}
        </motion.span>

        <motion.h2
          className="mb-4"
          style={{
            fontFamily: GEOS.fonts.display,
            fontSize: "clamp(22px, 4vw, 32px)",
            fontWeight: "700",
            color: GEOS.colors.white,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {headline}
        </motion.h2>

        <motion.p
          style={{
            fontFamily: GEOS.fonts.body,
            fontSize: "14px",
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.65)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {body}
        </motion.p>
      </div>

      {footnote && (
        <motion.p
          className="mt-auto pt-4"
          style={{
            fontFamily: GEOS.fonts.body,
            fontSize: "12px",
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.35)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {footnote}
        </motion.p>
      )}
    </div>
  );
};

// Buttons tile
const ButtonsTile = ({ buttons }) => {
  return (
    <div
      className="h-full w-full flex flex-col justify-center gap-3 p-6"
      style={{
        backgroundColor: GEOS.colors.beige,
        borderRadius: GEOS.radius.lg,
      }}
    >
      {buttons?.map((label, i) => {
        const isYellow = i === 0;
        const isDark = i === 1;
        const isOutlined = i === 2;

        return (
          <motion.button
            key={i}
            className="w-full py-3.5 rounded-full font-semibold transition-all"
            style={{
              fontFamily: GEOS.fonts.body,
              fontSize: "12px",
              letterSpacing: "0.1em",
              backgroundColor: isYellow ? GEOS.colors.yellow : isDark ? GEOS.colors.charcoal : "transparent",
              color: isYellow ? GEOS.colors.black : isDark ? GEOS.colors.white : GEOS.colors.charcoal,
              border: isOutlined ? `1.5px solid ${GEOS.colors.charcoal}` : "none",
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {label}
          </motion.button>
        );
      })}
    </div>
  );
};

// Landscape image tile
const LandscapeTile = ({ image }) => {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ borderRadius: GEOS.radius.lg }}
    >
      <motion.img
        src={image}
        alt=""
        className="w-full h-full object-cover"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
};

// Logo tile (dark variant - navy)
const LogoDark = () => {
  return (
    <div
      className="h-full w-full flex items-center justify-center"
      style={{
        backgroundColor: GEOS.colors.navy,
        borderRadius: GEOS.radius.lg,
      }}
    >
      <motion.span
        className="font-bold"
        style={{
          fontFamily: GEOS.fonts.display,
          fontSize: "clamp(20px, 3vw, 28px)",
          color: GEOS.colors.white,
          letterSpacing: "-0.01em",
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        geos.
      </motion.span>
    </div>
  );
};

// Logo tile (light variant - white)
const LogoLight = () => {
  return (
    <div
      className="h-full w-full flex items-center justify-center"
      style={{
        backgroundColor: GEOS.colors.white,
        borderRadius: GEOS.radius.lg,
        border: `1px solid ${GEOS.colors.warmGray}`,
      }}
    >
      <motion.span
        className="font-bold"
        style={{
          fontFamily: GEOS.fonts.display,
          fontSize: "clamp(20px, 3vw, 28px)",
          color: GEOS.colors.black,
          letterSpacing: "-0.01em",
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
      >
        geos.
      </motion.span>
    </div>
  );
};

// Main tile renderer
const BrandTile = ({ tile, index }) => {
  const { focusedTileId, setFocusedTile } = useBrandStore();
  const isFocused = focusedTileId === tile.id;

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
          <PhoneMockup
            image={tile.content.image}
            headline={tile.content.headline}
            cta={tile.content.cta}
          />
        );
      case "image":
        return (
          <ImageWithLogo
            image={tile.content.image}
            overlayText={tile.content.overlayText}
          />
        );
      case "editorial":
        return (
          <EditorialTile
            label={tile.content.label}
            headline={tile.content.headline}
            body={tile.content.body}
            footnote={tile.content.footnote}
          />
        );
      case "ui-preview":
        return <ButtonsTile buttons={tile.content.buttons} />;
      case "landscape":
        return <LandscapeTile image={tile.content.image} />;
      case "logo":
        return <LogoDark />;
      case "colors":
        return <LogoLight />;
      default:
        return null;
    }
  };

  return (
    <BentoTile
      tileType={tile.type}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="button"
      aria-pressed={isFocused}
      onClick={(e) => {
        e.stopPropagation();
        setFocusedTile(tile.id);
      }}
      className="cursor-pointer group"
      style={{
        outline: isFocused ? `2px solid ${GEOS.colors.yellow}` : "none",
        outlineOffset: "2px",
        transition: "outline 0.2s ease",
      }}
    >
      <motion.div
        className="h-full w-full overflow-hidden"
        style={{ borderRadius: GEOS.radius.lg }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: index * 0.08,
          ease: [0.22, 1, 0.36, 1],
        }}
        whileHover={{ scale: 0.98 }}
      >
        {renderContent()}
      </motion.div>
    </BentoTile>
  );
};

const BentoCanvas = () => {
  const { setFocusedTile } = useBrandStore();

  return (
    <div
      className="flex-1 h-full transition-colors duration-300"
      style={{ backgroundColor: GEOS.colors.canvas }}
      onClick={() => setFocusedTile(null)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <BentoGrid>
            {GEOS_TILES.map((tile, index) => (
              <BrandTile key={tile.id} tile={tile} index={index} />
            ))}
          </BentoGrid>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BentoCanvas;
