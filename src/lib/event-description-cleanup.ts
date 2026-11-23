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

/**
 * Systematic scrape grammar artifacts. Small, explicit, and safe: each pattern
 * only matches the misspelled form, never the correct one.
 */
const GRAMMAR_FIXES: Array<[RegExp, string]> = [
  [/\bIndias\b/g, "India's"],
  [/\bindustrys\b/g, "industry's"],
  [/\bthe worlds\b/g, "the world's"],
  [/\bcitie\b/g, 'cities'],
];

const WEEKDAY =
  'Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY';
const MONTH =
  'January|February|March|April|May|June|July|August|September|October|November|December|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER';

/**
 * Luma scrapes sometimes flatten block layout into one paragraph. Re-insert
 * line breaks before headings, day sections, bullets, and session titles.
 */
export function rebreakCollapsedEventParagraphs(text: string): string {
  if (!text) return text;
  const trimmedLines = text.replace(/\r\n?/g, '\n').split('\n').filter((line) => line.trim());
  const longest = Math.max(0, ...trimmedLines.map((line) => line.trim().length));
  const looksFlattened =
    trimmedLines.length <= 4 || (trimmedLines.length <= 8 && longest > 360) || longest > 520;
  if (!looksFlattened) return text.replace(/\r\n?/g, '\n').trim();

  let out = text.replace(/\r\n?/g, '\n');

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
    /(?<=[.!?\p{Ll}\d)])\s+(?=(?:BE PART OF|WHAT TO EXPECT|WHO SHOULD ATTEND|EVENT FORMAT|HOW TO REGISTER|HOW TO JOIN|REGISTRATION)\b)/giu,
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
  let out = rebreakCollapsedEventParagraphs(text);
  for (const [pattern, replacement] of GRAMMAR_FIXES) out = out.replace(pattern, replacement);
  const lines = out.split('\n').filter((line) => !STANDALONE_STAT_LINE.test(line));
  return lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
