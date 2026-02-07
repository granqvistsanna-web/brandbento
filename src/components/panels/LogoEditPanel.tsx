import { useCallback, useRef } from 'react';
import { useCanvasStore } from '@/state/canvasState';
import { Slider, ToggleGroup } from '../controls';

const VARIANT_OPTIONS = [
  { value: 'original' as const, label: 'Original' },
  { value: 'dark' as const, label: 'Dark' },
  { value: 'light' as const, label: 'Light' },
];

const BACKGROUND_OPTIONS = [
  { value: 'auto' as const, label: 'Auto' },
  { value: 'white' as const, label: 'White' },
  { value: 'dark' as const, label: 'Dark' },
  { value: 'primary' as const, label: 'Brand' },
];

const ACCEPTED_FILE_TYPES = '.svg,.png,.jpg,.jpeg,.webp';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function LogoEditPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setAssets = useCanvasStore((state) => state.setAssets);
  const setLogoScale = useCanvasStore((state) => state.setLogoScale);
  const setLogoVariant = useCanvasStore((state) => state.setLogoVariant);
  const setLogoBackground = useCanvasStore((state) => state.setLogoBackground);
  const scale = useCanvasStore((state) => state.tileSettings.logo.scale);
  const variant = useCanvasStore((state) => state.tileSettings.logo.variant);
  const background = useCanvasStore(
    (state) => state.tileSettings.logo.background
  );

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        console.warn('File too large. Maximum size is 5MB.');
        return;
      }

      // Read file as data URI
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUri = event.target?.result as string;
        if (dataUri) {
          setAssets({
            logo: dataUri,
            logoSource: 'default', // User-uploaded logos are marked as default source
          });
        }
      };
      reader.onerror = () => {
        console.error('Failed to read file');
      };
      reader.readAsDataURL(file);

      // Reset input for re-upload of same file
      e.target.value = '';
    },
    [setAssets]
  );

  const handleScaleChange = useCallback(
    (value: number) => {
      setLogoScale(value);
    },
    [setLogoScale]
  );

  const handleVariantChange = useCallback(
    (value: 'original' | 'dark' | 'light') => {
      setLogoVariant(value);
    },
    [setLogoVariant]
  );

  const handleBackgroundChange = useCallback(
    (value: 'auto' | 'white' | 'dark' | 'primary') => {
      setLogoBackground(value);
    },
    [setLogoBackground]
  );

  return (
    <div className="logo-edit-panel">
      {/* File Upload */}
      <div className="logo-edit-section">
        <button
          type="button"
          className="logo-upload-button"
          onClick={handleUploadClick}
        >
          Upload Logo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleFileChange}
          className="logo-upload-input"
          aria-label="Upload logo file"
        />
        <span className="logo-upload-hint">SVG, PNG, or JPG</span>
      </div>

      {/* Scale Slider */}
      <div className="logo-edit-section">
        <Slider
          value={scale}
          min={40}
          max={100}
          step={5}
          label="Scale"
          onChange={handleScaleChange}
          formatValue={(v) => `${v}%`}
        />
      </div>

      {/* Variant Toggle */}
      <div className="logo-edit-section">
        <ToggleGroup
          value={variant}
          options={VARIANT_OPTIONS}
          onChange={handleVariantChange}
          label="Variant"
        />
      </div>

      {/* Background Toggle */}
      <div className="logo-edit-section">
        <ToggleGroup
          value={background}
          options={BACKGROUND_OPTIONS}
          onChange={handleBackgroundChange}
          label="Background"
        />
      </div>
    </div>
  );
}
