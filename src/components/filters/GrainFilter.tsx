import { useId } from 'react';

interface GrainFilterProps {
  children: React.ReactNode;
  intensity?: number;  // 0-1
}

/**
 * Film grain effect using SVG feTurbulence filter.
 * More performant than PNG textures, scalable, no network request.
 */
export function GrainFilter({ children, intensity = 0.5 }: GrainFilterProps) {
  const filterId = useId();

  return (
    <div className="relative w-full h-full">
      {/* SVG filter definition */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            {/* Generate Perlin noise */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves={4}
              stitchTiles="stitch"
              result="noise"
            />
            {/* Desaturate noise */}
            <feColorMatrix
              in="noise"
              type="saturate"
              values="0"
              result="desaturated"
            />
            {/* Control intensity via opacity */}
            <feComponentTransfer in="desaturated" result="adjusted">
              <feFuncA type="linear" slope={intensity} intercept={0} />
            </feComponentTransfer>
            {/* Blend with source using multiply */}
            <feBlend mode="multiply" in="adjusted" in2="SourceGraphic" />
          </filter>
        </defs>
      </svg>

      {/* Apply filter to children */}
      <div
        className="w-full h-full"
        style={{ filter: `url(#${filterId})` }}
      >
        {children}
      </div>
    </div>
  );
}
