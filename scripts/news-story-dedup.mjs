/**
 * Cross-source news dedup for Telegram digests.
 * Same event from Ars vs TechCrunch must not post twice just because
 * URLs and Gemini headlines differ.
 */

const STOP = new Set([
  'this', 'that', 'with', 'from', 'what', 'where', 'when', 'the', 'and', 'for',
  'says', 'said', 'could', 'will', 'would', 'about', 'after', 'amid', 'over',
  'under', 'into', 'onto', 'than', 'then', 'artificial', 'intelligence',
  'crypto', 'web3', 'bitcoin', 'ethereum',
]);

const GENERIC = new Set([
  ...STOP,
  'model', 'models', 'language', 'train', 'training', 'company', 'launch',
  'launches', 'release', 'releases', 'raise', 'raises', 'funding', 'million',
  'billion', 'startup', 'tech', 'news', 'report', 'reports', 'using', 'used',
  'make', 'made', 'just', 'which', 'started', 'selling', 'texts', 'industry',
  'update', 'updates', 'feature', 'features', 'users', 'user', 'new', 'latest',
  'first', 'year', 'years', 'today', 'week', 'deal', 'sign', 'signs',
  'according', 'their', 'they', 'have', 'been', 'into', 'more', 'than',
]);

export function normalizeUrl(urlString) {
  try {
    const url = new URL(urlString);
    let host = url.hostname.toLowerCase();
    if (host.startsWith('www.')) host = host.substring(4);
    let pathname = url.pathname;
    if (pathname.endsWith('/')) pathname = pathname.slice(0, -1);
    return `${host}${pathname}`;
  } catch {
    return String(urlString || '').trim().toLowerCase();
  }
}

export function stemWord(word) {
  let w = String(word || '').toLowerCase().trim();
  if (w.endsWith('ies')) {
    w = w.slice(0, -3) + 'y';
  } else if (w.endsWith('s') && !w.endsWith('us') && !w.endsWith('is') && !w.endsWith('ss')) {
    w = w.slice(0, -1);
  }
  if (w.endsWith('ing')) {
    w = w.slice(0, -3);
  } else if (w.endsWith('ed')) {
    w = w.slice(0, -2);
  }
  if (w.endsWith('e') && w.length > 3) {
    w = w.slice(0, -1);
  }
  return w;
}

export function getKeywords(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 3 && !STOP.has(w))
    .map(stemWord)
    .filter((w) => w.length > 2);
}

export function distinctiveTokens(text) {
  return [...new Set(getKeywords(text).filter((w) => !GENERIC.has(w) && w.length > 3))];
}

export function isSimilar(a, b, threshold = 0.4) {
  const wa = new Set(getKeywords(a));
  const wb = new Set(getKeywords(b));
  if (!wa.size || !wb.size) return false;
  let overlap = 0;
  for (const w of wa) if (wb.has(w)) overlap++;
  return overlap / Math.min(wa.size, wb.size) > threshold;
}

/**
 * True when two headlines cover the same real-world event.
 * Catches "Amazon destroys rare books…" vs a TechCrunch rewrite of the same scoop.
 */
export function sameEvent(a, b) {
  if (!a || !b) return false;
  if (isSimilar(a, b, 0.28)) return true;
  const da = distinctiveTokens(a);
  const db = distinctiveTokens(b);
  if (!da.length || !db.length) return false;
  const dbSet = new Set(db);
  const shared = da.filter((w) => dbSet.has(w));
  if (shared.length >= 3) return true;
  const hasEntity = shared.some((w) => w.length >= 5);
  const hasTopic = shared.some((w) => w.length >= 4);
  return hasEntity && hasTopic && shared.length >= 2;
}

export function postedTexts(posted) {
  return [...posted].filter((p) => typeof p === 'string' && !/^https?:\/\//i.test(p));
}

export function alreadyCovered(candidate, postedList) {
  const blob = String(candidate || '').trim();
  if (!blob) return false;
  return postedList.some((h) => sameEvent(blob, h));
}
