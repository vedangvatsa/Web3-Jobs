/**
 * Strip third-party Telegram/WhatsApp/Discord community links and
 * "join our community" call-to-action sentences from event/job/company
 * content.
 *
 * Organizer communities pattern-match the social-engineering classifiers
 * behind the Google Safe Browsing flag on this site (2026-11-12), so their
 * community links leave our pages entirely.
 *
 * The site's own channels (web3hiring, web3newsfeed, hashtagweb3,
 * web3jobs_rep) are always preserved.
 */

const OWN_HANDLES = new Set(['hashtagweb3', 'web3hiring', 'web3newsfeed', 'web3jobs_rep']);

const COMMUNITY_URL_SOURCE =
 '(?:https?:\\/\\/)?(?:www\\.)?(?:t\\.me\\/|telegram\\.me\\/|telegram\\.dog\\/|chat\\.whatsapp\\.com\\/|wa\\.me\\/|api\\.whatsapp\\.com\\/|whatsapp\\.com\\/(?:channel\\/|invite\\/)|discord\\.gg\\/|discord(?:app)?\\.com\\/invite\\/)([A-Za-z0-9_.+-]+)';

const OWN_TOKEN =
 /t\.me\/(?:hashtagweb3|web3hiring|web3newsfeed|web3jobs_rep)\b|@(?:hashtagweb3|web3hiring|web3newsfeed|web3jobs_rep)\b/i;

const PLATFORM = /\b(?:telegram|whatsapp|discord)\b/i;
const JOIN_VERB =
 /\b(?:join|connect|follow|chat|sign\s?up|subscribe|dm\b|message\s+us|contact\s+us|reach\s+us|find\s+us)\b/i;
const GROUP_WORD = /\b(?:group|channel|community|chat)\b/i;

export function isOwnCommunityHandle(handle: string | undefined | null): boolean {
 return !!handle && OWN_HANDLES.has(handle.toLowerCase());
}

function mentionsCommunityPlatform(text: string): boolean {
 return /t\.me\/|telegram\.|whatsapp|wa\.me\/|discord/i.test(text);
}

/**
 * Remove bare and markdown links to third-party communities. HTML-safe
 * (never drops markup) — use on job HTML and other markup-bearing text.
 */
export function stripThirdPartyCommunityUrls(text: string): string {
 if (!text || !mentionsCommunityPlatform(text)) return text;

 const urlRe = new RegExp(COMMUNITY_URL_SOURCE, 'gi');

 // Markdown links: [label](url) — drop the whole link when it promotes joining.
 let out = text.replace(
  /\[([^\]\n]*)\]\(\s*(https?:\/\/[^\s)]+)\s*\)/g,
  (full: string, label: string, url: string) => {
   urlRe.lastIndex = 0;
   const match = urlRe.exec(url);
   if (!match || isOwnCommunityHandle(match[1])) return full;
   return /\b(?:join|follow|connect|chat|channel|group|community)\b/i.test(label) ? ' ' : label;
  },
 );

 // Bare URLs — keep ours, drop the rest.
 urlRe.lastIndex = 0;
 out = out.replace(urlRe, (full: string, handle: string) =>
  isOwnCommunityHandle(handle) ? full : ' ',
 );

 return out;
}

/**
 * URLs plus the containing CTA sentences. Text-only input (event
 * descriptions, summaries) — never apply to markup-bearing strings.
 *
 * A sentence is dropped when it mentions a third-party community platform
 * and looks promotional: a join verb, a group/channel/community word, an
 * @handle, or a link that was removed. Informational mentions without any
 * of those signals ("TON is Telegram's blockchain") survive.
 */
export function stripThirdPartyCommunityPromo(text: string): string {
 if (!text || !mentionsCommunityPlatform(text)) return text;

 const parts = stripThirdPartyCommunityUrls(text)
  .split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])|\n+/)
  .filter((sentence) => {
   if (!PLATFORM.test(sentence)) return true;
   if (OWN_TOKEN.test(sentence)) return true; // our own channels stay
   if (JOIN_VERB.test(sentence)) return false;
   if (GROUP_WORD.test(sentence)) return false;
   if (/@[A-Za-z0-9_]{3,}/.test(sentence) && stripThirdPartyCommunityUrls(sentence) !== sentence) return false;
   if (stripThirdPartyCommunityUrls(sentence) !== sentence) return false;
   return true;
  });

 return parts
  .join('\n')
  .replace(/[ \t]{2,}/g, ' ')
  .replace(/ +\n/g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim();
}
