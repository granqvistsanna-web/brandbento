import { useEffect, useCallback } from 'react';
import { useCanvasStore } from '@/state/canvasState';
import { extractBrand, type ExtractionProgress } from '@/services/brandExtractor';
import { URLInput, ColorTile, FontTile, LogoTile, ImageTile, ExtractionOverlay } from '@/components';
import './App.css';

function App() {
  const hydrate = useCanvasStore((state) => state.hydrate);
  const assets = useCanvasStore((state) => state.assets);
  const sourceUrl = useCanvasStore((state) => state.sourceUrl);
  const extractionStage = useCanvasStore((state) => state.extractionStage);
  const extractionError = useCanvasStore((state) => state.extractionError);

  const setAssets = useCanvasStore((state) => state.setAssets);
  const setSourceUrl = useCanvasStore((state) => state.setSourceUrl);
  const setExtractionStage = useCanvasStore((state) => state.setExtractionStage);
  const setExtractionError = useCanvasStore((state) => state.setExtractionError);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleExtract = useCallback(async (url: string) => {
    setSourceUrl(url);
    setExtractionError(null);
    setExtractionStage('fetching');

    try {
      const result = await extractBrand(url, (progress: ExtractionProgress) => {
        setExtractionStage(progress.stage);
        if (progress.assets) {
          setAssets(progress.assets);
        }
        if (progress.error) {
          setExtractionError(progress.error);
        }
      });

      setAssets(result);
      setExtractionStage('complete');

      // Clear complete status after a moment
      setTimeout(() => {
        setExtractionStage('idle');
      }, 1500);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Extraction failed';
      setExtractionError(message);
      setExtractionStage('error');
    }
  }, [setAssets, setSourceUrl, setExtractionStage, setExtractionError]);

  const handleDismissError = useCallback(() => {
    setExtractionStage('idle');
    setExtractionError(null);
  }, [setExtractionStage, setExtractionError]);

  const isExtracting = extractionStage !== 'idle' && extractionStage !== 'complete' && extractionStage !== 'error';

  // Determine which tiles are still loading
  const tileLoading = {
    colors: extractionStage === 'fetching' || extractionStage === 'colors',
    fonts: extractionStage === 'fetching' || extractionStage === 'colors' || extractionStage === 'fonts',
    images: extractionStage === 'fetching' || extractionStage === 'colors' || extractionStage === 'fonts' || extractionStage === 'images',
    logo: extractionStage === 'fetching' || extractionStage === 'colors' || extractionStage === 'fonts' || extractionStage === 'images' || extractionStage === 'logo',
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Brand Bento</h1>
        <p className="app-subtitle">Extract and remix brand assets</p>
      </header>

      <main className="app-main">
        <URLInput
          onSubmit={handleExtract}
          disabled={isExtracting}
          initialValue={sourceUrl || ''}
        />

        <div className="canvas-preview">
          <div className="tile-grid">
            <LogoTile
              logo={assets.logo}
              isLoading={isExtracting && tileLoading.logo}
              isDefault={assets.logoSource === 'default'}
            />

            <FontTile
              fontName={assets.primaryFont}
              variant="primary"
              isLoading={isExtracting && tileLoading.fonts}
              isDefault={assets.fontsSource === 'default'}
            />

            <ImageTile
              image={assets.heroImage}
              colors={assets.colors}
              isLoading={isExtracting && tileLoading.images}
              isDefault={assets.imagesSource === 'default'}
            />

            <ColorTile
              colors={assets.colors}
              isLoading={isExtracting && tileLoading.colors}
              isDefault={assets.colorsSource === 'default'}
            />

            <FontTile
              fontName={assets.secondaryFont}
              variant="secondary"
              isLoading={isExtracting && tileLoading.fonts}
              isDefault={assets.fontsSource === 'default'}
            />
          </div>
        </div>

        <ExtractionOverlay
          stage={extractionStage}
          error={extractionError}
          onDismiss={handleDismissError}
        />
      </main>
    </div>
  );
}

export default App;
