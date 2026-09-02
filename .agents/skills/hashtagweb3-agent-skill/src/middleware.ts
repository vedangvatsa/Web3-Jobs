import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Social media suffix shortcuts mapping to standardized UTM attribution parameters.
 */
const SOCIAL_UTM_MAP: Record<string, { utm_source: string; utm_medium: string }> = {
  // LinkedIn
  'li': { utm_source: 'linkedin', utm_medium: 'social' },
  'linkedin': { utm_source: 'linkedin', utm_medium: 'social' },

  // X / Twitter
  'x': { utm_source: 'x', utm_medium: 'social' },
  'tw': { utm_source: 'twitter', utm_medium: 'social' },
  'twitter': { utm_source: 'twitter', utm_medium: 'social' },

  // YouTube
  'yt': { utm_source: 'youtube', utm_medium: 'social' },
  'youtube': { utm_source: 'youtube', utm_medium: 'social' },

  // Threads
  'th': { utm_source: 'threads', utm_medium: 'social' },
  'threads': { utm_source: 'threads', utm_medium: 'social' },

  // Instagram
  'ig': { utm_source: 'instagram', utm_medium: 'social' },
  'insta': { utm_source: 'instagram', utm_medium: 'social' },
  'instagram': { utm_source: 'instagram', utm_medium: 'social' },

  // Telegram
  'tg': { utm_source: 'telegram', utm_medium: 'social' },
  'telegram': { utm_source: 'telegram', utm_medium: 'social' },

  // Reddit
  'rd': { utm_source: 'reddit', utm_medium: 'social' },
  'reddit': { utm_source: 'reddit', utm_medium: 'social' },

  // Discord
  'dc': { utm_source: 'discord', utm_medium: 'social' },
  'discord': { utm_source: 'discord', utm_medium: 'social' },

  // Farcaster / Warpcast
  'fc': { utm_source: 'farcaster', utm_medium: 'social' },
  'warp': { utm_source: 'warpcast', utm_medium: 'social' },
  'farcaster': { utm_source: 'farcaster', utm_medium: 'social' },

  // Bluesky
  'bsky': { utm_source: 'bluesky', utm_medium: 'social' },
  'bluesky': { utm_source: 'bluesky', utm_medium: 'social' },

  // Facebook
  'fb': { utm_source: 'facebook', utm_medium: 'social' },
  'facebook': { utm_source: 'facebook', utm_medium: 'social' },

  // TikTok
  'tt': { utm_source: 'tiktok', utm_medium: 'social' },
  'tiktok': { utm_source: 'tiktok', utm_medium: 'social' },

  // Hacker News
  'hn': { utm_source: 'hackernews', utm_medium: 'social' },

  // WhatsApp
  'wa': { utm_source: 'whatsapp', utm_medium: 'social' },

  // Newsletter / Email
  'nl': { utm_source: 'newsletter', utm_medium: 'email' },
  'email': { utm_source: 'email', utm_medium: 'email' },
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const rawPathname = url.pathname;

  // Normalize path without trailing slashes for segment inspection
  const pathname = rawPathname.replace(/\/+$/, '');
  const lastSlashIdx = pathname.lastIndexOf('/');

  if (lastSlashIdx !== -1 || pathname) {
    const segment = pathname.slice(lastSlashIdx + 1).toLowerCase();

    if (segment && SOCIAL_UTM_MAP[segment]) {
      const config = SOCIAL_UTM_MAP[segment];
      const basePath = pathname.slice(0, lastSlashIdx) || '/';

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

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static asset file extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt|json|pdf)$).*)',
  ],
};
