import { useEffect, useCallback } from 'react';
import { useCanvasStore } from '@/state/canvasState';
import { extractBrand, type ExtractionProgress } from '@/services/brandExtractor';
import { URLInput } from '@/components/URLInput';
import { LogoTile, FontTile, ColorTile, ImageTile } from '@/components/Tile';
import { ExtractionOverlay } from '@/components/ExtractionOverlay';
import { UIPreviewTile } from '@/components';
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

      setTimeout(() => {
        setExtractionStage('idle');
      }, 1000);

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

  // Progressive loading states
  const tileLoading = {
    colors: extractionStage === 'fetching' || extractionStage === 'colors',
    fonts: extractionStage === 'fetching' || extractionStage === 'colors' || extractionStage === 'fonts',
    images: extractionStage === 'fetching' || extractionStage === 'colors' || extractionStage === 'fonts' || extractionStage === 'images',
    logo: extractionStage === 'fetching' || extractionStage === 'colors' || extractionStage === 'fonts' || extractionStage === 'images' || extractionStage === 'logo',
  };

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-wordmark">Brand Bento</span>
      </header>

      <main className="app-main">
        <URLInput
          onSubmit={handleExtract}
          disabled={isExtracting}
          initialValue={sourceUrl || ''}
        />

        <div className="canvas">
          <div className="bento-grid">
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

            <UIPreviewTile
              isLoading={isExtracting && tileLoading.logo}
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
