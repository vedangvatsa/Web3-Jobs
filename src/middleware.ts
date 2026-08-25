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
  // When AI agents request text/markdown on HTML routes, rewrite to the markdown render endpoint
  // to dynamically serve content while maintaining Vary: Accept, Accept-Encoding headers.
  if (accept.includes('text/markdown')) {
    if (
      !pathname.startsWith('/api/') &&
      !pathname.startsWith('/.well-known/') &&
      !pathname.endsWith('.txt') &&
      !pathname.endsWith('.xml') &&
      !pathname.endsWith('.json') &&
      !pathname.endsWith('.yaml')
    ) {
      const rewriteResponse = NextResponse.rewrite(
        new URL('/api/markdown-render', request.url)
      );
      rewriteResponse.headers.set('x-original-url', request.url);
      rewriteResponse.headers.set('Vary', 'Accept, Accept-Encoding');
      rewriteResponse.headers.set('Content-Type', 'text/markdown; charset=utf-8');
      rewriteResponse.headers.set('X-Robots-Tag', 'index, follow');
      rewriteResponse.headers.set('X-AI-Usage', 'indexing=yes, search=yes, inference=yes, citation=yes');
      return rewriteResponse;
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

  if (pathname.startsWith('/api/')) {
    response.headers.set('RateLimit-Limit', '120');
    response.headers.set('RateLimit-Remaining', '119');
    response.headers.set('RateLimit-Reset', '60');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.png).*)',
  ],
};
