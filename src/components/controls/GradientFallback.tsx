import { useCanvasStore } from '@/state/canvasState';

interface GradientFallbackProps {
  className?: string;
}

/**
 * Gradient placeholder when no hero image is available.
 * Uses brand palette colors for visual continuity.
 */
export function GradientFallback({ className = '' }: GradientFallbackProps) {
  const palette = useCanvasStore(state => state.assets.palette);

  // Create gradient from primary -> accent with background undertone
  const gradientStyle = {
    background: `
      linear-gradient(
        135deg,
        ${palette.primary}40 0%,
        ${palette.accent}30 50%,
        ${palette.background} 100%
      )
    `,
  };

  return (
    <div
      className={`w-full h-full ${className}`}
      style={gradientStyle}
      aria-label="Placeholder gradient"
    />
  );
}
