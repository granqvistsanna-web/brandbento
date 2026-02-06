import { useEffect } from 'react';
import { useCanvasStore } from '@/state/canvasState';

function App() {
  const hydrate = useCanvasStore((state) => state.hydrate);
  const assets = useCanvasStore((state) => state.assets);
  const sourceUrl = useCanvasStore((state) => state.sourceUrl);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="app">
      <h1>Brand Bento</h1>
      <p>Primary font: {assets.primaryFont}</p>
      <p>Secondary font: {assets.secondaryFont}</p>
      <p>Colors: {assets.colors.join(', ')}</p>
      <p>Source: {sourceUrl || 'None'}</p>
    </div>
  );
}

export default App;
