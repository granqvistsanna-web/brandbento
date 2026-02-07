import { useDropzone } from 'react-dropzone';
import { useCallback, useState } from 'react';
import { useCanvasStore } from '@/state/canvasState';

const ACCEPTED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DIMENSION = 1920; // Resize to max 1920px

interface ImageUploadProps {
  onUploadComplete?: () => void;
  className?: string;
}

/**
 * Resize image to max dimension while maintaining aspect ratio
 */
async function resizeImage(file: File, maxDimension: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        // Create canvas and resize
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG with 85% quality for smaller file size
        const dataUri = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUri);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = reader.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({ onUploadComplete, className = '' }: ImageUploadProps) {
  const setAssets = useCanvasStore(state => state.setAssets);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setError(null);
    setIsProcessing(true);

    try {
      // Resize image to reduce storage size
      const dataUri = await resizeImage(file, MAX_DIMENSION);

      // Update store
      setAssets({
        heroImage: dataUri,
        imagesSource: 'extracted', // Mark as user-provided
      });

      onUploadComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsProcessing(false);
    }
  }, [setAssets, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: ACCEPTED_IMAGE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    multiple: false,
    disabled: isProcessing,
  });

  // Get error message from rejections
  const rejectionError = fileRejections[0]?.errors[0]?.message;
  const displayError = error || rejectionError;

  return (
    <div
      {...getRootProps()}
      className={`
        relative cursor-pointer transition-all duration-200
        ${isDragActive ? 'ring-2 ring-blue-400 ring-inset' : ''}
        ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        ${className}
      `}
    >
      <input {...getInputProps()} />

      {/* Overlay shown on drag or when empty */}
      <div
        className={`
          absolute inset-0 flex flex-col items-center justify-center
          bg-black/50 backdrop-blur-sm transition-opacity duration-200
          ${isDragActive ? 'opacity-100' : 'opacity-0 hover:opacity-100'}
        `}
      >
        {isProcessing ? (
          <div className="text-white text-sm">Processing...</div>
        ) : isDragActive ? (
          <div className="text-white text-sm font-medium">Drop image here</div>
        ) : (
          <div className="text-center text-white">
            <svg
              className="w-8 h-8 mx-auto mb-2 opacity-80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm opacity-80">
              Drag image or click to browse
            </span>
          </div>
        )}
      </div>

      {/* Error display */}
      {displayError && (
        <div className="absolute bottom-2 left-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
          {displayError}
        </div>
      )}
    </div>
  );
}
