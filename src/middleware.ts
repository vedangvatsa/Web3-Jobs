import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  isLinkPreviewCrawlerRequest,
  linkPreviewPreviewPath,
  SOCIAL_UTM_MAP,
} from '@/lib/social-share';
/**
 * Social media suffix shortcuts mapping to standardized UTM attribution parameters.
 */

/** AI agent and bot user-agents to detect for markdown serving */
const AI_BOT_UA_PATTERNS = [
  'GPTBot', 'ClaudeBot', 'ChatGPT-User', 'PerplexityBot',
  'Google-Extended', 'Applebot-Extended', 'ora-agent', 'DeepSeekBot',
  'anthropic-ai', 'Claude-Web', 'OAI-SearchBot',
];

interface RateLimitBucket {
  count: number;
  resetTime: number;
}

const RATE_LIMIT_MAX = 300;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
/** Cap in-memory buckets so Worker isolates do not grow without bound (1102). */
const RATE_LIMIT_MAX_IPS = 512;
const ipBuckets = new Map<string, RateLimitBucket>();

let lastCleanup = Date.now();
function cleanupExpiredBuckets() {
  const now = Date.now();
  if (now - lastCleanup > 5 * 60 * 1000) {
    lastCleanup = now;
    for (const [ip, bucket] of ipBuckets.entries()) {
      if (now > bucket.resetTime) {
        ipBuckets.delete(ip);
      }
    }
  }
}

function getClientIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp.trim();
  }
  return '127.0.0.1';
}

function getRateLimitInfo(request: NextRequest) {
  cleanupExpiredBuckets();
  const ip = getClientIp(request);
  const now = Date.now();
  let bucket = ipBuckets.get(ip);

  if (!bucket || now >= bucket.resetTime) {
    if (!bucket && ipBuckets.size >= RATE_LIMIT_MAX_IPS) {
      const oldestKey = ipBuckets.keys().next().value;
      if (oldestKey) ipBuckets.delete(oldestKey);
    }
    bucket = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
    ipBuckets.set(ip, bucket);
  } else {
    bucket.count += 1;
  }

  const remaining = Math.max(0, RATE_LIMIT_MAX - bucket.count);
  const reset = Math.max(1, Math.ceil((bucket.resetTime - now) / 1000));
  const isRateLimited = bucket.count > RATE_LIMIT_MAX;

  return {
    limit: RATE_LIMIT_MAX,
    remaining,
    reset,
    isRateLimited,
  };
}

function applyRateLimitHeaders(response: NextResponse, limit: number, remaining: number, reset: number): NextResponse {
  response.headers.set('RateLimit-Limit', String(limit));
  response.headers.set('RateLimit-Remaining', String(remaining));
  response.headers.set('RateLimit-Reset', String(reset));
  response.headers.set('RateLimit-Policy', `${limit};w=60`);
  response.headers.set('RateLimit', `limit=${limit}, remaining=${remaining}, reset=${reset}`);
  response.headers.set('X-RateLimit-Limit', String(limit));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(reset));
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Access-Control-Expose-Headers',
    'RateLimit, RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, RateLimit-Policy, Retry-After, API-Version, Sunset, Deprecation, Link, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset'
  );
  return response;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;
  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase();
  if (host === 'www.hashtagweb3.com') {
    const canonical = request.nextUrl.clone();
    canonical.host = 'hashtagweb3.com';
    return NextResponse.redirect(canonical, 308);
  }

  // Node/Firebase run middleware before public-file serving. Let the static
  // handler decide whether an asset exists, without content negotiation.
  if (
    pathname.startsWith('/articles-data/') ||
    pathname.startsWith('/data/') ||
    pathname.startsWith('/job-shards/') ||
    pathname.startsWith('/job-description-shards/') ||
    pathname.startsWith('/logo/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/events/')
  ) {
    return NextResponse.next();
  }

  if (!pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.includes('.')) {
    const ua = request.headers.get('user-agent') || '';
    const previewPath = linkPreviewPreviewPath(pathname, ua, isLinkPreviewCrawlerRequest(request));
    if (previewPath) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = previewPath;
      rewriteUrl.search = '';
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  // Only apply rate limiting to /api/ routes
  if (pathname.startsWith('/api')) {
    const { limit, remaining, reset, isRateLimited } = getRateLimitInfo(request);

    if (isRateLimited) {
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please throttle your requests and respect rate limits.',
            retryAfter: reset,
            docUrl: 'https://hashtagweb3.com/developers',
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(reset),
            'RateLimit-Limit': String(limit),
            'RateLimit-Remaining': '0',
            'RateLimit-Reset': String(reset),
            'RateLimit-Policy': `${limit};w=60`,
            'RateLimit': `limit=${limit}, remaining=0, reset=${reset}`,
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(reset),
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
            'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Expose-Headers': 'RateLimit, RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, RateLimit-Policy, Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset',
          },
        }
      );
    }
  }

  // 1. Social UTM suffix shortcuts
  // Strip recognised social-suffix path segments and replace with UTM params.
  // Only runs for non-API, non-static paths.
  if (!pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.endsWith('.xml') && !/\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf)$/i.test(pathname)) {
    const normalised = pathname.replace(/\/+$/, '');
    const lastSlashIdx = normalised.lastIndexOf('/');

    if (lastSlashIdx !== -1 || normalised) {
      const segment = normalised.slice(lastSlashIdx + 1).toLowerCase();

      if (segment && SOCIAL_UTM_MAP[segment]) {
        const config = SOCIAL_UTM_MAP[segment];
        const basePath = normalised.slice(0, lastSlashIdx) || '/';

        const url = request.nextUrl.clone();
        url.pathname = basePath;
        url.searchParams.set('utm_source', config.utm_source);
        url.searchParams.set('utm_medium', config.utm_medium);
        if (!url.searchParams.has('utm_campaign')) {
          url.searchParams.set('utm_campaign', 'share');
        }

        // Serve link preview bots a 200 with OG tags directly: LinkedIn and Meta
        // do not reliably follow 307 redirects when scraping previews.
        //
        // Firebase App Hosting's dataplane does not reliably forward the client
        // User-Agent to middleware on GET requests, so UA matching alone can miss
        // bots in production. Every modern browser sets the Sec-Fetch-* headers on
        // navigation; bot stacks (LinkedInBot, Meta-ExternalAgent, etc.) do not.
        // Treat "bot UA OR no browser navigation signals" as a crawler.
        if (isLinkPreviewCrawlerRequest(request)) {
          const crawlerRewrite = request.nextUrl.clone();
          crawlerRewrite.pathname =
            basePath === '/' ? '/preview/index.html' : `/preview${basePath}.html`;
          crawlerRewrite.search = '';
          return NextResponse.rewrite(crawlerRewrite);
        }

        // For human visitors, redirect with absolute URL and UTM parameters
        const response = NextResponse.redirect(url, 307);
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        return response;
      }
    }
  }

  // 2. ?mode=agent → static JSON catalog (CDN; no Serverless Function).
  // Never intercept /api/* paths (e.g. /api/email/unsubscribe).
  // silently return the wrong payload on a public API.
  if (!pathname.startsWith('/api') && searchParams.get('mode') === 'agent') {
    const rewrite = request.nextUrl.clone();
    rewrite.pathname = '/agent-view.json';
    rewrite.search = '';
    return NextResponse.rewrite(rewrite);
  }

   // 3. Bot UA or Accept: text/markdown → serve a known Markdown resource.
  const ua = request.headers.get('user-agent') || '';
  const isAIBot = AI_BOT_UA_PATTERNS.some((pattern) => ua.includes(pattern));
  const acceptHeader = request.headers.get('accept') || '';
  const prefersMarkdown = acceptHeader.includes('text/markdown');

  const KNOWN_MD_PATHS = new Set([
    '/index.md',
    '/auth.md',
    '/404.md',
    '/terms-of-use.md',
    '/api-policy.md',
    '/agent-instructions.md',
    '/noslop.md',
    '/AGENTS.md',
  ]);

  if (
    (isAIBot || prefersMarkdown) &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next') &&
    !pathname.includes('.')
  ) {
    const candidateMdPath = pathname === '/' ? '/index.md' : `${pathname}.md`;

    if (KNOWN_MD_PATHS.has(candidateMdPath)) {
      const rewrite = request.nextUrl.clone();
      rewrite.pathname = candidateMdPath;
      rewrite.search = '';
      const response = NextResponse.rewrite(rewrite);
      response.headers.set('Vary', 'Accept, Accept-Encoding, User-Agent');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico / icon.png
     * - Binary static assets (images, fonts, etc.)
     * Note: /api routes ARE included so social crawler / UTM logic can run;
     * ?mode=agent rewrites to static /agent-view.json and skips /api/*.
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.png|logo-bimi.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf)$).*)',
  ],
};
