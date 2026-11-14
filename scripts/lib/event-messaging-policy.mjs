/**
 * Canonical policy for third-party messaging-community links
 * (Telegram / WhatsApp / Discord invite-style URLs) in event records.
 *
 * Organizer "join our community" links pattern-match the social-engineering
 * classifiers behind the Google Safe Browsing flag on this site
 * (2026-11-12), so they must never reach an event page. Layered guarantee:
 *
 *   1. Prevention  — `canImportEvent` (event-retention.mjs) rejects any
 *      record carrying one of these URLs in ANY field, so discovery writers
 *      and the runtime build can never import one.
 *   2. Alarm       — scripts/audit-event-catalog-safety.ts hard-fails the
 *      refresh workflow if one ever lands in the committed catalog.
 *   3. Render      — src/lib/community-link-sanitizer.ts mirrors these
 *      rules for displayed text (last line of defense).
 *
 * The site's own channels (hashtagweb3, web3hiring, web3newsfeed,
 * web3jobs_rep) are always allowed.
 */

export const OWN_COMMUNITY_HANDLES = new Set([
  'hashtagweb3',
  'web3hiring',
  'web3newsfeed',
  'web3jobs_rep',
]);

// Mirrors COMMUNITY_URL_SOURCE in src/lib/community-link-sanitizer.ts.
const MESSAGING_COMMUNITY_URL_SOURCE =
  '(?:https?:\\/\\/)?(?:www\\.)?(?:t\\.me\\/|telegram\\.me\\/|telegram\\.dog\\/|chat\\.whatsapp\\.com\\/|wa\\.me\\/|api\\.whatsapp\\.com\\/|whatsapp\\.com\\/(?:channel\\/|invite\\/)|discord\\.gg\\/|discord(?:app)?\\.com\\/invite\\/)([A-Za-z0-9_.+-]+)';

const MESSAGING_COMMUNITY_URL_RE = new RegExp(MESSAGING_COMMUNITY_URL_SOURCE, 'gi');

export function isOwnMessagingCommunityHandle(handle) {
  return !!handle && OWN_COMMUNITY_HANDLES.has(handle.toLowerCase());
}

/** All third-party messaging-community URLs in a string (own handles excluded). */
export function findMessagingCommunityUrls(text) {
  if (!text || typeof text !== 'string') return [];
  MESSAGING_COMMUNITY_URL_RE.lastIndex = 0;
  const hits = [];
  let match;
  while ((match = MESSAGING_COMMUNITY_URL_RE.exec(text))) {
    if (!isOwnMessagingCommunityHandle(match[1])) hits.push({ url: match[0], handle: match[1] });
  }
  return hits;
}

/**
 * Deep-walk every string field of an event record and return the first
 * third-party messaging-community link, or null when the record is clean.
 *
 * Records are crawled content: an organizer CTA can hide in any field
 * (description, extras, evidence, nested verification payloads), so this
 * never trusts a field allowlist. Returns { path, url, handle } so callers
 * can log exactly where the link came from.
 */
export function findEventMessagingCommunityLink(value, path = 'event') {
  if (typeof value === 'string') {
    const hit = findMessagingCommunityUrls(value)[0];
    return hit ? { path, url: hit.url, handle: hit.handle } : null;
  }
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const hit = findEventMessagingCommunityLink(value[index], `${path}[${index}]`);
      if (hit) return hit;
    }
    return null;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      const hit = findEventMessagingCommunityLink(child, path ? `${path}.${key}` : key);
      if (hit) return hit;
    }
  }
  return null;
}
