import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AI_BOT_UA_REGEX = /(gptbot|claudebot|chatgpt-user|perplexitybot|google-extended|applebot-extended|ora-agent|deepseekbot|anthropic-ai|oai-searchbot|cohere-ai)/i;

const AUTH_PROBE_PATHS = new Set(['/api', '/api/v1', '/v1', '/v2', '/agent/auth']);

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;
  const userAgent = request.headers.get('user-agent') || '';
  const accept = request.headers.get('accept') || '';
  const idempotencyKey = request.headers.get('idempotency-key') || '';

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

  // ── WWW-Authenticate probe on API root endpoints ──
  if (AUTH_PROBE_PATHS.has(pathname)) {
    return NextResponse.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required for privileged operations. Public read operations on /api/jobs, /api/news, /api/events, and /api/glossary are unauthenticated.',
          hint: 'Obtain an agent token via POST https://hashtagweb3.com/api/auth/register or query public endpoints directly.',
          docUrl: 'https://hashtagweb3.com/auth.md',
        },
      },
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer resource_metadata="https://hashtagweb3.com/.well-known/oauth-protected-resource"',
          'Access-Control-Allow-Origin': '*',
          'Vary': 'Accept, Accept-Encoding, User-Agent',
        },
      }
    );
  }

  // ── ?mode=agent — return machine-readable JSON platform overview directly ──
  if (searchParams.get('mode') === 'agent' && (pathname === '/' || pathname === '')) {
    const rewriteResponse = NextResponse.rewrite(new URL('/api/agent-view', request.url));
    rewriteResponse.headers.set('Vary', 'Accept, Accept-Encoding, User-Agent');
    rewriteResponse.headers.set('Content-Type', 'application/json; charset=utf-8');
    rewriteResponse.headers.set('X-Robots-Tag', 'index, follow');
    rewriteResponse.headers.set('X-AI-Usage', 'indexing=yes, search=yes, inference=yes, citation=yes');
    return rewriteResponse;
  }

  // ── Markdown URL fallback (.md twin on any page) & Markdown Content Negotiation & Bot-UA serving ──
  const isExplicitMarkdownFile = pathname.endsWith('.md');
  const isAcceptMarkdown = accept.includes('text/markdown');
  const isAIBot = AI_BOT_UA_REGEX.test(userAgent) && !pathname.startsWith('/api/') && !pathname.startsWith('/.well-known/');

  if (isExplicitMarkdownFile || isAcceptMarkdown || isAIBot) {
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
      rewriteResponse.headers.set('Vary', 'Accept, Accept-Encoding, User-Agent');
      rewriteResponse.headers.set('Content-Type', 'text/markdown; charset=utf-8');
      rewriteResponse.headers.set('X-Robots-Tag', 'index, follow');
      rewriteResponse.headers.set('X-AI-Usage', 'indexing=yes, search=yes, inference=yes, citation=yes');
      return rewriteResponse;
    }
  }

  // Add security + agentic web headers to all responses
  const response = NextResponse.next();
  response.headers.set('Vary', 'Accept, Accept-Encoding, User-Agent');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Agentic Web - Content Signals
  response.headers.set('X-AI-Usage', 'indexing=yes, search=yes, inference=yes, citation=yes');
  response.headers.set('Link', '</llms.txt>; rel="ai-context", </openapi.json>; rel="service-desc", </.well-known/agents.json>; rel="agents", </.well-known/api-catalog>; rel="api-catalog"');

  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/.well-known/') ||
    pathname === '/openapi.json' ||
    pathname === '/openapi.yaml' ||
    pathname === '/mcp'
  ) {
    response.headers.set('RateLimit-Limit', '120');
    response.headers.set('RateLimit-Remaining', '119');
    response.headers.set('RateLimit-Reset', '60');
    response.headers.set('RateLimit-Policy', '120;w=60');
    response.headers.set('X-RateLimit-Limit', '120');
    response.headers.set('X-RateLimit-Remaining', '119');
    response.headers.set('X-RateLimit-Reset', '60');
    response.headers.set('API-Version', '1.0.0');
    response.headers.set('Deprecation', '@1767225600');
    response.headers.set('Sunset', 'Wed, 31 Dec 2026 23:59:59 GMT');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Expose-Headers', 'RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, RateLimit-Policy, Retry-After, API-Version, Sunset, Deprecation, Link');
    if (idempotencyKey) {
      response.headers.set('Idempotency-Key', idempotencyKey);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.png).*)',
  ],
};
