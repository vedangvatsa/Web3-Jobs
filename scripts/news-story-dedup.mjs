/**
 * Cross-source news dedup for Telegram digests.
 * A story may post once. Later coverage from another outlet, or a Gemini
 * rewrite of the same event, must not go out again.
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
  'across', 'family', 'maker', 'closes', 'round', 'rolls',
]);

/** Map outlet-specific names onto one org token so rewrites still collide. */
const ALIASES = {
  chatgpt: 'openai',
  altman: 'openai',
  claude: 'anthropic',
  deepmind: 'google',
  grok: 'xai',
  llama: 'meta',
  aws: 'amazon',
};

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
  if (ALIASES[w]) return ALIASES[w];
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
  return ALIASES[w] || w;
}

function prepareText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\$(\d+(?:\.\d+)?)\s*(billion|million|b|m)\b/g, (_, n, u) => {
      const unit = u.startsWith('b') ? 'b' : 'm';
      return ` ${String(n).replace('.', '')}${unit} `;
    })
    .replace(/(\d+(?:\.\d+)?)\s*(billion|million)\b/g, (_, n, u) => {
      return ` ${String(n).replace('.', '')}${u.startsWith('b') ? 'b' : 'm'} `;
    })
    // GPT-5.6 / Claude 4 → gpt56 / claude4. Do not glue verbs onto money tokens (raises 20b).
    .replace(/\b([a-z]{2,})\s*[-./]?\s*(\d+(?:\.\d+)?)(?![a-z0-9])/g, (_, name, num) => `${name}${String(num).replace('.', '')}`)
    .replace(/[^a-z0-9]/g, ' ');
}

export function getKeywords(text) {
  return prepareText(text)
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOP.has(w))
    .map(stemWord)
    .filter((w) => w.length > 2);
}

export function distinctiveTokens(text) {
  return [...new Set(getKeywords(text).filter((w) => !GENERIC.has(w) && w.length > 2))];
}

export function eventFingerprint(text) {
  return distinctiveTokens(text).sort().slice(0, 10);
}

export function fingerprintsMatch(a, b) {
  const sa = new Set(a.filter(Boolean));
  const sb = new Set(b.filter(Boolean));
  if (!sa.size || !sb.size) return false;
  const shared = [...sa].filter((t) => sb.has(t));
  const n = shared.length;
  if (n >= 3) return true;
  // Soft path only for versioned products (gpt56, claude4, 20b) + an org/name token.
  // Plain topic overlaps like "mica"+"europe" or "drain"+"wallet" must not match.
  if (n >= 2) {
    const min = Math.min(sa.size, sb.size);
    const hasVersioned = shared.some((t) => /\d/.test(t));
    const hasOrg = shared.some((t) => t.length >= 4 && !/\d/.test(t));
    return hasVersioned && hasOrg && n / min >= 0.5;
  }
  return false;
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
 * True when two headlines cover the same real-world event, regardless of
 * outlet or Gemini wording.
 *
 * Kept strict on purpose: a soft keyword overlap was blocking ~95% of fresh
 * RSS items against months of history (e.g. any two "wallet drain" stories).
 */
export function sameEvent(a, b) {
  if (!a || !b) return false;
  const left = String(a).trim().toLowerCase();
  const right = String(b).trim().toLowerCase();
  if (!left || !right) return false;
  if (left === right) return true;
  if (fingerprintsMatch(eventFingerprint(a), eventFingerprint(b))) return true;
  const da = distinctiveTokens(a);
  const db = distinctiveTokens(b);
  if (!da.length || !db.length) return false;
  const dbSet = new Set(db);
  const shared = da.filter((w) => dbSet.has(w));
  if (shared.length >= 3) return true;
  if (shared.length >= 2) {
    const min = Math.min(da.length, db.length);
    const hasVersioned = shared.some((w) => /\d/.test(w));
    const hasOrg = shared.some((w) => w.length >= 4 && !/\d/.test(w));
    return hasVersioned && hasOrg && shared.length / min >= 0.5;
  }
  return false;
}

export function postedTexts(posted) {
  return [...posted].filter((p) => typeof p === 'string' && !/^https?:\/\//i.test(p));
}

/** Prefer recent digests for event matching; ancient headlines create false blocks. */
export function recentPostedTexts(postedList, { maxTexts = 120, maxFingerprints = 120 } = {}) {
  const texts = [];
  const fps = [];
  for (const p of postedList) {
    const s = String(p || '');
    if (!s) continue;
    if (s.startsWith('fp:')) fps.push(s);
    else if (!/^https?:\/\//i.test(s)) texts.push(s);
  }
  return [...texts.slice(-maxTexts), ...fps.slice(-maxFingerprints)];
}

export function alreadyCovered(candidate, postedList) {
  const blob = String(candidate || '').trim();
  if (!blob) return false;
  const candFp = eventFingerprint(blob);
  for (const h of postedList) {
    if (!h || typeof h !== 'string') continue;
    if (h.startsWith('fp:')) {
      if (fingerprintsMatch(candFp, h.slice(3).split('|').filter(Boolean))) return true;
      continue;
    }
    if (sameEvent(blob, h)) return true;
  }
  return false;
}

export function rememberPostedStory(posted, story) {
  if (story.link) posted.add(story.link);
  if (story.headline) posted.add(story.headline);
  if (story.originalTitle) posted.add(story.originalTitle);
  const blob = [story.headline, story.originalTitle, story.summary, story.snippet]
    .filter(Boolean)
    .join(' ');
  const fp = eventFingerprint(blob);
  if (fp.length >= 2) posted.add(`fp:${fp.join('|')}`);
}

/** Keep event fingerprints and headlines; only trim oldest URLs. */
export function trimPostedLog(posted, { maxUrls = 2500, maxTexts = 4000 } = {}) {
  const items = [...posted];
  const urls = [];
  const fps = [];
  const texts = [];
  for (const p of items) {
    const s = String(p || '');
    if (/^https?:\/\//i.test(s)) urls.push(s);
    else if (s.startsWith('fp:')) fps.push(s);
    else texts.push(s);
  }
  return [...urls.slice(-maxUrls), ...texts.slice(-maxTexts), ...fps.slice(-maxTexts)];
}
