/**
 * Social share path suffixes (/ebc/dc → Discord UTM) and link-preview crawlers.
 * Keep og-meta stripSocialPathSuffix, middleware UTM handling, and bot OG rewrites in sync via this module.
 */

export const SOCIAL_UTM_MAP: Record<string, { utm_source: string; utm_medium: string }> = {
  li: { utm_source: 'linkedin', utm_medium: 'social' },
  linkedin: { utm_source: 'linkedin', utm_medium: 'social' },
  x: { utm_source: 'x', utm_medium: 'social' },
  tw: { utm_source: 'twitter', utm_medium: 'social' },
  twitter: { utm_source: 'twitter', utm_medium: 'social' },
  yt: { utm_source: 'youtube', utm_medium: 'social' },
  youtube: { utm_source: 'youtube', utm_medium: 'social' },
  th: { utm_source: 'threads', utm_medium: 'social' },
  threads: { utm_source: 'threads', utm_medium: 'social' },
  ig: { utm_source: 'instagram', utm_medium: 'social' },
  insta: { utm_source: 'instagram', utm_medium: 'social' },
  instagram: { utm_source: 'instagram', utm_medium: 'social' },
  tg: { utm_source: 'telegram', utm_medium: 'social' },
  telegram: { utm_source: 'telegram', utm_medium: 'social' },
  rd: { utm_source: 'reddit', utm_medium: 'social' },
  reddit: { utm_source: 'reddit', utm_medium: 'social' },
  dc: { utm_source: 'discord', utm_medium: 'social' },
  discord: { utm_source: 'discord', utm_medium: 'social' },
  fc: { utm_source: 'farcaster', utm_medium: 'social' },
  warp: { utm_source: 'warpcast', utm_medium: 'social' },
  farcaster: { utm_source: 'farcaster', utm_medium: 'social' },
  bsky: { utm_source: 'bluesky', utm_medium: 'social' },
  bluesky: { utm_source: 'bluesky', utm_medium: 'social' },
  fb: { utm_source: 'facebook', utm_medium: 'social' },
  facebook: { utm_source: 'facebook', utm_medium: 'social' },
  tt: { utm_source: 'tiktok', utm_medium: 'social' },
  tiktok: { utm_source: 'tiktok', utm_medium: 'social' },
  hn: { utm_source: 'hackernews', utm_medium: 'social' },
  wa: { utm_source: 'whatsapp', utm_medium: 'social' },
  whatsapp: { utm_source: 'whatsapp', utm_medium: 'social' },
  nl: { utm_source: 'newsletter', utm_medium: 'email' },
  email: { utm_source: 'email', utm_medium: 'email' },
};

export const SOCIAL_PATH_SUFFIXES = new Set(Object.keys(SOCIAL_UTM_MAP));

/** User-agents that only need OG meta (full RSC pages are too large for LinkedIn etc.). */
export const LINK_PREVIEW_BOT_RE =
  /LinkedInBot|LinkedIn|facebookexternalhit|Facebot|Meta-ExternalAgent|Meta-ExternalFetcher|Slackbot|Slack-ImgProxy|Twitterbot|WhatsApp|TelegramBot|Telegram|Discordbot|Pinterest|vkShare|Applebot|redditbot|embedly|quora link preview|outbrain|Buffer|bufferbot|Bluesky|Warpcast|Farcaster|Iframely|SkypeUriPreview|Viber|Line\/|Google-PageRenderer|bingpreview|YahooLinkPreview|NotionEmbedder|Mattermost|Rocket\.Chat|W3C_Validator|BitlyBot|Tumblr|Xing.Bot|Screaming FrogSEOSpider/i;

export function stripSocialPathSuffix(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1]?.toLowerCase();
  if (last && SOCIAL_PATH_SUFFIXES.has(last)) {
    parts.pop();
  }
  return parts.length ? `/${parts.join('/')}` : '/';
}

/** Detect link-preview crawlers and headless fetchers (no Sec-Fetch navigation signals). */
export function isLinkPreviewCrawlerRequest(request: {
  headers: Headers;
  method: string;
}): boolean {
  const ua = request.headers.get('user-agent') || '';
  if (LINK_PREVIEW_BOT_RE.test(ua)) return true;
  const method = request.method.toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') return false;

  const fetchMode = request.headers.get('sec-fetch-mode');
  const fetchDest = request.headers.get('sec-fetch-dest');
  const fetchUser = request.headers.get('sec-fetch-user');
  const hasBrowserNavigationSignal =
    fetchMode === 'navigate' || fetchDest === 'document' || fetchUser === '?1';
  return !hasBrowserNavigationSignal;
}
