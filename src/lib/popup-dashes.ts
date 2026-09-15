/** Unicode dash/hyphen variants (common in AI-generated copy). */
const UNICODE_DASH = /[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g;

/**
 * Strip em/en dashes from popup copy. They read as AI punctuation; use commas,
 * periods, or ASCII hyphens instead (numeric ranges stay as 1-28 style).
 */
export function normalizePopupDashes(text: string): string {
  let t = text.replace(UNICODE_DASH, (ch) => (ch === '\u2014' || ch === '\u2015' ? '—' : '–'));
  t = t.replace(/(\d)\s*[–—]\s*(\d)/g, '$1-$2');
  t = t.replace(/\s*—\s*/g, ', ');
  t = t.replace(/([A-Za-z])\s*–\s*([A-Za-z])/g, '$1-$2');
  t = t.replace(/–/g, '-');
  t = t.replace(/—/g, ', ');
  t = t.replace(/,\s*,/g, ',');
  t = t.replace(/\s+,/g, ',');
  return t.trim();
}
