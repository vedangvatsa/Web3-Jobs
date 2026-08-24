import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  // Skip middleware for static assets and internal Next.js routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/ingest/') ||
    pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|webp|mp4|webm)$/)
  ) {
    return NextResponse.next();
  }

  // ── ?mode=agent — return machine-readable JSON platform overview ──
  if (searchParams.get('mode') === 'agent' && (pathname === '/' || pathname === '')) {
    return NextResponse.redirect(new URL('/api/agent-view', request.url), 302);
  }

  const accept = request.headers.get('accept') || '';

  // ── Markdown Content Negotiation (acceptmarkdown.com) ──
  // When AI agents request text/markdown on HTML routes, redirect to llms.txt with 303 See Other
  // and ensure Vary: Accept, Accept-Encoding is strictly set.
  if (accept.includes('text/markdown')) {
    if (
      !pathname.startsWith('/api/') &&
      !pathname.startsWith('/.well-known/') &&
      !pathname.endsWith('.txt') &&
      !pathname.endsWith('.xml') &&
      !pathname.endsWith('.json') &&
      !pathname.endsWith('.yaml')
    ) {
      const redirectResponse = NextResponse.redirect(
        new URL('/llms.txt', request.url),
        303
      );
      redirectResponse.headers.set('Vary', 'Accept, Accept-Encoding');
      redirectResponse.headers.set('Content-Type', 'text/markdown; charset=utf-8');
      redirectResponse.headers.set('X-Robots-Tag', 'index, follow');
      redirectResponse.headers.set('X-AI-Usage', 'indexing=yes, search=yes, inference=yes, citation=yes');
      return redirectResponse;
    }
  }

  // Add security + agentic web headers to all responses
  const response = NextResponse.next();
  response.headers.set('Vary', 'Accept, Accept-Encoding');
  response.headers.set('X-Robots-Tag', 'index, follow');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Agentic Web - Content Signals
  response.headers.set('X-AI-Usage', 'indexing=yes, search=yes, inference=yes, citation=yes');
  response.headers.set('Link', '</llms.txt>; rel="ai-context", </openapi.json>; rel="service-desc"');

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.png).*)',
  ],
};
