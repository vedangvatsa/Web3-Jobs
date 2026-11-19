/**
 * Short public label for a job title.
 * The catalog title stays official (schema, slugs, search, apply).
 * Words are only ever removed, never reordered, and the rank is always kept.
 * A comma tail is dropped only when it is a team, region, product, or season clause
 * after a title that is already specific. It stays when it is the specialty.
 */

const RANK = 'director|president|vice president|vp|svp|evp|avp|gm|manager|engineer|analyst|lead|principal|associate|specialist|partner|head|counsel|officer|intern|architect|designer|scientist|developer|researcher|executive|consultant|coordinator|staff';
const LEVEL = '(?:\\s+(?:i{1,3}|iv|v|l\\d+))?';

const BARE_RANK = new RegExp(`^(?:${RANK})${LEVEL}$`, 'i');

const RANK_PHRASE = new RegExp(
  `^(?:(?:senior|sr\\.?|staff|principal|lead|junior|jr\\.?|associate|chief|deputy|assistant|executive|group|team|managing|general)\\s+)*(?:${RANK})${LEVEL}$`,
  'i',
);

const ROLE = 'engineers?|analysts?|managers?|directors?|designers?|counsel|architects?|recruiters?|officers?|specialists?|partners?|scientists?|researchers?|executives?|developers?|accountants?|consultants?|coordinators?|administrators?|superintendents?|investigators?|strategists?|showrunners?|marketers?|representatives?|assistants?|interns?|heads?|leads?|associates?|producers?|principal|vp|president|gm';

// A role noun only counts when it ends the phrase or is followed by a connector,
// so "Developer Relations" or "Partner Management" are specialties, not roles.
const ROLE_NOUN = new RegExp(`\\b(?:${ROLE})\\b(?=\\s*$|\\s+(?:of|and|&|for|to|in)\\b|\\s*[/|,:]|\\s+[-–—]\\s)`, 'i');

const CRAFT_PHRASES = [
  'machine learning',
  'artificial intelligence',
  'developer relations',
  'site reliability',
  'smart contracts',
  'smart contract',
  'customer success',
  'business development',
  'data infrastructure',
  'data engineering',
  'data science',
  'talent acquisition',
  'client management',
  'account management',
  'risk management',
  'full stack',
  'full-stack',
  'front end',
  'front-end',
  'back end',
  'back-end',
].sort((a, b) => b.length - a.length);

const CRAFT_WORDS = new Set([
  'frontend', 'backend', 'front-end', 'back-end', 'fullstack', 'full-stack',
  'ios', 'android', 'mobile', 'web', 'data', 'security', 'devops', 'sre',
  'infrastructure', 'platform', 'protocol', 'solidity', 'rust', 'golang', 'go',
  'payments', 'payment', 'trading', 'finance', 'financial', 'legal', 'compliance',
  'risk', 'fraud', 'marketing', 'growth', 'sales', 'design', 'product', 'research',
  'qa', 'support', 'recruiting', 'talent', 'hr', 'people', 'accounting', 'tax',
  'treasury', 'quant', 'quantitative', 'hardware', 'firmware', 'kernel', 'systems',
  'system', 'blockchain', 'crypto', 'defi', 'identity', 'privacy', 'reliability',
  'observability', 'analytics', 'brand', 'content', 'community', 'partnerships',
  'partnership', 'ml', 'ai', 'ux', 'ui', 'cloud', 'network', 'networking', 'wallet',
  'custody', 'billing', 'audit', 'engineering', 'regulatory', 'java', 'python',
  'typescript', 'javascript', 'c++', 'kdb', 'litigation', 'corporate', 'm&a',
]);

const FILLER_WORDS = new Set([
  'app', 'factory', 'production', 'markets', 'market', 'funds', 'desk', 'coast',
  'governance', 'controls', 'affairs', 'committee', 'ventures', 'transactions',
  'regional', 'americas', 'emea', 'apac', 'latam', 'office', 'europe', 'asia', 'eu',
  'uk', 'us', 'usa', 'japan', 'india', 'canada', 'mexico', 'brazil', 'germany', 'france',
  'singapore', 'korea', 'china', 'benelux', 'dach', 'cee', 'nordics', 'mena', 'africa', 'australia', 'anz',
]);

const CONJUNCTION = /\s(?:and|&)\s/i;

function words(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

function wordCount(text: string): number {
  return words(stripParen(text)).filter(word => /[a-z0-9]/i.test(word)).length;
}

function stripParen(text: string): string {
  return text.replace(/\s*[([][^)\]]*[)\]]/g, ' ').replace(/\s+/g, ' ').trim();
}

function stripNoise(title: string): string {
  let t = title.replace(/\s+/g, ' ').trim();
  const noise = /^(?:off[- ]cycle|co[- ]?op|cohort|class of|fall|spring|summer|winter|autumn)(?:\s+20\d{2}(?:[-/]\d{2,4})?)?[\s,:-]+/i;
  for (let i = 0; i < 4; i++) {
    const stripped = t.replace(noise, '').trim();
    if (stripped === t || !stripped) break;
    t = stripped;
  }
  return t;
}

/** Splits on commas outside brackets, so "(Korean Speaking, Singapore based)" stays whole. */
function splitClauses(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of text) {
    if (char === '(' || char === '[') depth++;
    if ((char === ')' || char === ']') && depth > 0) depth--;
    if (char === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts.map(part => part.trim()).filter(Boolean);
}

function isSeason(text: string): boolean {
  return /^(?:spring|summer|fall|winter|autumn|off[- ]cycle|cohort)\b/i.test(text)
    || (/\b20\d{2}\b/.test(text) && words(text).length <= 4);
}

function craftPhraseAtStart(text: string): string | null {
  const lower = text.toLowerCase();
  for (const phrase of CRAFT_PHRASES) {
    if (lower === phrase || lower.startsWith(`${phrase} `)) return text.slice(0, phrase.length);
  }
  return null;
}

function isCraftWord(word: string): boolean {
  return CRAFT_WORDS.has(word.toLowerCase().replace(/[^a-z0-9+-]/g, ''));
}

function hasCraft(text: string): boolean {
  const lower = text.toLowerCase();
  return CRAFT_PHRASES.some(phrase => lower.includes(phrase)) || words(text).some(isCraftWord);
}

function isFillerWord(word: string): boolean {
  return FILLER_WORDS.has(word.toLowerCase().replace(/[^a-z0-9+-]/g, ''));
}

/** A comma that separates items of one list ("Regulatory, Product & Litigation") is not a clause break. */
function isList(head: string, rest: string[]): boolean {
  const last = rest[rest.length - 1];
  if (/\s[-–—]\s/.test(head) && rest.length === 1 && CONJUNCTION.test(last)) return true;
  return rest.length >= 2 && CONJUNCTION.test(last) && wordCount(last) <= 4
    && rest.slice(0, -1).every(segment => wordCount(segment) <= 3);
}

/** The tail clause worth keeping after a title that is already specific, or null to drop it. */
function specialtyClause(segment: string): string | null {
  const clean = stripParen(segment);
  if (!clean || isSeason(clean)) return null;
  if (ROLE_NOUN.test(clean) || RANK_PHRASE.test(clean)) return clean;
  if (CONJUNCTION.test(clean)) return hasCraft(clean) ? clean : null;

  const dashed = clean.split(/\s+[-–—]\s+/);
  if (dashed.length === 2) {
    if (isCraftWord(words(dashed[1])[0] || '') || craftPhraseAtStart(dashed[1])) return specialtyClause(dashed[1]);
    return specialtyClause(dashed[0]);
  }

  if (words(clean).length >= 3) return hasCraft(clean) ? clean : null;
  if (words(clean).some(isFillerWord) && !hasCraft(clean)) return null;
  return clean;
}

export function displayJobTitle(title: string): string {
  const original = stripNoise(title || '');
  const segments = splitClauses(original);
  if (segments.length < 2) return original;

  const [head, ...rest] = segments;
  if (isList(head, rest)) return segments.join(', ');

  // A bare rank head ("Director", "VP") or a head without a role ("Revenue Operations", "Contractor")
  // needs its first tail to say what the job is, so only later clauses are dropped.
  if (BARE_RANK.test(head) || !ROLE_NOUN.test(head)) {
    const tail = stripParen(rest[0]);
    return tail ? `${head}, ${tail}` : head;
  }

  const specialty = specialtyClause(rest[0]);
  return specialty ? `${head}, ${specialty}` : head;
}
