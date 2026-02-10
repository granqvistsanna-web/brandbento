import React, { useCallback, useRef, useState } from "react";
import { Upload, X } from "lucide-react";

interface ImageDropZoneProps {
  value: string | null | undefined;
  onChange: (dataUrl: string | null) => void;
  accept?: string;
  label?: string;
  compact?: boolean;
}

export default function ImageDropZone({
  value,
  onChange,
  accept = "image/*",
  label = "Drop image here or click to browse",
  compact = false,
}: ImageDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const readFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        if (result) onChange(result);
      };
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) readFile(file);
    },
    [readFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) readFile(file);
      e.target.value = "";
    },
    [readFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  if (value) {
    return (
      <div
        className="relative group rounded-md overflow-hidden"
        style={{
          height: compact ? 48 : 80,
          background: "var(--sidebar-bg-active)",
        }}
      >
        <img
          src={value}
          alt=""
          className="w-full h-full object-contain"
        />
        <div
          className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <button
            type="button"
            className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
            style={{ color: "#fff" }}
            onClick={() => inputRef.current?.click()}
            title="Replace"
          >
            <Upload size={14} />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
            style={{ color: "#fff" }}
            onClick={() => onChange(null)}
            title="Remove"
          >
            <X size={14} />
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      className="rounded-md flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors"
      style={{
        height: compact ? 48 : 80,
        border: `1.5px dashed ${dragging ? "var(--accent)" : "var(--sidebar-border)"}`,
        background: dragging ? "var(--sidebar-bg-hover)" : "transparent",
        color: "var(--sidebar-text-muted)",
      }}
    >
      <Upload size={compact ? 14 : 18} style={{ opacity: 0.5 }} />
      <span className={compact ? "text-10" : "text-11"}>{label}</span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
