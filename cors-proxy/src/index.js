/**
 * Brand Bento CORS Proxy
 *
 * Cloudflare Worker that proxies requests to external URLs and adds CORS headers.
 * Rate limited to 10 requests per minute per IP to prevent abuse.
 *
 * Usage: GET /?url=https://example.com
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    // Handle CORS preflight (OPTIONS)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Validate target URL parameter
    if (!targetUrl) {
      return new Response('Missing required "url" query parameter', {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
      });
    }

    // Validate URL format
    let parsedTargetUrl;
    try {
      parsedTargetUrl = new URL(targetUrl);
    } catch (e) {
      return new Response('Invalid URL format', {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
      });
    }

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedTargetUrl.protocol)) {
      return new Response('Only HTTP and HTTPS URLs are supported', {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
      });
    }

    // Rate limiting (10 requests per minute per IP)
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const { success } = await env.RATE_LIMITER.limit({ key: clientIP });

    if (!success) {
      return new Response('Rate limit exceeded (10 requests per minute)', {
        status: 429,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Retry-After': '60',
          'Content-Type': 'text/plain',
        },
      });
    }

    try {
      // Create abort controller for 5-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Fetch target URL
      const response = await fetch(targetUrl, {
        method: request.method === 'HEAD' ? 'HEAD' : 'GET',
        headers: {
          'User-Agent': 'BrandBento/1.0 (https://brandbento.app)',
          Accept: 'text/html,text/css,*/*',
        },
        signal: controller.signal,
        cf: {
          cacheTtl: 300, // Cache for 5 minutes
          cacheEverything: true,
        },
      });

      clearTimeout(timeoutId);

      // Validate content type (only allow HTML and CSS)
      const contentType = response.headers.get('content-type') || '';
      const isValidContentType =
        contentType.includes('text/html') ||
        contentType.includes('text/css') ||
        contentType.includes('application/xhtml+xml');

      if (!isValidContentType) {
        return new Response(
          `Invalid content type: ${contentType}. Only text/html and text/css are allowed.`,
          {
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'text/plain',
            },
          }
        );
      }

      // Create new response with CORS headers
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.append('Vary', 'Origin');
      responseHeaders.set('Cache-Control', 'public, max-age=300');

      // Remove headers that could cause issues
      responseHeaders.delete('Content-Security-Policy');
      responseHeaders.delete('X-Frame-Options');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      // Handle timeout
      if (error.name === 'AbortError') {
        return new Response('Request timeout (5 seconds)', {
          status: 504,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain',
          },
        });
      }

      // Handle other fetch errors
      return new Response(`Failed to fetch target URL: ${error.message}`, {
        status: 502,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
      });
    }
  },
};
