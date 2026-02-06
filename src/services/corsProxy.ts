const CORS_PROXY_URL = import.meta.env.VITE_CORS_PROXY_URL || 'http://localhost:8787';

export async function fetchViaProxy(url: string, timeout = 5000): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const proxyUrl = `${CORS_PROXY_URL}?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a minute and try again.');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
}
