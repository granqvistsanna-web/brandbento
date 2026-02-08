import LZString from 'lz-string';

interface ShareableState {
  brand: any;
  tiles: any[];
}

export function generateShareUrl(state: ShareableState): string {
  const shareableState = {
    brand: state.brand,
    tiles: state.tiles,
    v: 1, // version for future compatibility
  };

  const json = JSON.stringify(shareableState);
  const compressed = LZString.compressToEncodedURIComponent(json);

  const url = new URL(window.location.href);
  url.hash = compressed;
  url.searchParams.set('view', 'readonly');

  return url.toString();
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Clipboard write failed:', error);
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError);
      return false;
    }
  }
}
