/**
 * Strip publisher sidebar / promo lines from news headlines and scraped grant paragraphs.
 */

const RELATED_MEDIA_PREFIX =
  /^(?:related:|listen(?:\s+on|\s+to)?\s|watch(?:\s+on|\s+this)?\s|podcast:|video:)/i;

export function isRelatedMediaLine(text) {
  if (typeof text !== 'string') return false;
  const t = text.replace(/\s+/g, ' ').trim();
  if (!t) return false;
  if (RELATED_MEDIA_PREFIX.test(t)) return true;
  if (/^magazine:\s/i.test(t)) return true;
  return false;
}

export function cleanTelegramNewsCopy(text) {
  if (typeof text !== 'string' || !text.trim()) return '';
  if (RELATED_MEDIA_PREFIX.test(text.replace(/\s+/g, ' ').trim())) return '';

  let t = text.replace(/\s+/g, ' ').trim();
  t = t.replace(/^Magazine:\s*/i, '');
  t = t.replace(/\s*\.?\s*Source:\s*YouTube\s*$/gi, '');
  t = t.replace(/\s*,\s*X Hall of Flame\s*$/gi, '');
  t = t.replace(/\s*Hall of Flame\s*$/gi, '');
  t = t.replace(/\s*\.?\s*Source:\s*YouTube\s*$/gi, '');
  return t.replace(/\s+/g, ' ').trim();
}

export function normalizeTelegramNewsStory(story) {
  const rawHeadline = String(story.headline || '');
  const rawSummary = String(story.summary || '');
  if (RELATED_MEDIA_PREFIX.test(rawHeadline.replace(/\s+/g, ' ').trim())) return null;
  const headline = cleanTelegramNewsCopy(rawHeadline);
  const summary = cleanTelegramNewsCopy(rawSummary);
  if (!headline) return null;
  return { ...story, headline, summary: summary || rawSummary };
}