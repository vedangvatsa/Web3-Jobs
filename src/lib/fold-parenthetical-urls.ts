/** Shared markdown link folding for `Brand (https://…)` patterns in event copy. */

export function cleanUrlTracking(url: string): string {
  try {
    const parsed = new URL(url);
    for (const p of Array.from(parsed.searchParams.keys())) {
      if (/^utm_|^ref_|^fbclid|^gclid/i.test(p)) parsed.searchParams.delete(p);
    }
    const cleanSearch = parsed.searchParams.toString();
    parsed.search = cleanSearch ? `?${cleanSearch}` : '';
    return parsed.toString();
  } catch {
    return url.replace(/([?&])utm_[a-z0-9_=-]+/gi, '').replace(/\?$/, '');
  }
}

const GENERAL_NAME_URL =
  /(^|[\s,;\-·•\u00b7]|and\s+)(@?[A-Za-z0-9][\p{L}\p{N}\s&''.+/\-]{0,48}?)\s*\(\s*(https?:\/\/[^\s)]+)\s*\)/gu;

/**
 * Turn `Tria (https://x.com/useTria)` into `[Tria](https://x.com/useTria)` everywhere,
 * including after `Co-hosts:`, middle-dot lists, and commas.
 */
export function foldParentheticalUrls(text: string): string {
  let out = text;

  out = out.replace(
    /(\b(?:thank you to our (?:partners|sponsors|supporters)|hosted by|co-hosted by|presented by|supported by|sponsored by|with|by|x|&)\s+)([A-Z0-9][\p{L}\p{N}\s&''+\-]{1,40})\s*\(\s*(https?:\/\/[^\s)]+)\s*\)/giu,
    (_, lead, name, url) => `${lead}[${name.trim()}](${cleanUrlTracking(url)})`,
  );

  let prev = '';
  while (out !== prev) {
    prev = out;
    out = out.replace(GENERAL_NAME_URL, (match, prefix, name, url) => {
      let label = name.trim().replace(/^(?:and|or)\s+/i, '');
      if (!label || label.length < 2) return match;
      if (/^(?:co-hosts?|partners?|media partners?|hosted by)$/i.test(label)) return match;
      if (/^https?:\/\//i.test(label)) return match;
      return `${prefix}[${label}](${cleanUrlTracking(url)})`;
    });
  }

  return out;
}