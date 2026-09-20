const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const LUMA_HUB_BLURB = /complete guide to the most important crypto gatherings around the world/i;
const SYNC_STUB = /Web3 community event\b/i;

function unescapeEmbeddedJsonString(fragment: string): string {
  try {
    return JSON.parse(`"${fragment}"`) as string;
  } catch {
    return fragment.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
}

/** Keep block boundaries and source links when flattening Luma's rich-text document. */
export function proseMirrorToFormattedText(node: unknown): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(proseMirrorToFormattedText).join('');
  if (typeof node !== 'object') return '';
  const value = node as Record<string, unknown>;
  if (typeof value.text === 'string') {
    let text = value.text;
    if (Array.isArray(value.marks)) {
      for (const mark of value.marks) {
        if (mark?.type === 'link' && typeof mark.attrs?.href === 'string' && /^https?:\/\//i.test(mark.attrs.href) && mark.attrs.href !== text) {
          text += ` (${mark.attrs.href})`;
        }
      }
    }
    return text;
  }
  const type = value.type;
  const children: unknown[] = Array.isArray(value.content) ? value.content : [];
  const content = children.map(proseMirrorToFormattedText).join('');

  if (type === 'paragraph') {
    return content ? `${content}\n\n` : '\n';
  }
  if (type === 'heading') {
    return `\n## ${content.trim()}\n\n`;
  }
  if (type === 'bulletList' || type === 'bullet_list' || type === 'orderedList' || type === 'ordered_list') {
    const ordered = type === 'orderedList' || type === 'ordered_list';
    const attrs = value.attrs as Record<string, unknown> | undefined;
    const start = typeof attrs?.start === 'number' ? attrs.start : typeof attrs?.order === 'number' ? attrs.order : 1;
    const items = children.map((child, index) => {
      const body = proseMirrorToFormattedText(child).trim().replace(/\n+/g, '\n  ');
      return `${ordered ? `${start + index}.` : '•'} ${body}`;
    });
    return `\n${items.join('\n')}\n\n`;
  }
  if (type === 'listItem' || type === 'list_item') {
    return content;
  }
  if (type === 'hardBreak' || type === 'hard_break') {
    return '\n';
  }
  if (type === 'blockquote') {
    return `\n${content.trim().split('\n').map((line) => `> ${line}`).join('\n')}\n\n`;
  }
  return content;
}

/** Extract all ProseMirror description_mirror JSON documents embedded in Luma HTML. */
export function extractProseMirrorDescriptionsFromHtml(html: string): string[] {
  const needle = '"description_mirror":';
  let pos = 0;
  const docs: string[] = [];
  while ((pos = html.indexOf(needle, pos)) !== -1) {
    const start = pos + needle.length;
    const openBrace = html.indexOf('{', start);
    if (openBrace === -1 || openBrace - start > 10) {
      pos = start;
      continue;
    }
    let depth = 0;
    let inString = false;
    let escape = false;
    let end = -1;
    for (let i = openBrace; i < html.length; i++) {
      const c = html[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (c === '\\') {
        escape = true;
        continue;
      }
      if (c === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (c === '{') depth++;
        else if (c === '}') {
          depth--;
          if (depth === 0) {
            end = i + 1;
            break;
          }
        }
      }
    }
    if (end !== -1) {
      try {
        const parsed = JSON.parse(html.slice(openBrace, end));
        const formatted = proseMirrorToFormattedText(parsed).trim();
        if (formatted) docs.push(formatted);
      } catch {
        // ignore unparseable block
      }
      pos = end;
    } else {
      pos = start;
    }
  }
  return docs;
}

/** Longest organiser description embedded in a Luma event HTML page. */
export function extractLumaDescriptionsFromHtml(html: string): string[] {
  const found: string[] = [];

  // 1. Try ProseMirror documents first (modern Luma rich text editor format)
  const pmDocs = extractProseMirrorDescriptionsFromHtml(html);
  found.push(...pmDocs);

  // 2. Legacy/fallback string descriptions
  const re = /"description":"((?:\\.|[^"\\]){60,})"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    found.push(unescapeEmbeddedJsonString(match[1]));
  }
  return found;
}

export function pickBestLumaOrganizerDescription(candidates: string[]): string | null {
  const filtered = candidates.filter((text) => {
    const t = text.trim();
    if (!t || t.length < 80) return false;
    if (LUMA_HUB_BLURB.test(t)) return false;
    if (SYNC_STUB.test(t) && t.length < 220) return false;
    return true;
  });
  if (!filtered.length) return null;
  return filtered.sort((a, b) => b.length - a.length)[0] ?? null;
}

/** Plain text for JSON / meta (keeps sentence structure, cleans excessive whitespace). */
export function normalizeLumaDescriptionForStorage(text: string, maxLen?: number): string {
  const withoutEmoji = text.replace(
    /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu,
    '',
  );
  return withoutEmoji
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim()
    .slice(0, maxLen);
}

export async function fetchLumaOrganizerDescription(eventUrl: string): Promise<string | null> {
  const url = eventUrl.replace(/^https?:\/\/lu\.ma\//i, 'https://luma.com/');
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html' }, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) return null;
  const html = await res.text();
  const best = pickBestLumaOrganizerDescription(extractLumaDescriptionsFromHtml(html));
  return best ? normalizeLumaDescriptionForStorage(best) : null;
}

export function isLumaSyncStubDescription(description: string): boolean {
  const t = description.trim();
  if (!t) return true;
  if (SYNC_STUB.test(t) && t.length < 320) return true;
  return false;
}
