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

export const PUBLIC_PAGE_ALIASES: Record<string, string> = {
  '/docs': '/developers',
  '/api-docs': '/developers',
  '/auth': '/developers',
  '/api-policy': '/api-policy.md',
  '/the-shape-of-ethereum-topological-anomaly-detection': '/shape-of-ethereum',
  '/arbitrum-offchain-labs': '/offchain-labs',
  '/arbitrum': '/offchain-labs',
  '/certik-detailed': '/certik',
  '/aztec-labs-privacy-l2': '/aztec',
  '/aztec-labs': '/aztec',
  '/aztec-network': '/aztec',
  '/tools/interview-questions': '/interview-questions',
  '/tools/salary-calculator': '/salary-calculator',
  '/tools/resume-builder': '/resume-builder',
  '/tools': '/',
  '/guides/web3-salaries': '/salary-calculator',
  '/guides': '/',
  '/what-is-bitcoin': '/bitcoin',
  '/what-is-ethereum': '/ethereum',
  '/what-is-solana': '/jobs',
  '/what-is-defi': '/defi',
  '/what-is-nft': '/nft',
  '/what-is-web3': '/web3',
  '/what-is-blockchain': '/blockchain',
  '/where-b2b-stablecoin-money-actually-flows': '/b2b-stablecoin-flows',
  '/what-is-dao': '/dao',
  '/what-is-staking': '/staking',
  '/what-is-a-token': '/token',
  '/how-to-build-a-web3-resume': '/how-to-build-a-web3-resume-that-stands-out',
  '/gas-optimization-guide-for-solidity-developers': '/gas-optimization-techniques-for-solidity-developers',
  '/how-to-be-a-good-community-moderator': '/web3-community-manager-career',
  '/deprecation-policy': '/api-policy.md',
  '/versioning-policy': '/api-policy.md',
  '/popups/ns': '/ns',
  '/popups/logos': '/logos-society',
  '/popups/logos-society': '/logos-society',
  '/crypto-tax-bills': '/tax-bills',
  '/nasdaq-tokenized-stocks': '/nasdaq-tokens',
  '/jio': '/jio-perpetuals',
  '/terms-of-use': '/terms-of-use.md',
  '/terms': '/terms-of-use.md',
  '/tos': '/terms-of-use.md',
};

export function isResourcePath(pathname: string): boolean {
  return pathname.includes('.') || /^\/(?:api|_next|data|job-catalog|job-shards|job-description-shards|articles-data|preview|og|images|logo|fonts|responsive)(?:\/|$)/i.test(pathname);
}

export function canonicalSocialPagePath(contentPath: string): string {
  if (isResourcePath(contentPath)) return contentPath;
  const path = contentPath.toLowerCase();
  if (Object.hasOwn(PUBLIC_PAGE_ALIASES, path)) return PUBLIC_PAGE_ALIASES[path];
  const popupSlug = path.match(/^\/popups\/([^/]+)$/)?.[1];
  return popupSlug && !SOCIAL_PATH_SUFFIXES.has(popupSlug) ? `/${popupSlug}` : path;
}

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

// App Hosting can drop crawler User-Agent headers on GET. Suffixed links without
// browser navigation signals still need a preview; RSC requests belong to Next.
export function isLinkPreviewCrawlerRequest(request: {
  headers: Headers;
  method: string;
}): boolean {
  const method = request.method.toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') return false;
  const ua = request.headers.get('user-agent') || '';
  if (LINK_PREVIEW_BOT_RE.test(ua)) return true;

  const fetchMode = request.headers.get('sec-fetch-mode');
  const fetchDest = request.headers.get('sec-fetch-dest');
  const fetchUser = request.headers.get('sec-fetch-user');
  const hasBrowserNavigationSignal =
    fetchMode === 'navigate' || fetchDest === 'document' || fetchUser === '?1' || request.headers.get('rsc') === '1';
  return !hasBrowserNavigationSignal;
}

/** Static preview shell path for bots (must match middleware rewrite targets). */
export function linkPreviewPreviewPath(
  pathname: string,
  userAgent: string,
  headlessOrBot: boolean,
): string | null {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  if (isResourcePath(normalizedPath)) return null;
  const contentPath = stripSocialPathSuffix(normalizedPath);
  const hasSocialSuffix = contentPath !== normalizedPath;
  const isLinkPreviewBot =
    LINK_PREVIEW_BOT_RE.test(userAgent) || (hasSocialSuffix && headlessOrBot);
  if (!isLinkPreviewBot) return null;
  const canonicalPath = canonicalSocialPagePath(contentPath);
  if (isResourcePath(canonicalPath)) return null;
  return canonicalPath === '/' ? '/preview/index.html' : `/preview${canonicalPath}.html`;
}
