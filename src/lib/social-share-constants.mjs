/**
 * Pure ECMAScript Module for social share path suffixes and public page aliases.
 * Imported safely by next.config.mjs (native Node ESM) and src/lib/social-share.ts.
 */

export const SOCIAL_UTM_MAP = {
  li: { utm_source: 'linkedin', utm_medium: 'social' },
  linkedin: { utm_source: 'linkedin', utm_medium: 'social' },
  x: { utm_source: 'x', utm_medium: 'social' },
  tw: { utm_source: 'twitter', utm_medium: 'social' },
  twitter: { utm_source: 'twitter', utm_medium: 'social' },
  yt: { utm_source: 'youtube', utm_medium: 'social' },
  youtube: { utm_source: 'youtube', utm_medium: 'social' },
  th: { utm_source: 'threads', utm_medium: 'social' },
  threads: { utm_source: 'threads', utm_medium: 'social' },
  ig: { utm_source: 'instagram', utm_medium: 'social' },
  insta: { utm_source: 'instagram', utm_medium: 'social' },
  instagram: { utm_source: 'instagram', utm_medium: 'social' },
  tg: { utm_source: 'telegram', utm_medium: 'social' },
  telegram: { utm_source: 'telegram', utm_medium: 'social' },
  rd: { utm_source: 'reddit', utm_medium: 'social' },
  reddit: { utm_source: 'reddit', utm_medium: 'social' },
  dc: { utm_source: 'discord', utm_medium: 'social' },
  discord: { utm_source: 'discord', utm_medium: 'social' },
  fc: { utm_source: 'farcaster', utm_medium: 'social' },
  warp: { utm_source: 'warpcast', utm_medium: 'social' },
  farcaster: { utm_source: 'farcaster', utm_medium: 'social' },
  bsky: { utm_source: 'bluesky', utm_medium: 'social' },
  bluesky: { utm_source: 'bluesky', utm_medium: 'social' },
  fb: { utm_source: 'facebook', utm_medium: 'social' },
  facebook: { utm_source: 'facebook', utm_medium: 'social' },
  tt: { utm_source: 'tiktok', utm_medium: 'social' },
  tiktok: { utm_source: 'tiktok', utm_medium: 'social' },
  hn: { utm_source: 'hackernews', utm_medium: 'social' },
  wa: { utm_source: 'whatsapp', utm_medium: 'social' },
  whatsapp: { utm_source: 'whatsapp', utm_medium: 'social' },
  nl: { utm_source: 'newsletter', utm_medium: 'email' },
  email: { utm_source: 'email', utm_medium: 'email' },
};

export const SOCIAL_PATH_SUFFIXES = new Set(Object.keys(SOCIAL_UTM_MAP));

export const PUBLIC_PAGE_ALIASES = {
  '/about': '/community',
  '/docs': '/developers',
  '/api-docs': '/developers',
  '/auth': '/developers',
  '/api-policy': '/api-policy.md',
  '/the-shape-of-ethereum-topological-anomaly-detection': '/shape-of-ethereum',
  '/arbitrum-offchain-labs': '/offchain-labs',
  '/arbitrum': '/offchain-labs',
  '/certik-detailed': '/certik',
  '/aztec-labs-privacy-l2': '/aztec',
  '/aztec-labs': '/aztec',
  '/aztec-network': '/aztec',
  '/tools/interview-questions': '/interview-questions',
  '/tools/salary-calculator': '/salary-calculator',
  '/tools/resume-builder': '/resume-builder',
  '/tools': '/',
  '/guides/web3-salaries': '/salary-calculator',
  '/guides': '/',
  '/what-is-bitcoin': '/bitcoin',
  '/what-is-ethereum': '/ethereum',
  '/what-is-solana': '/jobs',
  '/what-is-defi': '/defi',
  '/what-is-nft': '/nft',
  '/what-is-web3': '/web3',
  '/what-is-blockchain': '/blockchain',
  '/where-b2b-stablecoin-money-actually-flows': '/b2b-stablecoin-flows',
  '/what-is-dao': '/dao',
  '/what-is-staking': '/staking',
  '/what-is-a-token': '/token',
  '/how-to-build-a-web3-resume': '/how-to-build-a-web3-resume-that-stands-out',
  '/gas-optimization-guide-for-solidity-developers': '/gas-optimization-techniques-for-solidity-developers',
  '/how-to-be-a-good-community-moderator': '/web3-community-manager-career',
  '/deprecation-policy': '/api-policy.md',
  '/versioning-policy': '/api-policy.md',
  '/popups/ns': '/ns',
  '/popups/logos': '/logos-society',
  '/popups/logos-society': '/logos-society',
  '/crypto-tax-bills': '/tax-bills',
  '/nasdaq-tokenized-stocks': '/nasdaq-tokens',
  '/jio': '/jio-perpetuals',
  '/nearlaunder': '/nearmemecoin',
  '/terms-of-use': '/terms-of-use.md',
  '/terms': '/terms-of-use.md',
  '/tos': '/terms-of-use.md',
};

/**
 * Defangs domain-like company names (e.g. "Blockchain.com", "Crypto.com", "Rhino.fi", "pump.fun")
 * for social media sharing by inserting an invisible Zero-Width Space (\u200B) before the dot.
 * This prevents social platforms (X, Telegram, LinkedIn, Threads, Bluesky, Facebook) from auto-linking
 * the company name and scraping their website preview instead of our job preview.
 */
export function sanitizeCompanyForSocial(company) {
  if (typeof company !== 'string' || !company) return company || '';
  return company.replace(/([a-zA-Z0-9_-]+)\.([a-zA-Z]{2,})\b/g, '$1\u200B.$2');
}

const SOCIAL_TITLE_LOCATION =
  /^(?:remote|hybrid|onsite|dubai|london|nyc|new york|singapore|hong kong|tokyo|berlin|paris|amsterdam|dublin|sydney|melbourne|toronto|vancouver|mexico(?:\s+city)?|latam|apac|emea|mena|eu|us|usa|uk|india|asian markets?)$/i;

const SOCIAL_ROLE_SIGNAL =
  /\b(intern|engineer|developer|architect|analyst|manager|associate|director|lead|head|counsel|recruiter|designer|specialist|coordinator|representative|trader|underwriter|operator|administrator|executive|officer|researcher|scientist|compliance|legal|sales|marketing|product|support|kol|quant|counsel|paralegal|accountant|controller|tax|writer|editor|strategist|consultant|mlro|counsel|paralegal)\b/i;

/** Keeps comma-separated role continuations (e.g. "Software Engineer, Core Infra Systems"). */
const SOCIAL_COMMA_ROLE_CONTINUATION =
  /\b(engineer|developer|software|infra|systems|backend|frontend|mobile|growth|notifications|product manager|react native|consumer|core infra|tokenization|mobile backend|stablecoins|third party|ii|iii|push)\b/i;

/** Second column is a business unit / routing label, not the role specialty. */
const SOCIAL_COMMA_DEPARTMENT_TAIL =
  /\b(crypto ecosystem|onchain compliance|relationship management|customer advocacy)\b/i;

const SOCIAL_COMMA_DEPARTMENT_TAIL_SINGLE =
  /^(?:commerce|fc[mf]?|programs)$/i;

const SOCIAL_SENIORITY_ONLY =
  /^(?:senior|sr\.?|staff|principal|lead|expert|head|director|vp|vice president|associate|analyst|graduate)$/i;

function isSeniorityOnlyToken(text) {
  return SOCIAL_SENIORITY_ONLY.test(String(text || '').trim());
}

const SOCIAL_COMMA_REGION_TAIL =
  /^(?:eu|apac|emea|mena|latam|us|uk|usa|u\.s\.|americas?)$/i;

/** Trailing dash segments that are geo, cohort, or partner labels—not role specialty. */
const SOCIAL_DASH_JUNK =
  /^(?:consumer|enterprise|smb|y combinator|asian markets?|mexico|london|dubai|rwa|d1 liquidity)$/i;

/** One trailing dash segment worth keeping after the core role. */
const SOCIAL_TECH_SPECIALTY =
  /\b(mobile backend|react native|growth foundations|tokenization|push|notifications|defi|stablecoins|web3|on-?chain|payments|compliance|tax information|third party security)\b/i;

const SOCIAL_TITLE_FILLER_PREFIX = /^(?:innovation|graduate)\s+/i;

const SOCIAL_CORE_ROLE =
  /\b(manager|engineer|developer|architect|analyst|designer|counsel|officer|executive|associate|director|intern|trader|recruiter|specialist|coordinator|representative|underwriter|administrator|consultant|strategist|researcher|scientist|paralegal|controller|accountant)\b/i;

const SOCIAL_SENIORITY =
  /\b(senior|sr\.?|staff|principal|lead|head|director|vp|vice president|associate|analyst|manager|engineer|developer|intern|counsel|mlro|cfo|cto)\b/i;

function scoreSocialRoleSegment(segment) {
  const text = segment.trim();
  if (!text) return -1;
  if (SOCIAL_TITLE_LOCATION.test(text)) return -1;
  if (/^[A-Z]{2,6}$/.test(text) && SOCIAL_ROLE_SIGNAL.test(text)) return 22;
  if (/^[A-Z]{2,6}$/.test(text)) return 0;
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words === 1) {
    if (isSeniorityOnlyToken(text)) return 2;
    if (!SOCIAL_ROLE_SIGNAL.test(text)) return -1;
  }
  if (SOCIAL_CORE_ROLE.test(text) && SOCIAL_SENIORITY.test(text)) return 30 + words;
  if (SOCIAL_ROLE_SIGNAL.test(text)) return 20 + words;
  return 5 + words;
}

/** Pick the speakable role from ATS breadcrumbs (pipes, slashes, dash chains). */
function pickSocialBreadcrumbTitle(title) {
  const normalized = title.replace(/\s*[–—]\s*/g, ' - ').trim();
  if (/[|/]/.test(normalized)) {
    const parts = normalized.split(/[|/]/).map((part) => part.trim()).filter(Boolean);
    if (parts.length > 1) {
      let best = parts[0];
      let bestScore = scoreSocialRoleSegment(best);
      for (const part of parts) {
        const score = scoreSocialRoleSegment(part);
        if (score > bestScore) {
          best = part;
          bestScore = score;
        }
      }
      if (parts.length === 2 && isSeniorityOnlyToken(parts[0])) {
        const right = parts[1];
        const levelComma = right.indexOf(',');
        if (levelComma > 0 && isSeniorityOnlyToken(right.slice(0, levelComma).trim())) {
          return `${parts[0]}, ${right.slice(levelComma + 1).trim()}`;
        }
      }
      if (isSeniorityOnlyToken(best)) {
        const richer = parts.find((part) => part.split(/\s+/).length >= 2 && !isSeniorityOnlyToken(part));
        if (richer) best = richer;
      }
      return best;
    }
  }
  if (!/\s+-\s+/.test(normalized)) return normalized;
  const parts = normalized.split(/\s+-\s+/).map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return normalized;
  let best = parts[0];
  let bestScore = scoreSocialRoleSegment(best);
  for (const part of parts) {
    const score = scoreSocialRoleSegment(part);
    if (score > bestScore) {
      best = part;
      bestScore = score;
    }
  }
  const headIsCoreRole = SOCIAL_CORE_ROLE.test(parts[0]);
  const headLooksLikeRole =
    headIsCoreRole ||
    SOCIAL_ROLE_SIGNAL.test(parts[0]) ||
    /\b(head of|director of|vice president|\bvp\b)\b/i.test(parts[0]);
  if (headIsCoreRole) {
    best = parts[0];
  } else if (headLooksLikeRole && scoreSocialRoleSegment(parts[0]) >= scoreSocialRoleSegment(best)) {
    best = parts[0];
  }
  if (headIsCoreRole || (headLooksLikeRole && scoreSocialRoleSegment(parts[0]) >= scoreSocialRoleSegment(best))) {
    const rest = parts.slice(1);
    if (rest.length === 1) {
      const tail = rest[0];
      if (SOCIAL_TITLE_LOCATION.test(tail) || SOCIAL_DASH_JUNK.test(tail)) return best;
      if (SOCIAL_TECH_SPECIALTY.test(tail)) return `${best} - ${tail}`;
      return best;
    }
    if (rest.every((part) => SOCIAL_TITLE_LOCATION.test(part) || SOCIAL_DASH_JUNK.test(part))) return best;
    if (SOCIAL_TECH_SPECIALTY.test(rest[0]) && rest.slice(1).every((part) => SOCIAL_TITLE_LOCATION.test(part) || SOCIAL_DASH_JUNK.test(part))) {
      return `${best} - ${rest[0]}`;
    }
    return best;
  }
  return bestScore > 0 ? best : normalized;
}

function stripSocialCommaTail(text) {
  const comma = text.indexOf(',');
  if (comma <= 0) return text;
  const head = text.slice(0, comma).trim();
  const tail = text.slice(comma + 1).trim();
  if (!tail || tail.includes(',')) return text;
  if (isSeniorityOnlyToken(head) || /^vp$/i.test(head)) return text;
  if (SOCIAL_COMMA_REGION_TAIL.test(tail)) return head;
  const stripCommaSuffix =
    SOCIAL_COMMA_DEPARTMENT_TAIL.test(tail) ||
    SOCIAL_COMMA_DEPARTMENT_TAIL_SINGLE.test(tail) ||
    (!SOCIAL_COMMA_ROLE_CONTINUATION.test(tail) &&
      !SOCIAL_CORE_ROLE.test(tail) &&
      !/\b(Engineer|Developer|Architect|Counsel|Designer|Analyst|Manager|Recruiter|Associate|Director|Intern|Trader|Executive|Officer)\b/i.test(head) &&
      tail.split(/\s+/).length <= 4 &&
      head.split(/\s+/).length > 1);
  return stripCommaSuffix ? head : text;
}

/**
 * Shorten noisy ATS titles for Telegram/social one-liners without changing on-site job titles.
 *
 * Intent: keep what a human would say out loud; drop geo tags, pipe/slash paths, ecosystem labels,
 * parentheticals, cohort dates, and team acronyms that ATS systems prepend.
 */
export function shortenJobTitleForSocial(title) {
  if (typeof title !== 'string' || !title.trim()) return title || '';
  let text = title.normalize('NFKC').replace(/\u200b/g, '').replace(/\s+/g, ' ').trim();
  text = text.replace(/^\[(?:EU|US|UK|APAC|EMEA|UAE|SG)\]\s*/i, '');
  text = text.replace(/\s*[\(\[][^)\]]*[\)\]]\s*/g, ' ').replace(/\s+/g, ' ').trim();
  text = text.replace(/\s+-\s+(?:summer|winter|fall|spring)\s+\d{4}\b.*$/i, '').trim();
  text = pickSocialBreadcrumbTitle(text);
  text = text.replace(SOCIAL_TITLE_FILLER_PREFIX, '');
  const internLead = text.match(/^Intern,\s*(.+)$/i);
  if (internLead) text = `${internLead[1]} Intern`;
  text = stripSocialCommaTail(text);
  text = text.replace(/\s+/g, ' ').trim();
  if (isSeniorityOnlyToken(text)) {
    const source = title.normalize('NFKC').replace(/\u200b/g, '').replace(/\s+/g, ' ').trim()
      .replace(/\s*[\(\[][^)\]]*[\)\]]\s*/g, ' ').replace(/\s+/g, ' ').trim();
    const comma = source.indexOf(',');
    if (comma > 0) {
      const head = source.slice(0, comma).trim();
      const tail = source.slice(comma + 1).trim();
      if (isSeniorityOnlyToken(head) && tail) text = `${head}, ${tail.split(/[|/]/)[0].trim()}`;
    }
  }
  return text.replace(/\s+/g, ' ').trim();
}

