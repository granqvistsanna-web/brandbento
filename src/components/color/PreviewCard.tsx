import { memo } from 'react';
import { hexToHSL } from '@/utils/colorMapping';
import { COLOR_DEFAULTS } from '@/utils/colorDefaults';
import type { Colors } from '@/store/useBrandStore';

interface PreviewCardProps {
  colors: Colors;
  variant: 'primary' | 'surface' | 'accent';
}

export const PreviewCard = memo(({ colors, variant }: PreviewCardProps) => {
  const bgMap = {
    primary: colors.primary,
    surface: colors.surface || colors.surfaces?.[0] || colors.bg,
    accent: colors.accent,
  };

  const bg = bgMap[variant];
  const { l } = hexToHSL(bg);
  const isLight = l > 55;

  const textColor = isLight ? COLOR_DEFAULTS.TEXT_DARK : COLOR_DEFAULTS.SURFACE;
  const mutedText = isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)';

  // Button uses primary on surface, or surface on primary/accent
  const btnBg = variant === 'surface' ? colors.primary : colors.bg;
  const btnText = (() => {
    const { l: btnL } = hexToHSL(btnBg);
    return btnL > 55 ? COLOR_DEFAULTS.TEXT_DARK : COLOR_DEFAULTS.SURFACE;
  })();

  const labelBg = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)';

  return (
    <div
      className="flex-1 rounded-xl p-3 flex flex-col gap-2.5 min-w-0"
      style={{ backgroundColor: bg }}
    >
      {/* Label chip */}
      <span
        className="self-start text-[9px] font-semibold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full"
        style={{ background: labelBg, color: mutedText }}
      >
        Label
      </span>

      {/* Title */}
      <span
        className="text-[14px] font-bold leading-tight"
        style={{ color: textColor }}
      >
        Title text
      </span>

      {/* Body */}
      <span
        className="text-[10px] leading-relaxed"
        style={{ color: mutedText }}
      >
        This default paragraph will appear on your interface
      </span>

      {/* Button */}
      <button
        className="self-stretch text-[10px] font-semibold py-1.5 rounded-lg mt-auto"
        style={{
          backgroundColor: btnBg,
          color: btnText,
        }}
      >
        Button
      </button>
    </div>
  );
});

PreviewCard.displayName = 'PreviewCard';
