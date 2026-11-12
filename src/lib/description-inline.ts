import { createElement, Fragment, type ReactNode } from 'react';
import { stripThirdPartyCommunityPromo } from '@/lib/community-link-sanitizer';

function cleanUrlTracking(url: string): string {
  try {
    const parsed = new URL(url);
    const params = Array.from(parsed.searchParams.keys());
    for (const p of params) {
      if (/^utm_|^ref_|^fbclid|^gclid/i.test(p)) {
        parsed.searchParams.delete(p);
      }
    }
    const cleanSearch = parsed.searchParams.toString();
    parsed.search = cleanSearch ? `?${cleanSearch}` : '';
    return parsed.toString();
  } catch {
    return url.replace(/([?&])utm_[a-z0-9_=-]+/gi, '').replace(/\?$/, '');
  }
}

function foldParentheticalUrls(text: string): string {
  // 1. Entities after lead words (e.g. "hosted by Solana Foundation (https://...)", "Thank You to Our Partners Solana Foundation")
  text = text.replace(/(\b(?:thank you to our (?:partners|sponsors|supporters)|hosted by|co-hosted by|presented by|supported by|sponsored by|with|by|and|x|&)\s+)([A-Z0-9][\p{L}\p{N}\s&’'+\-]{1,40})\s*\(\s*(https?:\/\/[^\s)]+)\s*\)/gui,
    (_, lead, name, url) => `${lead}[${name.trim()}](${cleanUrlTracking(url)})`);

  // 2. Action phrases (e.g. "Follow us on X (https://...)", "join OFFLINE's Telegram (https://...)")
  text = text.replace(/(\b(?:follow us on|join|check out|visit|connect on|see)\s+[A-Za-z0-9’'\s]{2,30})\s*\(\s*(https?:\/\/[^\s)]+)\s*\)/gui,
    (_, action, url) => `[${action.trim()}](${cleanUrlTracking(url)})`);

  // 3. Standalone capitalized names (e.g. "Solana Spaces (https://...)", "CUDIS (https://...)")
  text = text.replace(/(^|[.;!?]\s+|,\s+)([A-Z0-9][\p{L}\p{N}\s&’'+\-]{1,40})\s*\(\s*(https?:\/\/[^\s)]+)\s*\)/gu,
    (_, prefix, name, url) => `${prefix}[${name.trim()}](${cleanUrlTracking(url)})`);

  return text;
}

const tokens = /\[(?<label>[^\]\n]+)\]\((?<href>https?:\/\/[^\s)]+(?:\([^\s)]*\)[^\s)]*)*)\)|\*\*(?<bold>[^*]+)\*\*|__(?<boldUnder>[^_]+)__|`(?<code>[^`\n]+)`|(?<!\*)\*(?<italic>[^*\n]+)\*(?!\*)|(?<url>https?:\/\/[^\s<>"']+)/g;

export function renderDescriptionInline(text: string, depth = 0, links = true): ReactNode {
  if (depth > 5) return text;
  if (depth === 0 && text) {
    text = stripThirdPartyCommunityPromo(text);
  }
  if (depth === 0 && text) {
    text = foldParentheticalUrls(text);
  }
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(tokens)) {
    const groups = match.groups!;
    const index = match.index!;
    if (index > cursor) nodes.push(text.slice(cursor, index));
    let length = match[0].length;
    let node: ReactNode;
    if (groups.href || groups.url) {
      let href = groups.href || groups.url;
      if (!groups.href) {
        href = href.replace(/[.,;!?]+$/, '');
        for (const [open, close] of [['(', ')'], ['[', ']'], ['{', '}']]) {
          while (href.endsWith(close) && href.split(close).length > href.split(open).length) href = href.slice(0, -1);
        }
        length = href.length;
      }
      const label = groups.label ? renderDescriptionInline(groups.label, depth + 1, false) : href;
      node = links ? createElement('a', {
        href, target: '_blank', rel: 'noopener noreferrer',
        className: 'break-words font-medium text-foreground underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4',
      }, label) : label;
    } else if (groups.code) node = createElement('code', { className: 'rounded bg-muted px-1 text-sm' }, groups.code);
    else node = createElement(groups.italic ? 'em' : 'strong', null,
      renderDescriptionInline(groups.italic || groups.bold || groups.boldUnder, depth + 1, links));
    nodes.push(createElement(Fragment, { key: index }, node));
    cursor = index + length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes.length ? nodes : text;
}
