/**
 * CORS Proxy Service
 *
 * Fetches external URLs via a CORS proxy to bypass browser security
 * restrictions. Required for extracting brand assets from third-party sites.
 *
 * The proxy URL is configured via VITE_CORS_PROXY_URL environment variable,
 * defaulting to localhost:8787 for local development (Cloudflare Workers).
 *
 * @module services/corsProxy
 */

/** Proxy URL from environment or localhost fallback */
const CORS_PROXY_URL = import.meta.env.VITE_CORS_PROXY_URL || 'http://localhost:8787';

/**
 * Fetches HTML content from a URL via the CORS proxy.
 *
 * Includes timeout handling and specific error messages for common failures
 * (rate limiting, network errors, timeouts).
 *
 * @param url - URL to fetch (will be encoded and passed to proxy)
 * @param timeout - Request timeout in milliseconds (default: 5000)
 * @returns HTML content as string
 * @throws Error on timeout, rate limit, or network failure
 *
 * @example
 * try {
 *   const html = await fetchViaProxy('https://stripe.com');
 *   const doc = new DOMParser().parseFromString(html, 'text/html');
 * } catch (error) {
 *   if (error.message.includes('Rate limit')) {
 *     showRateLimitWarning();
 *   }
 * }
 */
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
