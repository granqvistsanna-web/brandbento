import type { ImageTreatment, ColorPalette } from '@/types/brand';
import { getTreatmentFilter } from '@/utils/imageFilters';
import { DuotoneFilter } from './DuotoneFilter';
import { GrainFilter } from './GrainFilter';

interface TreatmentFilterProps {
  treatment: ImageTreatment;
  palette: ColorPalette;
  colorOverlay?: number;  // 0-60 percentage
  children: React.ReactNode;
}

/**
 * Unified component that applies the selected image treatment.
 * Handles both CSS filter treatments and component-based treatments.
 */
export function TreatmentFilter({
  treatment,
  palette,
  colorOverlay = 0,
  children,
}: TreatmentFilterProps) {
  // Apply component-based treatments
  if (treatment === 'duotone') {
    return (
      <DuotoneFilter palette={palette}>
        {children}
      </DuotoneFilter>
    );
  }

  if (treatment === 'grain') {
    return (
      <GrainFilter intensity={0.4}>
        <div className="w-full h-full">{children}</div>
      </GrainFilter>
    );
  }

  // CSS filter-based treatments
  const filterStyle = getTreatmentFilter(treatment);

  return (
    <div className="relative w-full h-full">
      {/* Image with CSS filter */}
      <div
        className="w-full h-full"
        style={{ filter: filterStyle }}
      >
        {children}
      </div>

      {/* Color overlay (IMGR-06) */}
      {colorOverlay > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: palette.primary,
            opacity: colorOverlay / 100,
          }}
        />
      )}
    </div>
  );
}
