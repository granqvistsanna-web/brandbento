import { useCanvasStore } from '@/state/canvasState';
import { GradientFallback } from '@/components/controls/GradientFallback';
import { ImageUpload } from '@/components/controls/ImageUpload';

interface ImageryTileProps {
  className?: string;
}

export function ImageryTile({ className = '' }: ImageryTileProps) {
  const heroImage = useCanvasStore(state => state.assets.heroImage);
  const imagesSource = useCanvasStore(state => state.assets.imagesSource);

  const hasImage = !!heroImage;
  const isDefault = imagesSource === 'default';

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Image layer */}
      {hasImage ? (
        <img
          src={heroImage}
          alt="Brand imagery"
          className="w-full h-full object-cover"
          loading="lazy"
        />
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
    </div>
  );
}
