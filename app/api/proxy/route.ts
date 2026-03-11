import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) return new Response('No URL', { status: 400 });

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://www.shahid.net', // Common referer for MBC
        Origin: 'https://www.shahid.net',
      },
    });

    const contentType = response.headers.get('Content-Type') || '';

    // If it's any form of HLS playlist (Master or Media)
    if (
      contentType.includes('mpegurl') ||
      contentType.includes('application/x-mpegURL') ||
      targetUrl.includes('.m3u8')
    ) {
      const text = await response.text();
      const baseUrl = new URL(targetUrl);
      const basePath = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);

      const rewrittenText = text
        .split('\n')
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) {
            // Handle URI tags like #EXT-X-KEY or #EXT-X-MEDIA which contain URLs
            if (trimmed.includes('URI="')) {
              return trimmed.replace(/URI="([^"]+)"/, (match, p1) => {
                const abs = p1.startsWith('http')
                  ? p1
                  : new URL(p1, basePath).href;
                return `URI="/api/proxy?url=${encodeURIComponent(abs)}"`;
              });
            }
            return line;
          }

          // Convert any relative segment or playlist link to a proxied absolute URL
          const absoluteUrl = trimmed.startsWith('http')
            ? trimmed
            : trimmed.startsWith('/')
              ? baseUrl.origin + trimmed
              : basePath + trimmed;

          return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
        })
        .join('\n');

      return new Response(rewrittenText, {
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Pipe binary segments (.ts, .m4s) directly
    return new Response(response.body, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    return new Response('Proxy Error', { status: 500 });
  }
}
