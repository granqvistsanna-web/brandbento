import { useBrandStore, type BrandStore } from '@/store/useBrandStore';
import { motion } from 'motion/react';
import { Copy } from 'lucide-react';
import { useState } from 'react';
import { hexToHSL } from '@/utils/colorMapping';

export function ColorTile() {
  const brand = useBrandStore((state: BrandStore) => state.brand);
  const colors = brand.colors;

  const [copied, setCopied] = useState<string | null>(null);

  // Get readable text color based on background
  const getTextColor = (bgHex: string): string => {
    const { l } = hexToHSL(bgHex);
    return l > 55 ? '#000000' : '#FFFFFF';
  };

  // Core brand colors
  const coreColors = [
    { name: 'Primary', value: colors.primary },
    { name: 'Accent', value: colors.accent },
  ];

  // Surface palette - showcases identity
  const surfaceColors = colors.surfaces?.length > 0
    ? colors.surfaces.slice(0, 6)
    : [colors.surface];

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopied(color);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div
      className="w-full h-full p-4 flex flex-col gap-3 overflow-hidden"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Core Colors Row */}
      <div className="flex gap-2">
        {coreColors.map((color) => (
          <motion.button
            key={color.name}
            className="flex-1 rounded-lg p-2.5 flex flex-col justify-between text-left min-h-[52px]"
            style={{ backgroundColor: color.value }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleCopy(color.value)}
          >
            <span
              className="text-[9px] font-medium opacity-70 uppercase tracking-wide"
              style={{ color: getTextColor(color.value) }}
            >
              {color.name}
            </span>
            <div className="flex justify-between items-center">
              <span
                className="text-[10px] font-semibold"
                style={{ color: getTextColor(color.value) }}
              >
                {color.value}
              </span>
              {copied === color.value ? (
                <span className="text-[9px]" style={{ color: getTextColor(color.value) }}>✓</span>
              ) : (
                <Copy size={10} className="opacity-40" style={{ color: getTextColor(color.value) }} />
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Surfaces Grid - shows palette identity */}
      <div className="flex-1 flex flex-col gap-1.5">
        <span
          className="text-[9px] font-medium opacity-50 uppercase tracking-wider"
          style={{ color: colors.text }}
        >
          Surfaces
        </span>
        <div className="grid grid-cols-3 gap-1.5 flex-1">
          {surfaceColors.map((surface, index) => (
            <motion.button
              key={`surface-${index}`}
              className="rounded-md flex items-end justify-between p-2"
              style={{
                backgroundColor: surface,
                border: surface === colors.bg ? `1px solid ${colors.text}20` : 'none',
              }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleCopy(surface)}
            >
              <span
                className="text-[8px] font-medium opacity-60"
                style={{ color: getTextColor(surface) }}
              >
                {index + 1}
              </span>
              {copied === surface && (
                <span className="text-[8px]" style={{ color: getTextColor(surface) }}>✓</span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Background indicator */}
      <div
        className="rounded-md p-2 flex justify-between items-center"
        style={{
          backgroundColor: colors.bg,
          border: `1px solid ${colors.text}15`,
        }}
      >
        <span
          className="text-[9px] font-medium opacity-50 uppercase"
          style={{ color: colors.text }}
        >
          Background
        </span>
        <span
          className="text-[10px] font-semibold opacity-70"
          style={{ color: colors.text }}
        >
          {colors.bg}
        </span>
      </div>
    </div>
  );
}
