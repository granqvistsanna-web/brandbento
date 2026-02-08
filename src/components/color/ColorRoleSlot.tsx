import { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pencil } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

interface ColorRoleSlotProps {
  label: string;
  color: string;
  onChange: (hex: string) => void;
}

export const ColorRoleSlot = memo(({ label, color, onChange }: ColorRoleSlotProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(color);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync draft when external color changes
  useEffect(() => { setDraft(color); }, [color]);

  // Close on outside click
  useEffect(() => {
    if (!isEditing) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onChange(draft);
        setIsEditing(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isEditing, draft, onChange]);

  const handlePickerChange = (hex: string) => {
    setDraft(hex);
    onChange(hex);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsEditing(!isEditing)}
        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-colors"
        style={{
          background: isEditing ? 'var(--sidebar-bg-active)' : 'transparent',
        }}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
      >
        {/* Label */}
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.08em] w-[72px] text-left shrink-0"
          style={{ color: 'var(--sidebar-text-muted)' }}
        >
          {label}
        </span>

        {/* Color swatch */}
        <div
          className="w-5 h-5 rounded-[5px] shrink-0 ring-1 ring-inset ring-white/10"
          style={{ backgroundColor: color }}
        />

        {/* Hex value */}
        <span
          className="text-[12px] font-medium tracking-wide flex-1 text-left"
          style={{
            color: 'var(--sidebar-text-secondary)',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
          }}
        >
          {color.toUpperCase()}
        </span>

        {/* Edit indicator */}
        <Pencil
          size={11}
          className="shrink-0 transition-opacity"
          style={{
            color: 'var(--sidebar-text-muted)',
            opacity: isEditing ? 1 : 0.4,
          }}
        />
      </motion.button>

      {/* Color picker popover */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-3 right-3 z-50 mt-1 rounded-xl overflow-hidden shadow-2xl"
            style={{
              background: 'var(--sidebar-bg-elevated)',
              border: '1px solid var(--sidebar-border)',
            }}
          >
            <div className="p-3">
              <HexColorPicker
                color={draft}
                onChange={handlePickerChange}
                style={{ width: '100%', height: '140px' }}
              />
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={draft.toUpperCase()}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDraft(val);
                    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                      onChange(val);
                    }
                  }}
                  className="flex-1 text-[11px] px-2 py-1 rounded-md"
                  style={{
                    background: 'var(--sidebar-bg-active)',
                    color: 'var(--sidebar-text)',
                    border: '1px solid var(--sidebar-border)',
                    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ColorRoleSlot.displayName = 'ColorRoleSlot';
