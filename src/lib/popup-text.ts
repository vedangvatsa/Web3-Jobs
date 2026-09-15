import { shouldDropPopupLine } from '@/lib/popup-copy-guard';

/** Normalize popup copy for display (entities, mojibake, stray UI scrape). */
export function formatPopupText(text: string): string {
  let t = text
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/Â(?=[A-Za-z])/g, '')
    .replace(/\s*\u2666\s*/g, ' ')
    .replace(/♔/g, '')
    .replace(/→/g, ' ')
    .replace(/[\u200b-\u200d\ufeff]/g, '');

  // Undo accidental "xyz. city" / "ns. com" splits from earlier bad sentence chopping
  t = t.replace(/\b([a-z0-9]+)\.\s+(city|com|io|co|bt|ai|xyz|org|net)\b/gi, '$1.$2');

  t = t.replace(/\s+/g, ' ').trim();
  t = t.replace(/\s+([.,;:])/g, '$1');
  return t;
}

export function formatPopupParagraph(text: string): string {
  return formatPopupText(text).replace(/\n+/g, ' ');
}

/** Drop lines that are clearly nav/marketing scrape, not editorial copy. */
export function isPopupScrapeNoise(line: string): boolean {
  const t = formatPopupText(line);
  if (t.length < 12) return true;
  if (/^Read more/i.test(t)) return true;
  if (/Get a job/i.test(t)) return true;
  if (/All results go into/i.test(t)) return true;
  if (/Burn Calories/i.test(t)) return true;
  if (/^\d{2}\s*-\s*What .+ do /i.test(t)) return true;
  if (/database\.\s*$/i.test(t) && t.length < 120) return true;
  // Sourced-from-NS meta lines (attribution belongs in the linked footer, not body copy)
  if (/appears (in|on) Network School/i.test(t)) return true;
  if (/shows up on the Network School dashboard/i.test(t)) return true;
  if (/listed on the Network School dashboard/i.test(t)) return true;
  if (/on the Network School (dashboard|list)\b/i.test(t)) return true;
  if (/Network School directories/i.test(t)) return true;
  // Scrape section headers / FAQ prompts
  if (/^Amenities in .+ include:?$/i.test(t)) return true;
  if (/^Tickets include:?$/i.test(t)) return true;
  if (/shows up in the same .+ directories/i.test(t)) return true;
  if (/\b(in|across|on) (?:both |the )?(?:xyz\.city and Network School )?directories\b/i.test(t)) return true;
  if (/^What (is|kind of|are)\b.+\?$/i.test(t)) return true;
  if (shouldDropPopupLine(t)) return true;
  return false;
}

/** Tweet / post copy: keep paragraph breaks, normalize each line. */
export function formatPopupPostText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => formatPopupText(line))
    .filter(Boolean)
    .join('\n\n');
}

export function filterPopupBody(body: string[]): string[] {
  return body.map(formatPopupParagraph).filter((p) => p.length > 0 && !isPopupScrapeNoise(p));
}

/**
 * Split prose into sentences without breaking domains like xyz.city or ns.com.
 */
export function splitPopupSentences(block: string): string[] {
  const text = formatPopupParagraph(block);
  if (!text) return [];

  const protectedText = text.replace(
    /\b([a-z0-9-]+)\.(city|com|io|co|bt|ai|xyz|org|net|app)\b/gi,
    (_, a, b) => `${a}DOT${b}`
  );

  const parts =
    protectedText.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)?.map((s) => s.trim()) ?? [protectedText];

  return parts
    .map((s) => s.replace(/DOT/g, '.').trim())
    .filter((s) => s.length > 0);
}
