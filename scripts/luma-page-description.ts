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

/** Recursively format a ProseMirror document object into structured text. */
export function proseMirrorToFormattedText(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.text) return node.text;

  const type = node.type;
  const content = Array.isArray(node.content) ? node.content.map(proseMirrorToFormattedText).join('') : '';

  if (type === 'paragraph') {
    return content ? `${content}\n\n` : '\n';
  }
  if (type === 'heading') {
    return `\n${content}\n\n`;
  }
  if (type === 'bulletList' || type === 'orderedList') {
    return `\n${content}\n`;
  }
  if (type === 'listItem') {
    return `• ${content.trim()}\n`;
  }
  if (type === 'hardBreak') {
    return '\n';
  }
  if (type === 'blockquote') {
    return `\n> ${content.trim()}\n\n`;
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
export function normalizeLumaDescriptionForStorage(text: string, maxLen = 3500): string {
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
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html' } });
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
