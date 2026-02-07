import { useRef } from 'react';
import { useCanvasStore } from '@/state/canvasState';
import { useHoverPreview } from '@/hooks/useHoverPreview';
import { TREATMENTS, type TreatmentInfo } from '@/utils/imageFilters';
import { TreatmentFilter } from '@/components/filters/TreatmentFilter';
import type { ImageTreatment } from '@/types/brand';

interface TreatmentPresetsProps {
  onClose?: () => void;
}

export function TreatmentPresets({ onClose }: TreatmentPresetsProps) {
  const heroImage = useCanvasStore(state => state.assets.heroImage);
  const palette = useCanvasStore(state => state.assets.palette);
  const currentTreatment = useCanvasStore(state => state.assets.imagery.treatment);
  const setImageTreatment = useCanvasStore(state => state.setImageTreatment);

  // Track committed value for hover preview reversion
  const committedRef = useRef(currentTreatment);
  const { startPreview, endPreview, commit } = useHoverPreview(currentTreatment);

  // Apply preview treatment temporarily
  const handleHover = (treatment: ImageTreatment) => {
    startPreview(treatment);
    // Directly update store for live preview
    setImageTreatment(treatment);
  };

  const handleHoverEnd = () => {
    // Revert to committed value
    setImageTreatment(committedRef.current);
    endPreview();
  };

  const handleClick = (treatment: ImageTreatment) => {
    commit(treatment, (t) => {
      setImageTreatment(t);
      committedRef.current = t;
    });
    onClose?.();
  };

  // Don't show presets if no image
  if (!heroImage) {
    return (
      <div className="text-sm text-gray-400 dark:text-gray-500 italic">
        Upload an image to see treatment presets
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        Treatments
      </span>

      <div className="grid grid-cols-3 gap-2">
        {TREATMENTS.map((treatment) => (
          <TreatmentThumbnail
            key={treatment.name}
            treatment={treatment}
            heroImage={heroImage}
            palette={palette}
            isSelected={committedRef.current === treatment.name}
            onMouseEnter={() => handleHover(treatment.name)}
            onMouseLeave={handleHoverEnd}
            onClick={() => handleClick(treatment.name)}
          />
        ))}
      </div>
    </div>
  );
}

interface TreatmentThumbnailProps {
  treatment: TreatmentInfo;
  heroImage: string;
  palette: {
    primary: string;
    accent: string;
    background: string;
    text: string;
  };
  isSelected: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

function TreatmentThumbnail({
  treatment,
  heroImage,
  palette,
  isSelected,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: TreatmentThumbnailProps) {
  return (
    <button
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={`
        group flex flex-col items-center gap-1 p-1 rounded-lg
        transition-all duration-150
        ${isSelected
          ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-900'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
      `}
    >
      {/* Thumbnail with filter applied */}
      <div className="w-16 h-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
        <TreatmentFilter
          treatment={treatment.name}
          palette={palette}
        >
          <img
            src={heroImage}
            alt={treatment.label}
            className="w-full h-full object-cover"
          />
        </TreatmentFilter>
      </div>

      <span className={`
        text-[10px] transition-colors
        ${isSelected
          ? 'text-blue-600 dark:text-blue-400 font-medium'
          : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}
      `}>
        {treatment.label}
      </span>
    </button>
  );
}
