/**
 * Social share path suffixes (/ebc/dc → Discord UTM) and link-preview crawlers.
 * Keep og-meta stripSocialPathSuffix, middleware UTM handling, and bot OG rewrites in sync via this module.
 */
import {
  PUBLIC_PAGE_ALIASES as RAW_PUBLIC_PAGE_ALIASES,
  SOCIAL_PATH_SUFFIXES as RAW_SOCIAL_PATH_SUFFIXES,
  SOCIAL_UTM_MAP as RAW_SOCIAL_UTM_MAP,
  sanitizeCompanyForSocial,
} from './social-share-constants.mjs';

export { sanitizeCompanyForSocial };

export const SOCIAL_UTM_MAP: Record<string, { utm_source: string; utm_medium: string }> = RAW_SOCIAL_UTM_MAP;

export const SOCIAL_PATH_SUFFIXES: Set<string> = RAW_SOCIAL_PATH_SUFFIXES;

export const PUBLIC_PAGE_ALIASES: Record<string, string> = RAW_PUBLIC_PAGE_ALIASES;

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

const GOOGLE_SEARCH_CRAWLER_RE = /Googlebot|Google-InspectionTool|Google-PageRenderer/i;

export function stripSocialPathSuffix(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1]?.toLowerCase();
  // /dc is an assigned job URL. Discord attribution remains /<page>/dc or /discord for home.
  if (parts.length === 1 && last === 'dc') return `/${parts[0]}`;
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
  if (GOOGLE_SEARCH_CRAWLER_RE.test(ua)) return false;
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
  if (GOOGLE_SEARCH_CRAWLER_RE.test(userAgent)) return null;
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
