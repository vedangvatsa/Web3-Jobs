import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Social media suffix shortcuts mapping to standardized UTM attribution parameters.
 */
const SOCIAL_UTM_MAP: Record<string, { utm_source: string; utm_medium: string }> = {
  'li': { utm_source: 'linkedin', utm_medium: 'social' },
  'linkedin': { utm_source: 'linkedin', utm_medium: 'social' },
  'x': { utm_source: 'x', utm_medium: 'social' },
  'tw': { utm_source: 'twitter', utm_medium: 'social' },
  'twitter': { utm_source: 'twitter', utm_medium: 'social' },
  'yt': { utm_source: 'youtube', utm_medium: 'social' },
  'youtube': { utm_source: 'youtube', utm_medium: 'social' },
  'th': { utm_source: 'threads', utm_medium: 'social' },
  'threads': { utm_source: 'threads', utm_medium: 'social' },
  'ig': { utm_source: 'instagram', utm_medium: 'social' },
  'insta': { utm_source: 'instagram', utm_medium: 'social' },
  'instagram': { utm_source: 'instagram', utm_medium: 'social' },
  'tg': { utm_source: 'telegram', utm_medium: 'social' },
  'telegram': { utm_source: 'telegram', utm_medium: 'social' },
  'rd': { utm_source: 'reddit', utm_medium: 'social' },
  'reddit': { utm_source: 'reddit', utm_medium: 'social' },
  'dc': { utm_source: 'discord', utm_medium: 'social' },
  'discord': { utm_source: 'discord', utm_medium: 'social' },
  'fc': { utm_source: 'farcaster', utm_medium: 'social' },
  'warp': { utm_source: 'warpcast', utm_medium: 'social' },
  'farcaster': { utm_source: 'farcaster', utm_medium: 'social' },
  'bsky': { utm_source: 'bluesky', utm_medium: 'social' },
  'bluesky': { utm_source: 'bluesky', utm_medium: 'social' },
  'fb': { utm_source: 'facebook', utm_medium: 'social' },
  'facebook': { utm_source: 'facebook', utm_medium: 'social' },
  'tt': { utm_source: 'tiktok', utm_medium: 'social' },
  'tiktok': { utm_source: 'tiktok', utm_medium: 'social' },
  'hn': { utm_source: 'hackernews', utm_medium: 'social' },
  'wa': { utm_source: 'whatsapp', utm_medium: 'social' },
  'nl': { utm_source: 'newsletter', utm_medium: 'email' },
  'email': { utm_source: 'email', utm_medium: 'email' },
};

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
  return request.ip || '127.0.0.1';
}

function getRateLimitInfo(request: NextRequest) {
  cleanupExpiredBuckets();
  const ip = getClientIp(request);
  const now = Date.now();
  let bucket = ipBuckets.get(ip);

  if (!bucket || now >= bucket.resetTime) {
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

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

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
        const ua = request.headers.get('user-agent') || '';
        const hasBrowserNavigationSignal = ['sec-fetch-mode', 'sec-fetch-dest', 'sec-fetch-user'].some((h) =>
          request.headers.has(h)
        );
        const isSocialCrawler =
          /Twitterbot|facebookexternalhit|Facebot|Meta-ExternalAgent|Meta-ExternalFetcher|LinkedInBot|Slackbot|TelegramBot|Discordbot|WhatsApp|Pinterest|vkShare|Bluesky|Warpcast|Farcaster|Buffer|BufferBot|redditbot|Applebot|LinkedIn|embedly|quora link preview|outbrain|W3C_Validator/i.test(ua) ||
          !hasBrowserNavigationSignal;
        if (isSocialCrawler) {
          // Serve the destination page directly with HTTP 200 so link preview cards render OG tags immediately without relying on redirect following
          return NextResponse.rewrite(url);
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

  // 2. ?mode=agent → rewrite to /api/agent-view for structured JSON response
  if (searchParams.get('mode') === 'agent') {
    const rewrite = request.nextUrl.clone();
    rewrite.pathname = '/api/agent-view';
    rewrite.search = '';
    return NextResponse.rewrite(rewrite);
  }

  // 3. Bot UA or Accept: text/markdown → serve markdown or agent view
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
    } else if (isAIBot || prefersMarkdown) {
      // For paths without a specific static .md file, rewrite to agent-view so bots get structured content rather than 404
      const rewrite = request.nextUrl.clone();
      rewrite.pathname = '/api/agent-view';
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
     * Note: /api routes ARE included so that ?mode=agent can be intercepted
     * on any URL and rewritten to /api/agent-view before the API handler runs.
     * The bot-UA and UTM logic explicitly skip /api/* paths internally.
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.png|logo-bimi.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf)$).*)',
  ],
};
