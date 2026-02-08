import { useBrandStore } from '@/store/useBrandStore';
import { motion } from 'motion/react';
import { Copy } from 'lucide-react';
import { useState } from 'react';

export function ColorTile() {
  const brand = useBrandStore((state) => state.brand);
  const colors = brand.colors;

  const [copied, setCopied] = useState<string | null>(null);

  const displayColors = [
    { name: 'Primary', value: colors.primary, textColor: '#FFFFFF' },
    { name: 'Accent', value: colors.accent, textColor: '#000000' },
    { name: 'Surface', value: colors.surface, textColor: '#000000' },
    { name: 'Background', value: colors.bg, textColor: '#000000', border: true },
  ];

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopied(color);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="w-full h-full p-4 bg-white flex flex-col gap-2 overflow-hidden">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Palette</h3>
      </div>

      <div className="grid grid-cols-2 gap-2 flex-1">
        {displayColors.map((color) => (
          <motion.button
            key={color.name}
            className={`relative rounded-lg p-3 flex flex-col justify-between text-left group transition-all ${color.border ? 'border border-gray-100' : ''
              }`}
            style={{ backgroundColor: color.value }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCopy(color.value)}
          >
            <span
              className="text-[10px] font-medium opacity-60 uppercase"
              style={{ color: color.textColor }}
            >
              {color.name}
            </span>
            <div className="flex justify-between items-end">
              <span
                className="text-xs font-semibold"
                style={{ color: color.textColor }}
              >
                {color.value}
              </span>
              {copied === color.value ? (
                <span className="text-[10px]" style={{ color: color.textColor }}>Copied!</span>
              ) : (
                <Copy
                  size={12}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: color.textColor }}
                />
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
