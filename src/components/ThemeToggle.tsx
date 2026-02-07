import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../hooks/useTheme';

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get the icon for the current resolved theme
  const CurrentIcon = resolvedTheme === 'dark' ? Moon : Sun;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="icon-btn"
        style={{
          background: isOpen ? 'var(--accent-muted)' : 'transparent',
          color: isOpen ? 'var(--accent)' : 'var(--sidebar-text-secondary)',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle theme"
        aria-expanded={isOpen}
      >
        <CurrentIcon size={16} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full right-0 mt-1 py-1 rounded-lg z-50 min-w-[120px]"
            style={{
              background: 'var(--sidebar-bg-elevated)',
              border: '1px solid var(--sidebar-border)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 text-left transition-fast"
                  style={{
                    background: isSelected ? 'var(--accent-muted)' : 'transparent',
                    color: isSelected ? 'var(--accent)' : 'var(--sidebar-text)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'var(--sidebar-bg-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isSelected
                      ? 'var(--accent-muted)'
                      : 'transparent';
                  }}
                >
                  <Icon size={14} />
                  <span className="text-11 flex-1">{option.label}</span>
                  {isSelected && <Check size={12} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
