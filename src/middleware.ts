import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  isLinkPreviewCrawlerRequest,
  linkPreviewPreviewPath,
  SOCIAL_UTM_MAP,
  stripSocialPathSuffix,
} from '@/lib/social-share';
import { getLearnRedirectPath } from '@/lib/learn-routes';
import { isRetiredOrProbePath } from '@/lib/retired-request';
import { isRemovedJobPath, recoveredJobDestination } from '@/lib/removed-job-path';
import { isExpiredJobPath, isKnownJobPath, jobPathCacheHeaders } from '@/lib/job-age-path';
import { jobAgePageCache, JOB_LISTING_CACHE_PREFIX, normalizeJobAgePath, validJobListingCachePath } from '@/lib/job-age-page-cache';
import { JOB_LISTING_CACHE_HEADER } from '@/lib/job-age-cache.mjs';
import eventTombstones from '../content/event-tombstones.json';
import { removedEventStatus } from '../scripts/lib/event-retention.mjs';
import { isMissingRootPagePath } from '@/lib/root-page-path';
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

function isResourcePath(pathname: string): boolean {
  return pathname.includes('.') || /^\/(?:api|_next|data|job-catalog|job-shards|job-description-shards|articles-data|preview|og|images|logo|fonts)(?:\/|$)/i.test(pathname);
}

export function missingPageResponse(request: NextRequest, status: 404 | 410 = 404, cacheControl = 'no-store'): NextResponse {
  const path = normalizeJobAgePath(request.nextUrl.pathname);
  const safeMethod = request.method === 'GET' || request.method === 'HEAD';
  const navigation = request.headers.get('sec-fetch-mode') === 'navigate'
    || request.headers.get('sec-fetch-dest') === 'document'
    || request.headers.get('sec-fetch-user') === '?1'
    || request.headers.get('rsc') === '1'
    || /(?:^|,)\s*text\/html\b/i.test(request.headers.get('accept') || '');
  const vary = 'Accept, Accept-Encoding, Sec-Fetch-Mode, Sec-Fetch-Dest, Sec-Fetch-User, RSC';
  if (safeMethod && navigation && !isResourcePath(path) && request.nextUrl.searchParams.get('mode') !== 'agent') {
    const response = NextResponse.redirect(new URL('/', request.url), 307);
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('X-Robots-Tag', 'noindex');
    response.headers.set('Vary', vary);
    return response;
  }
  return new NextResponse(request.method === 'HEAD' ? null : status === 410 ? 'This page is no longer available.\n' : 'Not found\n', {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': cacheControl, 'X-Robots-Tag': 'noindex', Vary: vary },
  });
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const agePathname = normalizeJobAgePath(pathname);
  if ((agePathname === JOB_LISTING_CACHE_PREFIX || agePathname.startsWith(`${JOB_LISTING_CACHE_PREFIX}/`)) && !validJobListingCachePath(pathname)) {
    return missingPageResponse(request, 410, 'public, max-age=0, s-maxage=300, must-revalidate');
  }
  const eventStatus = removedEventStatus(stripSocialPathSuffix(agePathname), eventTombstones);
  if (eventStatus) return missingPageResponse(request, eventStatus);
  if (isRemovedJobPath(pathname) || isExpiredJobPath(pathname)) {
    return missingPageResponse(request, 410, 'public, max-age=0, s-maxage=300, must-revalidate');
  }
  if (isRetiredOrProbePath(agePathname)) return missingPageResponse(request);
  if (/^\/api(?:\/|$)/.test(agePathname)
    && !/^\/api\/(?:email\/unsubscribe|openapi\.(?:json|yaml)|llms\.txt)$/.test(agePathname)) {
    return missingPageResponse(request);
  }
  // Public pages have no write handlers. Keep their 404 fallback out of POST responses.
  if (request.method !== 'GET' && request.method !== 'HEAD' && !/^\/api(?:\/|$)/.test(agePathname)) {
    return missingPageResponse(request);
  }
  if (isMissingRootPagePath(pathname)) return missingPageResponse(request);
  if (pathname.includes('%') && agePathname !== pathname && (
    isKnownJobPath(agePathname) || jobAgePageCache(agePathname) || agePathname.startsWith(`${JOB_LISTING_CACHE_PREFIX}/`)
    || /^\/(?:data\/(?:jobs-runtime|companies-runtime|catalog-freshness)\.json|job-(?:description-)?shards\/|(?:\.well-known\/)?sitemap\.(?:xml|json))/.test(agePathname)
  )) {
    const canonical = request.nextUrl.clone();
    canonical.pathname = agePathname;
    return NextResponse.redirect(canonical, 308);
  }
  const recoveredDestination = recoveredJobDestination(pathname);
  if (recoveredDestination?.startsWith('/')) {
    const url = request.nextUrl.clone();
    const preview = linkPreviewPreviewPath(pathname, request.headers.get('user-agent') || '', isLinkPreviewCrawlerRequest(request));
    if (preview) {
      url.pathname = preview;
      url.search = '';
      return NextResponse.rewrite(url, { headers: jobPathCacheHeaders(pathname) || {} });
    }
    url.pathname = recoveredDestination;
    return NextResponse.redirect(url, 308);
  }
  const normalizedLearnPath = pathname.replace(/\/+$/, '');
  const exactLearnDestination = getLearnRedirectPath(normalizedLearnPath);
  const learnBasePath = exactLearnDestination ? normalizedLearnPath : stripSocialPathSuffix(normalizedLearnPath);
  const learnDestination = exactLearnDestination || getLearnRedirectPath(learnBasePath);
  if (learnDestination) {
    const url = request.nextUrl.clone();
    url.pathname = learnDestination + normalizedLearnPath.slice(learnBasePath.length);
    return NextResponse.redirect(url, 308);
  }
  if (normalizedLearnPath.startsWith('/learn/') && !normalizedLearnPath.includes('.')) {
    return missingPageResponse(request);
  }
  const searchParams = request.nextUrl.searchParams;
  if (searchParams.get('mode') === 'agent' && !isResourcePath(agePathname) && agePathname.split('/').length > 2
    && !/^\/glossary\/[^/]+$/.test(agePathname) && !validJobListingCachePath(agePathname)) {
    return missingPageResponse(request);
  }
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
    pathname.startsWith('/events/') ||
    pathname === '/favicon-preview.html'
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
      return NextResponse.rewrite(rewriteUrl, { headers: jobPathCacheHeaders(pathname) || {} });
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

      if (segment && Object.hasOwn(SOCIAL_UTM_MAP, segment)) {
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
  if (!isResourcePath(agePathname) && searchParams.get('mode') === 'agent') {
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

  const pageCache = jobAgePageCache(pathname);
  if (pageCache) {
    const headers = new Headers(request.headers);
    headers.set(JOB_LISTING_CACHE_HEADER, pageCache.key);
    return NextResponse.next({ request: { headers }, headers: pageCache.headers });
  }
  const internalScope = pathname.match(/^\/job-listing-cache\/\d+(\/.*)?$/)?.[1] || '/';
  const cacheHeaders = pathname.startsWith(`${JOB_LISTING_CACHE_PREFIX}/`)
    ? jobAgePageCache(internalScope)?.headers : jobPathCacheHeaders(pathname);
  return NextResponse.next({ headers: cacheHeaders || {} });
}

export const config = {
  matcher: [
    '/og/jobs/:path*',
    '/:path(.*%.*)',
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico / icon.png
     * - Binary static assets (images, fonts, etc.)
     * - Catalog files and /events: keep these outside middleware so App Hosting can cache them.
     * Note: /api routes ARE included so social crawler / UTM logic can run;
     * ?mode=agent rewrites to static /agent-view.json and skips /api/*.
     */
     '/((?!_next/static|_next/image|favicon.ico|favicon-preview.html|icon.png|logo-bimi.svg|events$|(?:jobs/(?:feed\\.(?:json|xml)|adzuna\\.xml|jora\\.xml|feed-aggregator-us\\.xml)|events/feed\\.xml|(?:adzuna|jooble|myjobhelper|sitemap)\\.xml)$|(?:sitemap|\\.well-known/sitemap)\\.json$|job-catalog(?:/|$)|data(?:/|$)|articles-data(?:/|$)|job-shards(?:/|$)|job-description-shards(?:/|$)|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|pdf|woff2?)$).*)',
  ],
};
