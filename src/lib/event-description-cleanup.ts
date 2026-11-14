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

export function cleanupEventDescriptionFormat(text: string): string {
  if (!text) return text;
  let out = text;
  for (const [pattern, replacement] of GRAMMAR_FIXES) out = out.replace(pattern, replacement);
  const lines = out.split('\n').filter((line) => !STANDALONE_STAT_LINE.test(line));
  return lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
