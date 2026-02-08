import { toPng } from 'html-to-image';

export async function exportToPng(
  canvasElement: HTMLElement,
  filename: string = 'brandbento'
): Promise<void> {
  // Filter function to exclude UI elements from export
  const filter = (node: HTMLElement): boolean => {
    // Skip non-element nodes
    if (!(node instanceof HTMLElement)) return true;

    // List of class names to exclude from export
    const excludeClasses = [
      'toolbar',
      'edit-panel',
      'control-panel',
      'controls',
      'tooltip',
      'overlay',
      'modal',
    ];

    // Check if node has any excluded class
    if (node.classList) {
      for (const cls of excludeClasses) {
        if (node.classList.contains(cls)) {
          return false;
        }
      }
    }

    // Also check data attributes for export exclusion
    if (node.dataset?.exportExclude === 'true') {
      return false;
    }

    return true;
  };

  try {
    const dataUrl = await toPng(canvasElement, {
      cacheBust: true,
      // EXPRT-04: Scale for high-DPI screens
      pixelRatio: window.devicePixelRatio,
      filter,
      // Improve quality
      quality: 1.0,
      // Handle background
      backgroundColor: undefined, // Use transparent or element's bg
    });

    // Trigger download
    const link = document.createElement('a');
    link.download = `${filename}-${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('Failed to export PNG. Please try again.');
  }
}
