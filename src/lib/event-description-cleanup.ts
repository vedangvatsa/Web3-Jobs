/**
 * Formatting and grammar cleanup for scraped event descriptions.
 *
 * Official-site scrapes sometimes carry stat-counter numbers ("1200", "+10.00"),
 * unlabeled price fragments and missing possessive apostrophes ("Indias",
 * "industrys"). This pass removes artifacts that render as broken fragments and
 * fixes the systematic grammar artifacts; content-level rewrites live in the
 * reviewed catalog data (content/events/catalog-reviewed-descriptions.json).
 *
 * The site's own community-link sanitizer handles URLs separately
 * (community-link-sanitizer.ts); this module never touches links or markup.
 */

/** A line that is only a number/price fragment: a stat counter or unlabeled price. */
export const STANDALONE_STAT_LINE =
  /^\s*(?:\d{1,4}[+%]?|\+\d[\d.,]*%?|\d{1,3}(?:\.\d{3})+(?:\$|£|€)?|\d{1,3}(?:\.\d{3})+)\s*$/;

/** Standalone dashes, hyphens, and bullet marks that produce broken <p>-</p> blocks. */
export const STANDALONE_SEPARATOR_LINE = /^\s*[-–—•·*~_]{1,10}\s*$/;

/** Common scraped registration platform boilerplate lines. */
export const PLATFORM_BOILERPLATE_LINE =
  /^\s*(?:[-–—•·*]\s*)*(?:Sales ended|Refund Policy:?.*|Refunds up to \d+ days before event.*|\|\s*Eventbrite)\s*$/i;

/**
 * Systematic scrape grammar artifacts. Small, explicit, and safe: each pattern
 * only matches the misspelled form, never the correct one.
 */
const GRAMMAR_FIXES: Array<[RegExp, string]> = [
  [/\bIndias\b/g, "India's"],
  [/\bindustrys\b/g, "industry's"],
  [/\bthe worlds\b/g, "the world's"],
  [/\bcitie\b/g, 'cities'],
  [/(?<=[a-z]),(?=[A-Za-z])/g, ', '],
];

const WEEKDAY =
  'Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY';
const MONTH =
  'January|February|March|April|May|June|July|August|September|October|November|December|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER';

const LUMA_CHROME_TAIL =
  /\n\n(?:Location|Hosted By|Presented by|Registration|## Tickets|## Hosts)\b[\s\S]*$/i;

/** Drop Luma page chrome when a full HTML export was stored as the description. */
/** Drop trailing Luma date/venue/host-list footer duplicated from the page chrome. */
export function stripLumaEventFooterDuplicate(text: string): string {
  return text.replace(
    /\n\n[\u{1F4C5}\u{1F5D3}\uFE0F]?\s*(?:Saturday|Sunday|Monday|Tuesday|Wednesday|Thursday|Friday)[\s\S]*?\n(?:Media partners|Partners|Co-hosts):[^\n]+\s*$/iu,
    '',
  );
}

export function stripLumaExportChrome(text: string): string {
  if (!/LumaSkip to Content/i.test(text)) return text;
  const normalized = text.replace(/\r\n?/g, '\n');
  const about = normalized.match(
    /About Event\s*\n+([\s\S]*?)(?=\n\n(?:Location|Hosted By|Presented by|Registration)\b)/i,
  );
  if (about?.[1]?.trim()) {
    return about[1].replace(/^\u200b+/gm, '').trim();
  }
  const withoutPreamble = normalized.replace(/^[\s\S]*?LumaSkip to Content\s*\n+/i, '');
  const markdown = withoutPreamble.match(/(##[\s\S]+)/);
  if (markdown?.[1]) return markdown[1].replace(LUMA_CHROME_TAIL, '').trim();
  return withoutPreamble.replace(LUMA_CHROME_TAIL, '').trim();
}

const LIST_LINE_MAX = 72;

function isBulletCandidateLine(line: string): boolean {
  const t = line.trim();
  if (!t || t.length > LIST_LINE_MAX) return false;
  if (/^#{1,6}\s/.test(t) || /^[-*•·▪]\s/.test(t) || /^\d+[.)]\s/.test(t)) return false;
  if (/https?:\/\//.test(t)) return false;
  if (/^[A-Za-z][^:：]{0,48}[:：]\s/.test(t)) return false;
  if (STANDALONE_STAT_LINE.test(t) || STANDALONE_SEPARATOR_LINE.test(t)) return false;
  if (/\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Hangul}/u.test(t)) return false;
  if (/^\p{Extended_Pictographic}/u.test(t)) return false;
  if (/[.!?…]['")\]]?$/.test(t)) return false;
  return true;
}

/** Turn runs of 3+ short unpunctuated lines into markdown bullets (amenity lists, etc.). */
export function bulletizeShortFeatureRuns(text: string): string {
  const lines = text.split('\n');
  const out = [...lines];
  let run: number[] = [];
  let inCode = false;

  const flush = () => {
    if (run.length >= 3) {
      for (const i of run) {
        const t = out[i].trim();
        if (!/^[-*•·▪]\s/.test(t)) out[i] = `- ${t}`;
      }
    }
    run = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (/^```/.test(trimmed)) {
      flush();
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    if (!trimmed) {
      flush();
      continue;
    }
    if (isBulletCandidateLine(lines[i])) run.push(i);
    else flush();
  }
  flush();
  return out.join('\n');
}

/**
 * Luma scrapes sometimes flatten block layout into one paragraph. Re-insert
 * line breaks before headings, day sections, bullets, and session titles.
 */
function hasStructuredEventLayout(trimmedLines: string[]): boolean {
  const bulletLines = trimmedLines.filter((line) => /^[-*•·▪]\s+\S/.test(line.trim())).length;
  const headingLines = trimmedLines.filter((line) => /^#{1,6}\s+\S/.test(line.trim())).length;
  return bulletLines >= 2 || headingLines >= 2 || (headingLines >= 1 && bulletLines >= 1);
}

export function rebreakCollapsedEventParagraphs(text: string): string {
  if (!text) return text;
  const normalized = text.replace(/\r\n?/g, '\n');
  const trimmedLines = normalized.split('\n').filter((line) => line.trim());
  if (hasStructuredEventLayout(trimmedLines)) return normalized.trim();

  const longest = Math.max(0, ...trimmedLines.map((line) => line.trim().length));
  const looksFlattened =
    trimmedLines.length <= 4 || (trimmedLines.length <= 8 && longest > 360);
  if (!looksFlattened) return normalized.trim();

  let out = normalized;

  out = out.replace(/\s+(?=#{1,6}\s+\S)/g, '\n\n');
  out = out.replace(
    new RegExp(`(?<=[.!?\\p{Ll}\\d)])\\s+(?=(?:${WEEKDAY})\\b,?\\s+(?:${MONTH})\\b)`, 'giu'),
    '\n\n',
  );
  out = out.replace(
    new RegExp(`(?<=[.!?\\p{Ll}\\d)])\\s+(?=(?:${WEEKDAY})\\s+EVENING\\b)`, 'giu'),
    '\n\n',
  );
  out = out.replace(
    /(?<=[.!?\p{Ll}\d)])\s+(?=[A-Z][A-Z0-9\s&'’\-]{8,}?\s+\d{1,2}:\d{2}\s*(?:AM|PM|am|pm|a\.m\.|p\.m\.)?)/gu,
    '\n\n',
  );
  out = out.replace(
    /([A-Z][A-Z0-9\s&'’\-]{4,}?\d{1,2}:\d{2}\s*(?:AM|PM|am|pm|a\.m\.|p\.m\.)\s*-\s*\d{1,2}:\d{2}\s*(?:AM|PM|am|pm|a\.m\.|p\.m.)(?:\s*-\s*[\p{L}]+)?)\s+(?=[A-Z][\p{Ll}])/gu,
    '$1\n\n',
  );
  out = out.replace(
    /(?<=[.!?\p{Ll}\d)])\s+(?=(?:BE PART OF|WHAT TO EXPECT|WHO SHOULD ATTEND|EVENT FORMAT|HOW TO REGISTER|HOW TO JOIN|REGISTRATION)\b)/gu,
    '\n\n',
  );
  out = out.replace(
    /\b((?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+EVENING)\s*-\s*(?=[A-Z])/giu,
    '$1 · ',
  );
  out = out.replace(
    /(?<=[.!?])\s+(?=(?:One of|Two days|Three days|The event|This event|Join us|We invite|Hosted by)\b)/g,
    '\n\n',
  );
  out = out.replace(/\s+(?=[•·▪]\s+)/g, '\n');
  out = out.replace(/(\d{4})\n\s*-\s+([^\n]+)/g, '$1 - $2');
  out = out.replace(
    /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm|a\.m\.|p\.m.)(?:\s*-\s*[\p{L}]+)?)\n\s*-\s+(?=[A-Z][\p{Ll}])/gu,
    '$1\n\n',
  );
  out = out.replace(/(?:^|,)\s*(\d{4}\s*-\s*[\p{L}][\p{L}\s,.'-]{2,48})\s+(?=Two days\b)/gmu, (match) => `${match.trimEnd()}\n\n`);
  out = out.replace(
    /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm|a\.m\.|p\.m.)\s*-\s*[\p{L}]+)\s+(?=[A-Z][\p{Ll}])/gu,
    '$1\n\n',
  );
  out = out.replace(/\n\s*-\s+(?=[A-Z][\p{L}]+(?:,\s*[A-Z][\p{L}]+)?\s)/gu, '\n');
  out = out.replace(/\n\s*-\s+(?=[A-Z][\p{Ll}]{3,}\s)/gu, '\n');
  out = out.replace(
    /((?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[^\n]{0,40}EVENING)\n\s*([A-Z][A-Z\s&'’\-]{3,})/giu,
    '$1 · $2',
  );
  out = out.replace(/(?<=[a-z])\s+(?=BE PART OF\b)/gu, '\n\n');

  return out.replace(/\n{3,}/g, '\n\n').trim();
}

export function cleanupEventDescriptionFormat(text: string): string {
  if (!text) return text;
  let out = stripLumaExportChrome(text);
  out = stripLumaEventFooterDuplicate(out);
  out = rebreakCollapsedEventParagraphs(out);
  out = bulletizeShortFeatureRuns(out);
  for (const [pattern, replacement] of GRAMMAR_FIXES) out = out.replace(pattern, replacement);
  out = out.replace(/\s*Tickets,\s*(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[^\n]*\|\s*Eventbrite/gi, '');
  const lines = out.split('\n').filter((line) => !STANDALONE_STAT_LINE.test(line) && !STANDALONE_SEPARATOR_LINE.test(line) && !PLATFORM_BOILERPLATE_LINE.test(line));
  return lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
