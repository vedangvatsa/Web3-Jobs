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

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  // 1. ?mode=agent → rewrite to /api/agent-view for structured JSON response
  if (searchParams.get('mode') === 'agent') {
    const rewrite = request.nextUrl.clone();
    rewrite.pathname = '/api/agent-view';
    rewrite.search = '';
    return NextResponse.rewrite(rewrite);
  }

  // 2. Bot UA + Accept: text/markdown → rewrite to .md equivalent
  // API routes, Next.js internals, and paths that already have a file extension
  // are excluded so we only touch page-level HTML routes.
  const ua = request.headers.get('user-agent') || '';
  const isAIBot = AI_BOT_UA_PATTERNS.some((pattern) => ua.includes(pattern));

  if (
    isAIBot &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next') &&
    !pathname.includes('.')
  ) {
    const accept = request.headers.get('accept') || '';
    if (
      accept.includes('text/markdown') ||
      accept.includes('text/*') ||
      accept.includes('*/*')
    ) {
      const mdPath = pathname === '/' ? '/index.md' : `${pathname}.md`;
      const rewrite = request.nextUrl.clone();
      rewrite.pathname = mdPath;
      rewrite.search = '';
      const response = NextResponse.rewrite(rewrite);
      response.headers.set('Vary', 'Accept, Accept-Encoding, User-Agent');
      return response;
    }
  }

  // 3. Social UTM suffix shortcuts
  // Strip recognised social-suffix path segments and replace with UTM params.
  // Only runs for non-API, non-static paths.
  if (!pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
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

        // Temporary redirect (307) so browser cache does not lock query strings
        return NextResponse.redirect(url, 307);
      }
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
    '/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|pdf)$).*)',
  ],
};
