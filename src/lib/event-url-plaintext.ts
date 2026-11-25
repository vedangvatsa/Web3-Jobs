/**
 * Remove outbound URLs from organizer copy while keeping readable names and lists.
 * Event detail pages do not render hyperlinks in the body (Safe Browsing / phishing risk).
 */

const MARKDOWN_LINK = /\[([^\]\n]+)\]\(\s*https?:\/\/[^\s)]+\s*\)/gi;

const NAME_PAREN_URL =
  /(^|[\s,;\-·•\u00b7]|and\s+)(@?[A-Za-z0-9][\p{L}\p{N}\s&''.+/\-]{0,48}?)\s*\(\s*https?:\/\/[^\s)]+\s*\)/gu;

const BARE_URL = /https?:\/\/[^\s<>"')\]]+/gi;

function stripUrlsInSegment(segment: string): string {
  let out = segment.replace(MARKDOWN_LINK, '$1');
  let prev = '';
  while (out !== prev) {
    prev = out;
    out = out.replace(NAME_PAREN_URL, '$1$2');
  }
  out = out.replace(BARE_URL, '');
  out = out.replace(/\(\s*\)/g, '');
  out = out.replace(/[ \t]+([,;.])(?=\s|$)/g, '$1');
  out = out.replace(/[ \t]{2,}/g, ' ');
  out = out.replace(/ ([,;])/g, '$1');
  return out;
}

/** `Name (https://…)` → `Name`; drop bare URLs and empty parentheses. */
export function stripUrlsFromOrganizerCopy(text: string): string {
  if (!text?.trim()) return '';
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  let code: string[] | null = null;
  for (const line of lines) {
  if (/^\s*```/.test(line)) {
      if (code) {
        out.push(...code, line);
        code = null;
      } else {
        code = [line];
      }
      continue;
    }
    if (code) {
      code.push(line);
      continue;
    }
    out.push(stripUrlsInSegment(line));
  }
  if (code) out.push(...code);
  return out
    .join('\n')
    .replace(/\n[ \t]+\n/g, '\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}