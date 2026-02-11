/**
 * Shared micro-components for sidebar control panels.
 * Extracted from ControlPanel.jsx for reuse across GlobalControls and TileControls.
 */
import React, { useState } from "react";
import {
  RiArrowRightSLine as ChevronRight,
} from "react-icons/ri";
import { motion, AnimatePresence } from "motion/react";

export const Badge = ({ children, variant = "muted" }: { children: React.ReactNode; variant?: string }) => (
  <span className={`badge badge-${variant}`}>{children}</span>
);

export const Tooltip = ({
  children,
  content,
  position = "right",
}: {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: "top" | "right" | "bottom" | "left";
}) => {
  const [show, setShow] = useState(false);

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className={`absolute ${positions[position]} tooltip z-50`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const PropRow = ({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) => (
  <div className="flex items-center gap-3 min-h-[38px]">
    <span className="text-12 min-w-[72px] flex-shrink-0" style={{ color: "var(--sidebar-text-secondary)" }}>{label}</span>
    <div className="flex-1 flex items-center gap-1">{children}</div>
    {hint && (
      <span className="text-11" style={{ color: "var(--sidebar-text-muted)" }}>
        {hint}
      </span>
    )}
  </div>
);

export const Input = ({
  value,
  onChange,
  placeholder,
  type = "text",
  mono,
  ...props
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  mono?: boolean;
  [key: string]: unknown;
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="input-figma flex-1"
    style={mono ? { fontFamily: "var(--font-mono)" } : undefined}
    {...props}
  />
);

export const TextArea = ({
  value,
  onChange,
  placeholder,
  rows = 3,
  ...props
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  [key: string]: unknown;
}) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className="input-figma w-full resize-none"
    style={{ height: "auto", padding: "8px 10px" }}
    {...props}
  />
);

export const Slider = ({
  value,
  onChange,
  onBlur,
  min,
  max,
  step = 1,
  label,
  unit = "",
}: {
  value: number;
  onChange: (val: number) => void;
  onBlur?: () => void;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
}) => {
  const percentage = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2 py-1.5">
      <div className="flex items-center justify-between">
        <span className="text-12" style={{ color: "var(--sidebar-text-secondary)" }}>
          {label}
        </span>
        <span
          className="text-12 font-mono"
          style={{ color: "var(--sidebar-text-secondary)" }}
        >
          {typeof value === "number" ? value.toFixed(step < 1 ? 2 : 0) : value}
          {unit}
        </span>
      </div>
      <div className="relative h-5 flex items-center">
        <div
          className="absolute h-[3px] rounded-full w-full"
          style={{ background: "var(--sidebar-bg-active)" }}
        />
        <div
          className="absolute h-[3px] rounded-full"
          style={{
            width: `${percentage}%`,
            background: "var(--accent)",
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onMouseUp={onBlur}
          onTouchEnd={onBlur}
          className="absolute w-full h-5 opacity-0 cursor-pointer"
        />
        <div
          className="absolute w-3.5 h-3.5 rounded-full border-2 pointer-events-none"
          style={{
            left: `calc(${percentage}% - 7px)`,
            background: "var(--sidebar-bg)",
            borderColor: "var(--accent)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        />
      </div>
    </div>
  );
};

export const SegmentedControl = ({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
}) => (
  <div
    className="flex flex-1 rounded-lg overflow-hidden"
    style={{
      background: "var(--sidebar-bg-hover)",
      padding: "3px",
      gap: "2px",
    }}
  >
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className="flex-1 h-8 text-12 font-medium transition-fast rounded-md"
        style={{
          background:
            value === opt.value ? "var(--sidebar-bg)" : "transparent",
          color:
            value === opt.value
              ? "var(--sidebar-text)"
              : "var(--sidebar-text-muted)",
          boxShadow:
            value === opt.value ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
        }}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export const Section = ({
  title,
  children,
  badge,
  defaultOpen = true,
  noPadding = false,
  action,
}: {
  title: string;
  children: React.ReactNode;
  badge?: string | null;
  defaultOpen?: boolean;
  noPadding?: boolean;
  action?: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="group">
      <div
        className="flex items-center sticky top-0 z-10"
        style={{ background: "var(--sidebar-bg)" }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center gap-3 transition-colors hover:bg-[var(--sidebar-bg-hover)]"
          style={{ background: "transparent", border: "none", cursor: "pointer", paddingBlock: 16, paddingInline: 24, paddingRight: action ? 8 : 24 }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.15 }}
            style={{ color: "var(--sidebar-text-muted)" }}
          >
            <ChevronRight size={11} />
          </motion.div>

          <span
            className="flex-1 text-left select-none"
            style={{
              color: "var(--sidebar-text)",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </span>

          {badge && <div>{badge}</div>}
        </button>

        {action && (
          <div style={{ paddingRight: 16 }}>
            {action}
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div
              className={noPadding ? "" : "space-y-5"}
              style={noPadding ? {} : { paddingInline: 24, paddingTop: 4, paddingBottom: 20 }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ height: 1, background: "var(--sidebar-border-subtle)", marginInline: 16, opacity: 0.4 }} />
    </div>
  );
};
