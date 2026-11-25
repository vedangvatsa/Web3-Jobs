import { createElement, Fragment, type ReactNode } from 'react';
import { linkifyPlainCtaUrlsInMarkdown } from '@/lib/linkify-cta-urls';
import { stripThirdPartyCommunityPromo } from '@/lib/community-link-sanitizer';
import { foldParentheticalUrls } from '@/lib/fold-parenthetical-urls';
import { polishEventDescriptionLinks } from '@/lib/event-description-links';

const tokens = /\[(?<label>[^\]\n]+)\]\((?<href>https?:\/\/[^\s)]+(?:\([^\s)]*\)[^\s)]*)*)\)|\*\*(?<bold>[^*]+)\*\*|__(?<boldUnder>[^_]+)__|`(?<code>[^`\n]+)`|(?<!\*)\*(?<italic>[^*\n]+)\*(?!\*)|(?<url>https?:\/\/[^\s<>"']+)/g;

export function renderDescriptionInline(text: string, depth = 0, links = true): ReactNode {
  if (depth > 5) return text;
  if (depth === 0 && text) {
    text = stripThirdPartyCommunityPromo(text);
  }
  if (depth === 0 && text && links) {
    text = linkifyPlainCtaUrlsInMarkdown(text);
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
      if (!links) {
        if (groups.label) {
          node = renderDescriptionInline(groups.label, depth + 1, false);
        } else {
          cursor = index + match[0].length;
          continue;
        }
      } else {
      const label = groups.label ? renderDescriptionInline(groups.label, depth + 1, false) : href;
      node = createElement('a', {
        href, target: '_blank', rel: 'noopener noreferrer',
        className: 'break-words font-medium text-foreground underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4',
      }, label);
      }
    } else if (groups.code) node = createElement('code', { className: 'rounded bg-muted px-1 text-sm' }, groups.code);
    else node = createElement(groups.italic ? 'em' : 'strong', null,
      renderDescriptionInline(groups.italic || groups.bold || groups.boldUnder, depth + 1, links));
    nodes.push(createElement(Fragment, { key: index }, node));
    cursor = index + length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes.length ? nodes : text;
}

/** Event detail body: no hyperlinks; organizer copy is URL-stripped before render. */
export function renderEventBodyInline(text: string): ReactNode {
  return renderDescriptionInline(polishEventDescriptionLinks(text), 0, false);
}
