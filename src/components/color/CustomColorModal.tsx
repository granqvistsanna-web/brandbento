/**
 * Custom Color Modal
 *
 * Full-screen overlay that houses the CustomModePanel with generous space.
 * Opens when user clicks "Custom" in the ColorPalettePanel segmented control.
 * Renders via portal to escape sidebar overflow constraints.
 */
import { memo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { RiCloseFill as X } from 'react-icons/ri';
import { CustomModePanel } from './CustomModePanel';

interface CustomColorModalProps {
  open: boolean;
  onClose: () => void;
}

export const CustomColorModal = memo(({ open, onClose }: CustomColorModalProps) => {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
          style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-[920px] max-h-[85vh] rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: 'var(--sidebar-bg)',
              border: '1px solid var(--sidebar-border)',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid var(--sidebar-border-subtle)' }}
            >
              <span
                className="text-[13px] font-semibold tracking-[-0.01em]"
                style={{ color: 'var(--sidebar-text)' }}
              >
                Custom Colors
              </span>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: 'var(--sidebar-text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--sidebar-bg-hover)';
                  e.currentTarget.style.color = 'var(--sidebar-text)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--sidebar-text-muted)';
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-4">
              <CustomModePanel />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
});

CustomColorModal.displayName = 'CustomColorModal';
