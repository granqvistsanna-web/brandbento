import { useEffect, useCallback } from 'react';
import { useCanvasStore, useTemporalStore } from '@/state/canvasState';
import { extractBrand, type ExtractionProgress } from '@/services/brandExtractor';
import { URLInput } from '@/components/URLInput';
import { ColorTile, ImageTile } from '@/components/Tile';
import { LogoTile } from '@/components/tiles/LogoTile';
import { TypographyTileWithPanel } from '@/components/TypographyTileWithPanel';
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

  // Temporal store for undo/redo
  const temporal = useTemporalStore();
  const pastLength = temporal.pastStates.length;
  const futureLength = temporal.futureStates.length;

  const handleUndo = useCallback(() => {
    temporal.undo();
  }, [temporal]);

  const handleRedo = useCallback(() => {
    temporal.redo();
  }, [temporal]);

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-wordmark">Brand Bento</span>
        <div className="undo-redo-controls">
          <button
            className="undo-redo-btn"
            onClick={handleUndo}
            disabled={pastLength === 0}
            aria-label={`Undo (${pastLength} available)`}
          >
            Undo ({pastLength})
          </button>
          <button
            className="undo-redo-btn"
            onClick={handleRedo}
            disabled={futureLength === 0}
            aria-label={`Redo (${futureLength} available)`}
          >
            Redo ({futureLength})
          </button>
        </div>
      </header>

      <main className="app-main">
        <URLInput
          onSubmit={handleExtract}
          disabled={isExtracting}
          initialValue={sourceUrl || ''}
        />

        <div className="canvas">
          <div className="bento-grid">
            {/* Logo Tile - self-contained with edit panel */}
            <LogoTile />

            {/* Primary Typography Tile with Panel */}
            <TypographyTileWithPanel role="primary" />

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

            {/* Secondary Typography Tile with Panel */}
            <TypographyTileWithPanel role="secondary" />

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
