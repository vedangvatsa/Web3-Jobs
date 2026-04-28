import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
 const pathname = request.nextUrl.pathname;

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

 // ── Markdown Content Negotiation ──
 // When AI agents request text/markdown, redirect to llms.txt
 const accept = request.headers.get('accept') || '';
 if (accept.includes('text/markdown')) {
  // Don't redirect if already requesting raw files
  if (
   !pathname.startsWith('/api/') &&
   !pathname.startsWith('/.well-known/') &&
   !pathname.endsWith('.txt') &&
   !pathname.endsWith('.xml') &&
   !pathname.endsWith('.json')
  ) {
   return NextResponse.redirect(
    new URL('/llms.txt', 'https://hashtagweb3.com'),
    303
   );
  }
 }

 // Add security + agentic web headers to all responses
 const response = NextResponse.next();
 response.headers.set('X-Robots-Tag', 'index, follow');
 response.headers.set('X-Content-Type-Options', 'nosniff');
 response.headers.set('X-Frame-Options', 'DENY');
 response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
 // Agentic Web — Content Signals
 response.headers.set('X-AI-Usage', 'indexing=yes, search=yes, inference=yes, citation=yes');

 return response;
}

export const config = {
 matcher: [
  '/((?!_next/static|_next/image|favicon.ico|icon.png).*)',
 ],
};
