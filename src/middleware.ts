import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Known scraper/bot user agent patterns to block
const BLOCKED_UA_PATTERNS = [
  /scrapy/i,
  /python-requests/i,
  /wget/i,
  /curl\//i,
  /httpx/i,
  /aiohttp/i,
  /node-fetch/i,
  /axios/i,
  /go-http-client/i,
  /java\//i,
  /libwww-perl/i,
  /mechanize/i,
  /phantom/i,
  /headless/i,
  /selenium/i,
  /puppeteer/i,
  /crawl4ai/i,
  /AhrefsBot/i,
  /SemrushBot/i,
  /DotBot/i,
  /MJ12bot/i,
  /PetalBot/i,
  /BLEXBot/i,
  /DataForSeoBot/i,
  /MegaIndex/i,
  /CCBot/i,
  /anthropic-ai/i,
  /cohere-ai/i,
];

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static assets and internal Next.js routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icon') ||
    pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|webp|mp4|webm)$/)
  ) {
    return NextResponse.next();
  }

  // Block requests with no user agent (likely scrapers)
  if (!userAgent || userAgent.length < 10) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Block known scraper user agent patterns
  for (const pattern of BLOCKED_UA_PATTERNS) {
    if (pattern.test(userAgent)) {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'index, follow');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.png (browser icons)
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.png).*)',
  ],
};
