import { useCanvasStore } from '@/state/canvasState';
import { GradientFallback } from '@/components/controls/GradientFallback';
import { ImageUpload } from '@/components/controls/ImageUpload';
import { TreatmentFilter } from '@/components/filters/TreatmentFilter';
import { TreatmentPresets } from '@/components/pickers/TreatmentPresets';
import { TREATMENTS } from '@/utils/imageFilters';

interface ImageryTileProps {
  className?: string;
  isEditing?: boolean;
  onEditToggle?: (editing: boolean) => void;
}

export function ImageryTile({
  className = '',
  isEditing = false,
  onEditToggle,
}: ImageryTileProps) {
  const heroImage = useCanvasStore(state => state.assets.heroImage);
  const imagesSource = useCanvasStore(state => state.assets.imagesSource);
  const palette = useCanvasStore(state => state.assets.palette);
  const imagery = useCanvasStore(state => state.assets.imagery);

  const hasImage = !!heroImage;
  const isDefault = imagesSource === 'default';

  const handleEditClose = () => {
    onEditToggle?.(false);
  };

  // Get treatment label for indicator badge
  const treatmentLabel = TREATMENTS.find(t => t.name === imagery.treatment)?.label;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Image/Gradient with treatment applied */}
      {hasImage ? (
        <TreatmentFilter
          treatment={imagery.treatment}
          palette={palette}
          colorOverlay={imagery.colorOverlay}
        >
          <img
            src={heroImage}
            alt="Brand imagery"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </TreatmentFilter>
      ) : (
        <GradientFallback />
      )}

      {/* Default indicator */}
      {isDefault && !hasImage && (
        <div className="absolute bottom-2 left-2 text-xs text-white/70 bg-black/30 px-2 py-0.5 rounded">
          Default - click to change
        </div>
      )}

      {/* Upload overlay (always present, shown on hover) */}
      <ImageUpload className="absolute inset-0" />

      {/* Treatment presets panel (shown in edit mode) */}
      {isEditing && hasImage && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
          <TreatmentPresets onClose={handleEditClose} />
        </div>
      )}

      {/* Treatment indicator when not editing */}
      {hasImage && imagery.treatment !== 'original' && !isEditing && (
        <div className="absolute top-2 right-2 text-xs text-white bg-black/40 px-2 py-0.5 rounded">
          {treatmentLabel}
        </div>
      )}
    </div>
  );
}
